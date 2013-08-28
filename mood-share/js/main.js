UT.Expression.ready(function(post){

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
  });




  that.editMode = !post.context.player;
  that.isTouch = (('ontouchstart' in window) || (window.navigator.msMaxTouchPoints > 0));

  that.fonts = {
    1:'bebas_neueregular',
    2:'nosiferregular',
    3:false,
    4:'press_start_2pregular',
    5:false,
    6:'gooddogregular'
  };

  if(that.editMode){
    that.fullSize = {width:$(post.node).width(), height:$(post.node).height()};
  }

  that.validate = function(){
    post.valid(!!(post.storage.h1 || post.storage.mediaType));
  };

  that.updateSize = function(){
    var descHeight = that.view.desc.outerHeight();
    if((that.isTouch || that.view.container.hasClass('button_edit_hidden')) && that.editMode && descHeight < that.fullSize.height){
      post.size({height: that.fullSize.height});
    } else {
      post.size({height: descHeight});
    }

    that.view.desc.css({
      'marginTop': - descHeight/2 + 'px',
      'top': '50%'
    });
  };

  that.updateTheme = function(v){
    that.view.container.css('left','-4000px');
    that.view.h1.removeClass('slabtextdone');
    $('body').removeClass('slabtexted');
    if(v){
      //that.view.container.alterClass("t*","t0"); // clean
      post.storage.theme = v;
      post.save();
      that.validate();
    } else {
      if(post.storage.theme){
        v = post.storage.theme;
      } else {
        v = 3;
      }
    }

    var onFontLoaded = function(){
      that.view.container.css('left','0px');
      var l = post.storage.h1?post.storage.h1.length:1;
      var fs = $(post.node).width()/l*1.5;
      if(fs>$(post.node).width()/40) fs = $(post.node).width()/40;
      that.view.desc.css('fontSize', fs + 'px' );
      that.view.container.alterClass("t*","t" + v);
      that.view.h1.slabText({
         noResizeEvent: true,
         fontRatio: 1.4
        // minCharsPerLine: 2
      });

      that.view.h1.find('b').map(function(i,v){
        $(v).html(post.autoLink( $(v).html()));
      });

      that.updateSize();
    };

    if(that.fonts[v]){
      fontdetect.onFontLoaded(that.fonts[v], function () {
        onFontLoaded();
      }, function () {
      }, {msInterval: 50, msTimeout: 10000});
    } else {
      onFontLoaded();
    }
  };

  that.updateText = function(v){
    if(v){
      that.view.h1.html(v);
      post.storage.h1 = v;
      post.save();
      that.validate();
    } else {
      if(post.storage.h1){
        v = post.storage.h1;
      } else {
        v = (that.isTouch?'tap':'click')+' to enter your own text';
      }
    }

    that.view.h1.html(v);
  };



  that.addEditModeStuff = function(){
    that.view.mediaMenu       = $("<div>",{'class':'media_core_menu'}).appendTo(that.view.mediaContainer);
    that.view.mediaMenuHeader = $("<div>",{'class':'media_core_menu_header'}).html('Add some media ...if you want').appendTo(that.view.mediaMenu);
    that.view.mediaMenuImage  = $("<div>",{'class':'button media_core_menu_item media_core_menu_item_image icon_picture'}  ).appendTo(that.view.mediaMenu).on('click', function(){that.addMedia.image({dialog:true});});
    that.view.mediaMenuVideo  = $("<div>",{'class':'button media_core_menu_item media_core_menu_item_video icon_video_alt'}).appendTo(that.view.mediaMenu).on('click', function(){that.addMedia.video({dialog:true});});
    that.view.mediaMenuAudio  = $("<div>",{'class':'button media_core_menu_item media_core_menu_item_audio icon_sound'}    ).appendTo(that.view.mediaMenu).on('click', function(){that.addMedia.audio({dialog:true});});
    that.view.buttons         = $("<div>",{'class':'buttons'}).appendTo(that.view.desc);
    that.view.buttonEditText  = $("<a>",{'class':'needsclick button icon_text  button_edit button_edit_text' }).prop('title','Edit text' ).appendTo(that.view.buttons);
    that.view.buttonEditStyle = $("<a>",{'class':'needsclick button icon_brush button_edit button_edit_style'}).prop('title','Edit style').appendTo(that.view.buttons);

    that.view.menu = $("<div>",{'class':'menu'}).appendTo(that.view.container);
    that.view.menu.utPopupMenu({
      title: 'Choose a theme',
      items:[
        {html:'<img src="images/1.png"/><span>Official</span>',      value:1},
        {html:'<img src="images/2.png"/><span>Paint</span>',         value:2},
        {html:'<img src="images/3.png"/><span>Grunge</span>',        value:3},
        {html:'<img src="images/4.png"/><span>Geek</span>',          value:4},
        {html:'<img src="images/5.png"/><span>Stereo</span>',        value:5},
        {html:'<img src="images/6.png"/><span>Rasta</span>',          value:6}
      ]
    });

    that.view.tenu = $("<div>",{'class':'tenu'}).appendTo(that.view.container);
    that.view.tenu.utPopupText({
      title: 'Type your quote',
      maxLength: '200'
    });

    that.view.mediaCore.off('click').on('click', '.ut-image-button-remove, .ut-video-ui-remove, .ut-audio-ui-remove', function(e){
      e.stopPropagation();
      e.preventDefault();
      that.clearMedia();
    });



    that.editStyle = function(){
      post.valid(false);
      that.view.container.addClass('button_edit_hidden');
      that.updateSize();
      that.view.menu.utPopupMenu('show',{val:post.storage.theme},function(v){
        that.view.menu.utPopupMenu('hide');
        that.view.container.removeClass('button_edit_hidden');
        that.updateSize();
        that.updateText();
        that.updateTheme(v);
        that.validate();
      });
    };

    that.editText = function(){
      post.valid(false);
      if(that.isTouch){
        post.dialog('text', {value: post.storage.h1}, function(v){
          if(v){
            that.updateSize();
            that.updateText(v);
            that.updateTheme();
            that.validate();
          }
        });
      } else {
        that.view.container.addClass('button_edit_hidden');
        that.updateSize();
        that.view.tenu.utPopupText('show',{val:post.storage.h1},function(v){
          that.view.tenu.utPopupText('hide');
          that.view.container.removeClass('button_edit_hidden');
          that.updateSize();
          that.updateText(v);
          that.updateTheme();
          that.validate();
        });
      }

    };


    that.view.buttonEditText.on('click', function(){
      that.editText();
    });

    that.view.buttonEditStyle.on('click', function(){
      that.editStyle();
    });
  };


  that.showMediaMenu = function(bool){
    if(that.view.mediaMenu) that.view.mediaMenu[bool?'show':'hide']();
  };

  that.clearMedia = function(){
    post.storage.mediaType = null;
    post.save();
    //that.view.mediaCore.utImage('destroy');
    that.view.mediaCore.utVideo('destroy');
    that.view.mediaCore.utAudio('destroy');
    that.view.mediaCore.empty();
    that.showMediaMenu(true);
    that.updateSize();
    that.validate();
  };

  that.addMedia = {
    image: function(options){
     var media = $("<div>",{'class':'media image'}).prop('id','media1').appendTo(that.view.mediaCore);
     media
     .utImage()
     .on('utImage:mediaReady', function(e,data){
       that.showMediaMenu(false);
       post.storage.mediaType = 'image';
       post.save();
       that.validate();
     })
     .on('utImage:resize', function(e,data){
       that.updateSize();
       setTimeout(function(){media.utImage('update');},1);
     })
     .on('utImage:dialogCancel', function(e,data){
       that.clearMedia();
     });
     if(options.dialog){media.utImage('dialog');}
    },

    video: function(options){
     var media = $("<div>",{'class':'media video'}).prop('id','media1').appendTo(that.view.mediaCore);
     media
     .height(media.width()/(16/9))
     .utVideo()
     .on('utVideo:mediaReady', function(e,data){
        that.showMediaMenu(false);
        post.storage.mediaType = 'video';
        post.save();
        that.updateSize();
        that.validate();
     }).on('utVideo:dialogclose', function(e,data){
       that.clearMedia();
     });
     if(options.dialog){media.utVideo('dialog');}
     that.updateSize();
    },

    audio: function(options){
     var media = $("<div>",{'class':'media video'}).prop('id','media1').appendTo(that.view.mediaCore);
     media
     .height(media.width())
     .utAudio()
     .on('utAudio:mediaReady', function(e,data){
        that.showMediaMenu(false);
        post.storage.mediaType = 'audio';
        post.save();
        that.updateSize();
        that.validate();
     }).on('utAudio:dialogclose', function(e,data){
        that.clearMedia();
     });
     if(options.dialog){media.utAudio('dialog');}
     that.updateSize();
    }
  };

  that.view = {};
  that.view.container      = $("<div>",{'class':'container'}).appendTo(post.node);
  that.view.desc           = $("<div>",{'class':'desc'}).appendTo(that.view.container);
  that.view.mediaContainer = $("<div>",{'class':'media_container'}).appendTo(that.view.desc);
  that.view.mediaCore      = $("<div>",{'class':'media_core'}).appendTo(that.view.mediaContainer);
  if(that.editMode){that.addEditModeStuff();}
  that.view.h1             = $("<h1>",{'class':'text_container needsclick'})
  .appendTo(that.view.desc).on('click', function(){
    if(that.editMode) that.editText();
  });

  that.updateText();
  that.updateTheme();

  if(post.storage.mediaType){
    that.addMedia[post.storage.mediaType]({
      dialog:false
    });
  } else {
    if(!that.editMode){
      that.view.mediaContainer.hide();
    }
  }

  if(!post.storage.h1 && !that.editMode){
    that.view.h1.hide();
    that.view.mediaContainer.css('margin-bottom',0);
  }

  that.updateSize();
  that.validate();
  post.save();

});
