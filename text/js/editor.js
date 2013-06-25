UT.Expression.ready(function(post){



  WebFontConfig = {
    google: { families: [ 'Nosifer::latin', 'Finger+Paint::latin', 'UnifrakturCook:700:latin', 'Montserrat+Subrayada::latin', 'Black+Ops+One::latin', 'Press+Start+2P::latin' ] }
  };
  (function() {
    var wf = document.createElement('script');
    wf.src = ('https:' == document.location.protocol ? 'https' : 'http') +
      '://ajax.googleapis.com/ajax/libs/webfont/1/webfont.js';
    wf.type = 'text/javascript';
    wf.async = 'true';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(wf, s);
  })();










  var that = {};
  that.view = {};
  that.view.container      = $("<div>",{'class':'conainer'}).appendTo(post.node);
  that.view.desc           = $("<div>",{'class':'desc'}).appendTo(that.view.container);

  that.view.menu = $("<div>",{'class':'menu'}).appendTo(that.view.container);
  that.view.menu.utPopupMenu({
    items:[
      {html:'<div style="background-image:url(images/1.png)"><span></span></div>',         value:1},
      {html:'<div style="background-image:url(images/2.png)"><span></span></div>',         value:2},
      {html:'<div style="background-image:url(images/3.png)"><span></span></div>',         value:3},
      {html:'<div style="background-image:url(images/4.png)"><span></span></div>',         value:4}
    ]
  });

  that.updateStyle = function(v){
    that.view.desc.alterClass("t*","t0"); // clean
    setTimeout(function(){
        that.view.desc.alterClass("t*","t" + v);
        that.view.h1.slabText({});

        post.resize({height: that.view.desc.outerHeight()});

        // $('.slabtext b').on('click', function(){

        //   $(this).css('color', 'rgba(255,255,0,1)');
        // });

    },1000);


  };



  // that.view.buttons   = $("<div>",{'class':'buttons'}).appendTo(that.view.top);
  // that.view.addButton = $("<a>",{'class':'action-button icon_add spaced-right large-button button'}).appendTo(that.view.buttons).text('Add bubble').on('click', function(){
  //   that.view.menu.utPopupMenu('show',function(v){
  //     that.view.menu.utPopupMenu('hide');
  //     that.updateStyle(v);
  //   });
  // });

  that.updateStyle(4);

 // that.view.h1             = $("<h1>").html("Click to enter your idea, status or quote insted of this boring text").appendTo(that.view.desc);
 // that.view.h1             = $("<h1>").html("Official wall. Only for serious messages :D").appendTo(that.view.desc);
 // that.view.h1             = $("<h1>").html("Paint, color, splashes and chaos! Only for your best mood ;)").appendTo(that.view.desc);

  //that.view.h1             = $("<h1>").html("Romantic pop-grunge. Say something  and enjoy this style!").appendTo(that.view.desc);



 that.view.media          = $("<div>",{'class':'media'}).appendTo(that.view.desc);
 that.view.mediaCore      = $("<div>",{'class':'media_core'}).appendTo(that.view.media);
 that.view.buttons        = $("<div>",{'class':'buttons'}).appendTo(that.view.desc)
 that.view.buttonEditText = $("<a>",{'class':'button_edit_text'}).html('Edit text').appendTo(that.view.buttons);


 that.view.buttonEditPlus= $("<a>",{'class':'button_edit_style'}).html('+').appendTo(that.view.buttons);
 that.view.buttonEditMinus= $("<a>",{'class':'button_edit_style'}).html('-').appendTo(that.view.buttons);


 that.view.buttonEditStyle= $("<a>",{'class':'button_edit_style'}).html('Edit style').appendTo(that.view.buttons);

 that.view.h1             = $("<h1>").html("HEY Hipsters, wake up! Oldschool! Join the game! 8-bit style ;)").appendTo(that.view.desc);







that.view.buttonEditStyle.on('click', function(){
    that.view.menu.utPopupMenu('show',function(v){
      that.view.menu.utPopupMenu('hide');
      that.updateStyle(v);
    });
  });




  post.save();                         // save current state
  post.valid(true);                    // the post can be anytime from now.
});
