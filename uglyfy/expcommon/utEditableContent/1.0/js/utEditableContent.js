(function($) {
  var methods = {
    init: function(options) {
      return this.each(function() {

        var defaults = {
          post:false,
          maxLength:100,
          maxFont:1.5,
          minFont:0.5,
          minFontCount:100,
          saveMaxFont: 0,
          maxRows:10,
          placeholder:'hey',
          disableAfterFocus: true,
          oneLine:false,
          msie: window.navigator.userAgent.toLowerCase().indexOf('msie') !== -1,
          onChange:function(){

          },
          onBlur:function(){

          }
        };

        var that = {};
        this.utEditableContent = that;
        var $that = $(this);
        that.options = jQuery.extend(defaults,options);

        that.cl = {
          e:              'ut_e',
          p:              'ut_p',
          w:              'ut_ce',
          view:           'ut_view',
          edit:           'ut_edit',
          empty:          'ut_empty'
        };

        that.view = {};
        $that.addClass(that.cl.view);
        that.mode = 'view';

        // =======================================================================
        // ========================---- chooser ----==============================
        // =======================================================================

        that.view.wrapper = $('<div>').addClass(that.cl.w).appendTo($that);
        that.view.e = $('<div>').addClass(that.cl.e).appendTo(that.view.wrapper);
        that.view.p = $('<div>').addClass(that.cl.p).appendTo(that.view.wrapper).html(that.options.placeholder);

        that.updateFontSize = function(){
          var longestWordLength = 0;
          var longestWord = '';
          if(!that.options.oneLine){
            var markedText = that.nonFormattedText.replace(/(\r\n|\n|\r)/gm," ");
            var markedArr = markedText.split(' ');
            markedArr.map(function(v){
              if(v.length > longestWordLength){
                longestWordLength = v.length;
                longestWord = v;
              }
            });
          } else {
            longestWord = that.nonFormattedText;
          }

          var coefficient = that.options.maxFont;
          var baseFontSize = parseInt(that.view.wrapper.css('font-size'),10);
          var maxFontSize = baseFontSize * that.options.maxFont;

          var merger = $('<span class="ut_merger" style="font-size:'+maxFontSize+'px" ></span>').html(longestWord).prependTo(that.view.wrapper);

          var mergerWidth = merger.width();
          var wrapperWidth = that.view.wrapper.width();

          if(wrapperWidth < mergerWidth*1.5){
            var coefficient = that.options.maxFont*(wrapperWidth/mergerWidth)*0.75;
          }

          merger.remove();
          if(coefficient <= that.options.minFont) coefficient = that.options.minFont;
          if(coefficient >= that.options.maxFont) coefficient = that.options.maxFont;
          that.view.e.css('font-size',100*coefficient+'%');
          that.view.p.css('font-size',100*1+'%');
        };

        that.checkEmpty = function(e){
          if(!that.nonFormattedText){
            $that.addClass(that.cl.empty);
          } else {
            $that.removeClass(that.cl.empty);
          }
        };

        that.checkMaxLength = function(e){
          if(that.nonFormattedText.length > that.options.maxLength){
            //list of functional/control keys that you want to allow always
            var keys = [8, 9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 144, 145];
            if( $.inArray(e.keyCode, keys) === -1) {
                e.preventDefault();
                e.stopPropagation();
            }
          }
        };

        that.cutText = function(e){
          if(that.options.maxLength && that.nonFormattedText.length > (that.options.maxLength - 1)) {
            that.view.e.text(that.nonFormattedText.substr(0, that.options.maxLength));
          }
        };

        that.parseLinks = function(text){
          var hashFoundInLink = false;
          text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
          text = text.replace(/\b(((https*\:\/\/)|www\.).+?)(([!?,.\)]+)?(\s|$))/g, function(link, m1, m2, m3, m4) {
            if(m1.indexOf('#')!==-1) hashFoundInLink = true;
            var http = m2.match(/w/) ? 'http://' : '';
            return '<a class="inner_link" target="_blank" href="' + http + m1 + '">' + m1 + '</a>' + m4;
          });
          if(!hashFoundInLink) text = text.replace(/#([a-z0-9]*)/ig,      '<a href="#" data-navigate="search" data-value="#$1" class="search" target="_new">#$1</a>');
          text = text.replace(/@([a-z0-9_\-\.]+)/ig, '<a href="#" data-navigate="user" data-value="$1" class="user" target="_new">@$1</a>');
          return text;
        };

        that.addLinkHandlers = function(){
          that.view.e.find('[data-navigate]').map(function(){
            $(this).on('click', function(e){
              e.preventDefault();
              e.stopPropagation();
              var value = $(this).data('value');
              var navigate = $(this).data('navigate');
              that.options.post.navigate(navigate,value);
            });
          });
        };

        that.cleanUpText = function(e){
          that.nonFormattedText = that.nonFormattedText.replace(/(\r\n|\n|\r)/gm,"");
          that.view.e.text(that.nonFormattedText);
        };

        that.setText = function(v){
          that.nonFormattedText = v;
          if(that.mode == 'edit'){
            that.view.e.text(that.nonFormattedText);
          } else {
            that.view.e.html(that.parseLinks(that.nonFormattedText));
            that.addLinkHandlers();
          }
          that.checkEmpty();
          that.updateFontSize();
          that.changed(true);
        };

        that.changed = function(isResize){
          setTimeout(function(){
            var data = {
              ratio:that.view.wrapper.outerWidth()/that.view.wrapper.outerHeight(),
              text:that.nonFormattedText
            };
            that.options.onChange(data,isResize);
          },10);
        };

        that.getTextFromField = function(){
          var v = that.view.e.html().replace(/<br\s*\/?>/mg,"\n");
          v = v.replace(/(<([^>]+)>)/ig,'');
          return $.trim(v.replace(/&nbsp;/ig,''));
        };

        that.view.e.on('keyup keydown keypress', function(e){

          $that.find('font').removeAttr('face');

          that.nonFormattedText = that.getTextFromField();
          that.checkEmpty(e);
          that.updateFontSize();



          if(e.type == 'keyup'){
            that.changed(true);
          }

          if(e.which == 13 && (that.options.oneLine || that.options.msie)) {
            e.preventDefault();
          }

          if(e.which == 8 || e.which == 46 ) return;

          that.checkMaxLength(e);
        });

        that.view.e.on('paste', function() {
          setTimeout(function() {
            that.nonFormattedText = that.view.e.text();
            that.cutText();
            that.cleanUpText();
            that.changed(true);
          }, 50);
        });

        that.view.e.on('focus', function() {
          if(!that.view.e.text()){
            if(that.options.msie) that.view.e.html('<br/>'); // I cnow.. feature detection and etc.. but this is not the case
          }
        });

        that.view.e.on('blur', function() {
          if(that.options.disableAfterFocus) that.viewMode();
          that.checkEmpty();
          that.options.onBlur();
        });

        // =======================================================================
        // =======================================================================

        that.text = function(v){
          that.setText(v);
        };

        that.blur = function(v){
          that.view.e.trigger('blur');
        };

        that.viewMode = function(){
          that.mode = 'view';
          that.nonFormattedText = that.getTextFromField();
          that.view.e.html(that.parseLinks(that.nonFormattedText));
          that.addLinkHandlers();
          $that.addClass(that.cl.view).removeClass(that.cl.edit);
          that.view.e.prop('contenteditable',false);
          that.changed(false);
        };

        that.editMode = function(opts){
          that.mode = 'edit';
          that.view.e.text(that.nonFormattedText);
          $that.removeClass(that.cl.view).addClass(that.cl.edit);
          that.view.e.prop('contenteditable',true).focus();
          if(opts && opts.selectAll && that.view.e.text()) that.view.e.selectText();
          that.changed(false);
        };

        return this;
      });
    },

    text: function(val){
      this.each(function() {
        if(this.utEditableContent) this.utEditableContent.text(val);
      });
      return this;
    },

    blur: function(){
      this.each(function() {
        if(this.utEditableContent) this.utEditableContent.blur();
      });
      return this;
    },

    edit: function(opts){
      this.each(function() {
        if(this.utEditableContent) this.utEditableContent.editMode(opts);
      });
      return this;
    },

    view: function(){
      this.each(function() {
        if(this.utEditableContent) this.utEditableContent.viewMode();
      });
      return this;
    }
  };

  $.fn.utEditableContent = function(method) {
    if (methods[method]) {
      methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else if (typeof method === 'object' || !method) {
      return methods.init.apply(this, arguments);
    } else {
      $.error('Method ' + method + ' does not exist on $.utEditableContent');
    }
    return this;
  };
})(window.jQuery);


jQuery.fn.selectText = function(){
    var doc = document;
    var element = this[0];
    if (doc.body.createTextRange) {
      var range = document.body.createTextRange();
      range.moveToElementText(element);
      range.select();
    } else if (window.getSelection) {
      var selection = window.getSelection();
      var range = document.createRange();
      range.selectNodeContents(element);
      selection.removeAllRanges();
      selection.addRange(range);
    }
};

