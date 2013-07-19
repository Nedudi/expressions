UT.Expression.ready(function(post) {
  "use strict";
  var that = {};
  var element = $(post.node);
  that.isTouch = 'ontouchstart' in window || window.navigator.msMaxTouchPoints > 0;
  that.view = {};
  that.view.desc        = $('.desc');
  that.view.image       = $('.image');
  that.view.canvas      = $('.canvas');
  that.view.zoomer      = $('.zoomer');
  that.view.text        = $('.text');
  that.view.help        = $('.help');
  that.view.sw          = $('.sw');
  that.view.swcheckbox  = $('.sw input');
  that.view.swlabel     = $('.sw label');
  that.view.refresh     = $('.sw .refresh');
  that.view.helpme      = $('.sw .helpme');

  that.zoomer = {pos:false};
  that.zoomMode = 'zoomout';

  post.storage.headerRotation = Math.floor(Math.random()*10 - 5);

  that.view.swlabel.on('touchend mouseup', function(){
    setTimeout(function(){
      that.zoomMode = that.view.swcheckbox.prop('checked')?'zoomin':'zoomout';
    },30);
  });

  that.view.swlabel.on('touchstart', function(e){
    e.stopPropagation();
    e.preventDefault();
    that.view.swcheckbox.prop('checked',!that.view.swcheckbox.prop('checked'));
  }).on('touchend touchcancel touchmove', function(e){
    e.stopPropagation();
    e.preventDefault();
  });

  that.view.help.on('click', function(e){
    e.stopPropagation();
    that.changeMode('main');
  }).on('mouseup mousedown touchend touchstart touchcancel', function(e){
    e.stopPropagation();
  });

  that.view.helpme.on('click', function(e){
    e.stopPropagation();
    that.changeMode('help');
  }).on('mouseup mousedown touchend touchstart touchcancel', function(e){
    e.stopPropagation();
  });

  that.view.sw.on('click', function(e){
    e.stopPropagation();
  }).on('mouseup mousedown touchend touchstart touchcancel', function(e){
    e.stopPropagation();
  });

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
    $('body')
    .on(that.isTouch?'touchstart':'mousedown', function(e){
      that.view.text.utEditableContent('blur');
      that.view.text.utEditableContent('view');
      if(!that.zoomer.pos){
        var pointerPos = that.touchToXY(e);
        that.zoomer.pos = pointerPos;
        that.zoomer.pos.r = 0;
        that.renderZoomer();
      }
    })
    .on(that.isTouch?'touchmove':'mousemove', function(e){
      if(that.zoomer.pos){
        var z = that.zoomer.pos;
        var p = that.touchToXY(e);
        z.r = Math.sqrt((p.x - z.x)*(p.x - z.x) + (p.y - z.y)*(p.y - z.y));
        that.renderZoomer();
      }
    })
    .on(that.isTouch?'touchend touchcancel':'mouseup mouseleave', function(e){
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
      var css = {
        left:       Math.round(p.x)+'px',
        top:        Math.round(p.y)+'px',
        width:      Math.round(p.r*2)+'px',
        height:     Math.round(p.r*2)+'px',
        marginTop:  Math.round(-p.r)+'px',
        marginLeft: Math.round(-p.r)+'px'
      };
      that.view.zoomer.css(css).text(css.width);
    }
  };

  that.readyToPost = function(bool){
    that.view.desc[bool?'addClass':'removeClass']('ready-to-post');
    post.valid(bool);
  };

  that.readyToAnimate = function(bool){
    that.view.desc[bool?'addClass':'removeClass']('ready-to-animate');
  };

  that.doLoupe = function(p){
    uglify(that.view.canvas[0],that.zoomMode, p.x, p.y, p.r, function(){
      setTimeout(function(){
        post.storage.imageD = new UT.Image(that.view.canvas.get(0).toDataURL());
        post.save();
        that.readyToPost(true);
      },100);
    });
  };

  that.showImageDialog = function(fastQuit) {
    post.dialog('image', {size: { width: 576, height: false, flexRatio: true, autoCrop: true, fastQuit:fastQuit }}, function(data, error) {
      if (error) {return;}
      if (data) {that.insertImage(data);}
    });
  };

  that.createImgCanvas = function(){
    that.view.canvas.get(0).width = that.view.image.width();
    that.view.canvas.get(0).height = that.view.image.height();
    that.view.canvasCtx = that.view.canvas.get(0).getContext('2d');
    that.view.canvasCtx.clearRect(0, 0, that.view.image.width(), that.view.image.height());
    that.view.canvasCtx.drawImage(that.img, 0, 0, that.view.image.width(), that.view.image.height());
  };

  that.clear = function(){
    that.createImgCanvas();
    post.storage.imageD = null;
    that.readyToPost(false);
  };

  that.centrifyImage = function(size) {
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
  };

  that.changeMode = function(mode){
    if(mode == "help"){
      that.view.desc.removeClass('main-mode').addClass('help-mode');
      that.centrifyImage({width:that.view.image.width(), height: that.view.image.height()});
    } else if(mode == 'main'){
      that.view.desc.removeClass('help-mode').addClass('main-mode');
      that.centrifyImage({width:that.img.width, height: that.img.height});
    }
  };

  that.insertImage = function(data) {
    post.storage.imageS = data;
    post.save();
    var ii = new UT.Image(data.url);
    ii.editable(function(data) {
      that.img = new Image();
      that.img.onload = function() {
        that.ratio = that.img.width/that.img.height;
        post.storage.ratio = that.ratio;
        post.save();
        that.changeMode('main');
        that.createImgCanvas();
        that.readyToAnimate(true);

        post.users('current', function(data){
          if (data.numberOfUse >= 1) {
            that.changeMode('main');
          } else {
            that.changeMode('help');
          }
        });

        post.pushNavigation('back', function(){
          that.showImageDialog(false);
        });

        that.view.text.css("fontSize", (that.view.image.width()/8) + "px");
      };
      that.img.src = data.url;
    });
  };

  that.initZoomer();

  that.view.text.utEditableContent({
    post:post,
    maxLength: 30,
    saveMaxFont: 30,
    maxFont: 1.2,
    minFont: 0.7,
    minFontCount: 100,
    maxRows: 5,
    placeholder: that.isTouch ? '<span>TAP to edit text</span>' : '<span class="desctop_placeholder">Write here...</span>',
    oneLine: true,
    disableAfterFocus: false,
    onChange: function(data){
      post.storage.text = data.text;
      post.storage.indexedContent = 'ugly distortion mirror ' + post.storage.text;
      post.save();
    },
    onBlur: function(data){
      that.view.text.utEditableContent('view');
      that.editModeText = false;
    }
  });

  that.view.text.utEditableContent('text',post.storage.text || '');

  that.view.text.find('.ut_e').add(that.view.text.find('.ut_p'))
  .on('touchmove touchend touchcancel mousemove mousedown mouseup click', function(e){
    if(that.editModeText) e.stopPropagation();
  })
  .on('click', function(e){
    if(that.editModeText) return;
    else that.editModeText = true;
    that.view.text.utEditableContent('edit',{selectAll:true});
  }).on('touchstart', function(e){
    e.stopPropagation();
    e.preventDefault();
    post.dialog('text',{ 'value':post.storage.text, 'max':30, 'multiline':true  } , function(newText){
      if(!newText) return;
      post.storage.text = newText;
      that.view.text.utEditableContent('text',post.storage.text || '');
    });
  });

  that.view.refresh.on('click',that.clear);
  post.on('resize', function(){});

  if(!post.storage.imageD){
    that.showImageDialog(true);
  } else {
    that.insertImage(post.storage.imageD);
    post.valid(true);
  }
  return that;
});
