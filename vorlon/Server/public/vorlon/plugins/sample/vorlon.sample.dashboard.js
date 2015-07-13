var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var SampleDashboard = (function (_super) {
        __extends(SampleDashboard, _super);
        //Do any setup you need, call super to configure
        //the plugin with html and css for the dashboard
        function SampleDashboard() {
            //     name   ,  html for dash   css for dash
            _super.call(this, "sample", "control.html", "control.css");
            this._ready = true;
            console.log('Started');
        }
        //Return unique id for your plugin
        SampleDashboard.prototype.getID = function () {
            return "SAMPLE";
        };
        SampleDashboard.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                _this._inputField = filledDiv.querySelector('#echoInput');
                _this._outputDiv = filledDiv.querySelector('#output');
                // Send message to client when user types and hits return
                _this._inputField.addEventListener("keydown", function (evt) {
                    if (evt.keyCode === 13) {
                        _this.sendToClient({
                            message: _this._inputField.value
                        });
                        _this._inputField.value = "";
                    }
                });
            });
        };
        // When we get a message from the client, just show it
        SampleDashboard.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            var message = document.createElement('p');
            message.textContent = receivedObject.message;
            this._outputDiv.appendChild(message);
        };
        return SampleDashboard;
    })(VORLON.DashboardPlugin);
    VORLON.SampleDashboard = SampleDashboard;
    //Register the plugin with vorlon core
    VORLON.Core.RegisterDashboardPlugin(new SampleDashboard());
})(VORLON || (VORLON = {}));
