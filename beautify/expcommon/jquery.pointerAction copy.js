(function($) {
  var methods = {
    init: function(options) {
      return this.each(function() {
        var $that = $(this);
        var that = this;
        var defaults = {
          isTouch:'ontouchstart' in window || window.navigator.msMaxTouchPoints > 0,
          back:'body',
          onStart:function(){},
          onMove:function(){},
          onEnd:function(){}
        };

        that.options = jQuery.extend(defaults,options);
        that.pos = false;
        that.options.back = $(that.options.back);
        that.ev = {
          start: that.options.isTouch?'touchstart':'mousedown',
          move:  that.options.isTouch?'touchmove':'mousemove',
          end:   that.options.isTouch?'touchend touchcancel':'mouseup mouseleave'
        };

        that.touchToXY = function(e){
          if(e.customX && e.customY) return {x:e.customX,y:e.customY};
          var out = {x:0, y:0};
          if(e.type == 'touchstart' || e.type == 'touchmove' || e.type == 'touchend' || e.type == 'touchcancel'){
            var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            out.x = touch.pageX  - that.offset.left;
            out.y = touch.pageY - that.offset.top;
          } else if (e.type == 'mousedown' || e.type == 'mouseup' || e.type == 'mousemove' || e.type == 'mouseover'|| e.type=='mouseout' || e.type=='mouseenter' || e.type=='mouseleave') {
            out.x = e.pageX - that.offset.left ;
            out.y = e.pageY - that.offset.top;
          }
          return out;
        };

        that.onActionStart = function(e){
          that.options.back.on(that.ev.move, that.onActionMove);
          that.options.back.on(that.ev.end, that.onActionEnd);
          var pos = that.touchToXY(e);
          that.options.onStart(pos,e);
        };

        that.onActionMove = function(e){
          var pos = that.touchToXY(e);
          that.options.onMove(pos,e);
        };

        that.onActionEnd = function(e){
          that.pos = false;
          var pos = that.touchToXY(e);
          that.options.back.off(that.ev.move, that.onActionMove);
          that.options.back.off(that.ev.end, that.onActionEnd);
          that.options.onEnd(pos,e);
        };

        that.refresh = function(){
          that.offset = $that.offset();
          $that.off(that.ev.start, that.onActionStart).on(that.ev.start, that.onActionStart);
        };

        that.refresh();
        return this;
      });
    },

    set: function(val){
      this.each(function() {
        this.setData(val);
      });
      return this;
    }
  };

  $.fn.pointerAction = function(method) {
    if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.pointerAction');
    }
    return this;
  };
})(window.jQuery);

