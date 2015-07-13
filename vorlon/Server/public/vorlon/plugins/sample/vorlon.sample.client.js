var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var SampleClient = (function (_super) {
        __extends(SampleClient, _super);
        function SampleClient() {
            _super.call(this, "sample"); // Name
            this._ready = true; // No need to wait
            console.log('Started');
        }
        //Return unique id for your plugin
        SampleClient.prototype.getID = function () {
            return "SAMPLE";
        };
        SampleClient.prototype.refresh = function () {
            //override this method with cleanup work that needs to happen
            //as the user switches between clients on the dashboard
            //we don't really need to do anything in this sample
        };
        // This code will run on the client //////////////////////
        // Start the clientside code
        SampleClient.prototype.startClientSide = function () {
            //don't actually need to do anything at startup
        };
        // Handle messages from the dashboard, on the client
        SampleClient.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            console.log('Got message from sample plugin', receivedObject.message);
            //The dashboard will send us an object like { message: 'hello' }
            //Let's just return it, reversed
            var data = {
                message: receivedObject.message.split("").reverse().join("")
            };
            this.sendToDashboard(data);
        };
        return SampleClient;
    })(VORLON.ClientPlugin);
    VORLON.SampleClient = SampleClient;
    //Register the plugin with vorlon core
    VORLON.Core.RegisterClientPlugin(new SampleClient());
})(VORLON || (VORLON = {}));
