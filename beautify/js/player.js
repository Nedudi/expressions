UT.Expression.ready(function(post) {
  "use strict";
  var that = {};
  var element = $(post.node);
  var isTouch = 'ontouchstart' in window || window.navigator.msMaxTouchPoints > 0;
  that.view = {};
  that.view.desc   = $('.desc');
  that.view.image  = $('.image');
  that.view.text   = $('.text');
  that.view.frame  = $('.frame');
  that.view.tip    = $('.tip');

  that.view.tip.html((isTouch?'Tap':'Click')+' to see the original image');

  post.size(element.width()/post.storage.ratio);

  var currentD = true;

  var iS = new Image();
  var iD = new Image();

  iS.url = post.storage.imageD.url;
  iD.url = post.storage.imageS.url;

  that.view.desc.css('background-image','url('+post.storage.imageD.url+')');
  that.view.image.css('background-image','url('+post.storage.imageD.url+')');
  that.view.image.on('click', function(){
    that.view.tip.hide();
    if(currentD){
      that.view.image.css('background-image','url('+post.storage.imageS.url+')');
    } else {
      that.view.image.css('background-image','url('+post.storage.imageD.url+')');
    }
    currentD =! currentD;
  });

  that.view.text
  .css("fontSize", (that.view.image.width()/8) + "px")
  .css({
    "-webkit-transform":"rotate(" + (post.storage.headerRotation || 0) + "deg)",
    "-moz-transform":"rotate(" + (post.storage.headerRotation || 0) + "deg)",
    "-ms-transform":"rotate(" + (post.storage.headerRotation || 0) + "deg)",
    "-o-transform":"rotate(" + (post.storage.headerRotation || 0) + "deg)",
    "transform":"rotate(" + (post.storage.headerRotation || 0) + "deg)"
  });

  if(post.storage.text){
    that.view.text.utEditableContent({
      post:post,
      maxLength: 30,
      saveMaxFont: 30,
      maxFont: 1.2,
      minFont: 0.7,
      minFontCount: 100,
      maxRows: 5,
      oneLine: true
    });
    that.view.text.utEditableContent('text',post.storage.text);
  }
});
