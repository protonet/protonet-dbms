$(function() {
  // Bring the visitor into the right mood
  protonet.trigger("monster.in_love");
  
  // Add sound on/off button only when browser supports playing Audio
  if (!window.Audio) {
    return;
  }
  
  var soundOn = protonet.user.Config.get("sound");
  
  var getCssClass = function() {
    return soundOn ? "sound-on" : "sound-off";
  };
  
  $("<li>", {
    "class":          getCssClass(),
    title:            "sound on/off",
    "data-extension": "sound",
    click:            function() {
      soundOn = !soundOn;
      this.className = getCssClass();
      protonet.user.Config.set("sound", soundOn);
    }
  }).appendTo("#message-form menu");
  
  protonet.user._createContextMenu = function() {
    // TODO: One day we should combine the context menu logic with our behaviors. FO SHIZZLE.
    // By the way: "Taylor Swift - The Best Day" is a really good song.
    // U have to check it out http://grooveshark.com/#/s/The+Best+Day/2fZAWg
    // kkthxbai
    var contextOptions = {
      "show profile": function($link, closeContextMenu) {
        var url = $link.prop("href");
        if (protonet.config.allow_modal_views) {
          protonet.open(url);
        } else {
          window.open(url, "profile" + new Date().getTime());
        }
        closeContextMenu();
      }.bind(this),
      "send @reply": function(link, closeContextMenu) {
        var user = this.usersData[link.data("user-id")] || (function() {
          var meep = link.parents("li").data("meep");
          return meep && { name: meep.author };
        })();
        if (user) {
          protonet.trigger("form.create_reply", user.name);
        }
        closeContextMenu();
      }.bind(this),
      "ignore user": function(link, closeContextMenu) {
        protonet.ignoreList.addOrRemove(link.data("user-id"));
        closeContextMenu();
      },
      "unignore user": function(link, closeContextMenu) {
        protonet.ignoreList.addOrRemove(link.data("user-id"));
        closeContextMenu();
      },
      "start private chat": function(link, closeContextMenu) {
        protonet.trigger("rendezvous.start", +link.data("user-id"));
        closeContextMenu();
      }.bind(this)
    };

    var contextMenu = new protonet.ui.ContextMenu("a[data-user-id]", contextOptions, "context-menu-users");
    contextMenu.bind("opening", function(e, menu, target) {
      var userId = target.data("user-id");
      if (userId.toString().match(/_/) || userId == -1) {
        $.each(["show profile", "start private chat"], function(i, element){
          menu.list.children("li:contains('" + element + "')").hide();
        });
      } else {
        $.each(["show profile", "start private chat"], function(i, element){
          menu.list.children("li:contains('" + element + "')").show();
        });
      }
      if ($.inArray(userId, protonet.ignoreList.ignoredUserIds) != -1) {
        menu.list.children("li:contains('ignore user')").hide();
        menu.list.children("li:contains('unignore user')").show();
      } else {
        menu.list.children("li:contains('ignore user')").show();
        menu.list.children("li:contains('unignore user')").hide();
      }
    });
  };

  protonet.ignoreList = {
    "initialize": function() {
      this.ignoredUserIds = [];
      this.load();
      protonet
        .on("meep.rendered", function(element, data, instance) {
          if (this.ignoredUserIds.length > 0 && $.inArray(data.user_id, this.ignoredUserIds) != -1) {
            element.hide();
          }
        }.bind(this));
    },

    "addOrRemove": function(userId) {
      if($.inArray(userId, this.ignoredUserIds) != -1) {
        this.removeIgnore(userId);
      } else {
        this.addIgnore(userId)
      }
    },

    "addIgnore": function(userId) {
      this.ignoredUserIds.push(userId);
      protonet.trigger('flash_message.notice', 'You are now ignoring user ' + userId);
      new Image().src = "http://growing-beach-5771.heroku.com/add?user_id=" + protonet.config.user_id + "&ignored_user_id=" + userId + "&communication_token=" + protonet.config.token
    },

    "removeIgnore": function(userId) {
      this.ignoredUserIds.splice($.inArray(userId, this.ignoredUserIds), 1);
      protonet.trigger('flash_message.notice', 'You have stopped ignoring ' + userId);
      new Image().src = "http://growing-beach-5771.heroku.com/remove?user_id=" + protonet.config.user_id + "&ignored_user_id=" + userId + "&communication_token=" + protonet.config.token
    },

    "load": function() {
      $.ajax({url: "http://growing-beach-5771.heroku.com/load", dataType: "jsonp", data: {"user_id": protonet.config.user_id}, success: function(data) {
          console.log(data);
        }
      })
    }
  }

  protonet.ignoreList.initialize();



});