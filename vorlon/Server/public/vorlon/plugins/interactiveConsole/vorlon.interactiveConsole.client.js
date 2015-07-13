var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var InteractiveConsoleClient = (function (_super) {
        __extends(InteractiveConsoleClient, _super);
        function InteractiveConsoleClient() {
            var _this = this;
            _super.call(this, "interactiveConsole");
            this._cache = [];
            this._pendingEntries = [];
            this._maxBatchSize = 50;
            this._maxBatchTimeout = 200;
            this._objPrototype = Object.getPrototypeOf({});
            this._hooks = {
                clear: null,
                dir: null,
                log: null,
                debug: null,
                error: null,
                warn: null,
                info: null
            };
            this._ready = false;
            this._id = "CONSOLE";
            this.traceLog = function (msg) {
                if (_this._hooks && _this._hooks.log) {
                    _this._hooks.log.call(console, msg);
                }
                else {
                    console.log(msg);
                }
            };
        }
        InteractiveConsoleClient.prototype.inspect = function (obj, context, deepness) {
            if (!obj)
                return null;
            var objProperties = Object.getOwnPropertyNames(obj);
            var proto = Object.getPrototypeOf(obj);
            var res = {
                functions: [],
                properties: []
            };
            if (proto && proto != this._objPrototype)
                res.proto = this.inspect(proto, context, deepness + 1);
            for (var i = 0, l = objProperties.length; i < l; i++) {
                var p = objProperties[i];
                var propertyType = "";
                if (p === '__vorlon')
                    continue;
                try {
                    var objValue = context[p];
                    propertyType = typeof objValue;
                    if (propertyType === 'function') {
                        res.functions.push(p);
                    }
                    else if (propertyType === 'undefined') {
                        res.properties.push({ name: p, val: undefined });
                    }
                    else if (propertyType === 'null') {
                        res.properties.push({ name: p, val: null });
                    }
                    else if (propertyType === 'object') {
                        if (deepness > 5) {
                            res.properties.push({ name: p, val: "Vorlon cannot inspect deeper, try inspecting the proper object directly" });
                        }
                        else {
                            res.properties.push({ name: p, val: this.inspect(objValue, objValue, deepness + 1) });
                        }
                    }
                    else {
                        res.properties.push({ name: p, val: objValue.toString() });
                    }
                }
                catch (exception) {
                    this.trace('error reading property ' + p + ' of type ' + propertyType);
                    this.trace(exception);
                    res.properties.push({ name: p, val: "oups, Vorlon has an error reading this " + propertyType + " property..." });
                }
            }
            res.functions = res.functions.sort(function (a, b) {
                var lowerAName = a.toLowerCase();
                var lowerBName = b.toLowerCase();
                if (lowerAName > lowerBName)
                    return 1;
                if (lowerAName < lowerBName)
                    return -1;
                return 0;
            });
            res.properties = res.properties.sort(function (a, b) {
                var lowerAName = a.name.toLowerCase();
                var lowerBName = b.name.toLowerCase();
                if (lowerAName > lowerBName)
                    return 1;
                if (lowerAName < lowerBName)
                    return -1;
                return 0;
            });
            return res;
        };
        InteractiveConsoleClient.prototype.getMessages = function (messages) {
            var resmessages = [];
            for (var i = 0, l = messages.length; i < l; i++) {
                var msg = messages[i];
                if (typeof msg === 'string' || typeof msg === 'number') {
                    resmessages.push(msg);
                }
                else {
                    if (msg == window || msg == document) {
                        resmessages.push('VORLON : object cannot be inspected, too big...');
                    }
                    else {
                        resmessages.push(this.inspect(msg, msg, 0));
                    }
                }
            }
            return resmessages;
        };
        InteractiveConsoleClient.prototype.addEntry = function (entry) {
            this._cache.push(entry);
            //non batch send
            //this.sendCommandToDashboard('entries', { entries: [entry] });
            this._pendingEntries.push(entry);
            if (this._pendingEntries.length > this._maxBatchSize) {
                this.sendPendings();
            }
            else {
                this.checkPendings();
            }
        };
        InteractiveConsoleClient.prototype.checkPendings = function () {
            var _this = this;
            if (!this._pendingEntriesTimeout) {
                this._pendingEntriesTimeout = setTimeout(function () {
                    _this._pendingEntriesTimeout = null;
                    _this.sendPendings();
                }, this._maxBatchTimeout);
            }
        };
        InteractiveConsoleClient.prototype.sendPendings = function () {
            var currentPendings = this._pendingEntries;
            this._pendingEntries = [];
            this.sendCommandToDashboard('entries', { entries: currentPendings });
        };
        InteractiveConsoleClient.prototype.batchSend = function (items) {
            var batch = [];
            for (var i = 0, l = items.length; i < l; i++) {
                if (batch.length < this._maxBatchSize) {
                    batch.push(items[i]);
                }
                else {
                    this.sendCommandToDashboard('entries', { entries: batch });
                    batch = [];
                }
            }
            this.sendCommandToDashboard('entries', { entries: batch });
        };
        InteractiveConsoleClient.prototype.startClientSide = function () {
            var _this = this;
            // Overrides clear, log, error and warn
            this._hooks.clear = VORLON.Tools.Hook(window.console, "clear", function () {
                _this.clearClientConsole();
            });
            this._hooks.dir = VORLON.Tools.Hook(window.console, "dir", function (message) {
                var messages = arguments;
                var data = {
                    messages: _this.getMessages(arguments[0]),
                    type: "dir"
                };
                _this.addEntry(data);
            });
            this._hooks.log = VORLON.Tools.Hook(window.console, "log", function (message) {
                var messages = arguments;
                var data = {
                    messages: _this.getMessages(arguments[0]),
                    type: "log"
                };
                _this.addEntry(data);
            });
            this._hooks.debug = VORLON.Tools.Hook(window.console, "debug", function (message) {
                var data = {
                    messages: _this.getMessages(arguments[0]),
                    type: "debug"
                };
                _this.addEntry(data);
            });
            this._hooks.info = VORLON.Tools.Hook(window.console, "info", function (message) {
                var data = {
                    messages: _this.getMessages(arguments[0]),
                    type: "info"
                };
                _this.addEntry(data);
            });
            this._hooks.warn = VORLON.Tools.Hook(window.console, "warn", function (message) {
                var data = {
                    messages: _this.getMessages(arguments[0]),
                    type: "warn"
                };
                _this.addEntry(data);
            });
            this._hooks.error = VORLON.Tools.Hook(window.console, "error", function (message) {
                var data = {
                    messages: _this.getMessages(arguments[0]),
                    type: "error"
                };
                _this.addEntry(data);
            });
            // Override Error constructor
            var previousError = Error;
            Error = (function (message) {
                var error = new previousError(message);
                var data = {
                    messages: [message],
                    type: "exception"
                };
                _this.addEntry(data);
                return error;
            });
            window.addEventListener('error', function () {
                var err = arguments[0];
                if (err.error) {
                    //this.addEntry({ messages: [err.error.message], type: "exception" });
                    _this.addEntry({ messages: [err.error.stack], type: "exception" });
                }
            });
        };
        InteractiveConsoleClient.prototype.clearClientConsole = function () {
            this.sendCommandToDashboard('clear');
            this._cache = [];
        };
        InteractiveConsoleClient.prototype.evalOrderFromDashboard = function (order) {
            try {
                eval(order);
            }
            catch (e) {
                console.error("Unable to execute order: " + e.message);
            }
        };
        InteractiveConsoleClient.prototype.refresh = function () {
            var _this = this;
            this.sendCommandToDashboard("clear");
            //delay sending cache to dashboard to let other plugins load...
            setTimeout(function () {
                _this.batchSend(_this._cache);
            }, 300);
        };
        return InteractiveConsoleClient;
    })(VORLON.ClientPlugin);
    VORLON.InteractiveConsoleClient = InteractiveConsoleClient;
    InteractiveConsoleClient.prototype.ClientCommands = {
        order: function (data) {
            var plugin = this;
            plugin.evalOrderFromDashboard(data.order);
        },
        clear: function (data) {
            var plugin = this;
            console.clear();
        }
    };
    // Register
    VORLON.Core.RegisterClientPlugin(new InteractiveConsoleClient());
})(VORLON || (VORLON = {}));
