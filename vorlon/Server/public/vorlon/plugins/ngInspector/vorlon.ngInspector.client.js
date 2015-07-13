var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var NgInspectorClient = (function (_super) {
        __extends(NgInspectorClient, _super);
        function NgInspectorClient() {
            _super.call(this, "ngInspector");
            this._rootScopes = [];
            this._currentShownScopeId = null;
            this._scopePropertiesNamesToExclude = ["$$applyAsyncQueue", "$$asyncQueue", "$$childHead", "$$ChildScope", "$$childTail", "$$destroyed", "$$isolateBindings", "$$listenerCount", "$$listeners", "$$nextSibling", "$$phase", "$$postDigest", "$$postDigestQueue", "$$prevSibling", "$$transcluded", "$$watchers", "$$watchersCount", "$apply", "$applyAsync", "$broadcast", "$childTail", "$destroy", "$digest", "$emit", "$eval", "$evalAsync", "$even", "$first", "$index", "$last", "$middle", "$new", "$odd", "$on", "$parent", "$root", "$watch", "$watchCollection", "$watchGroup"];
            this._ready = false;
        }
        NgInspectorClient.prototype.getID = function () {
            return "NGINSPECTOR";
        };
        NgInspectorClient.prototype.refresh = function () {
            this._packageAndSendScopes();
        };
        NgInspectorClient.prototype.startClientSide = function () {
            var _this = this;
            document.addEventListener("DOMContentLoaded", function () {
                _this.refresh();
            });
        };
        NgInspectorClient.prototype._markForRefresh = function () {
            var _this = this;
            if (this._timeoutId) {
                clearTimeout(this._timeoutId);
            }
            this._timeoutId = setTimeout(function () {
                _this.refresh();
            }, 2000);
        };
        NgInspectorClient.prototype._packageAndSendScopes = function () {
            this._rootScopes = [];
            this._findRootScopes(document.body);
            this.sendToDashboard({ scopes: this._rootScopes });
        };
        NgInspectorClient.prototype._findRootScopes = function (element) {
            if (typeof angular == 'undefined')
                return;
            var rootScope = angular.element(element).scope();
            if (!!rootScope) {
                var cleanedRootScope = this._cleanScope(rootScope);
                cleanedRootScope.$type = 1 /* RootScope */;
                cleanedRootScope.$name = "$rootScope";
                this._rootScopes.push(cleanedRootScope);
                this._findChildrenScopes(element, cleanedRootScope);
                this._listenScopeChanges(rootScope);
            }
            else {
                for (var i = 0; i < element.childNodes.length; i++) {
                    this._findRootScopes(element.childNodes[i]);
                }
            }
        };
        NgInspectorClient.prototype._findChildrenScopes = function (element, parentScope) {
            if (typeof angular == 'undefined')
                return;
            for (var i = 0; i < element.childNodes.length; i++) {
                var childNode = element.childNodes[i];
                var childScope = angular.element(childNode).scope();
                if (!!childScope && childScope.$id !== parentScope.$id) {
                    var cleanedChildScope = this._cleanScope(childScope);
                    if (childNode.attributes["ng-repeat"] || childNode.attributes["data-ng-repeat"] || childNode.attributes["x-ng-repeat"] || childNode.attributes["ng_repeat"] || childNode.attributes["ng:repeat"]) {
                        cleanedChildScope.$type = 0 /* NgRepeat */;
                        cleanedChildScope.$name = "ng-repeat";
                    }
                    else if (angular.element(childNode).data("$ngControllerController")) {
                        var constructor = angular.element(childNode).data("$ngControllerController").constructor;
                        // Workaround for IE, name property of constructor return undefined :/
                        // Get the name from the constructor function as string
                        var name = constructor.toString().match(/function (\w+)\(/)[1];
                        cleanedChildScope.$type = 2 /* Controller */;
                        cleanedChildScope.$name = name;
                    }
                    parentScope.$children.push(cleanedChildScope);
                    this._findChildrenScopes(childNode, cleanedChildScope);
                }
                else {
                    this._findChildrenScopes(childNode, parentScope);
                }
            }
        };
        NgInspectorClient.prototype._listenScopeChanges = function (scope) {
            var _this = this;
            scope.$watch(function (newValue, oldValue) {
                _this._markForRefresh();
            });
        };
        NgInspectorClient.prototype._cleanScope = function (scope) {
            var scopePackaged = {
                $id: null,
                $parentId: null,
                $children: [],
                $functions: [],
                $type: 2 /* Controller */,
                $name: ""
            };
            var keys = Object.keys(scope);
            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                if (this._scopePropertiesNamesToExclude.indexOf(key) === -1) {
                    scopePackaged[key] = scope[key];
                }
            }
            if (scope.$parent !== null) {
                scopePackaged.$parentId = scope.$parent.$id;
            }
            return scopePackaged;
        };
        NgInspectorClient.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
            if (typeof angular == 'undefined')
                return;
            if (receivedObject.type === 0 /* ReloadWithDebugInfo */) {
                angular.reloadWithDebugInfo();
            }
        };
        return NgInspectorClient;
    })(VORLON.ClientPlugin);
    VORLON.NgInspectorClient = NgInspectorClient;
    // Register
    VORLON.Core.RegisterClientPlugin(new NgInspectorClient());
})(VORLON || (VORLON = {}));
