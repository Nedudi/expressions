UT.Expression.ready(function(post) {
  "use strict";
  var that = {};

  // ========= ready state controller begin ==========//
  // TODO: move this controller to API somewhere//
  that.readyStateController = {
    setKeys:function(keys, onReady){
      var that = this;
      that.keys = {};
      that.onReady = onReady;
      keys.map(function(key){that.keys[key] = {ready:false, data:false};});
    },
    readyKey:function(key,data){
      var that = this;
      if(!that.keys) {console.error('Please call setKeys with defined array of keys before calling readyKey for partiqular key');return;}
      if(!that.keys[key]) {console.error('wrong key, that was not defined in setKeys');return;}
      that.keys[key].ready = true;
      that.keys[key].data = data || false;
      console.log('==> readyStateController -> "',key,'" - ', data);
      for(var i in that.keys){if(!that.keys[i].ready) {return;}}
      console.log('======> YEAH :) all medias/fonts/etc.. are ready',that.keys);
      that.onReady(that.keys);
    },
    cacheImage: function(key, url) {
      var self = this;
      var tmpImg = new Image();
      tmpImg.onload = function() {
        self.readyKey(key, tmpImg);
      };
      tmpImg.onerror = function() {
        self.readyKey(key, tmpImg);
      };
      tmpImg.src = url;
    },
    cacheFont: function(key, name) {
      var self = this;
      fontdetect.onFontLoaded(name, function(){
        self.readyKey(key, name);
      }, function() {
        console.error('BAD .. FONT NOT LOADED IN 10 SEC...');
        self.readyKey(key, name);
      }, {msInterval: 100, msTimeout: 10000});
    }
  };
  // ========= ready state controller end ==========//

  that.readyStateController.setKeys(["imageS","imageD",'font1','font2'], function(){
    post.size($(post.node).width()/post.storage.ratio);
    post.display();
  });

  that.readyStateController.cacheImage('imageS',post.storage.imageS.url);
  that.readyStateController.cacheImage('imageD',post.storage.imageD.url);
  that.readyStateController.cacheFont('font1','BoycottRegular');
  that.readyStateController.cacheFont('font2','CasinoHandRegular');


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
