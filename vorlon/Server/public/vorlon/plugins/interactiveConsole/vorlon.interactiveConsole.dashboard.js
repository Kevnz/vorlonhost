var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var InteractiveConsoleDashboard = (function (_super) {
        __extends(InteractiveConsoleDashboard, _super);
        function InteractiveConsoleDashboard() {
            _super.call(this, "interactiveConsole", "control.html", "control.css");
            this._commandHistory = [];
            this._logEntries = [];
            this._ready = false;
            this._id = "CONSOLE";
            this.traceLog = function (msg) {
                console.log(msg);
            };
        }
        InteractiveConsoleDashboard.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                // Log container
                _this._containerDiv = VORLON.Tools.QuerySelectorById(filledDiv, "logs");
                _this._clearButton = VORLON.Tools.QuerySelectorById(filledDiv, 'clear');
                _this._clearButton.addEventListener('clear', function () {
                    _this.sendCommandToClient('clear');
                });
                // Interactive console
                _this._interactiveInput = VORLON.Tools.QuerySelectorById(div, "input");
                _this._interactiveInput.addEventListener("keydown", function (evt) {
                    if (evt.keyCode === 13) {
                        _this.sendCommandToClient('order', {
                            order: _this._interactiveInput.value
                        });
                        _this._commandHistory.push(_this._interactiveInput.value);
                        _this._commandIndex = null;
                        _this._interactiveInput.value = "";
                    }
                    if (evt.keyCode === 38) {
                        if (_this._commandIndex == null)
                            _this._commandIndex = _this._commandHistory.length;
                        if (_this._commandHistory.length > 0 && _this._commandIndex > 0) {
                            _this._commandIndex--;
                            _this._interactiveInput.value = _this._commandHistory[_this._commandIndex];
                        }
                    }
                    else if (evt.keyCode === 40) {
                        if (_this._commandHistory.length > 0 && _this._commandIndex != null) {
                            if (_this._commandIndex < _this._commandHistory.length - 1) {
                                _this._commandIndex++;
                                _this._interactiveInput.value = _this._commandHistory[_this._commandIndex];
                            }
                            else {
                                _this._interactiveInput.value = "";
                                _this._commandIndex = null;
                            }
                        }
                    }
                });
                var filterAllBtn = filledDiv.querySelector('#filterall');
                var filterButtons = filledDiv.querySelectorAll('.filter-btn');
                var applyFilters = function () {
                    var filters = [];
                    withFilterButton(function (btn) {
                        if (btn.id !== 'filterall' && btn.className.match('selected')) {
                            filters.push(btn.getAttribute('filter'));
                        }
                    });
                    _this.applyFilter(filters, _this._textFilter.value);
                };
                var filterButtonClick = function (arg) {
                    VORLON.Tools.RemoveClass(filterAllBtn, 'selected');
                    VORLON.Tools.ToggleClass(arg.currentTarget, 'selected');
                    applyFilters();
                };
                var withFilterButton = function (callback) {
                    for (var i = 0, l = filterButtons.length; i < l; i++) {
                        callback(filterButtons[i]);
                    }
                };
                withFilterButton(function (btn) {
                    btn.onclick = filterButtonClick;
                });
                filterAllBtn.onclick = function () {
                    withFilterButton(function (btn) {
                        VORLON.Tools.RemoveClass(btn, 'selected');
                    });
                    VORLON.Tools.AddClass(filterAllBtn, 'selected');
                    applyFilters();
                };
                _this._textFilter = VORLON.Tools.QuerySelectorById(div, "filterInput");
                var timeout;
                _this._textFilter.addEventListener("keydown", function (evt) {
                    if (timeout)
                        clearTimeout(timeout);
                    setTimeout(function () { return applyFilters(); }, 300);
                });
                _this._ready = true;
            });
        };
        InteractiveConsoleDashboard.prototype.addDashboardEntries = function (entries) {
            for (var i = 0, l = entries.length; i < l; i++) {
                this.addDashboardEntry(entries[i]);
            }
        };
        InteractiveConsoleDashboard.prototype.addDashboardEntry = function (entry) {
            var ctrl = new InteractiveConsoleEntry(this._containerDiv, entry);
            this._logEntries.push(ctrl);
        };
        InteractiveConsoleDashboard.prototype.clearDashboard = function () {
            this._containerDiv.innerHTML = '';
        };
        InteractiveConsoleDashboard.prototype.applyFilter = function (filters, text) {
            if (text)
                text = text.toLowerCase();
            for (var i = 0; i < this._logEntries.length; i++) {
                if (filters.length) {
                    if (filters.indexOf(this._logEntries[i].entry.type) === -1) {
                        this._logEntries[i].element.classList.add('hide');
                    }
                    else {
                        this._logEntries[i].element.classList.remove('hide');
                    }
                }
                else {
                    this._logEntries[i].element.classList.remove('hide');
                }
                if (text && !this._logEntries[i].element.classList.contains('hide')) {
                    var contains = false;
                    for (var x = 0; x < this._logEntries[i].entry.messages.length; x++) {
                        var message = this._logEntries[i].entry.messages[x];
                        if (typeof message != 'string') {
                            message = JSON.stringify(message).toLowerCase();
                        }
                        if (this._logEntries[i].entry.messages[x] && message.indexOf(text) !== -1) {
                            contains = true;
                            break;
                        }
                    }
                    if (!contains)
                        this._logEntries[i].element.classList.add('hide');
                }
            }
            console.log('apply filters ' + JSON.stringify(filters));
        };
        return InteractiveConsoleDashboard;
    })(VORLON.DashboardPlugin);
    VORLON.InteractiveConsoleDashboard = InteractiveConsoleDashboard;
    InteractiveConsoleDashboard.prototype.DashboardCommands = {
        entries: function (data) {
            var plugin = this;
            plugin.addDashboardEntries(data.entries);
        },
        clear: function (data) {
            var plugin = this;
            plugin.clearDashboard();
        },
        setorder: function (data) {
            var plugin = this;
            plugin._interactiveInput.value = "document.getElementById(\"" + data.order + "\")";
        }
    };
    var InteractiveConsoleObject = (function () {
        function InteractiveConsoleObject(parent, obj, addToggle) {
            var _this = this;
            if (addToggle === void 0) { addToggle = false; }
            this.contentRendered = false;
            this.obj = obj;
            this.element = new VORLON.FluentDOM('DIV', 'object-description collapsed', parent).element;
            if (addToggle) {
                var toggle = new VORLON.FluentDOM('A', 'object-toggle obj-link', this.element);
                var toggleState = toggle.createChild('SPAN', 'toggle-state').text("+");
                toggle.createChild('SPAN', '').html('[Object]');
                toggle.click(function () {
                    _this.toggleView();
                    if (_this.expanded()) {
                        toggleState.text('-');
                    }
                    else {
                        toggleState.text('+');
                    }
                });
                this.toggle = toggle.element;
            }
            this.content = new VORLON.FluentDOM('DIV', 'object-content', this.element).element;
        }
        InteractiveConsoleObject.prototype.expanded = function () {
            return !this.element.className.match('collapsed');
        };
        InteractiveConsoleObject.prototype.toggleView = function () {
            this.renderContent();
            VORLON.Tools.ToggleClass(this.element, 'collapsed');
        };
        InteractiveConsoleObject.prototype.renderContent = function () {
            var _this = this;
            if (this.contentRendered)
                return;
            if (this.obj.proto) {
                this.protoElt = new VORLON.FluentDOM('DIV', 'obj-proto', this.content).append('A', 'label obj-link', function (protolabel) {
                    var toggleState = protolabel.createChild('SPAN', 'toggle-state').text("+");
                    protolabel.createChild('SPAN', '').html('[Prototype]');
                    protolabel.click(function () {
                        if (_this.proto) {
                            _this.proto.toggleView();
                            if (_this.proto.expanded()) {
                                toggleState.text("-");
                            }
                            else {
                                toggleState.text("+");
                            }
                        }
                    });
                }).element;
                this.proto = new InteractiveConsoleObject(this.protoElt, this.obj.proto);
            }
            if (this.obj.functions && this.obj.functions.length) {
                this.functionsElt = new VORLON.FluentDOM('DIV', 'obj-functions collapsed', this.content).append('A', 'label obj-link', function (functionslabel) {
                    var toggleState = functionslabel.createChild('SPAN', 'toggle-state').text("+");
                    functionslabel.createChild('SPAN', '').html('[Methods]');
                    functionslabel.click(function () {
                        VORLON.Tools.ToggleClass(_this.functionsElt, 'collapsed');
                        if (_this.functionsElt.className.match('collapsed')) {
                            toggleState.text("+");
                        }
                        else {
                            toggleState.text("-");
                        }
                    });
                }).append('DIV', 'content collapsed', function (functionscontent) {
                    functionscontent.element;
                    for (var i = 0, l = _this.obj.functions.length; i < l; i++) {
                        functionscontent.append('DIV', 'func', function (objfunc) {
                            objfunc.text(_this.obj.functions[i]);
                        });
                    }
                }).element;
            }
            this.propertiesElt = new VORLON.FluentDOM('DIV', 'obj-properties', this.content).append('DIV', 'content', function (propcontent) {
                for (var i = 0, l = _this.obj.properties.length; i < l; i++) {
                    var p = _this.obj.properties[i];
                    propcontent.append('DIV', 'prop', function (prop) {
                        if (typeof p.val === 'object' && p.val !== null && p.val !== undefined) {
                            var obj = null;
                            prop.append('A', 'prop-name obj-link', function (propname) {
                                var toggleState = propname.createChild('SPAN', 'toggle-state').text("+");
                                propname.createChild('SPAN', '').html('<span class="prop-title">' + p.name + '</span>: <span>[Object]</span>');
                                propname.click(function () {
                                    if (obj) {
                                        obj.toggleView();
                                        if (obj.expanded()) {
                                            toggleState.text("-");
                                        }
                                        else {
                                            toggleState.text("+");
                                        }
                                    }
                                });
                            }).append('DIV', 'prop-obj', function (propobj) {
                                if (!p.val)
                                    console.error("no value !", p);
                                obj = new InteractiveConsoleObject(propobj.element, p.val);
                            });
                        }
                        else {
                            prop.append('DIV', 'prop-name', function (prop) {
                                prop.createChild('SPAN', 'blank-state');
                                prop.createChild('SPAN', 'prop-title').text(p.name);
                                prop.createChild('SPAN').text(": ");
                                prop.createChild('SPAN', 'prop-value').text(p.val);
                            });
                        }
                    });
                }
            }).element;
            this.contentRendered = true;
        };
        return InteractiveConsoleObject;
    })();
    var InteractiveConsoleEntry = (function () {
        function InteractiveConsoleEntry(parent, entry) {
            this.objects = [];
            this.entry = entry;
            this.element = document.createElement("div");
            this.element.className = 'log-entry ' + this.getTypeClass();
            parent.insertBefore(this.element, parent.childNodes.length > 0 ? parent.childNodes[0] : null);
            for (var i = 0, l = entry.messages.length; i < l; i++) {
                this.addMessage(entry.messages[i]);
            }
        }
        InteractiveConsoleEntry.prototype.addMessage = function (msg) {
            if (typeof msg === 'string' || typeof msg === 'number') {
                var elt = document.createElement('DIV');
                elt.className = 'log-message text-message';
                this.element.appendChild(elt);
                elt.textContent = msg;
            }
            else {
                var obj = new InteractiveConsoleObject(this.element, msg, true);
                this.objects.push(obj);
            }
        };
        InteractiveConsoleEntry.prototype.getTypeClass = function () {
            switch (this.entry.type) {
                case "log":
                    return "logMessage";
                    break;
                case "debug":
                    return "logDebug";
                    break;
                case "info":
                    return "logInfo";
                    break;
                case "warn":
                    return "logWarning";
                    break;
                case "error":
                    return "logError";
                    break;
                case "exception":
                    return "logException";
                    break;
                default:
                    return "logMessage";
            }
        };
        return InteractiveConsoleEntry;
    })();
    // Register
    VORLON.Core.RegisterDashboardPlugin(new InteractiveConsoleDashboard());
})(VORLON || (VORLON = {}));
