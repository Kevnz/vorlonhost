var VORLON;
(function (VORLON) {
    var Tools = (function () {
        function Tools() {
        }
        Tools.QuerySelectorById = function (root, id) {
            if (root.querySelector) {
                return root.querySelector("#" + id);
            }
            return document.getElementById(id);
        };
        Tools.SetImmediate = function (func) {
            if (window.setImmediate) {
                setImmediate(func);
            }
            else {
                setTimeout(func, 0);
            }
        };
        Tools.setLocalStorageValue = function (key, data) {
            if (localStorage) {
                try {
                    localStorage.setItem(key, data);
                }
                catch (e) {
                }
            }
        };
        Tools.getLocalStorageValue = function (key) {
            if (localStorage) {
                try {
                    return localStorage.getItem(key);
                }
                catch (e) {
                    //local storage is not available (private mode maybe)
                    return "";
                }
            }
        };
        Tools.Hook = function (rootObject, functionToHook, hookingFunction) {
            var previousFunction = rootObject[functionToHook];
            rootObject[functionToHook] = function () {
                var optionalParams = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    optionalParams[_i - 0] = arguments[_i];
                }
                hookingFunction(optionalParams);
                previousFunction.apply(rootObject, optionalParams);
            };
            return previousFunction;
        };
        Tools.CreateCookie = function (name, value, days) {
            var expires;
            if (days) {
                var date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = "; expires=" + date.toUTCString();
            }
            else {
                expires = "";
            }
            document.cookie = name + "=" + value + expires + "; path=/";
        };
        Tools.ReadCookie = function (name) {
            var nameEQ = name + "=";
            var ca = document.cookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return c.substring(nameEQ.length, c.length);
                }
            }
            return "";
        };
        // from http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/2117523#answer-2117523
        Tools.CreateGUID = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
        Tools.RemoveEmpties = function (arr) {
            var len = arr.length;
            for (var i = len - 1; i >= 0; i--) {
                if (!arr[i]) {
                    arr.splice(i, 1);
                    len--;
                }
            }
            return len;
        };
        Tools.AddClass = function (e, name) {
            if (e.classList) {
                if (name.indexOf(" ") < 0) {
                    e.classList.add(name);
                }
                else {
                    var namesToAdd = name.split(" ");
                    Tools.RemoveEmpties(namesToAdd);
                    for (var i = 0, len = namesToAdd.length; i < len; i++) {
                        e.classList.add(namesToAdd[i]);
                    }
                }
                return e;
            }
            else {
                var className = e.className;
                var names = className.split(" ");
                var l = Tools.RemoveEmpties(names);
                var toAdd;
                if (name.indexOf(" ") >= 0) {
                    namesToAdd = name.split(" ");
                    Tools.RemoveEmpties(namesToAdd);
                    for (i = 0; i < l; i++) {
                        var found = namesToAdd.indexOf(names[i]);
                        if (found >= 0) {
                            namesToAdd.splice(found, 1);
                        }
                    }
                    if (namesToAdd.length > 0) {
                        toAdd = namesToAdd.join(" ");
                    }
                }
                else {
                    var saw = false;
                    for (i = 0; i < l; i++) {
                        if (names[i] === name) {
                            saw = true;
                            break;
                        }
                    }
                    if (!saw) {
                        toAdd = name;
                    }
                }
                if (toAdd) {
                    if (l > 0 && names[0].length > 0) {
                        e.className = className + " " + toAdd;
                    }
                    else {
                        e.className = toAdd;
                    }
                }
                return e;
            }
        };
        Tools.RemoveClass = function (e, name) {
            if (e.classList) {
                if (e.classList.length === 0) {
                    return e;
                }
                var namesToRemove = name.split(" ");
                Tools.RemoveEmpties(namesToRemove);
                for (var i = 0, len = namesToRemove.length; i < len; i++) {
                    e.classList.remove(namesToRemove[i]);
                }
                return e;
            }
            else {
                var original = e.className;
                if (name.indexOf(" ") >= 0) {
                    namesToRemove = name.split(" ");
                    Tools.RemoveEmpties(namesToRemove);
                }
                else {
                    if (original.indexOf(name) < 0) {
                        return e;
                    }
                    namesToRemove = [name];
                }
                var removed;
                var names = original.split(" ");
                var namesLen = Tools.RemoveEmpties(names);
                for (i = namesLen - 1; i >= 0; i--) {
                    if (namesToRemove.indexOf(names[i]) >= 0) {
                        names.splice(i, 1);
                        removed = true;
                    }
                }
                if (removed) {
                    e.className = names.join(" ");
                }
                return e;
            }
        };
        Tools.ToggleClass = function (e, name) {
            if (e.className.match(name)) {
                Tools.RemoveClass(e, name);
            }
            else {
                Tools.AddClass(e, name);
            }
        };
        return Tools;
    })();
    VORLON.Tools = Tools;
    var FluentDOM = (function () {
        function FluentDOM(nodeType, className, parentElt, parent) {
            this.childs = [];
            if (nodeType) {
                this.element = document.createElement(nodeType);
                if (className)
                    this.element.className = className;
                if (parentElt)
                    parentElt.appendChild(this.element);
                this.parent = parent;
                if (parent) {
                    parent.childs.push(this);
                }
            }
        }
        FluentDOM.for = function (element) {
            var res = new FluentDOM(null);
            res.element = element;
            return res;
        };
        FluentDOM.prototype.addClass = function (classname) {
            this.element.classList.add(classname);
            return this;
        };
        FluentDOM.prototype.className = function (classname) {
            this.element.className = classname;
            return this;
        };
        FluentDOM.prototype.opacity = function (opacity) {
            this.element.style.opacity = opacity;
            return this;
        };
        FluentDOM.prototype.display = function (display) {
            this.element.style.display = display;
            return this;
        };
        FluentDOM.prototype.hide = function () {
            this.element.style.display = 'none';
            return this;
        };
        FluentDOM.prototype.visibility = function (visibility) {
            this.element.style.visibility = visibility;
            return this;
        };
        FluentDOM.prototype.text = function (text) {
            this.element.textContent = text;
            return this;
        };
        FluentDOM.prototype.html = function (text) {
            this.element.innerHTML = text;
            return this;
        };
        FluentDOM.prototype.attr = function (name, val) {
            this.element.setAttribute(name, val);
            return this;
        };
        FluentDOM.prototype.editable = function (editable) {
            this.element.contentEditable = editable ? "true" : "false";
            return this;
        };
        FluentDOM.prototype.style = function (name, val) {
            this.element.style[name] = val;
            return this;
        };
        FluentDOM.prototype.appendTo = function (elt) {
            elt.appendChild(this.element);
            return this;
        };
        FluentDOM.prototype.append = function (nodeType, className, callback) {
            var child = new FluentDOM(nodeType, className, this.element, this);
            if (callback) {
                callback(child);
            }
            return this;
        };
        FluentDOM.prototype.createChild = function (nodeType, className) {
            var child = new FluentDOM(nodeType, className, this.element, this);
            return child;
        };
        FluentDOM.prototype.click = function (callback) {
            this.element.addEventListener('click', callback);
            return this;
        };
        FluentDOM.prototype.blur = function (callback) {
            this.element.addEventListener('blur', callback);
            return this;
        };
        FluentDOM.prototype.keydown = function (callback) {
            this.element.addEventListener('keydown', callback);
            return this;
        };
        return FluentDOM;
    })();
    VORLON.FluentDOM = FluentDOM;
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    (function (RuntimeSide) {
        RuntimeSide[RuntimeSide["Client"] = 0] = "Client";
        RuntimeSide[RuntimeSide["Dashboard"] = 1] = "Dashboard";
        RuntimeSide[RuntimeSide["Both"] = 2] = "Both";
    })(VORLON.RuntimeSide || (VORLON.RuntimeSide = {}));
    var RuntimeSide = VORLON.RuntimeSide;
    (function (PluginType) {
        PluginType[PluginType["OneOne"] = 0] = "OneOne";
        PluginType[PluginType["MulticastReceiveOnly"] = 1] = "MulticastReceiveOnly";
        PluginType[PluginType["Multicast"] = 2] = "Multicast";
    })(VORLON.PluginType || (VORLON.PluginType = {}));
    var PluginType = VORLON.PluginType;
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var BasePlugin = (function () {
        function BasePlugin(name) {
            this.name = name;
            this._ready = true;
            this._id = "";
            this._type = 0 /* OneOne */;
            this.traceLog = function (msg) {
                console.log(msg);
            };
            this.traceNoop = function (msg) {
            };
            this.loadingDirectory = "vorlon/plugins";
            this.debug = VORLON.Core.debug;
        }
        Object.defineProperty(BasePlugin.prototype, "Type", {
            get: function () {
                return this._type;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(BasePlugin.prototype, "debug", {
            get: function () {
                return this._debug;
            },
            set: function (val) {
                this._debug = val;
                if (val) {
                    this.trace = this.traceLog;
                }
                else {
                    this.trace = this.traceNoop;
                }
            },
            enumerable: true,
            configurable: true
        });
        BasePlugin.prototype.getID = function () {
            return this._id;
        };
        BasePlugin.prototype.isReady = function () {
            return this._ready;
        };
        return BasePlugin;
    })();
    VORLON.BasePlugin = BasePlugin;
})(VORLON || (VORLON = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var ClientPlugin = (function (_super) {
        __extends(ClientPlugin, _super);
        function ClientPlugin(name) {
            _super.call(this, name);
        }
        ClientPlugin.prototype.startClientSide = function () {
        };
        ClientPlugin.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
        };
        ClientPlugin.prototype.sendToDashboard = function (data, incrementVisualIndicator) {
            if (incrementVisualIndicator === void 0) { incrementVisualIndicator = false; }
            if (VORLON.Core.Messenger)
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, 0 /* Client */, "message", incrementVisualIndicator);
        };
        ClientPlugin.prototype.sendCommandToDashboard = function (command, data, incrementVisualIndicator) {
            if (data === void 0) { data = null; }
            if (incrementVisualIndicator === void 0) { incrementVisualIndicator = false; }
            if (VORLON.Core.Messenger) {
                this.trace(this.getID() + ' send command to dashboard ' + command);
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, 0 /* Client */, "message", incrementVisualIndicator, command);
            }
        };
        ClientPlugin.prototype.refresh = function () {
            console.error("Please override plugin.refresh()");
        };
        ClientPlugin.prototype._loadNewScriptAsync = function (scriptName, callback) {
            var basedUrl = "";
            if (this.loadingDirectory.indexOf('http') === 0) {
                basedUrl = this.loadingDirectory + "/" + this.name + "/";
            }
            else {
                basedUrl = "/" + this.loadingDirectory + "/" + this.name + "/";
            }
            var scriptToLoad = document.createElement("script");
            scriptToLoad.setAttribute("src", basedUrl + scriptName);
            scriptToLoad.onload = callback;
            var first = document.getElementsByTagName('script')[0];
            first.parentNode.insertBefore(scriptToLoad, first);
        };
        return ClientPlugin;
    })(VORLON.BasePlugin);
    VORLON.ClientPlugin = ClientPlugin;
})(VORLON || (VORLON = {}));

var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var DashboardPlugin = (function (_super) {
        __extends(DashboardPlugin, _super);
        function DashboardPlugin(name, htmlFragmentUrl, cssStyleSheetUrl) {
            _super.call(this, name);
            this.htmlFragmentUrl = htmlFragmentUrl;
            this.cssStyleSheetUrl = cssStyleSheetUrl;
            this.debug = VORLON.Core.debug;
        }
        DashboardPlugin.prototype.startDashboardSide = function (div) {
        };
        DashboardPlugin.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
        };
        DashboardPlugin.prototype.sendToClient = function (data) {
            if (VORLON.Core.Messenger)
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, 1 /* Dashboard */, "message");
        };
        DashboardPlugin.prototype.sendCommandToClient = function (command, data, incrementVisualIndicator) {
            if (data === void 0) { data = null; }
            if (incrementVisualIndicator === void 0) { incrementVisualIndicator = false; }
            if (VORLON.Core.Messenger) {
                this.trace(this.getID() + ' send command to client ' + command);
                VORLON.Core.Messenger.sendRealtimeMessage(this.getID(), data, 1 /* Dashboard */, "message", incrementVisualIndicator, command);
            }
        };
        DashboardPlugin.prototype.sendCommandToPluginClient = function (pluginId, command, data, incrementVisualIndicator) {
            if (data === void 0) { data = null; }
            if (incrementVisualIndicator === void 0) { incrementVisualIndicator = false; }
            if (VORLON.Core.Messenger) {
                this.trace(this.getID() + ' send command to plugin client ' + command);
                VORLON.Core.Messenger.sendRealtimeMessage(pluginId, data, 1 /* Dashboard */, "protocol", incrementVisualIndicator, command);
            }
        };
        DashboardPlugin.prototype.sendCommandToPluginDashboard = function (pluginId, command, data, incrementVisualIndicator) {
            if (data === void 0) { data = null; }
            if (incrementVisualIndicator === void 0) { incrementVisualIndicator = false; }
            if (VORLON.Core.Messenger) {
                this.trace(this.getID() + ' send command to plugin dashboard ' + command);
                VORLON.Core.Messenger.sendRealtimeMessage(pluginId, data, 0 /* Client */, "protocol", incrementVisualIndicator, command);
            }
        };
        DashboardPlugin.prototype._insertHtmlContentAsync = function (divContainer, callback) {
            var _this = this;
            var basedUrl = "/" + this.loadingDirectory + "/" + this.name + "/";
            var alone = false;
            if (!divContainer) {
                // Not emptyDiv provided, let's plug into the main DOM
                divContainer = document.createElement("div");
                document.body.appendChild(divContainer);
                alone = true;
            }
            var request = new XMLHttpRequest();
            request.open('GET', basedUrl + this.htmlFragmentUrl, true);
            request.onreadystatechange = function (ev) {
                if (request.readyState === 4) {
                    if (request.status === 200) {
                        divContainer.innerHTML = _this._stripContent(request.responseText);
                        var headID = document.getElementsByTagName("head")[0];
                        var cssNode = document.createElement('link');
                        cssNode.type = "text/css";
                        cssNode.rel = "stylesheet";
                        cssNode.href = basedUrl + _this.cssStyleSheetUrl;
                        cssNode.media = "screen";
                        headID.appendChild(cssNode);
                        var firstDivChild = (divContainer.children[0]);
                        if (alone) {
                            firstDivChild.className = "alone";
                        }
                        callback(firstDivChild);
                    }
                    else {
                        throw new Error("Error status: " + request.status + " - Unable to load " + basedUrl + _this.htmlFragmentUrl);
                    }
                }
            };
            request.send(null);
        };
        DashboardPlugin.prototype._stripContent = function (content) {
            // in case of SVG injection
            var xmlRegExp = /^\s*<\?xml(\s)+version=[\'\"](\d)*.(\d)*[\'\"](\s)*\?>/im;
            // for HTML content
            var bodyRegExp = /<body[^>]*>\s*([\s\S]+)\s*<\/body>/im;
            if (content) {
                content = content.replace(xmlRegExp, "");
                var matches = content.match(bodyRegExp);
                if (matches) {
                    content = matches[1];
                }
            }
            return content;
        };
        return DashboardPlugin;
    })(VORLON.BasePlugin);
    VORLON.DashboardPlugin = DashboardPlugin;
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var ClientMessenger = (function () {
        function ClientMessenger(side, serverUrl, sessionId, clientId, listenClientId) {
            var _this = this;
            this._isConnected = false;
            this._isConnected = false;
            this._sessionId = sessionId;
            this._clientId = clientId;
            VORLON.Core._listenClientId = listenClientId;
            this._serverUrl = serverUrl;
            this._waitingEvents = 0;
            switch (side) {
                case 0 /* Client */:
                    this._socket = io.connect(serverUrl);
                    this._isConnected = true;
                    break;
                case 1 /* Dashboard */:
                    this._socket = io.connect(serverUrl + "/dashboard");
                    this._isConnected = true;
                    break;
            }
            if (this.isConnected) {
                var manager = io.Manager(serverUrl);
                manager.on('connect_error', function (err) {
                    if (_this.onError) {
                        _this.onError(err);
                    }
                });
                this._socket.on('message', function (message) {
                    var received = JSON.parse(message);
                    if (_this.onRealtimeMessageReceived) {
                        _this.onRealtimeMessageReceived(received);
                    }
                });
                this._socket.on('helo', function (message) {
                    //console.log('messenger helo', message);
                    VORLON.Core._listenClientId = message;
                    if (_this.onHeloReceived) {
                        _this.onHeloReceived(message);
                    }
                });
                this._socket.on('identify', function (message) {
                    //console.log('messenger identify', message);
                    if (_this.onIdentifyReceived) {
                        _this.onIdentifyReceived(message);
                    }
                });
                this._socket.on('stoplisten', function () {
                    if (_this.onStopListenReceived) {
                        _this.onStopListenReceived();
                    }
                });
                this._socket.on('waitingevents', function (message) {
                    //console.log('messenger waitingevents', message);
                    if (_this.onWaitingEventsReceived) {
                        var receivedObject = JSON.parse(message);
                        _this.onWaitingEventsReceived(receivedObject);
                    }
                });
                this._socket.on('refreshclients', function () {
                    //console.log('messenger refreshclients');
                    if (_this.onRefreshClients) {
                        _this.onRefreshClients();
                    }
                });
            }
        }
        Object.defineProperty(ClientMessenger.prototype, "isConnected", {
            get: function () {
                return this._isConnected;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ClientMessenger.prototype, "clientId", {
            set: function (value) {
                this._clientId = value;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(ClientMessenger.prototype, "socketId", {
            get: function () {
                return this._socket.id;
            },
            enumerable: true,
            configurable: true
        });
        ClientMessenger.prototype.sendWaitingEvents = function (pluginID, waitingevents) {
            var message = {
                metadata: {
                    pluginID: pluginID,
                    side: 0 /* Client */,
                    sessionId: this._sessionId,
                    clientId: this._clientId,
                    listenClientId: VORLON.Core._listenClientId,
                    waitingEvents: waitingevents
                }
            };
            if (this.isConnected) {
                var messagestr = JSON.stringify(message);
                this._socket.emit("waitingevents", messagestr);
            }
        };
        ClientMessenger.prototype.sendRealtimeMessage = function (pluginID, objectToSend, side, messageType, incrementVisualIndicator, command) {
            if (messageType === void 0) { messageType = "message"; }
            if (incrementVisualIndicator === void 0) { incrementVisualIndicator = false; }
            var message = {
                metadata: {
                    pluginID: pluginID,
                    side: side,
                    sessionId: this._sessionId,
                    clientId: this._clientId,
                    listenClientId: VORLON.Core._listenClientId
                },
                data: objectToSend
            };
            if (command)
                message.command = command;
            if (!this.isConnected) {
                // Directly raise response locally
                if (this.onRealtimeMessageReceived) {
                    this.onRealtimeMessageReceived(message);
                }
                return;
            }
            else {
                if (VORLON.Core._listenClientId === "" && messageType === "message") {
                    if (incrementVisualIndicator) {
                        this._waitingEvents++;
                        this.sendWaitingEvents(pluginID, this._waitingEvents);
                    }
                }
                else {
                    var strmessage = JSON.stringify(message);
                    this._socket.emit(messageType, strmessage);
                    this._waitingEvents = 0;
                    this.sendWaitingEvents(pluginID, 0);
                }
            }
        };
        ClientMessenger.prototype.sendMonitoringMessage = function (pluginID, message) {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                    }
                }
            };
            xhr.open("POST", this._serverUrl + "api/push");
            xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
            var data = JSON.stringify({ "_idsession": this._sessionId, "id": pluginID, "message": message });
            //xhr.setRequestHeader("Content-length", data.length.toString());
            xhr.send(data);
        };
        ClientMessenger.prototype.getMonitoringMessage = function (pluginID, onMonitoringMessage, from, to) {
            if (from === void 0) { from = "-20"; }
            if (to === void 0) { to = "-1"; }
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        if (onMonitoringMessage)
                            onMonitoringMessage(JSON.parse(xhr.responseText));
                    }
                    else {
                        if (onMonitoringMessage)
                            onMonitoringMessage(null);
                    }
                }
                else {
                    if (onMonitoringMessage)
                        onMonitoringMessage(null);
                }
            };
            xhr.open("GET", this._serverUrl + "api/range/" + this._sessionId + "/" + pluginID + "/" + from + "/" + to);
            xhr.send();
        };
        return ClientMessenger;
    })();
    VORLON.ClientMessenger = ClientMessenger;
})(VORLON || (VORLON = {}));

var VORLON;
(function (VORLON) {
    var _Core = (function () {
        function _Core() {
            this._clientPlugins = new Array();
            this._dashboardPlugins = new Array();
            this._socketIOWaitCount = 0;
            this.debug = false;
            this._RetryTimeout = 1002;
        }
        Object.defineProperty(_Core.prototype, "Messenger", {
            get: function () {
                return VORLON.Core._messenger;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(_Core.prototype, "ClientPlugins", {
            get: function () {
                return VORLON.Core._clientPlugins;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(_Core.prototype, "DashboardPlugins", {
            get: function () {
                return VORLON.Core._dashboardPlugins;
            },
            enumerable: true,
            configurable: true
        });
        _Core.prototype.RegisterClientPlugin = function (plugin) {
            VORLON.Core._clientPlugins.push(plugin);
        };
        _Core.prototype.RegisterDashboardPlugin = function (plugin) {
            VORLON.Core._dashboardPlugins.push(plugin);
        };
        _Core.prototype.StartClientSide = function (serverUrl, sessionId, listenClientId) {
            var _this = this;
            if (serverUrl === void 0) { serverUrl = "'http://localhost:1337/'"; }
            if (sessionId === void 0) { sessionId = ""; }
            if (listenClientId === void 0) { listenClientId = ""; }
            VORLON.Core._side = 0 /* Client */;
            VORLON.Core._sessionID = sessionId;
            VORLON.Core._listenClientId = listenClientId;
            // Checking socket.io
            if (window.io === undefined) {
                if (this._socketIOWaitCount < 10) {
                    this._socketIOWaitCount++;
                    // Let's wait a bit just in case socket.io was loaded asynchronously
                    setTimeout(function () {
                        console.log("Vorlon.js: waiting for socket.io to load...");
                        VORLON.Core.StartClientSide(serverUrl, sessionId, listenClientId);
                    }, 1000);
                }
                else {
                    console.log("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.");
                    VORLON.Core.ShowError("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.", 0);
                }
                return;
            }
            // Cookie
            var clientId = VORLON.Tools.ReadCookie("vorlonJS_clientId");
            if (!clientId) {
                clientId = VORLON.Tools.CreateGUID();
                VORLON.Tools.CreateCookie("vorlonJS_clientId", clientId, 1);
            }
            // Creating the messenger
            VORLON.Core._messenger = new VORLON.ClientMessenger(VORLON.Core._side, serverUrl, sessionId, clientId, listenClientId);
            // Connect messenger to dispatcher
            VORLON.Core.Messenger.onRealtimeMessageReceived = VORLON.Core._Dispatch;
            VORLON.Core.Messenger.onHeloReceived = VORLON.Core._OnIdentificationReceived;
            VORLON.Core.Messenger.onIdentifyReceived = VORLON.Core._OnIdentifyReceived;
            VORLON.Core.Messenger.onStopListenReceived = VORLON.Core._OnStopListenReceived;
            VORLON.Core.Messenger.onError = VORLON.Core._OnError;
            // Say 'helo'
            var heloMessage = {
                ua: navigator.userAgent
            };
            VORLON.Core.Messenger.sendRealtimeMessage("", heloMessage, VORLON.Core._side, "helo");
            for (var index = 0; index < VORLON.Core._clientPlugins.length; index++) {
                var plugin = VORLON.Core._clientPlugins[index];
                plugin.startClientSide();
            }
            // Handle client disconnect
            window.addEventListener("beforeunload", function () {
                VORLON.Core.Messenger.sendRealtimeMessage("", { socketid: VORLON.Core.Messenger.socketId }, VORLON.Core._side, "clientclosed");
            }, false);
            // Start global dirty check, at this point document is not ready,
            // little timeout to defer starting dirtycheck
            setTimeout(function () {
                _this.startClientDirtyCheck();
            }, 500);
        };
        _Core.prototype.startClientDirtyCheck = function () {
            var mutationObserver = window.MutationObserver || window.WebKitMutationObserver || null;
            if (mutationObserver) {
                if (!document.body.__vorlon)
                    document.body.__vorlon = {};
                var config = { attributes: true, childList: true, subtree: true, characterData: true };
                document.body.__vorlon._observerMutationObserver = new mutationObserver(function (mutations) {
                    var sended = false;
                    mutations.forEach(function (mutation) {
                        if (mutation.target && mutation.target.__vorlon && mutation.target.__vorlon.ignore) {
                            return;
                        }
                        if (mutation.target && !sended && mutation.target.__vorlon && mutation.target.parentNode && mutation.target.parentNode.__vorlon && mutation.target.parentNode.__vorlon.internalId) {
                            setTimeout(function () {
                                var internalId = null;
                                if (mutation && mutation.target && mutation.target.parentNode && mutation.target.parentNode.__vorlon && mutation.target.parentNode.__vorlon.internalId)
                                    internalId = mutation.target.parentNode.__vorlon.internalId;
                                VORLON.Core.Messenger.sendRealtimeMessage('ALL_PLUGINS', {
                                    type: 'contentchanged',
                                    internalId: internalId
                                }, VORLON.Core._side, 'message');
                            }, 300);
                        }
                        sended = true;
                    });
                });
                document.body.__vorlon._observerMutationObserver.observe(document.body, config);
            }
            else {
                console.log("dirty check using html string");
                var content;
                if (document.body)
                    content = document.body.innerHTML;
                setInterval(function () {
                    var html = document.body.innerHTML;
                    if (content != html) {
                        content = html;
                        VORLON.Core.Messenger.sendRealtimeMessage('ALL_PLUGINS', {
                            type: 'contentchanged'
                        }, VORLON.Core._side, 'message');
                    }
                }, 2000);
            }
        };
        _Core.prototype.StartDashboardSide = function (serverUrl, sessionId, listenClientId, divMapper) {
            if (serverUrl === void 0) { serverUrl = "'http://localhost:1337/'"; }
            if (sessionId === void 0) { sessionId = ""; }
            if (listenClientId === void 0) { listenClientId = ""; }
            if (divMapper === void 0) { divMapper = null; }
            VORLON.Core._side = 1 /* Dashboard */;
            VORLON.Core._sessionID = sessionId;
            VORLON.Core._listenClientId = listenClientId;
            /* Notification elements */
            VORLON.Core._errorNotifier = document.createElement('x-notify');
            VORLON.Core._errorNotifier.setAttribute('type', 'error');
            VORLON.Core._errorNotifier.setAttribute('position', 'top');
            VORLON.Core._errorNotifier.setAttribute('duration', 5000);
            VORLON.Core._messageNotifier = document.createElement('x-notify');
            VORLON.Core._messageNotifier.setAttribute('position', 'top');
            VORLON.Core._messageNotifier.setAttribute('duration', 4000);
            document.body.appendChild(VORLON.Core._errorNotifier);
            document.body.appendChild(VORLON.Core._messageNotifier);
            // Checking socket.io
            if (window.io === undefined) {
                if (this._socketIOWaitCount < 10) {
                    this._socketIOWaitCount++;
                    // Let's wait a bit just in case socket.io was loaded asynchronously
                    setTimeout(function () {
                        console.log("Vorlon.js: waiting for socket.io to load...");
                        VORLON.Core.StartDashboardSide(serverUrl, sessionId, listenClientId, divMapper);
                    }, 1000);
                }
                else {
                    console.log("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.");
                    VORLON.Core.ShowError("Vorlon.js: please load socket.io before referencing vorlon.js or use includeSocketIO = true in your catalog.json file.", 0);
                }
                return;
            }
            // Cookie
            var clientId = VORLON.Tools.ReadCookie("vorlonJS_clientId");
            if (!clientId) {
                clientId = VORLON.Tools.CreateGUID();
                VORLON.Tools.CreateCookie("vorlonJS_clientId", clientId, 1);
            }
            // Creating the messenger
            VORLON.Core._messenger = new VORLON.ClientMessenger(VORLON.Core._side, serverUrl, sessionId, clientId, listenClientId);
            // Connect messenger to dispatcher
            VORLON.Core.Messenger.onRealtimeMessageReceived = VORLON.Core._Dispatch;
            VORLON.Core.Messenger.onHeloReceived = VORLON.Core._OnIdentificationReceived;
            VORLON.Core.Messenger.onIdentifyReceived = VORLON.Core._OnIdentifyReceived;
            VORLON.Core.Messenger.onStopListenReceived = VORLON.Core._OnStopListenReceived;
            VORLON.Core.Messenger.onError = VORLON.Core._OnError;
            // Say 'helo'
            var heloMessage = {
                ua: navigator.userAgent
            };
            VORLON.Core.Messenger.sendRealtimeMessage("", heloMessage, VORLON.Core._side, "helo");
            for (var index = 0; index < VORLON.Core._dashboardPlugins.length; index++) {
                var plugin = VORLON.Core._dashboardPlugins[index];
                plugin.startDashboardSide(divMapper ? divMapper(plugin.getID()) : null);
            }
        };
        _Core.prototype._OnStopListenReceived = function () {
            VORLON.Core._listenClientId = "";
        };
        _Core.prototype._OnIdentifyReceived = function (message) {
            //console.log('identify ' + message);
            if (VORLON.Core._side === 1 /* Dashboard */) {
                VORLON.Core._messageNotifier.innerHTML = message;
                VORLON.Core._messageNotifier.show();
            }
            else {
                var div = document.createElement("div");
                div.style.position = "absolute";
                div.style.left = "0";
                div.style.top = "50%";
                div.style.marginTop = "-150px";
                div.style.width = "100%";
                div.style.height = "300px";
                div.style.fontFamily = "Arial";
                div.style.fontSize = "300px";
                div.style.textAlign = "center";
                div.style.color = "white";
                div.style.textShadow = "2px 2px 5px black";
                div.style.zIndex = "100";
                div.innerHTML = message;
                document.body.appendChild(div);
                setTimeout(function () {
                    document.body.removeChild(div);
                }, 4000);
            }
        };
        _Core.prototype.ShowError = function (message, timeout) {
            if (timeout === void 0) { timeout = 5000; }
            if (VORLON.Core._side === 1 /* Dashboard */) {
                VORLON.Core._errorNotifier.innerHTML = message;
                VORLON.Core._errorNotifier.setAttribute('duration', timeout);
                VORLON.Core._errorNotifier.show();
            }
            else {
                var divError = document.createElement("div");
                divError.style.position = "absolute";
                divError.style.top = "0";
                divError.style.left = "0";
                divError.style.width = "100%";
                divError.style.height = "100px";
                divError.style.backgroundColor = "red";
                divError.style.textAlign = "center";
                divError.style.fontSize = "30px";
                divError.style.paddingTop = "20px";
                divError.style.color = "white";
                divError.style.fontFamily = "consolas";
                divError.style.zIndex = "1001";
                divError.innerHTML = message;
                document.body.appendChild(divError);
                if (timeout) {
                    setTimeout(function () {
                        document.body.removeChild(divError);
                    }, timeout);
                }
            }
        };
        _Core.prototype._OnError = function (err) {
            VORLON.Core.ShowError("Error while connecting to server. Server may be offline.<BR>Error message: " + err.message);
        };
        _Core.prototype._OnIdentificationReceived = function (id) {
            //console.log('helo received ' + id);
            VORLON.Core._listenClientId = id;
            if (VORLON.Core._side === 0 /* Client */) {
                for (var index = 0; index < VORLON.Core._clientPlugins.length; index++) {
                    var plugin = VORLON.Core._clientPlugins[index];
                    plugin.refresh();
                }
            }
            else {
                var elt = document.querySelector('.dashboard-plugins-overlay');
                VORLON.Tools.AddClass(elt, 'hidden');
            }
        };
        _Core.prototype._RetrySendingRealtimeMessage = function (plugin, message) {
            setTimeout(function () {
                if (plugin.isReady()) {
                    VORLON.Core._DispatchFromClientPluginMessage(plugin, message);
                    return;
                }
                VORLON.Core._RetrySendingRealtimeMessage(plugin, message);
            }, VORLON.Core._RetryTimeout);
        };
        _Core.prototype._Dispatch = function (message) {
            if (!message.metadata) {
                console.error('invalid message ' + JSON.stringify(message));
                return;
            }
            if (message.metadata.pluginID == 'ALL_PLUGINS') {
                VORLON.Core._clientPlugins.forEach(function (plugin) {
                    VORLON.Core._DispatchPluginMessage(plugin, message);
                });
                VORLON.Core._dashboardPlugins.forEach(function (plugin) {
                    VORLON.Core._DispatchPluginMessage(plugin, message);
                });
            }
            else {
                VORLON.Core._clientPlugins.forEach(function (plugin) {
                    if (plugin.getID() === message.metadata.pluginID) {
                        VORLON.Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
                VORLON.Core._dashboardPlugins.forEach(function (plugin) {
                    if (plugin.getID() === message.metadata.pluginID) {
                        VORLON.Core._DispatchPluginMessage(plugin, message);
                        return;
                    }
                });
            }
        };
        _Core.prototype._DispatchPluginMessage = function (plugin, message) {
            plugin.trace('received ' + JSON.stringify(message));
            if (message.metadata.side === 0 /* Client */) {
                if (!plugin.isReady()) {
                    VORLON.Core._RetrySendingRealtimeMessage(plugin, message);
                }
                else {
                    VORLON.Core._DispatchFromClientPluginMessage(plugin, message);
                }
            }
            else {
                VORLON.Core._DispatchFromDashboardPluginMessage(plugin, message);
            }
        };
        _Core.prototype._DispatchFromClientPluginMessage = function (plugin, message) {
            if (message.command && plugin.DashboardCommands) {
                var command = plugin.DashboardCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromClientSide(message.data);
        };
        _Core.prototype._DispatchFromDashboardPluginMessage = function (plugin, message) {
            if (message.command && plugin.ClientCommands) {
                var command = plugin.ClientCommands[message.command];
                if (command) {
                    command.call(plugin, message.data);
                    return;
                }
            }
            plugin.onRealtimeMessageReceivedFromDashboardSide(message.data);
        };
        return _Core;
    })();
    VORLON._Core = _Core;
    VORLON.Core = new _Core();
})(VORLON || (VORLON = {}));
