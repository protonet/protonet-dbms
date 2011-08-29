$(function() {
  // Add sound on/off button
  var soundOn = protonet.user.Config.get("sound");
  
  var getCssClass = function() {
    return soundOn ? "sound-on" : "sound-off"
  };
  
  $("<li>", {
    "class":          getCssClass(),
    title:            "sound on/off",
    "data-extension": "sound",
    click:            function() {
      soundOn = !soundOn;
      this.className = getCssClass();
      protonet.user.Config.set("sound", false);
    }
  }).appendTo("#message-form menu");
});