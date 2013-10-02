(function($) {
  var methods = {
    init: function(options) {
      return this.each(function() {
        var defaults = {
          expression:false,
          items: [],
          sub: false,
          autoFit: false,
          skin: 'main',
          isMobile: !(window.navigator.userAgent.toLowerCase().indexOf('mobile') == -1),
          onChange: function(val){},
          onExpand: function(val){},
          onChangeUp: function(val){}
        };

        var $that = $(this);
        var that = {};
        this.wdChooser = that;
        that.options = $.extend(defaults, options);

        that.totalWidth = 0;


        //TODO Hack for remove filter toolbal. Should be removed in the feature.
        //if ($.browser.isTouchDevice) {
          for (var i = 0; i < that.options.items.length; i++) {
            if (that.options.items[i].val == 'filter' || that.options.items[i].val == 'filters') {
              that.options.items.splice(i, 1);
              break;
            }
          }
        //}

        //TODO hide toolbar if have no items
        if (!options.items.length) {
          $('.container').css('padding-bottom', 0);
          $that.css('display', 'none');
        }

        that.create = function() {
          $that.addClass('wdChooser');

          // add menu type classes (mostly about style and bottom position)
          if(that.options.skin) $that.addClass('wdChooser_'+that.options.skin);

          // add autoFit class
          if(that.options.autoFit) $that.addClass('wdChooser_autoFit');

          $that.on('touchstart touchend touchmove mousedown mousemove mouseup click', function(e){
            e.stopPropagation();
            e.preventDefault();
          });

          // initial bottom position of menu in pixels
          that.initialBottomPosition = parseInt($that.css('bottom'),10);
          if(that.options.expression){
            var doOnScrollChanged = function(v){
              var currentBottomPosition = that.initialBottomPosition + parseInt(v.scrollBottom,10);
              $that.css('bottom',currentBottomPosition + 'px');
            };
            that.options.expression.scrollChanged(doOnScrollChanged);
            doOnScrollChanged(that.options.expression.getScrollValues());
          }

          that.wdChooserScrollArea = $('<div>').attr({'class': 'wdChooser_scroll_area'}).appendTo($that);

          $.each(that.options.items, function(index, val){
            var item = $('<div>').addClass("wdChooser_item");

            if(val.icon){
              item.css('backgroundImage', 'url(' + val.icon + ')');
            }

            if(val['class']){
              item.addClass('wdChooser_item_' + val['class']);
            }

            if(val.group){
              item.addClass('wdChooser_group_' + val.group);
            }

            that.activationClass  = 'wdChooser_item_active';
            that.selectionClass   = 'wdChooser_item_selected';
            that.expandedClass    = 'wdChooser_item_expanded';
            that.hasTitleClass    = 'wdChooser_item_hastitle';
            that.touchMoveEvents  = 'touchmove mousemove';
            that.touchEndEvents   = 'touchend touchcancel mouseup mouseleave';
            that.touchStartEvents = 'touchstart mousedown';

            $that.on(that.touchEndEvents, function(){
              $that.find('.wdChooser_item').removeClass(that.activationClass);
            });

            if(val.text.indexOf('<strong>')!=-1){
              item.addClass(that.hasTitleClass);
            }

            item.html(val.text)
              .attr('data-value',val.val)
              .addClass('wdChooser_item_' + val.type)
              .appendTo(that.wdChooserScrollArea)
              .on(that.touchStartEvents, function(e) {
                if(val.type && val.type == 'container') return false;
                if(val.type && val.type == "button") {
                  item.addClass(that.activationClass);
                  that.act = function(){
                    that.options.onChange(val.val);
                  };
                  var onMouseUpOnButton = function(e) {
                    item.removeClass(that.activationClass);
                    that.act();
                    that.act = function(){};
                    item.off(that.touchEndEvents, onMouseUpOnButton);
                  };

                  item.on(that.touchEndEvents, function(e){
                    onMouseUpOnButton();
                    e.preventDefault();
                    e.stopPropagation();
                  });
                } else if(val.type && val.type == "switch") {
                  item.addClass(that.activationClass);
                  var wasSelected = item.hasClass(that.selectionClass);
                  var wasExpanded = item.hasClass(that.expandedClass);
                  that.wdChooserScrollArea.find('.wdChooser_group_'+val.group).removeClass(that.selectionClass).removeClass(that.expandedClass);
                  if(wasSelected) item.addClass(that.selectionClass);
                  if(wasExpanded) item.addClass(that.expandedClass);
                  if(item.hasClass(that.selectionClass)) {
                    that.act = function() {
                      if(item.hasClass(that.expandedClass)){
                        item.removeClass(that.expandedClass);
                        that.options.onExpand(val.val,false);
                      } else {
                        item.addClass(that.expandedClass);
                        that.options.onExpand(val.val,true);
                      }
                    };
                  } else {
                    that.act = function() {
                      item.addClass(that.expandedClass);
                      item.addClass(that.selectionClass);
                      that.options.onChange(val.val);
                      that.options.onExpand(val.val,true);
                    };
                  }

                  var onMouseUpOnSwitch = function(e) {
                    that.act();
                    that.act = function(){};
                    item.off(that.touchEndEvents, onMouseUpOnSwitch);
                  };

                  item.on(that.touchEndEvents, function(e){
                    onMouseUpOnSwitch();
                    e.preventDefault();
                    e.stopPropagation();
                  });

                } else {
                  that.sel = that.wdChooserScrollArea.find('.'+that.selectionClass);
                  that.act = function(){
                    that.unselectAll();
                    item.addClass(that.selectionClass);
                    that.options.onChange(val.val);
                  };
                  var onMouseUpOther = function(e) {
                    that.act();
                    item.off(that.touchEndEvents, onMouseUpOther);
                  };

                  var onMouseMoveOnSwitch = function(e) {
                    that.act = function(){};
                    item.off(that.touchMoveEvents, onMouseMoveOnSwitch);
                    item.off(that.touchEndEvents, onMouseUpOnSwitch);
                  };

                  item.on(that.touchMoveEvents, onMouseMoveOnSwitch);
                  item.on(that.touchEndEvents, onMouseUpOther);
                }
                e.preventDefault();
            });

            that.totalWidth += item.fullWidth();
          });


          if(that.totalWidth > $that.width() && !this.options.autoFit){
            that.wdChooserScrollArea.width(that.totalWidth);
            that.wdChooserScrollArea.touchScroll();

            if(!this.options.isMobile){
              that.scrollNext = $('<div>').addClass('wdChooser_scroll_button wdChooser_scroll_button_next').html('<span class="icon_point_right"></span>').appendTo($that);
              that.scrollPrev = $('<div>').addClass('wdChooser_scroll_button wdChooser_scroll_button_prev').html('<span class="icon_point_left"></span>').appendTo($that);

              that.scrollPrev.hide();
              that.scrollNext.on('click',function(){
                var pos = that.wdChooserScrollArea.touchScroll('getPosition')*1;
                that.scrollPrev.show();
                if(that.totalWidth - $that.width() - pos > $that.width()){
                  that.wdChooserScrollArea.touchScroll('setPosition', pos + $that.width(),0);
                } else {
                  that.wdChooserScrollArea.touchScroll('setPosition',that.totalWidth - $that.width(),0);
                  that.scrollNext.hide();
                }
              });

              that.scrollPrev.on('click',function(){
                var pos = that.wdChooserScrollArea.touchScroll('getPosition')*1;
                that.scrollNext.show();
                if(pos > $that.width()){
                  that.wdChooserScrollArea.touchScroll('setPosition', pos - $that.width(),0);
                } else {
                  that.wdChooserScrollArea.touchScroll('setPosition',0,0);
                  that.scrollPrev.hide();
                }
              });
            }
          }
        };

        that.unselectAll = function(){
          that.wdChooserScrollArea.children().removeClass(that.selectionClass).removeClass(that.expandedClass);
        };

        that.unexpandAll = function(){
          that.wdChooserScrollArea.children().removeClass(that.expandedClass);
        };

        that.setValue = function(val,change){
          that.unselectAll();
          that.wdChooserScrollArea.children().filter('[data-value="'+val+'"]').addClass(that.selectionClass).addClass(that.expandedClass);
        };

        that.hide = function(){
          $that.hide();
        };

        that.show = function(){
          $that.show();
        };

        that.hideItem = function(id){
          $that.find('[data-value='+id+']').hide();
        };

        that.showItem = function(id){
          $that.find('[data-value='+id+']').show();
        };

        that.create();
      });
    },

    setValue: function(val, change){
      this.each(function() {
        if(this.wdChooser) this.wdChooser.setValue(val, change);
      });
      return this;
    },

    unselectAll: function() {
      this.each(function() {
        if(this.wdChooser) this.wdChooser.unselectAll();
      });
      return this;
    },

    unexpandAll: function() {
      this.each(function() {
        if(this.wdChooser) this.wdChooser.unexpandAll();
      });
      return this;
    },

    hide: function() {
      this.each(function() {
        if(this.wdChooser) this.wdChooser.hide();
      });
      return this;
    },

    show: function() {
      this.each(function() {
        if(this.wdChooser) this.wdChooser.show();
      });
      return this;
    },

    hideItem: function(id) {
      this.each(function() {
        if(this.wdChooser) this.wdChooser.hideItem(id);
      });
      return this;
    },

    showItem: function(id) {
      this.each(function() {
        if(this.wdChooser) this.wdChooser.showItem(id);
      });
      return this;
    }
  };

  $.fn.wdChooser = function(method) {
    if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.wdChooser');
    }
    return this;
  };
})(window.jQuery || window.Zepto || window.jq);
