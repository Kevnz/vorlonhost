var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var NetworkMonitorClient = (function (_super) {
        __extends(NetworkMonitorClient, _super);
        function NetworkMonitorClient() {
            _super.call(this, "networkMonitor");
            this.performanceItems = [];
            this._ready = true;
        }
        NetworkMonitorClient.prototype.getID = function () {
            return "NETWORK";
        };
        NetworkMonitorClient.prototype.sendClientData = function () {
            var entries = window.performance.getEntries();
            //console.log(entries);
            this.performanceItems = [];
            for (var i = 0; i < entries.length; i++) {
                this.performanceItems.push({
                    name: entries[i].name,
                    type: entries[i].initiatorType,
                    startTime: entries[i].startTime,
                    duration: entries[i].duration,
                    redirectStart: entries[i].redirectStart,
                    redirectDuration: entries[i].redirectEnd - entries[i].redirectStart,
                    dnsStart: entries[i].domainLookupStart,
                    dnsDuration: entries[i].domainLookupEnd - entries[i].domainLookupStart,
                    tcpStart: entries[i].connectStart,
                    tcpDuration: entries[i].connectEnd - entries[i].connectStart,
                    requestStart: entries[i].requestStart,
                    requestDuration: entries[i].responseStart - entries[i].requestStart,
                    responseStart: entries[i].responseStart,
                    responseDuration: (entries[i].responseStart == 0 ? 0 : entries[i].responseEnd - entries[i].responseStart)
                });
            }
            //console.log(this.performanceItems);
            var message = {};
            message.entries = this.performanceItems;
            VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), message, 0 /* Client */, "message");
        };
        NetworkMonitorClient.prototype.startClientSide = function () {
            var that = this;
            window.onload = function (event) {
                that.sendClientData();
            };
        };
        NetworkMonitorClient.prototype.refresh = function () {
            this.sendClientData();
        };
        return NetworkMonitorClient;
    })(VORLON.ClientPlugin);
    VORLON.NetworkMonitorClient = NetworkMonitorClient;
    //Register the plugin with vorlon core 
    VORLON.Core.RegisterClientPlugin(new NetworkMonitorClient());
})(VORLON || (VORLON = {}));
