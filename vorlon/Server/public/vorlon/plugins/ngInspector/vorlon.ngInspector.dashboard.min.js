var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var NgInspectorDashboard = (function (_super) {
        __extends(NgInspectorDashboard, _super);
        function NgInspectorDashboard() {
            _super.call(this, "ngInspector", "control.html", "control.css");
            this._rootScopes = [];
            this._currentShownScopeId = null;
            this._ngInspectorScopeProperties = ["$id", "$parentId", "$children", "$functions", "$type", "$name"];
            this._scopeNodeTemplate = '<a class="ng-scope SCOPECLASSTOREPLACE" data-scope-id="SCOPEIDTOREPLACE">' + '   SCOPEICONTOREPLACE' + '   <span class="scope-name">SCOPENAMETOREPLACE</span> ' + '   <span class="scope-id">(SCOPEIDTOREPLACE)</span>' + '</a>SCOPECHILDRENTOREPLACE';
            this._scopePropertyIconTemplate = '<span class="fa-stack fa">' + '   <i class="fa fa-square-o fa-stack-2x"></i>' + '   <i class="fa ICONNAMETOREPLACE fa-stack-1x">TEXTTOREPLACE</i>' + ' </span>';
            this._scopePropertyTemplate = '<li>' + '   <a class="ng-property PROPERTYTYPECLASSTOREPLACE">' + '       ICONTOREPLACE' + '       <span class="ng-property-name">' + '           PROPERTYTYPETOREPLACE : ' + '       </span>' + '       <span class="ng-property-value">' + '           PROPERTYVALUETOREPLACE' + '       </span>' + '       <span class="ng-sub-properties-length">' + '           (SUBLENGTHOREPLACE)' + '       </span>' + '   </a>SUBPROPERTIESTOREPLACE' + '</li>';
            this._ready = false;
        }
        NgInspectorDashboard.prototype.getID = function () {
            return "NGINSPECTOR";
        };
        NgInspectorDashboard.prototype.startDashboardSide = function (div) {
            var _this = this;
            if (div === void 0) { div = null; }
            this._insertHtmlContentAsync(div, function (filledDiv) {
                var $pluginContainer = $(filledDiv).parent();
                $pluginContainer.on("vorlon.plugins.active", function () {
                    $('.ng-inspector-container').split({
                        orientation: 'vertical',
                        limit: 50,
                        position: '35%'
                    });
                });
                document.getElementsByClassName("scopes-tree-wrapper")[0].addEventListener("click", function (e) {
                    var target = e.target;
                    if (target.classList.contains("ng-scope") || target.parentElement.classList.contains("ng-scope")) {
                        var dataAttribute = target.attributes["data-scope-id"] || target.parentElement.attributes["data-scope-id"];
                        var scopeId = parseInt(dataAttribute.value);
                        _this.showScopeDetail(scopeId);
                    }
                    else if (target.classList.contains("ng-property") || target.parentElement.classList.contains("ng-property")) {
                    }
                });
                document.getElementById("reloadAppWithDebugInfo").addEventListener("click", function (e) {
                    _this.sendToClient({ type: 0 /* ReloadWithDebugInfo */ });
                    document.getElementsByClassName("no-scope-found")[0].style.display = "none";
                });
                _this._ready = true;
            });
        };
        NgInspectorDashboard.prototype.onRealtimeMessageReceivedFromClientSide = function (receivedObject) {
            if (receivedObject.type === "contentchanged") {
                return;
            }
            this._rootScopes = receivedObject.scopes;
            if (!this._rootScopes || this._rootScopes.length === 0) {
                document.getElementsByClassName("scopes-tree-wrapper")[0].innerHTML = "";
                document.getElementsByClassName("scope-details-wrapper")[0].innerHTML = "";
                document.getElementsByClassName("no-scope-found")[0].style.display = "block";
            }
            else {
                document.getElementsByClassName("scopes-tree-wrapper")[0].innerHTML = this._formatScopesTree(receivedObject.scopes);
                document.getElementsByClassName("no-scope-found")[0].style.display = "none";
                if (this._currentShownScopeId) {
                    this.showScopeDetail(this._currentShownScopeId);
                }
            }
        };
        NgInspectorDashboard.prototype._formatScopesTree = function (scopes) {
            var dom = '<ul class="scopes-tree">';
            for (var i = 0; i < scopes.length; i++) {
                dom += "<li>" + this._formatScopeNode(scopes[i]) + "</li>";
            }
            dom += "</ul>";
            return dom;
        };
        NgInspectorDashboard.prototype._formatScopeNode = function (scope) {
            var scopeClass = "", scopeId = scope.$id, scopeName = scope.$name, iconName = "";
            switch (scope.$type) {
                case 0 /* NgRepeat */:
                    scopeClass = "ng-repeat-scope";
                    iconName = "fa-repeat";
                    break;
                case 1 /* RootScope */:
                    scopeClass = "root-scope";
                    iconName = "fa-arrows-alt";
                    break;
                case 2 /* Controller */:
                    scopeClass = "controller-scope";
                    iconName = "fa-crosshairs";
                    break;
                case 3 /* Directive */:
                    scopeClass = "directive-scope";
                    iconName = "caret-square-o-down";
                    break;
            }
            return this._scopeNodeTemplate.replace("SCOPECLASSTOREPLACE", scopeClass).replace(/SCOPEIDTOREPLACE/g, scopeId.toString()).replace("SCOPENAMETOREPLACE", scopeName).replace("SCOPEICONTOREPLACE", this._formatScopePropertyIconTemplate(iconName)).replace("SCOPECHILDRENTOREPLACE", this._formatScopesTree(scope.$children));
        };
        NgInspectorDashboard.prototype._formatScopePropertyIconTemplate = function (iconName, text) {
            if (text === void 0) { text = ""; }
            return this._scopePropertyIconTemplate.replace("ICONNAMETOREPLACE", iconName).replace("TEXTTOREPLACE", text);
        };
        NgInspectorDashboard.prototype._formatScopePropertyTemplate = function (icon, propertyName, propertyValue, subProperties, propertyTypeClass, subPropertiesLength) {
            if (subPropertiesLength === void 0) { subPropertiesLength = null; }
            return this._scopePropertyTemplate.replace("ICONTOREPLACE", icon).replace("PROPERTYTYPECLASSTOREPLACE", propertyTypeClass).replace("PROPERTYTYPETOREPLACE", propertyName).replace("PROPERTYVALUETOREPLACE", propertyValue).replace("SUBPROPERTIESTOREPLACE", subProperties).replace("SUBLENGTHOREPLACE", subPropertiesLength === null ? "" : subPropertiesLength.toString());
        };
        NgInspectorDashboard.prototype._renderScopeDetail = function (scope) {
            var elem = '<div class="scope-details"><ul class="scope-properties">';
            var keys = Object.keys(scope);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (this._ngInspectorScopeProperties.indexOf(key) === -1) {
                    elem += this._renderScopeProperty(scope[key], key);
                }
            }
            elem += '</ul></div>';
            return elem;
        };
        NgInspectorDashboard.prototype._renderScopeProperty = function (prop, key) {
            var propertyType = this._getPropertyType(prop), subProperties = "", value = prop, name = key, iconName = "", iconText = "", subPropertiesLength = null, propertyTypeClass = "";
            switch (propertyType) {
                case 0 /* Array */:
                    subProperties = this._renderScopeSubLevelDetails(prop);
                    subPropertiesLength = prop.length;
                    value = "[...]";
                    iconText = "[ ]";
                    propertyTypeClass = "ng-property-array";
                    break;
                case 1 /* Object */:
                    subProperties = this._renderScopeSubLevelDetails(prop);
                    subPropertiesLength = 0;
                    var keys = Object.keys(prop);
                    for (var i = 0; i < keys.length; i++) {
                        var key = keys[i];
                        if (this._ngInspectorScopeProperties.indexOf(key) === -1) {
                            subPropertiesLength++;
                        }
                    }
                    value = "{...}";
                    iconText = "{ }";
                    propertyTypeClass = "ng-property-object";
                    break;
                case 5 /* Null */:
                    value = "null";
                    iconName = "fa-ban";
                    propertyTypeClass = "ng-property-null";
                    break;
                case 2 /* Number */:
                    iconText = "#";
                    propertyTypeClass = "ng-property-number";
                    break;
                case 3 /* String */:
                    iconName = "fa-font";
                    propertyTypeClass = "ng-property-string";
                    break;
                case 4 /* Boolean */:
                    iconName = "fa-check";
                    propertyTypeClass = "ng-property-boolean";
                    break;
            }
            return this._formatScopePropertyTemplate(this._formatScopePropertyIconTemplate(iconName, iconText), name, value, subProperties, propertyTypeClass, subPropertiesLength);
        };
        NgInspectorDashboard.prototype._renderScopeSubLevelDetails = function (prop) {
            var elem = '<ul class="scope-properties">';
            if (prop instanceof Array) {
                for (var i = 0; i < prop.length; i++) {
                    elem += this._renderScopeProperty(prop[i], i.toString());
                }
            }
            else {
                var keys = Object.keys(prop);
                for (var i = 0; i < keys.length; i++) {
                    var key = keys[i];
                    if (this._ngInspectorScopeProperties.indexOf(key) === -1) {
                        elem += this._renderScopeProperty(prop[key], key);
                    }
                }
            }
            elem += '</ul>';
            return elem;
        };
        NgInspectorDashboard.prototype._getScopeTreeIcon = function (scope) {
            var iconName = "";
            var text = "";
            switch (scope.$type) {
                case 1 /* RootScope */:
                    iconName = "fa-arrows-alt";
                    break;
                case 0 /* NgRepeat */:
                    iconName = "fa-repeat";
                    break;
                case 3 /* Directive */:
                    iconName = "caret-square-o-down";
                    break;
                case 2 /* Controller */:
                    iconName = "fa-crosshairs";
                    break;
            }
            return this._scopePropertyIconTemplate.replace("ICONNAME", iconName).replace("TEXTTOREPLACE", text);
        };
        NgInspectorDashboard.prototype._findScopeById = function (scopes, scopeId) {
            for (var i = 0; i < scopes.length; i++) {
                if (scopes[i].$id === scopeId) {
                    return scopes[i];
                }
                if (scopes[i].$children.length > 0) {
                    var child = this._findScopeById(scopes[i].$children, scopeId);
                    if (child) {
                        return child;
                    }
                }
            }
            return null;
        };
        NgInspectorDashboard.prototype._getPropertyType = function (property) {
            var propertyType = typeof (property);
            switch (propertyType) {
                case "object":
                    if (property == null) {
                        return 5 /* Null */;
                    }
                    else if (property instanceof Array) {
                        return 0 /* Array */;
                    }
                    else {
                        return 1 /* Object */;
                    }
                case "number":
                    return 2 /* Number */;
                case "string":
                    return 3 /* String */;
                case "boolean":
                    return 4 /* Boolean */;
            }
        };
        NgInspectorDashboard.prototype.showScopeDetail = function (scopeId) {
            this._currentShownScopeId = scopeId;
            var scope = this._findScopeById(this._rootScopes, scopeId);
            var scopeDetailsWrapper = document.getElementsByClassName("scope-details-wrapper")[0];
            if (scope) {
                scopeDetailsWrapper.innerHTML = this._renderScopeDetail(scope);
            }
            else {
                scopeDetailsWrapper.innerHTML = "";
            }
        };
        return NgInspectorDashboard;
    })(VORLON.DashboardPlugin);
    VORLON.NgInspectorDashboard = NgInspectorDashboard;
    // Register
    VORLON.Core.RegisterDashboardPlugin(new NgInspectorDashboard());
})(VORLON || (VORLON = {}));
