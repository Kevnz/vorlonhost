var VORLON;
(function (VORLON) {
    var Tools = (function () {
        function Tools() {
        }
        Tools.GetOperatingSystem = function (ua) {
            var currentLowerUA = ua.toLowerCase();
            // Windows Phone
            if (currentLowerUA.indexOf("windows phone") >= 0) {
                return "Windows Phone";
            }
            // Windows
            if (currentLowerUA.indexOf("windows") >= 0) {
                return "Windows";
            }
            // Android
            if (currentLowerUA.indexOf("android") >= 0) {
                return "Android";
            }
            // iOS
            if (currentLowerUA.indexOf("apple-i") >= 0) {
                return "iOS";
            }
            if (currentLowerUA.indexOf("iphone") >= 0) {
                return "iOS";
            }
            if (currentLowerUA.indexOf("ipad") >= 0) {
                return "iOS";
            }
            // BlackBerry
            if (currentLowerUA.indexOf("blackberry") >= 0) {
                return "BlackBerry";
            }
            // BlackBerry
            if (currentLowerUA.indexOf("(bb") >= 0) {
                return "BlackBerry";
            }
            // Kindle
            if (currentLowerUA.indexOf("kindle") >= 0) {
                return "Kindle";
            }
            // Macintosh
            if (currentLowerUA.indexOf("macintosh") >= 0) {
                return "Macintosh";
            }
            // Linux
            if (currentLowerUA.indexOf("linux") >= 0) {
                return "Linux";
            }
            // OpenBSD
            if (currentLowerUA.indexOf("openbsd") >= 0) {
                return "OpenBSD";
            }
            // Firefox OS
            if (currentLowerUA.indexOf("firefox") >= 0) {
                return "Firefox OS"; // Web is the plaform
            }
            return "Unknown operating system";
        };
        return Tools;
    })();
    VORLON.Tools = Tools;
})(VORLON = exports.VORLON || (exports.VORLON = {}));
