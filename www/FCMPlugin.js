var exec = require("cordova/exec");
var cordova = require("cordova");


var execAsPromise = function (command, args) {
  if (args === void 0) { args = []; }
  return new Promise(function (resolve, reject) {
      window.cordova.exec(resolve, reject, 'FCMPlugin', command, args);
  });
};

var bridgeNativeEvents = function (eventTarget) {
  var onError = function (error) { return console.log('FCM: Error listening to native events', error); };
  var onEvent = function (data) {
      try {
          var _a = JSON.parse(data), eventName = _a[0], eventData = _a[1];
          eventTarget.dispatchEvent(new CustomEvent(eventName, { detail: eventData }));
      }
      catch (error) {
          console.log('FCM: Error parsing native event data', error);
      }
  };
  window.cordova.exec(onEvent, onError, 'FCMPlugin', 'startJsEventBridge', []);
};

function FCMPlugin() {
  var _this = this;
  this.eventTarget = document.createElement('div');
  execAsPromise('ready')
      .catch(function (error) { return console.log('FCM: Ready error: ', error); })
      .then(function () {
      console.log('FCM: Ready!');
      bridgeNativeEvents(_this.eventTarget);
  });
  console.log("FCMPlugin.js: is created");
}

// CHECK FOR PERMISSION
FCMPlugin.prototype.hasPermission = function(success, error) {
  if (cordova.platformId !== "ios") {
    success(true);
    return;
  }
  exec(success, error, "FCMPlugin", "hasPermission", []);
};

// SUBSCRIBE TO TOPIC //
FCMPlugin.prototype.subscribeToTopic = function(topic, success, error) {
  exec(success, error, "FCMPlugin", "subscribeToTopic", [topic]);
};

// UNSUBSCRIBE FROM TOPIC //
FCMPlugin.prototype.unsubscribeFromTopic = function(topic, success, error) {
  exec(success, error, "FCMPlugin", "unsubscribeFromTopic", [topic]);
};

// NOTIFICATION CALLBACK //
FCMPlugin.prototype.onNotification = function(callback, success, error) {
  FCMPlugin.prototype.onNotificationReceived = callback;
  exec(success, error, "FCMPlugin", "registerNotification", []);
};

// TOKEN REFRESH CALLBACK //
FCMPlugin.prototype.onTokenRefresh = function(callback) {
  FCMPlugin.prototype.onTokenRefreshReceived = callback;
};

// GET TOKEN //
FCMPlugin.prototype.getToken = function(success, error) {
  exec(success, error, "FCMPlugin", "getToken", []);
};

// GET APNS TOKEN //
FCMPlugin.prototype.getAPNSToken = function(success, error) {
  if (cordova.platformId !== "ios") {
    success(null);
    return;
  }
  exec(success, error, "FCMPlugin", "getAPNSToken", []);
};

// CLEAR ALL NOTIFICATIONS //
FCMPlugin.prototype.clearAllNotifications = function(success, error) {
  exec(success, error, "FCMPlugin", "clearAllNotifications", []);
};

// DEFAULT NOTIFICATION CALLBACK //
FCMPlugin.prototype.onNotificationReceived = function(payload) {
  console.log("Received push notification");
  console.log(payload);
};

// DEFAULT TOKEN REFRESH CALLBACK //
FCMPlugin.prototype.onTokenRefreshReceived = function(token) {
  console.log("Received token refresh");
  console.log(token);
};

// FIRE READY //
exec(
  function(result) {
    console.log("FCMPlugin Ready OK");
  },
  function(result) {
    console.log("FCMPlugin Ready ERROR");
  },
  "FCMPlugin",
  "ready",
  []
);

var fcmPlugin = new FCMPlugin();
module.exports = fcmPlugin;
