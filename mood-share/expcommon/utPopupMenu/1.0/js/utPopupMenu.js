(function($) {
  var methods = {
    init: function(options) {
      return this.each(function() {
        var defaults = {
          title:'Choose your style',
          items:[

          ],
          onChange: function (data) {

          }
        };

        var $that = $(this);
        var that = {};
        this.utPopupMenu = that;
        that.options = $.extend(defaults, options);
        that.callback = function(){};

        $that.addClass('utPopupMenu');
        // that.utPopupMenuTitle = $('<div>').addClass("utPopupMenu_title").appendTo($that).html("<span>" + that.options.title + "</span>");

        that.utPopupMenuItems = $('<div>').addClass("utPopupMenu_items").appendTo($that).on('click', function(e){
          e.stopPropagation();
        });

        $.each(that.options.items, function(i,v){
          $("<div>").addClass("utPopupMenu_item").appendTo(that.utPopupMenuItems).html(v.html).attr("data-value",v.value).on('click',function(){
            that.callback($(this).attr("data-value"));
          });
        });

        that.unselectAll = function(){
          $that.find("utPopupMenu_item").removeClass('utPopupMenu_item_selected');
        };

        that.select = function(v){
          that.unselectAll();
          $that.find('[data-value="'+v+'"]').addClass('utPopupMenu_item_selected');
        };

        that.show = function(options,callback){
          $that.show();
          that.callback = callback;
          that.select(options.theme);
          if(options && options.val){
            that.unselectAll();
            that.select(options.val);
          }
          setTimeout(function(){
            $that.addClass("utPopupMenu_show");
            that.utPopupMenuItems.css({
              'marginTop':-that.utPopupMenuItems.outerHeight()/2 + 'px',
              'top':'50%'
            });
          },1);
        };

        that.hide = function(){
          $that.removeClass("utPopupMenu_show");
          setTimeout(function(){$that.hide();},700);
        };

      });
    },

    unselectAll: function() {
      this.each(function() {
        if(this.utPopupMenu) this.utPopupMenu.unselectAll();
      });
      return this;
    },

    select: function(val) {
      this.each(function() {
        if(this.utPopupMenu) this.utPopupMenu.select(val);
      });
      return this;
    },

    hide: function() {
      this.each(function() {
        if(this.utPopupMenu) this.utPopupMenu.hide();
      });
      return this;
    },

    show: function(options,callback) {
      this.each(function() {
        if(this.utPopupMenu) this.utPopupMenu.show(options,callback);
      });
      return this;
    }


  };

  $.fn.utPopupMenu = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.utPopupMenu');
    }
    return this;
  };
})(window.jQuery || window.Zepto || window.jq);
