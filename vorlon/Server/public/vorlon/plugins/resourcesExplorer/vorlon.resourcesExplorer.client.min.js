var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var ResourcesExplorerClient = (function (_super) {
        __extends(ResourcesExplorerClient, _super);
        function ResourcesExplorerClient() {
            _super.call(this, "resourcesExplorer");
            this.localStorageList = [];
            this.sessionStorageList = [];
            this.cookiesList = [];
            this._ready = true;
        }
        ResourcesExplorerClient.prototype.getID = function () {
            return "RESOURCES";
        };
        ResourcesExplorerClient.prototype.sendClientData = function () {
            // LOCAL STORAGE
            this.localStorageList = [];
            for (var i = 0; i < localStorage.length; i++) {
                this.localStorageList.push({ "key": localStorage.key(i), "value": localStorage.getItem(localStorage.key(i)) });
            }
            // SESSION STORAGE
            this.sessionStorageList = [];
            for (var i = 0; i < sessionStorage.length; i++) {
                this.sessionStorageList.push({ "key": sessionStorage.key(i), "value": sessionStorage.getItem(sessionStorage.key(i)) });
            }
            // COOKIES
            this.cookiesList = [];
            var cookies = document.cookie.split(';');
            for (var i = 0; i < cookies.length; i++) {
                var keyValue = cookies[i].split('=');
                this.cookiesList.push({ "key": keyValue[0], "value": keyValue[1] });
            }
            var message = {};
            message.localStorageList = this.localStorageList;
            message.sessionStorageList = this.sessionStorageList;
            message.cookiesList = this.cookiesList;
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), message, 0 /* Client */, "message");
        };
        ResourcesExplorerClient.prototype.startClientSide = function () {
            var that = this;
            window.onload = function (event) {
                that.sendClientData();
            };
        };
        ResourcesExplorerClient.prototype.refresh = function () {
            this.sendClientData();
        };
        return ResourcesExplorerClient;
    })(VORLON.ClientPlugin);
    VORLON.ResourcesExplorerClient = ResourcesExplorerClient;
    //Register the plugin with vorlon core 
    VORLON.Core.RegisterClientPlugin(new ResourcesExplorerClient());
})(VORLON || (VORLON = {}));
