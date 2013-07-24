(function($) {
  var methods = {
    init: function(options) {
      return this.each(function() {
        var $that = $(this);
        var that = this;

        that.$canvas = $(this);
        that.canvas = this;
        that.context = this.getContext('2d');


        var defaults = {
          canvasCopy:{
            width: that.$canvas.attr('width') || that.$canvas.width(),
            height: that.$canvas.attr('height') || that.$canvas.height()
          },
          undoControl:false,
          redoControl:false,
          onUndo:function(){},
          onRedo:function(){},
          onSnapshot:function(){}
        };

        that.options = jQuery.extend(defaults,options);

        //that.bimap

        /********************************************************************************
         * undo - redo
         ********************************************************************************/
        that.undoStack = [];
        that.redoStack = [];

        that.clearHistory = function() {
          that.undoStack.length = 0;
          that.redoStack.length = 0;
        };

        that.setCopy = function(copy) {
          that.context.drawImage(copy, 0, 0);
        };

        that.getCanvasCopy = function(){
          var canvasCopy =  document.createElement('canvas');
          canvasCopy.setAttribute('width', that.options.canvasCopy.width);
          canvasCopy.setAttribute('height', that.options.canvasCopy.height);
          canvasCopy.getContext("2d").drawImage(that.canvas,0,0);
          return canvasCopy;
        };

        that.snapshot = function() {
          var canvasCopy = that.getCanvasCopy();
          that.addToUndoStack({ canvasCopy: canvasCopy });
          that.redoStack.length = 0;
          that.options.onSnapshot(that.getUndoRedoState());
          that.setInactiveStates();
        };

        that.addToUndoStack = function(data) {
          that.undoStack.push(data);
        };

        that.addToRedoStack = function(data) {
          that.undoStack.push(data);
        };

        that.setInactiveStates = function(){
          var a = that.getUndoRedoState();
          if(a[0]>0){that.options.undoControl.removeClass('inactive');} else {that.options.undoControl.addClass('inactive');}
          if(a[1]>0){that.options.redoControl.removeClass('inactive');} else {that.options.redoControl.addClass('inactive');}
        };

        that.undo = function() {
          if (that.undoStack.length) {
            that.redoStack.push(that.undoStack.pop());
            that.context.clearRect(0, 0, that.options.canvasCopy.width, that.options.canvasCopy.height);
            if (that.undoStack.length) {
              that.setCopy(that.undoStack[that.undoStack.length - 1].canvasCopy);
            } else {
              that.setCopy(that.original);
            }
            that.options.onUndo(that.getUndoRedoState());
            that.setInactiveStates();
          }
        };

        that.redo = function() {
          if (that.redoStack.length) {
            var data = that.redoStack[that.redoStack.length - 1];
            that.context.clearRect(0, 0, that.options.canvasCopy.width, that.options.canvasCopy.height);
            that.context.drawImage(data.canvasCopy, 0, 0);
            that.undoStack.push(that.redoStack.pop());
            that.options.onRedo(that.getUndoRedoState());
            that.setInactiveStates();
          }
        };

        that.clear = function() {
          that.context.clearRect(0, 0, that.options.canvasCopy.width, that.options.canvasCopy.height);
          //that.snapshot();
        };

        that.reset = function() {
          that.context.clearRect(0, 0, that.width, that.height);
          that.clearHistory();
        };

        that.getBase64 = function() {
          return that.$canvas.toDataURL("image/png");
        };

        that.getUndoRedoState = function() {
          return [that.undoStack.length, that.redoStack.length];
        };

        if(that.options.undoControl){
          that.options.undoControl
          .on('click', function(e){
            e.stopPropagation();
            that.undo();
          })
          .on('mouseup mousedown touchend touchstart touchcancel', function(e){
            e.stopPropagation();
          });
        }

        if(that.options.redoControl){
          that.options.redoControl.on('click', function(e){
            e.stopPropagation();
            that.redo();
          })
          .on('mouseup mousedown touchend touchstart touchcancel', function(e){
            e.stopPropagation();
          });
        }


        that.original = that.getCanvasCopy();
        return this;
      });
    },
    undo: function(val){
      this.each(function() {
        this.undo();
      });
      return this;
    },
    redo: function(val){
      this.each(function() {
        this.redo();
      });
      return this;
    },
    snapshot: function(val){
      this.each(function() {
        this.snapshot();
      });
      return this;
    }
  };

  $.fn.canvasUndoRedo = function(method) {
    if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.canvasUndoRedo');
    }
    return this;
  };
})(window.jQuery);

