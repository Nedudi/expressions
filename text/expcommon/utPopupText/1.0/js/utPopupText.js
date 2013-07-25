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
        this.utPopupText = that;
        that.options = $.extend(defaults, options);
        that.callback = function(){};

        $that.addClass('utPopupText');
        that.utPopupTextItems = $('<div>').addClass("utPopupText_items").appendTo($that).on('click', function(e){
          e.stopPropagation();
        });

        that.utPopupTextTitle = $('<div>').addClass("utPopupText_title").appendTo(that.utPopupTextItems).html("<span>" + that.options.title + "</span>");
        that.utPopupTextArea = $('<textarea>',{placeholder:'Type here'}).addClass("utPopupText_area").appendTo(that.utPopupTextItems);
        that.utPopupTextButton = $('<a>').addClass("utPopupText_button ut-success-button ut-button").html('Done').appendTo(that.utPopupTextItems);
        // $.each(that.options.items, function(i,v){
        //   $("<div>").addClass("utPopupText_item").appendTo(that.utPopupTextItems).html(v.html).attr("data-value",v.value).on('click',function(){
        //     that.callback($(this).attr("data-value"));
        //   });
        // });




        that.show = function(callback){
          $that.show();
          that.callback = callback;
          setTimeout(function(){$that.addClass("utPopupText_show");},1);
        };

        that.hide = function(){
          $that.removeClass("utPopupText_show");
          setTimeout(function(){$that.hide();},700);
        };

      });
    },

    hide: function() {
      this.each(function() {
        if(this.utPopupText) this.utPopupText.hide();
      });
      return this;
    },

    show: function(callback) {
      this.each(function() {
        if(this.utPopupText) this.utPopupText.show(callback);
      });
      return this;
    }


  };

  $.fn.utPopupText = function(method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.utPopupText');
    }
    return this;
  };
})(window.jQuery || window.Zepto || window.jq);
