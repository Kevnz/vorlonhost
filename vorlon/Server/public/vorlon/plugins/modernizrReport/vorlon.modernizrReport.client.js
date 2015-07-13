var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var VORLON;
(function (VORLON) {
    var ModernizrReportClient = (function (_super) {
        __extends(ModernizrReportClient, _super);
        function ModernizrReportClient() {
            _super.call(this, "modernizrReport");
            this.supportedFeatures = [];
            this._ready = false;
        }
        ModernizrReportClient.prototype.getID = function () {
            return "MODERNIZR";
        };
        ModernizrReportClient.prototype.startClientSide = function () {
            var _this = this;
            this._loadNewScriptAsync("modernizr.js", function () {
                if (Modernizr) {
                    _this.supportedFeatures.push({ featureName: "Application cache", isSupported: Modernizr.applicationcache, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Audio tag", isSupported: Modernizr.audio, type: "html" });
                    _this.supportedFeatures.push({ featureName: "background-size", isSupported: Modernizr.backgroundsize, type: "css" });
                    _this.supportedFeatures.push({ featureName: "border-image", isSupported: Modernizr.borderimage, type: "css" });
                    _this.supportedFeatures.push({ featureName: "border-radius", isSupported: Modernizr.borderradius, type: "css" });
                    _this.supportedFeatures.push({ featureName: "box-shadow", isSupported: Modernizr.boxshadow, type: "css" });
                    _this.supportedFeatures.push({ featureName: "canvas", isSupported: Modernizr.canvas, type: "html" });
                    _this.supportedFeatures.push({ featureName: "canvas text", isSupported: Modernizr.canvastext, type: "html" });
                    _this.supportedFeatures.push({ featureName: "CSS Animations", isSupported: Modernizr.cssanimations, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Columns", isSupported: Modernizr.csscolumns, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Gradients", isSupported: Modernizr.cssgradients, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Reflections", isSupported: Modernizr.cssreflections, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Transforms", isSupported: Modernizr.csstransforms, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Transforms 3d", isSupported: Modernizr.csstransforms3d, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Transitions", isSupported: Modernizr.csstransitions, type: "css" });
                    _this.supportedFeatures.push({ featureName: "Drag'n'drop", isSupported: Modernizr.draganddrop, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Flexbox", isSupported: Modernizr.flexbox, type: "css" });
                    _this.supportedFeatures.push({ featureName: "@font-face", isSupported: Modernizr.fontface, type: "css" });
                    _this.supportedFeatures.push({ featureName: "CSS Generated Content (:before/:after)", isSupported: Modernizr.generatedcontent, type: "css" });
                    _this.supportedFeatures.push({ featureName: "Geolocation API", isSupported: Modernizr.geolocation, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "hashchange Event", isSupported: Modernizr.hashchange, type: "html" });
                    _this.supportedFeatures.push({ featureName: "History Management", isSupported: Modernizr.history, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Color Values hsla()", isSupported: Modernizr.hsla, type: "css" });
                    _this.supportedFeatures.push({ featureName: "IndexedDB", isSupported: Modernizr.indexeddb, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Inline SVG in HTML5", isSupported: Modernizr.inlinesvg, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "Input Attribute autocomplete", isSupported: Modernizr.input.autocomplete, type: "html" });
                    /* TO DO: Inputs... */
                    _this.supportedFeatures.push({ featureName: "localStorage", isSupported: Modernizr.localstorage, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Multiple backgrounds", isSupported: Modernizr.multiplebgs, type: "css" });
                    _this.supportedFeatures.push({ featureName: "opacity", isSupported: Modernizr.opacity, type: "css" });
                    _this.supportedFeatures.push({ featureName: "Cross-window Messaging", isSupported: Modernizr.postmessage, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Color Values rgba()", isSupported: Modernizr.rgba, type: "css" });
                    _this.supportedFeatures.push({ featureName: "sessionStorage", isSupported: Modernizr.sessionstorage, type: "html" });
                    _this.supportedFeatures.push({ featureName: "SVG SMIL animation", isSupported: Modernizr.smil, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "SVG", isSupported: Modernizr.svg, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "SVG Clipping Paths", isSupported: Modernizr.svgclippaths, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "text-shadow", isSupported: Modernizr.textshadow, type: "css" });
                    _this.supportedFeatures.push({ featureName: "Touch Events", isSupported: Modernizr.touch, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "Video", isSupported: Modernizr.video, type: "html" });
                    _this.supportedFeatures.push({ featureName: "WebGL", isSupported: Modernizr.webgl, type: "misc" });
                    _this.supportedFeatures.push({ featureName: "Web Sockets", isSupported: ("WebSocket" in window), type: "html" });
                    _this.supportedFeatures.push({ featureName: "Web SQL Database", isSupported: Modernizr.websqldatabase, type: "html" });
                    _this.supportedFeatures.push({ featureName: "Web Workers", isSupported: Modernizr.webworkers, type: "html" });
                    _this.supportedFeatures.push({ featureName: "A [download] attribute", isSupported: Modernizr.adownload, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Mozilla Audio Data API", isSupported: Modernizr.audiodata, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "HTML5 Web Audio API", isSupported: Modernizr.webaudio, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Battery Status API", isSupported: Modernizr.battery, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Low Battery Level", isSupported: Modernizr.lowbattery, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Blob Constructor", isSupported: Modernizr.blobconstructor, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Canvas toDataURL image/jpeg", isSupported: Modernizr.todataurljpeg, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Canvas toDataURL image/png", isSupported: Modernizr.todataurlpng, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Canvas toDataURL image/webp", isSupported: Modernizr.todataurlwebp, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "HTML5 Content Editable Attribute", isSupported: Modernizr.contenteditable, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Content Security Policy", isSupported: Modernizr.contentsecuritypolicy, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "HTML5 Context Menu", isSupported: Modernizr.contextmenu, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Cookie", isSupported: Modernizr.cookies, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Cross-Origin Resource Sharing", isSupported: Modernizr.cors, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS background-position Shorthand", isSupported: Modernizr.bgpositionshorthand, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS background-position-x/y", isSupported: Modernizr.bgpositionxy, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS background-repeat: space", isSupported: Modernizr.bgrepeatspace, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS background-repeat: round", isSupported: Modernizr.bgrepeatround, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS background-size: cover", isSupported: Modernizr.bgsizecover, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS Box Sizing", isSupported: Modernizr.boxsizing, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS Calc", isSupported: Modernizr.csscalc, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "CSS Cubic Bezier Range", isSupported: Modernizr.cubicbezierrange, type: "noncore" });
                    _this.supportedFeatures.push({ featureName: "Gamepad", isSupported: Modernizr.gamepads, type: "noncore" });
                    //this.supportedFeatures.push({ featureName: "", isSupported: Modernizr.display-runin, type: "noncore" });
                    //this.supportedFeatures.push({ featureName: "", isSupported: Modernizr.display-table, type: "noncore" });
                    var message = {};
                    message.features = _this.supportedFeatures;
                    _this.sendToDashboard(message);
                }
            });
        };
        ModernizrReportClient.prototype.refresh = function () {
            var message = {};
            message.features = this.supportedFeatures;
            this.sendToDashboard(message);
        };
        ModernizrReportClient.prototype.onRealtimeMessageReceivedFromDashboardSide = function (receivedObject) {
        };
        return ModernizrReportClient;
    })(VORLON.ClientPlugin);
    VORLON.ModernizrReportClient = ModernizrReportClient;
    // Register
    VORLON.Core.RegisterClientPlugin(new ModernizrReportClient());
})(VORLON || (VORLON = {}));
