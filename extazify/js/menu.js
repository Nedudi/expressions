(function($) {
  var methods = {
    init: function(options) {
      return this.each(function() {
        var defaults = {
          expression:false,
          items: [],
          autoFit: false,
          skin: '1',
          lever:false,
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

        that.create = function() {
          $that.addClass('wdChooser');

          if(that.options.lever){
            that.$lever = $(that.options.lever);
            that.$lever.on('click', function(e) {
              e.stopPropagation();
              if(!that.$lever.hasClass('active')){
                that.show();
              } else {
                that.hide();
              }
            });
          }

          // add menu type classes (mostly about style and bottom position)
          if(that.options.skin) $that.addClass('wdChooser_skin'+that.options.skin);

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



            that.selectionClass   = 'wdChooser_item_selected';
            that.touchMoveEvents  = 'touchmove mousemove';
            that.touchEndEvents   = 'touchend touchcancel mouseup mouseleave';
            that.touchStartEvents = 'touchstart mousedown';

            $that.on(that.touchEndEvents, function(){
              $that.find('.wdChooser_item').removeClass(that.activationClass);
            });

            // if(val.text.indexOf('<strong>')!=-1){
            //   item.addClass(that.hasTitleClass);
            // }

            item.html(val.text)
              .attr('data-value',val.val)
              .addClass('wdChooser_item_' + val.type)
              .appendTo(that.wdChooserScrollArea)
              .on('touchstart mousedown', function(e) {
                if(val.type && val.type == "chooser") {
                  $that.find('.wdChooser_item').removeClass(that.selectionClass);
                  item.addClass(that.selectionClass);
                  that.options.onChange(val.val);
                } else if(val.type && val.type == "button") {
                  item.addClass(that.selectionClass);
                  that.options.onChange(val.val);
                }
                // e.preventDefault();
              });

            if(val['class']){
              item.find('a span').addClass(val['class']);
            }

            that.totalWidth += item.outerWidth();
          });


          that.wdChooserScrollArea.width(that.totalWidth);
          if(that.totalWidth > $that.width() && !this.options.autoFit){

            that.wdChooserScrollArea.touchScroll();

            // if(!this.options.isMobile){
            //   that.scrollNext = $('<div>').addClass('wdChooser_scroll_button wdChooser_scroll_button_next').html('<span class="icon_point_right"></span>').appendTo($that);
            //   that.scrollPrev = $('<div>').addClass('wdChooser_scroll_button wdChooser_scroll_button_prev').html('<span class="icon_point_left"></span>').appendTo($that);

            //   that.scrollPrev.hide();
            //   that.scrollNext.on('click',function(){
            //     var pos = that.wdChooserScrollArea.touchScroll('getPosition')*1;
            //     that.scrollPrev.show();
            //     if(that.totalWidth - $that.width() - pos > $that.width()){
            //       that.wdChooserScrollArea.touchScroll('setPosition', pos + $that.width(),0);
            //     } else {
            //       that.wdChooserScrollArea.touchScroll('setPosition',that.totalWidth - $that.width(),0);
            //       that.scrollNext.hide();
            //     }
            //   });

            //   that.scrollPrev.on('click',function(){
            //     var pos = that.wdChooserScrollArea.touchScroll('getPosition')*1;
            //     that.scrollNext.show();
            //     if(pos > $that.width()){
            //       that.wdChooserScrollArea.touchScroll('setPosition', pos - $that.width(),0);
            //     } else {
            //       that.wdChooserScrollArea.touchScroll('setPosition',0,0);
            //       that.scrollPrev.hide();
            //     }
            //   });
            // }
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
          if(that.$lever) that.$lever.removeClass('active');
        };

        that.show = function(){
          $that.show();
          if(that.$lever) that.$lever.addClass('active');
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
