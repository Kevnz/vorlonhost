var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var ObjectExplorerClient = (function (_super) {
        __extends(ObjectExplorerClient, _super);
        function ObjectExplorerClient() {
            _super.call(this, "objectExplorer");
            this.STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
            this.ARGUMENT_NAMES = /([^\s,]+)/g;
            this.rootProperty = 'window';
            this._id = "OBJEXPLORER";
            this._ready = false;
        }
        ObjectExplorerClient.prototype.getFunctionArgumentNames = function (func) {
            var result = [];
            try {
                var fnStr = func.toString().replace(this.STRIP_COMMENTS, '');
                result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(this.ARGUMENT_NAMES);
                if (result === null)
                    result = [];
            }
            catch (exception) {
                console.error(exception);
            }
            return result;
        };
        ObjectExplorerClient.prototype._getProperty = function (propertyPath) {
            var selectedObj = window;
            var tokens = [this.rootProperty];
            if (propertyPath && propertyPath !== this.rootProperty) {
                tokens = propertyPath.split('.');
                if (tokens && tokens.length) {
                    for (var i = 0, l = tokens.length; i < l; i++) {
                        selectedObj = selectedObj[tokens[i]];
                        if (!selectedObj)
                            break;
                    }
                }
            }
            if (!selectedObj) {
                console.log('not found');
                return { type: 'notfound', name: 'not found', fullpath: propertyPath, contentFetched: true, content: [] };
            }
            var res = this.getObjDescriptor(selectedObj, tokens, true);
            return res;
        };
        ObjectExplorerClient.prototype.getObjDescriptor = function (object, pathTokens, scanChild) {
            if (scanChild === void 0) { scanChild = false; }
            pathTokens = pathTokens || [];
            var name = pathTokens[pathTokens.length - 1];
            var type = typeof object;
            if (object === null) {
                type = 'null';
            }
            if (object === undefined) {
                type = 'undefined';
            }
            var fullpath = this.rootProperty;
            if (!name) {
                name = this.rootProperty;
                fullpath = this.rootProperty;
            }
            else {
                if (fullpath.indexOf(this.rootProperty + ".") !== 0 && pathTokens[0] !== this.rootProperty) {
                    fullpath = this.rootProperty + '.' + pathTokens.join('.');
                }
                else {
                    fullpath = pathTokens.join('.');
                }
            }
            //console.log('check ' + name + ' ' + type);
            var res = { type: type, name: name, fullpath: fullpath, contentFetched: false, content: [], value: null };
            if (type === 'string' || type === 'number' || type === 'boolean') {
                res.value = object.toString();
            }
            else if (type === 'function') {
                res.value = this.getFunctionArgumentNames(object).join(',');
            }
            if (object && scanChild) {
                for (var e in object) {
                    var itemTokens = pathTokens.concat([e]);
                    res.content.push(this.getObjDescriptor(object[e], itemTokens, false));
                }
                res.contentFetched = true;
            }
            return res;
        };
        ObjectExplorerClient.prototype._packageAndSendObjectProperty = function (type, path) {
            path = path || this._currentPropertyPath;
            var packagedObject = this._getProperty(path);
            this.sendToDashboard({ type: type, path: packagedObject.fullpath, property: packagedObject });
        };
        ObjectExplorerClient.prototype._markForRefresh = function () {
            var _this = this;
            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
            }
            this._timeoutId = setTimeout(function () {
                _this.refresh();
            }, 10000);
        };
        ObjectExplorerClient.prototype.startClientSide = function () {
            var _this = this;
            document.addEventListener("DOMContentLoaded", function () {
                if (VORLON.Core.Messenger.isConnected) {
                    document.addEventListener("DOMNodeInserted", function () {
                        _this._markForRefresh();
                    });
                    document.addEventListener("DOMNodeRemoved", function () {
                        _this._markForRefresh();
                    });
                }
                _this.refresh();
            });
        };
        ObjectExplorerClient.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            switch (receivedObject.type) {
                case "query":
                    this._currentPropertyPath = receivedObject.path;
                    this._packageAndSendObjectProperty(receivedObject.type);
                    break;
                case "queryContent":
                    this._packageAndSendObjectProperty(receivedObject.type, receivedObject.path);
                    break;
                default:
                    break;
            }
        };
        ObjectExplorerClient.prototype.refresh = function () {
            this._packageAndSendObjectProperty('refresh');
        };
        return ObjectExplorerClient;
    })(VORLON.ClientPlugin);
    VORLON.ObjectExplorerClient = ObjectExplorerClient;
    // Register
    VORLON.Core.RegisterClientPlugin(new ObjectExplorerClient());
})(VORLON || (VORLON = {}));
