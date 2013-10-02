UT.Expression.ready(function(post){

  var that = {};

  var isMobileApp = /(urturn)/i.test(navigator.userAgent);
  //post.size(320);
  //post.valid(true);

  var params = {width: 576, height: false, flexRatio: true, autoCrop: true, autoResize: true, groupMode: true};




  that.view = {
    container: $('.container'),
    desc:      $('.desc'),
    image:     $('.image')
  };


  that.centrifyImage = function(size) {
    if(post.context.player) {
      post.size(that.view.image.height());
      return;
    }
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

  };


  that.view.image.utImage({
    type: "svg",
    styles: params
  })
  .on('utImage:ready', function (e, data) {
    if(data.data) {

    } else {
      if(!post.context.mediaFirst) {
        that.view.image.utImage("dialog", {dialog: {fastQuit:true}});
      }
    }
  })
  .on('utImage:mediaReady', function (e, data) {



    post.display();
    that.view.container.addClass('help-mode');


    //console.log(data)
    that.centrifyImage({
      height: data.height,
      width:  data.width
    });

    that.view.image.utImage('update');

    if(!post.storage.filter && !post.context.player){
      post.storage.filter = {};
      post.storage.filter.hue = 200;
      post.storage.filter.gamma = 1.6;
      post.save();
    }

    that.size = {
      width:  that.view.image.width(),
      height: that.view.image.height()
    };

    $('#svgfilters').find('filter').clone().appendTo($('.ut-image-view').find('defs'));
    $('.ut-image-view').find('image')[0].setAttribute('filter','url(#studioFilter)');
    that.hueDef = document.getElementById('hue');
    that.satDef = document.getElementById('sat');
    that.rcDef  = document.getElementById('redChannel-0');
    that.bcDef  = document.getElementById('blueChannel-0');
    that.gcDef  = document.getElementById('greenChannel-0');

    that.changeStyle();

    if(!post.context.player){
      post.valid(true);
      that.view.image.pointerAction('update');
    }





  })
  .on('utImage:resize', function () {
    that.view.image.utImage('update');
  });


   //console.log('===========',post.storage.filter)


  that.changeStyle = function(){
    that.rcDef.setAttribute('amplitude',post.storage.filter.gamma);
    that.bcDef.setAttribute('amplitude',post.storage.filter.gamma);
    that.gcDef.setAttribute('amplitude',post.storage.filter.gamma);
    that.hueDef.setAttribute('values',post.storage.filter.hue);
    //console.log('============change style==========',post.storage.filter.gamma,post.storage.filter.hue);
  };

  that.posToFilterParams = function(v){
    return {
      hue:   (v.x/that.size.width)*360,
      gamma: 2-(v.y/that.size.height)*2 + 0.5
    };
  };

  if(!post.context.player){
    that.view.image.pointerAction({
      back:$('body'),
      onStart: function(v){
        that.view.container.find('.help').remove();
        post.storage.filter = that.posToFilterParams(v);
        that.changeStyle();
      },
      onMove: function(v){
        post.storage.filter = that.posToFilterParams(v);
        that.changeStyle();
      },
      onEnd: function(v){
        post.save();
        console.log('save');
      }
    });
  }


});