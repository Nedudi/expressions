var player = function(expression) {
  var that = this;
  that.expWidth = $(expression.getElement()).width();
  that.container = $("<div class='container'></div>").appendTo(expression.getElement());
  that.desc = $("<div class='desc'></div>").appendTo(that.container);
  if(expression.storage.title){
    that.header = $("<div class='header'></div>").appendTo(that.desc);
    that.titleContainer = $("<pre class='title_container'></div>").text(expression.storage.title).appendTo(that.header).css('font-size', parseInt((that.expWidth/576) * 150,10) + '%');
  }
  that.videoContainer = $("<div class='video_container'></div>").appendTo(that.desc).height(that.expWidth * (9/16));
  expression.container.resizeHeight(that.desc.outerHeight());
  that.videoContainer.utEmbedVideo({
    data: JSON.parse(expression.storage.videodata),
    showTopPanel: false,
    showBottomPanel: false,
    loadingBgStyle:'simple'
  });
};
