var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var XHRPanelDashboard = (function (_super) {
        __extends(XHRPanelDashboard, _super);
        function XHRPanelDashboard() {
            _super.call(this, "xhrPanel", "control.html", "control.css");
            this.hooked = false;
            this.cache = [];
            this._id = "XHRPANEL";
            this._ready = false;
        }
        XHRPanelDashboard.prototype._mapAction = function (selector, onClick) {
            var button = this._dashboardDiv.querySelector(selector);
            button.addEventListener("click", function () { return onClick(button); });
            return button;
        };
        XHRPanelDashboard.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._dashboardDiv = div;
            this._dashboardItems = {};
            this._insertHtmlContentAsync(div, function (filledDiv) {
                _this._itemsContainer = filledDiv.querySelector('.network-items');
                _this._clearButton = filledDiv.querySelector('x-action[event="clear"]');
                _this._startStopButton = filledDiv.querySelector('x-action[event="toggleState"]');
                _this._startStopButtonState = filledDiv.querySelector('x-action[event="toggleState"]>i');
                _this._clearButton.addEventListener('click', function (arg) {
                    _this.sendCommandToClient('clear');
                    _this._itemsContainer.innerHTML = '';
                    _this._dashboardItems = {};
                });
                _this._startStopButton.addEventListener('click', function (arg) {
                    if (!_this._startStopButtonState.classList.contains('fa-spin')) {
                        _this._startStopButtonState.classList.remove('fa-play');
                        _this._startStopButtonState.classList.remove('fa-stop');
                        _this._startStopButtonState.classList.remove('no-anim');
                        _this._startStopButtonState.classList.add('fa-spin');
                        _this._startStopButtonState.classList.add('fa-spinner');
                        if (_this.hooked) {
                            _this.sendCommandToClient('stop');
                        }
                        else {
                            _this.sendCommandToClient('start');
                        }
                    }
                });
                _this._ready = true;
            });
        };
        XHRPanelDashboard.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
        };
        XHRPanelDashboard.prototype.processNetworkItem = function (item) {
            var storedItem = this._dashboardItems[item.id];
            if (!storedItem) {
                storedItem = new NetworkItemCtrl(this._itemsContainer, item);
                this._dashboardItems[item.id] = storedItem;
            }
            storedItem.update(item);
        };
        return XHRPanelDashboard;
    })(VORLON.DashboardPlugin);
    VORLON.XHRPanelDashboard = XHRPanelDashboard;
    XHRPanelDashboard.prototype.DashboardCommands = {
        state: function (data) {
            var plugin = this;
            plugin.hooked = data.hooked;
            plugin._startStopButtonState.classList.remove('fa-spin');
            plugin._startStopButtonState.classList.remove('fa-spinner');
            if (plugin.hooked) {
                plugin._startStopButtonState.classList.remove('fa-play');
                plugin._startStopButtonState.classList.add('fa-stop');
                plugin._startStopButtonState.classList.add('no-anim');
            }
            else {
                plugin._startStopButtonState.classList.remove('fa-stop');
                plugin._startStopButtonState.classList.add('fa-play');
                plugin._startStopButtonState.classList.add('no-anim');
            }
        },
        xhr: function (data) {
            var plugin = this;
            plugin.processNetworkItem(data);
        }
    };
    var NetworkItemCtrl = (function () {
        function NetworkItemCtrl(parent, item) {
            var _this = this;
            this.item = item;
            this.element = new VORLON.FluentDOM('DIV', 'network-item').append('DIV', 'description', function (fdDesc) {
                fdDesc.append('DIV', 'status item smallitem', function (fdStatus) {
                    _this.statusElt = fdStatus.element;
                    fdStatus.html('<i class="fa fa-spin fa-spinner"></i>');
                }).append('DIV', 'method item smallitem', function (fdMethod) {
                    fdMethod.text(item.method.toUpperCase());
                }).append('DIV', 'url item', function (fdUrl) {
                    fdUrl.text(item.url);
                });
            }).append('DIV', 'details', function (fdDesc) {
                fdDesc.append('DIV', 'responsetype', function (fdResponseType) {
                    _this.responseTypeElt = fdResponseType.element;
                    fdResponseType.html('&nbsp;');
                });
            }).element;
            parent.appendChild(this.element);
        }
        NetworkItemCtrl.prototype.update = function (item) {
            this.item = item;
            if (item.readyState === 4) {
                if (item.status !== 200) {
                    this.element.classList.add('error');
                }
                this.statusElt.innerText = item.status.toString();
                this.responseTypeElt.innerText = 'response type : ' + (item.responseType || 'text');
            }
        };
        return NetworkItemCtrl;
    })();
    //Register the plugin with vorlon core
    VORLON.Core.RegisterDashboardPlugin(new XHRPanelDashboard());
})(VORLON || (VORLON = {}));
