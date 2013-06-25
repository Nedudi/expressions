  UT.Expression.ready(function(post) {
  "use strict";
  var that = {};
  var element = $(post.node);
  var isTouch = 'ontouchstart' in window || window.navigator.msMaxTouchPoints > 0;
  that.view = {};
  that.view.desc   = $("<div>",{"class":"desc"}).appendTo(element);
  that.view.img    = $("<img>",{"class":"img"}).appendTo(that.view.desc);
  that.view.text   = $("<div>",{"class":"text"}).appendTo(that.view.desc);
  that.view.frame  = $("<div>",{"class":"frame"}).appendTo(that.view.desc);

  that.view.text.utEditableContent({
    post:post,
    maxLength: 30,
    saveMaxFont: 30,
    maxFont: 1.6,
    minFont: 0.7,
    minFontCount: 100,
    maxRows: 5,
    placeholder: isTouch ? '<span>TAP<br>to edit text</span>' : '<span class="desctop_placeholder">Write here...</span>',
    oneLine: true,
    disableAfterFocus: false,
    onChange: function(data){
      post.storage.text = data.text;
      post.storage.indexedContent = 'ugly distortion mirror ' + post.storage.text;
      post.save();
      // that.checkValidContent();
    }
  });

  that.view.text.utEditableContent('text',post.storage.text || '');

});
