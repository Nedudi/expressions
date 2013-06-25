  UT.Expression.ready(function(post) {
  "use strict";
  var that = {};
  var element = $(post.node);
  var isTouch = 'ontouchstart' in window || window.navigator.msMaxTouchPoints > 0;
  that.view = {};
  that.view.desc   = $("<div>",{"class":"desc"}).appendTo(element);
  that.view.image   = $("<div>",{"class":"image"}).appendTo(that.view.desc);
  that.view.canvas = $("<canvas>",{"class":"canvas"}).appendTo(that.view.image);
  that.view.zoomer = $("<div>",{"class":"zoomer"}).appendTo(that.view.image);
  that.view.text   = $("<div>",{"class":"text"}).appendTo(that.view.image);
  that.view.help   = $("<div>",{"class":"help"}).html(

    '<div class="help-face">'+
      '<div class="help-title">Uglify image</div>'+
      '<div class="help-finger"></div>'+
      '<div class="help-circle"></div>'+
      '<div class="help-bottom">Add cool title at the bottom</div>'+
      // '<div class="help-bottom2">Share everywhere and have fun</div>'+
      '<div class="help-gotit">Got it!</div>'+
    '</div>'+

    '<div class="help-close"></div>'
  ).appendTo(that.view.desc);

  that.view.gotit = that.view.help.find('.help-gotit').on('click', function(){
    that.view.help.hide();
  });

  that.view.add    = $("<a href='#'>").addClass("add-button dark-button icon_camera spaced-right large-button button").text("Add Image").appendTo(that.view.addWrap);
  that.view.remove = $("<a href='#'>").addClass("remove-button action-button icon_trash large-button button").appendTo(that.view.desc);

  that.updateFrame = function(){
    if(that.view.frame) {that.view.frame.remove();}
    that.view.frame   = $("<div>",{"class":"frame"}).appendTo(that.view.image);
  }

  that.zoomer = {pos:false};


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

  that.initZoomer = function(){
    //that.state = "zoomer";
    $('body').on('mousedown touchmove', function(e){
      if(!that.zoomer.pos){
        var pointerPos = that.touchToXY(e);
        that.zoomer.pos = pointerPos;
        that.zoomer.pos.r = 0;
        that.renderZoomer();
      }
    }).on('mousemove touchmove', function(e){
      //that.doLoupe(that.zoomer.pos);
      if(that.zoomer.pos){
        var z = that.zoomer.pos;
        var p = that.touchToXY(e);
        z.r = Math.sqrt((p.x - z.x)*(p.x - z.x) + (p.y - z.y)*(p.y - z.y));
        console.log(z.r)
        that.renderZoomer();
      }
    }).on('mouseup touchend', function(e){
      that.doLoupe(that.zoomer.pos);
      that.zoomer.pos = false;
      that.renderZoomer();

    });
  };

  that.renderZoomer = function(){
    if(!that.zoomer.pos) {
      that.view.zoomer.hide();
    } else {
      if(that.zoomer.pos.r === 0) {
        that.view.zoomer.show();
      }
      var p = that.zoomer.pos;
      that.view.zoomer.css({
        left:       p.x+'px',
        top:        p.y+'px',
        width:      p.r*2+'px',
        height:     p.r*2+'px',
        marginTop:  -p.r+'px',
        marginLeft: -p.r+'px'
      });
    }
  };

  that.doLoupe = function(p){
    uglify(that.view.canvas[0],'zoomout',p.x,p.y,p.r);
  };

  that.showImageDialog = function() {
    post.dialog('image', {size: { width: 576, height: false, flexRatio: true, autoCrop: true }}, function(data, error) {
      if (error) {return;}
      if (data) {that.insertImage(data);}
    });
  };

  that.updateSize = function(){
    // that.view.image.width() = $(post.node).width();
    // that.view.image.height() = $(post.node).height();
  };

  that.createImgCanvas = function(){
    that.view.canvas.get(0).width = that.view.image.width();
    that.view.canvas.get(0).height = that.view.image.height();
    var imgCtx = that.view.canvas.get(0).getContext('2d');
    imgCtx.drawImage(that.img, 0, 0, that.view.image.width(), that.view.image.height());

    return imgCtx;
  };

  that.createImageOverlay = function() {
    var imgCtx = that.createImgCanvas();
    that.imageOverlay = new UT.Image(that.view.canvas.get(0).toDataURL());
  };

  that.saveData = function() {
    post.storage.imageOverlay = that.imageOverlay;
    post.storage.save();
    var res = !!that.imageOverlay;
    post.valid(res);
  };

  that.clear = function(){
    that.saveData();
    that.view.desc.removeClass('full');
    var imgCtx = that.view.canvas.get(0).getContext('2d');
    imgCtx.clearRect(0, 0, that.view.image.width(), that.view.image.height());
    that.updateSize();
    that.showImageDialog();
  };

  that.setBackground = function(){
    //that.updateSize();
  };

  that.createBackground = function(){
    that.updateSize();
    that.createImageOverlay();
    that.saveData();
  };


  that.onImageSizeChangedOutside = function(size) {
    console.log("onImageSizeChangedOutside", size.width, size.height);



    var height = size.height || that.view.desc.height();
    var width = size.width || that.view.desc.width();
    var dwidth = Math.floor(width*(that.view.desc.height()/height));
    var dheight = Math.floor(height*(that.view.desc.width()/width));

    if(dheight <= that.view.desc.height()){
      that.view.image.css({
        height: dheight+'px',
        marginTop: -Math.round(dheight/2)+'px',
        top: '50%',
        left: "", width: "", marginLeft:""
      });
    } else {
      that.view.image.css({
        width: dwidth+'px',
        marginLeft: -Math.round(dwidth/2)+'px',
        left: '50%',
        top: "", height: "", marginTop:""
      });
    }
    that.offset = $(that.view.image).offset();
    that.updateSize();
    that.updateFrame();
  };


  that.insertImage = function(data) {
    var ii = new UT.Image(data.url);
    ii.editable(function(data) {
      that.img = new Image();
      //$('body').append(that.img);
      that.img.onload = function() {
        that.ratio = that.img.width/that.img.height;
        //console.log(that.ratio);
        that.onImageSizeChangedOutside({width:that.img.width, height: that.img.height});
        that.createBackground();
      };
      that.img.src = data.url;
      //face
    });
  };







  that.initZoomer();

  // $(".text").html('Hello world');


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

  that.view.text.on('touchstart', function(e){
    e.stopPropagation();
    post.dialog('text',{ 'value':that.textData, 'max':100, 'multiline': true  }, function(newText){
      if(newText){
        that.textEdit.utEditableContent('text',newText);
      }
    });
  });

  that.view.text.on('click', function(e){
    e.stopPropagation();
    if(!isTouch){
      if(that.editModeText) return;
      else that.editModeText = true;
      that.view.text.utEditableContent('edit');
    }
  });

  that.view.add.on('clcik',that.showImageDialog);
  that.view.remove.on('click',that.clear);

  that.updateSize();

  post.on('resize', function(){});


  that.showImageDialog();


  return that;
});
