var VORLON;
(function (VORLON) {
    (function (ScopeType) {
        ScopeType[ScopeType["NgRepeat"] = 0] = "NgRepeat";
        ScopeType[ScopeType["RootScope"] = 1] = "RootScope";
        ScopeType[ScopeType["Controller"] = 2] = "Controller";
        ScopeType[ScopeType["Directive"] = 3] = "Directive";
    })(VORLON.ScopeType || (VORLON.ScopeType = {}));
    var ScopeType = VORLON.ScopeType;
    ;
    (function (PropertyType) {
        PropertyType[PropertyType["Array"] = 0] = "Array";
        PropertyType[PropertyType["Object"] = 1] = "Object";
        PropertyType[PropertyType["Number"] = 2] = "Number";
        PropertyType[PropertyType["String"] = 3] = "String";
        PropertyType[PropertyType["Boolean"] = 4] = "Boolean";
        PropertyType[PropertyType["Null"] = 5] = "Null";
    })(VORLON.PropertyType || (VORLON.PropertyType = {}));
    var PropertyType = VORLON.PropertyType;
    ;
    (function (MessageType) {
        MessageType[MessageType["ReloadWithDebugInfo"] = 0] = "ReloadWithDebugInfo";
    })(VORLON.MessageType || (VORLON.MessageType = {}));
    var MessageType = VORLON.MessageType;
    ;
})(VORLON || (VORLON = {}));
