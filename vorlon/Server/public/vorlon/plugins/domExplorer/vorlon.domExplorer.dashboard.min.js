var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var DOMExplorerDashboard = (function (_super) {
        __extends(DOMExplorerDashboard, _super);
        function DOMExplorerDashboard() {
            _super.call(this, "domExplorer", "control.html", "control.css");
            this._lastReceivedObject = null;
            this.clikedNodeID = null;
            this._autorefresh = false;
            this._editablemode = false;
            this._clientHaveMutationObserver = false;
            this._id = "DOM";
            this._ready = false;
        }
        DOMExplorerDashboard.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._dashboardDiv = div;
            this._insertHtmlContentAsync(this._dashboardDiv, function (filledDiv) {
                _this._containerDiv = filledDiv;
                _this.treeDiv = VORLON.Tools.QuerySelectorById(filledDiv, "treeView");
                _this._innerHTMLView = VORLON.Tools.QuerySelectorById(filledDiv, "innerHTMLView");
                _this._margincontainer = VORLON.Tools.QuerySelectorById(filledDiv, "margincontainer");
                _this._bordercontainer = VORLON.Tools.QuerySelectorById(filledDiv, "bordercontainer");
                _this._paddingcontainer = VORLON.Tools.QuerySelectorById(filledDiv, "paddingcontainer");
                _this._sizecontainer = VORLON.Tools.QuerySelectorById(filledDiv, "sizecontainer");
                _this._computedsection = VORLON.Tools.QuerySelectorById(filledDiv, "computedsection");
                _this._searchinput = VORLON.Tools.QuerySelectorById(filledDiv, "searchinput");
                _this.styleView = VORLON.Tools.QuerySelectorById(filledDiv, "styleView");
                var domSettings = new DomSettings(_this);
                _this.searchDOM();
                _this.refreshButton = _this._containerDiv.querySelector('x-action[event="refresh"]');
                _this._stylesEditor = new DomExplorerPropertyEditor(_this);
                _this._containerDiv.addEventListener('refresh', function () {
                    _this.sendCommandToClient('refresh');
                });
                _this._containerDiv.addEventListener('gethtml', function () {
                    _this.sendCommandToClient('getInnerHTML', {
                        order: _this._selectedNode.node.internalId
                    });
                });
                _this._containerDiv.addEventListener('savehtml', function () {
                    _this.clikedNodeID = _this._selectedNode.node.internalId;
                    _this.sendCommandToClient('saveinnerHTML', {
                        order: _this._selectedNode.node.internalId,
                        innerhtml: _this._innerHTMLView.value
                    });
                });
                _this.treeDiv.addEventListener('click', function (e) {
                    var button = e.target;
                    if (button.className.match('treeNodeButton')) {
                        button.hasAttribute('data-collapsed') ? button.removeAttribute('data-collapsed') : button.setAttribute('data-collapsed', '');
                    }
                });
                _this.treeDiv.addEventListener('mouseenter', function (e) {
                    var node = e.target;
                    var parent = node.parentElement;
                    var isHeader = node.className.match('treeNodeHeader');
                    if (isHeader || parent.className.match('treeNodeClosingText')) {
                        if (isHeader) {
                            parent.setAttribute('data-hovered-tag', '');
                            var id = $(node).data('internalid');
                            if (id) {
                                _this.hoverNode(id);
                            }
                        }
                        else {
                            parent.parentElement.setAttribute('data-hovered-tag', '');
                            var id = $(parent).data('internalid');
                            if (id) {
                                _this.hoverNode(id);
                            }
                        }
                    }
                }, true);
                _this.treeDiv.addEventListener('mouseleave', function (e) {
                    var node = e.target;
                    if (node.className.match('treeNodeHeader') || node.parentElement.className.match('treeNodeClosingText')) {
                        var hovered = _this.treeDiv.querySelector('[data-hovered-tag]');
                        if (hovered)
                            hovered.removeAttribute('data-hovered-tag');
                        var id = $(node).data('internalid');
                        if (id) {
                            _this.hoverNode(id, true);
                        }
                        else {
                            var id = $(node.parentElement).data('internalid');
                            if (id) {
                                _this.hoverNode(id, true);
                            }
                        }
                    }
                }, true);
                $('.dom-explorer-container').split({
                    orientation: 'vertical',
                    limit: 50,
                    position: '70%'
                });
                $("#accordion h3", _this._containerDiv).click(function (elt) {
                    $('.visible', elt.target.parentElement).removeClass('visible');
                    $('#' + elt.target.className, elt.target.parentElement).addClass('visible');
                    elt.target.classList.add('visible');
                    if (elt.target.className.indexOf("htmlsection") !== -1) {
                        _this.sendCommandToClient('getInnerHTML', {
                            order: _this._selectedNode.node.internalId
                        });
                    }
                    else if (elt.target.className.indexOf("layoutsection") !== -1) {
                        _this.sendCommandToClient('getStyle', {
                            order: _this._selectedNode.node.internalId
                        });
                    }
                    else if (elt.target.className.indexOf("computedsection") !== -1) {
                        _this.sendCommandToClient('getComputedStyleById', {
                            order: _this._selectedNode.node.internalId
                        });
                    }
                });
                _this._ready = true;
                _this.sendCommandToClient("getMutationObeserverAvailability");
            });
        };
        DOMExplorerDashboard.prototype.searchDOM = function () {
            var _this = this;
            this._searchinput.addEventListener("keydown", function (evt) {
                if (evt.keyCode === 13 || evt.keyCode === 9) {
                    evt.preventDefault();
                    _this._selectorSearch = _this._searchinput.value;
                    if (_this._selectorSearch === _this._searchinput.value) {
                        _this.sendCommandToClient("searchDOMBySelector", { selector: _this._searchinput.value, position: _this._positionSearch });
                    }
                    else {
                        _this._positionSearch = 0;
                        _this.sendCommandToClient("searchDOMBySelector", { selector: _this._searchinput.value });
                    }
                }
            });
        };
        DOMExplorerDashboard.prototype.makeEditable = function (element) {
            if (element.contentEditable == "true") {
                return;
            }
            var range = document.createRange();
            var sel = window.getSelection();
            range.setStart(element, 1);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            if (this._editableElement)
                this.undoEditable(this._editableElement);
            element.contentEditable = "true";
            this._editablemode = true;
            this._editableElement = element;
            VORLON.Tools.AddClass(element, "editable");
            $(element).focus();
            $(element).closest(".treeNodeSelected").addClass("editableselection");
        };
        DOMExplorerDashboard.prototype.undoEditable = function (element) {
            this._editablemode = false;
            element.contentEditable = "false";
            VORLON.Tools.RemoveClass(element, "editable");
            $(element).closest(".treeNodeSelected").addClass("editableselection");
            this._editableElement = null;
        };
        DOMExplorerDashboard.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            if (receivedObject.type === "contentchanged" && !this._editablemode && (!this._clientHaveMutationObserver || this._autorefresh == false)) {
                this.dirtyCheck();
            }
            else if (receivedObject.type === "contentchanged" && receivedObject.internalId !== null && this._clientHaveMutationObserver) {
                if (this._autorefresh)
                    this.sendCommandToClient('refreshNode', {
                        order: receivedObject.internalId
                    });
                else
                    this.dirtyCheck();
            }
        };
        DOMExplorerDashboard.prototype.contentChanged = function () {
            this.refreshButton.setAttribute('changed', '');
        };
        DOMExplorerDashboard.prototype.setInnerHTMLView = function (data) {
            this._innerHTMLView.value = data.innerHTML;
        };
        DOMExplorerDashboard.prototype.setComputedStyle = function (data) {
            var _this = this;
            if (data && data.length) {
                data.forEach(function (item) {
                    var root = new VORLON.FluentDOM('div', 'styleWrap', _this._computedsection);
                    root.append('span', 'styleLabel', function (span) {
                        span.text(item.name);
                    });
                    root.append('span', 'styleValue', function (span) {
                        span.text(item.value);
                    });
                });
            }
        };
        DOMExplorerDashboard.prototype.setLayoutStyle = function (data) {
            this._margincontainer.parentElement.parentElement.classList.remove('hide');
            $('.top', this._margincontainer).html(data.margin.top);
            $('.bottom', this._margincontainer).html(data.margin.bottom);
            $('.left', this._margincontainer).html(data.margin.left);
            $('.right', this._margincontainer).html(data.margin.right);
            $('.top', this._bordercontainer).html(data.border.topWidth);
            $('.bottom', this._bordercontainer).html(data.border.bottomWidth);
            $('.left', this._bordercontainer).html(data.border.leftWidth);
            $('.right', this._bordercontainer).html(data.border.rightWidth);
            $('.top', this._paddingcontainer).html(data.padding.top);
            $('.bottom', this._paddingcontainer).html(data.padding.bottom);
            $('.left', this._paddingcontainer).html(data.padding.left);
            $('.right', this._paddingcontainer).html(data.padding.right);
            var w = data.size.width;
            if (w && w.indexOf('.') !== -1) {
                w = w.split('.')[0] + 'px';
            }
            var h = data.size.height;
            if (h && h.indexOf('.') !== -1) {
                h = h.split('.')[0] + 'px';
            }
            $(this._sizecontainer).html(w + " x " + h);
        };
        DOMExplorerDashboard.prototype.searchDOMByResults = function (data) {
            this._lengthSearch = data.length, this._selectorSearch = data.selector;
            this._positionSearch = data.position;
        };
        DOMExplorerDashboard.prototype.mutationObeserverAvailability = function (data) {
            this._clientHaveMutationObserver = data.availability;
        };
        DOMExplorerDashboard.prototype.initDashboard = function (root) {
            this.refreshButton.removeAttribute('changed');
            this._lastReceivedObject = root;
            while (this.treeDiv.hasChildNodes()) {
                this.treeDiv.removeChild(this.treeDiv.lastChild);
            }
            if (this._rootNode)
                this._rootNode.dispose();
            this.treeDiv.parentElement.classList.add('active');
            this._rootNode = new DomExplorerNode(this, null, this.treeDiv, root);
        };
        DOMExplorerDashboard.prototype.updateDashboard = function (node) {
            if (this._rootNode) {
                this._rootNode.update(node);
            }
        };
        DOMExplorerDashboard.prototype.setAutorefresh = function (value) {
            this._autorefresh = value;
        };
        DOMExplorerDashboard.prototype.getContainerDiv = function () {
            return this._containerDiv;
        };
        DOMExplorerDashboard.prototype.dirtyCheck = function () {
            this.refreshButton.setAttribute('changed', '');
            if (this._autorefresh) {
                this.sendCommandToClient('refresh');
            }
        };
        DOMExplorerDashboard.prototype.hoverNode = function (internalId, unselect) {
            if (unselect === void 0) { unselect = false; }
            if (!internalId) {
                this.sendCommandToClient('unselect', {
                    order: null
                });
            }
            else if (unselect) {
                this.sendCommandToClient('unselect', {
                    order: internalId
                });
            }
            else {
                this.sendCommandToClient('select', {
                    order: internalId
                });
            }
        };
        DOMExplorerDashboard.prototype.select = function (selected) {
            $("#accordion .stylessection ").trigger('click');
            this._margincontainer.parentElement.parentElement.classList.add('hide');
            if (this._selectedNode) {
                this._selectedNode.selected(false);
                this.sendCommandToClient('unselect', {
                    order: this._selectedNode.node.internalId
                });
            }
            else {
                this.sendCommandToClient('unselect', {
                    order: null
                });
            }
            if (selected) {
                this._selectedNode = selected;
                this._selectedNode.selected(true);
                this.sendCommandToClient('select', {
                    order: this._selectedNode.node.internalId
                });
                this._stylesEditor.generateStyles(selected.node, selected.node.internalId);
                this._innerHTMLView.value = "";
            }
            else {
                this._selectedNode = null;
            }
        };
        return DOMExplorerDashboard;
    })(VORLON.DashboardPlugin);
    VORLON.DOMExplorerDashboard = DOMExplorerDashboard;
    DOMExplorerDashboard.prototype.DashboardCommands = {
        init: function (root) {
            var plugin = this;
            plugin.initDashboard(root);
        },
        contentChanged: function () {
        },
        searchDOMByResults: function (data) {
            var plugin = this;
            plugin.searchDOMByResults(data);
        },
        mutationObeserverAvailability: function (data) {
            var plugin = this;
            plugin.mutationObeserverAvailability(data);
        },
        innerHTML: function (data) {
            var plugin = this;
            plugin.setInnerHTMLView(data);
        },
        setLayoutStyle: function (data) {
            var plugin = this;
            plugin.setLayoutStyle(data);
        },
        setComputedStyle: function (data) {
            var plugin = this;
            plugin.setComputedStyle(data);
        },
        refreshNode: function (node) {
            var plugin = this;
            plugin.updateDashboard(node);
        }
    };
    var DomExplorerNode = (function () {
        function DomExplorerNode(plugin, parent, parentElt, node, oldNode) {
            this.attributes = [];
            this.childs = [];
            this.parent = parent;
            this.node = node;
            this.plugin = plugin;
            if (oldNode) {
                this.parent = oldNode.parent;
                this.element = oldNode.element;
                this.element.innerHTML = "";
                this.render(parentElt, true);
            }
            else {
                this.render(parentElt);
            }
        }
        DomExplorerNode.prototype.dispose = function () {
            for (var i = 0, l = this.childs.length; i < l; i++) {
                this.childs[i].dispose();
            }
            this.plugin = null;
            this.parent = null;
            this.element = null;
            this.header = null;
            this.headerAttributes = null;
            this.contentContainer = null;
        };
        DomExplorerNode.prototype.update = function (node) {
            this.plugin.refreshButton.removeAttribute('changed');
            var newNode = this.insertReceivedObject(node, this.plugin._rootNode);
            if (node.highlightElementID)
                this.openNode(node.highlightElementID);
        };
        DomExplorerNode.prototype.insertReceivedObject = function (receivedObject, root) {
            if ((root && root.node && root.node.internalId === this.plugin.clikedNodeID) || (this.plugin.clikedNodeID === null && root.node.internalId === receivedObject.internalId)) {
                this.plugin.clikedNodeID = null;
                var newNode;
                if (root.parent === null) {
                    newNode = new DomExplorerNode(root.plugin, null, this.plugin.treeDiv, receivedObject, root);
                }
                else {
                    newNode = new DomExplorerNode(root.plugin, root.parent, root.parent.element, receivedObject, root);
                }
                root.childs = newNode.childs;
                root.node.hasChildNodes = false;
                return root;
            }
            else {
                if (root && root.childs && root.childs.length) {
                    for (var index = 0; index < root.childs.length; index++) {
                        var res = this.insertReceivedObject(receivedObject, root.childs[index]);
                        if (res) {
                            root.childs.length[index] = res;
                            return root;
                        }
                    }
                }
            }
        };
        DomExplorerNode.prototype.openNode = function (highlightElementID) {
            $('#plusbtn' + highlightElementID).trigger('click');
            $('.treeNodeSelected').removeClass('treeNodeSelected');
            var domnode = $('#domNode' + highlightElementID);
            if (domnode.length == 0) {
                return;
            }
            domnode.addClass('treeNodeSelected');
            var container = $(this.plugin.treeDiv);
            container.animate({ scrollTop: domnode.offset().top - container.offset().top + container.scrollTop() });
        };
        DomExplorerNode.prototype.selected = function (selected) {
            if (selected) {
                $('.treeNodeSelected').removeClass('treeNodeSelected');
                VORLON.Tools.AddClass(this.element, 'treeNodeSelected');
            }
            else {
                $('.treeNodeSelected').removeClass('treeNodeSelected');
            }
        };
        DomExplorerNode.prototype.render = function (parent, isUpdate) {
            if (isUpdate === void 0) { isUpdate = false; }
            if (this.node.name === "#comment") {
                this.renderCommentNode(parent, isUpdate);
            }
            else if (this.node.type == "3") {
                this.renderTextNode(parent, isUpdate);
            }
            else {
                this.renderDOMNode(parent, isUpdate);
            }
        };
        DomExplorerNode.prototype.sendTextToClient = function () {
            this.plugin.sendCommandToClient('setElementValue', {
                value: this.element.innerHTML,
                order: this.parent.node.internalId
            });
            this.plugin.undoEditable(this.element);
        };
        DomExplorerNode.prototype.renderCommentNode = function (parentElt, isUpdate) {
            if (isUpdate === void 0) { isUpdate = false; }
            if (DomExplorerNode._spaceCheck.test(this.node.content)) {
                if (!isUpdate) {
                    var textNode = new VORLON.FluentDOM('span', 'nodeTextContent nodeComment', parentElt);
                    this.element = textNode.element;
                    textNode.text(this.node.content.trim()).editable(false);
                }
                else {
                    this.element.innerHTML = "";
                }
            }
        };
        DomExplorerNode.prototype.renderTextNode = function (parentElt, isUpdate) {
            var _this = this;
            if (isUpdate === void 0) { isUpdate = false; }
            if (DomExplorerNode._spaceCheck.test(this.node.content)) {
                if (!isUpdate) {
                    var textNode = new VORLON.FluentDOM('span', 'nodeTextContent', parentElt);
                    this.element = textNode.element;
                    textNode.text(this.node.content.trim()).editable(false).blur(function () { return _this.sendTextToClient(); }).keydown(function (evt) {
                        if (evt.keyCode === 13 || evt.keyCode === 9) {
                            _this.sendTextToClient();
                        }
                    }).click(function () {
                        _this.plugin.makeEditable(_this.element);
                    });
                }
                else {
                    this.element.innerHTML = "";
                }
            }
        };
        DomExplorerNode.prototype.renderDOMNode = function (parentElt, isUpdate) {
            if (isUpdate === void 0) { isUpdate = false; }
            parentElt.setAttribute('data-has-children', '');
            if (!isUpdate) {
                var root = new VORLON.FluentDOM('DIV', 'domNode', parentElt);
                this.element = root.element;
            }
            else {
                this.element.innerHTML = "";
            }
            this.element.id = "domNode" + this.node.internalId;
            this.renderDOMNodeContent();
        };
        DomExplorerNode.prototype.renderDOMNodeContent = function () {
            var _this = this;
            var root = VORLON.FluentDOM.for(this.element);
            root.append('BUTTON', 'treeNodeButton', function (nodeButton) {
                nodeButton.element.id = "plusbtn" + _this.node.internalId;
                if (_this.node.hasChildNodes && (!_this.node.children || _this.node.children.length === 0)) {
                    VORLON.Tools.AddClass(_this.element, "collapsed");
                    nodeButton.attr("data-collapsed", "");
                }
                else {
                    VORLON.Tools.RemoveClass(_this.element, "collapsed");
                }
                nodeButton.attr('button-block', '');
                nodeButton.click(function () {
                    if (_this.node.hasChildNodes && !nodeButton.element.className.match('loading')) {
                        VORLON.Tools.AddClass(nodeButton.element, "loading");
                        _this.plugin.clikedNodeID = _this.node.internalId;
                        _this.plugin.sendCommandToClient('refreshNode', {
                            order: _this.node.internalId
                        });
                    }
                });
            });
            var that = this;
            var menu = function (idtarget) {
                $('.b-m-mpanel').remove();
                var option = {
                    width: 180,
                    items: [
                        {
                            text: "Edit content as HTML",
                            icon: "",
                            alias: "1-1",
                            action: function () {
                                that.parent.plugin.select(that);
                                that.parent.plugin.sendCommandToClient('getInnerHTML', {
                                    order: that.plugin._selectedNode.node.internalId
                                });
                                $("#accordion .htmlsection").trigger('click');
                            }
                        },
                        {
                            text: "Add attribute",
                            alias: "1-3",
                            icon: "",
                            action: function () {
                                var attr = new DomExplorerNodeAttribute(that, "name", "value");
                                that.attributes.push(attr);
                            }
                        }
                    ]
                };
                $('.b-m-mpanel').remove();
                $(idtarget).contextmenu(option);
            };
            root.append("SPAN", "treeNodeHeader", function (header) {
                _this.header = header.element;
                header.click(function () { return _this.plugin.select(_this); });
                header.createChild("SPAN", "opentag").text('<');
                var nodename = header.createChild("SPAN", "nodeName");
                nodename.text(_this.node.name);
                header.element.id = "treeNodeHeader-" + _this.node.internalId;
                $(_this.header).data("internalid", _this.node.internalId);
                _this.headerAttributes = header.createChild("SPAN", "attributes").element;
                _this.node.attributes.forEach(function (attr) {
                    _this.addAttribute(attr[0], attr[1]);
                });
                header.createChild("SPAN", "closetag").text('>');
                nodename.element.addEventListener("contextmenu", function (evt) {
                    menu("#treeNodeHeader-" + that.node.internalId);
                });
            });
            root.append('DIV', 'nodeContentContainer', function (container) {
                _this.contentContainer = container.element;
                if (_this.node.hasChildNodes) {
                    _this.contentContainer.id = "vorlon-" + _this.node.internalId;
                }
                var nodes = _this.node.children;
                if (nodes && nodes.length) {
                    for (var index = 0; index < nodes.length; index++) {
                        var child = nodes[index];
                        if (child.nodeType != 3) {
                            var node = new DomExplorerNode(_this.plugin, _this, _this.contentContainer, child);
                            _this.childs.push(node);
                        }
                    }
                }
            });
            if (this.node.name) {
                root.append("DIV", "treeNodeClosingText", function (footer) {
                    footer.createChild("SPAN", "openclosingtag").text('</');
                    footer.createChild("SPAN", "nodeName").text(_this.node.name);
                    footer.createChild("SPAN", "closetag").text('>');
                    if (!footer.element.dataset)
                        footer.element.dataset = {};
                    $(footer.element).data("internalid", _this.node.internalId);
                    footer.element.id = "treeNodeClosingText" + _this.node.internalId;
                    footer.element.addEventListener("contextmenu", function () {
                        menu("#treeNodeClosingText" + _this.node.internalId);
                    });
                });
            }
            // Main node
            // Tools
            if (this.node.id) {
                root.createChild("span", "treeNodeTools fa fa-terminal").click(function () {
                    _this.plugin.sendCommandToPluginDashboard("CONSOLE", "setorder", {
                        order: _this.node.id
                    });
                });
            }
        };
        DomExplorerNode.prototype.addAttribute = function (name, value) {
            var attr = new DomExplorerNodeAttribute(this, name, value);
            this.attributes.push(attr);
        };
        DomExplorerNode._spaceCheck = /[^\t\n\r ]/;
        return DomExplorerNode;
    })();
    VORLON.DomExplorerNode = DomExplorerNode;
    var DomSettings = (function () {
        function DomSettings(plugin) {
            this._plugin = plugin;
            this.setSettings(this._plugin.getContainerDiv());
        }
        DomSettings.prototype.setSettings = function (filledDiv) {
            var _this = this;
            this._globalload = VORLON.Tools.QuerySelectorById(filledDiv, "globalload");
            this._autorefresh = VORLON.Tools.QuerySelectorById(filledDiv, "autorefresh");
            this.loadSettings();
            this.refreshClient();
            $(this._autorefresh).change(function () {
                _this.saveSettings();
            });
            $(this._globalload).change(function () {
                _this.saveSettings();
            });
        };
        DomSettings.prototype.refreshClient = function () {
            this._plugin.sendCommandToClient('setSettings', { globalload: this._globalload.checked, autoRefresh: this._autorefresh.checked });
        };
        DomSettings.prototype.loadSettings = function () {
            var stringSettings = VORLON.Tools.getLocalStorageValue("settings" + VORLON.Core._sessionID);
            if (this._autorefresh && this._globalload && stringSettings) {
                var settings = JSON.parse(stringSettings);
                if (settings) {
                    $(this._globalload).switchButton({ checked: settings.globalload });
                    $(this._autorefresh).switchButton({ checked: settings.autorefresh });
                    if (settings.globalload)
                        this._plugin.sendCommandToClient('globalload', { value: true });
                    this._plugin.setAutorefresh(this._autorefresh.checked);
                    return;
                }
            }
            $(this._globalload).switchButton({ checked: false });
            $(this._autorefresh).switchButton({ checked: false });
            this._plugin.setAutorefresh(this._autorefresh.checked);
        };
        DomSettings.prototype.saveSettings = function () {
            this.refreshClient();
            this._plugin.setAutorefresh(this._autorefresh.checked);
            VORLON.Tools.setLocalStorageValue("settings" + VORLON.Core._sessionID, JSON.stringify({
                "globalload": this._globalload.checked,
                "autorefresh": this._autorefresh.checked,
            }));
        };
        return DomSettings;
    })();
    VORLON.DomSettings = DomSettings;
    var DomExplorerNodeAttribute = (function () {
        function DomExplorerNodeAttribute(parent, name, value) {
            this.parent = parent;
            this.name = name;
            this.value = value;
            this.render();
        }
        DomExplorerNodeAttribute.prototype.eventNode = function (nodeName, nodeValue, parentElementId) {
            var _this = this;
            var oldNodeName = nodeName.innerHTML;
            var that = this;
            var sendTextToClient = function (attributeName, attributeValue, nodeEditable) {
                _this.parent.plugin.sendCommandToClient('attribute', {
                    attributeName: attributeName,
                    attributeOldName: oldNodeName,
                    attributeValue: attributeValue,
                    order: _this.parent.node.internalId
                });
                if (!attributeName) {
                    nodeName.parentElement.removeChild(nodeName);
                    nodeValue.parentElement.removeChild(nodeValue);
                }
                that.parent.plugin.undoEditable(nodeEditable);
            };
            var menu = function () {
                var option = {
                    width: 180,
                    items: [
                        {
                            text: "Edit attribute name",
                            icon: "",
                            alias: "1-1",
                            action: function () {
                                that.parent.plugin.makeEditable(nodeName);
                            }
                        },
                        {
                            text: "Edit attribute value",
                            alias: "1-2",
                            icon: "",
                            action: function () {
                                that.parent.plugin.makeEditable(nodeValue);
                            }
                        },
                        {
                            text: "Edit content as HTML",
                            alias: "1-3",
                            icon: "",
                            action: function () {
                                that.parent.plugin.select(that.parent);
                                that.parent.plugin.sendCommandToClient('getInnerHTML', {
                                    order: that.parent.plugin._selectedNode.node.internalId
                                });
                                $("#accordion .htmlsection").trigger('click');
                            }
                        },
                        {
                            text: "Add attribute",
                            alias: "1-4",
                            icon: "",
                            action: function () {
                                that.parent.addAttribute("name", "value");
                            }
                        },
                        {
                            text: "Delete attribute",
                            alias: "1-5",
                            icon: "",
                            action: function () {
                                sendTextToClient.bind(that)("", nodeValue.innerHTML, nodeValue);
                            }
                        }
                    ]
                };
                $('.b-m-mpanel').remove();
                $("#" + parentElementId).contextmenu(option);
            };
            nodeValue.addEventListener("contextmenu", function () {
                if (nodeValue.contentEditable != "true" && nodeName.contentEditable != "true")
                    menu.bind(_this)("value");
            });
            nodeValue.addEventListener("click", function () {
                _this.parent.plugin.makeEditable(nodeValue);
            });
            nodeName.addEventListener("click", function () {
                _this.parent.plugin.makeEditable(nodeName);
            });
            nodeName.addEventListener("contextmenu", function () {
                if (nodeValue.contentEditable != "true" && nodeName.contentEditable != "true")
                    menu.bind(_this)("name");
            });
            nodeValue.addEventListener("blur", function () {
                sendTextToClient.bind(_this)(nodeName.innerHTML, nodeValue.innerHTML, nodeValue);
            });
            nodeName.addEventListener("blur", function () {
                sendTextToClient.bind(_this)(nodeName.innerHTML, nodeValue.innerHTML, nodeName);
            });
            nodeName.addEventListener("keydown", function (evt) {
                if (evt.keyCode === 13 || evt.keyCode === 9) {
                    evt.preventDefault();
                    sendTextToClient.bind(_this)(nodeName.innerHTML, nodeValue.innerHTML, nodeName);
                }
            });
            nodeValue.addEventListener("keydown", function (evt) {
                if (evt.keyCode === 13 || evt.keyCode === 9) {
                    evt.preventDefault();
                    sendTextToClient.bind(_this)(nodeName.innerHTML, nodeValue.innerHTML, nodeValue);
                }
            });
        };
        DomExplorerNodeAttribute.prototype.render = function () {
            var node = new VORLON.FluentDOM("SPAN", "nodeAttribute", this.parent.headerAttributes);
            this.element = node.element;
            var nodename = node.createChild("SPAN", "attr-name").html(this.name);
            node.element.id = VORLON.Tools.CreateGUID();
            node.createChild("SPAN").html("=\"");
            var nodevalue = node.createChild("SPAN", "attr-value").html(this.value);
            node.createChild("SPAN").html("\"");
            this.eventNode(nodename.element, nodevalue.element, node.element.id);
        };
        return DomExplorerNodeAttribute;
    })();
    VORLON.DomExplorerNodeAttribute = DomExplorerNodeAttribute;
    var DomExplorerPropertyEditor = (function () {
        function DomExplorerPropertyEditor(plugin) {
            //private parent: HTMLElement = null;
            this.styles = [];
            this.plugin = plugin;
        }
        DomExplorerPropertyEditor.prototype._generateButton = function (parentNode, text, className, attribute) {
            var button = document.createElement("button");
            button.innerHTML = text;
            button.className = className;
            if (attribute)
                button.setAttribute(attribute.name, attribute.value);
            button.setAttribute('button-block', '');
            return parentNode.appendChild(button);
        };
        DomExplorerPropertyEditor.prototype.generateStyles = function (node, internalId) {
            var _this = this;
            this.node = node;
            this.internalId = internalId;
            this.styles = [];
            while (this.plugin.styleView.hasChildNodes()) {
                this.plugin.styleView.removeChild(this.plugin.styleView.lastChild);
            }
            for (var index = 0; index < node.styles.length; index++) {
                var style = node.styles[index];
                var splits = style.split(":");
                this.styles.push(new DomExplorerPropertyEditorItem(this, splits[0], splits[1], this.internalId));
            }
            // Append add style button
            this._generateButton(this.plugin.styleView, "+", "styleButton", null).addEventListener('click', function (e) {
                new DomExplorerPropertyEditorItem(_this, "property", "value", _this.internalId, true);
                _this.plugin.styleView.appendChild(e.target);
            });
        };
        return DomExplorerPropertyEditor;
    })();
    VORLON.DomExplorerPropertyEditor = DomExplorerPropertyEditor;
    var DomExplorerPropertyEditorItem = (function () {
        function DomExplorerPropertyEditorItem(parent, name, value, internalId, editableLabel, generate) {
            if (editableLabel === void 0) { editableLabel = false; }
            if (generate === void 0) { generate = true; }
            this.parent = parent;
            this.name = name;
            this.value = value;
            if (generate)
                this._generateStyle(name, value, internalId, editableLabel);
        }
        DomExplorerPropertyEditorItem.prototype._generateStyle = function (property, value, internalId, editableLabel) {
            var _this = this;
            if (editableLabel === void 0) { editableLabel = false; }
            var wrap = document.createElement("div");
            wrap.className = 'styleWrap';
            var label = document.createElement("div");
            label.innerHTML = property;
            label.className = "styleLabel";
            label.contentEditable = "false";
            var valueElement = this._generateClickableValue(label, value, internalId);
            wrap.appendChild(label);
            wrap.appendChild(valueElement);
            this.parent.plugin.styleView.appendChild(wrap);
            if (editableLabel) {
                label.addEventListener("blur", function () {
                    _this.parent.plugin.undoEditable(label);
                });
                label.addEventListener("click", function () {
                    _this.parent.plugin.makeEditable(label);
                });
                label.addEventListener("keydown", function (evt) {
                    if (evt.keyCode === 13 || evt.keyCode === 9) {
                        _this.parent.plugin.makeEditable(valueElement);
                        evt.preventDefault();
                    }
                });
            }
        };
        DomExplorerPropertyEditorItem.prototype._generateClickableValue = function (label, value, internalId) {
            var _this = this;
            // Value
            var valueElement = document.createElement("div");
            valueElement.contentEditable = "false";
            valueElement.innerHTML = value || "&nbsp;";
            valueElement.className = "styleValue";
            valueElement.addEventListener("keydown", function (evt) {
                if (evt.keyCode === 13 || evt.keyCode === 9) {
                    //Create the properties object of elements.
                    var propertyObject = {};
                    propertyObject.property = label.innerHTML.trim();
                    propertyObject.newValue = valueElement.innerHTML;
                    var propsArr = _this.parent.styles;
                    //check if property exists in array
                    var found = false;
                    for (var index = 0; index < _this.parent.styles.length; index++) {
                        var propObj = _this.parent.styles[index];
                        if (propObj.name === propertyObject.property) {
                            _this.parent.styles[index].value = propertyObject.newValue;
                            found = true;
                            break;
                        }
                    }
                    if (!found) {
                        _this.parent.styles.push(new DomExplorerPropertyEditorItem(_this.parent, propertyObject.property, propertyObject.newValue, internalId, false, false));
                    }
                    _this.parent.node.styles = [];
                    for (var index = 0; index < _this.parent.styles.length; index++) {
                        _this.parent.node.styles.push(_this.parent.styles[index].name + ":" + _this.parent.styles[index].value);
                    }
                    _this.parent.plugin.sendCommandToClient('style', {
                        property: label.innerHTML,
                        newValue: valueElement.innerHTML,
                        order: internalId
                    });
                    evt.preventDefault();
                    _this.parent.plugin.undoEditable(valueElement);
                }
            });
            valueElement.addEventListener("blur", function () {
                _this.parent.plugin.undoEditable(valueElement);
            });
            valueElement.addEventListener("click", function () {
                _this.parent.plugin.makeEditable(valueElement);
            });
            return valueElement;
        };
        return DomExplorerPropertyEditorItem;
    })();
    VORLON.DomExplorerPropertyEditorItem = DomExplorerPropertyEditorItem;
    // Register
    VORLON.Core.RegisterDashboardPlugin(new DOMExplorerDashboard());
})(VORLON || (VORLON = {}));
