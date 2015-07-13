var express = require("express");
var path = require("path");
var stylus = require("stylus");
var vauth = require("./vorlon.authentication");
var httpConfig = require("../config/vorlon.httpconfig");
var VORLON;
(function (VORLON) {
    var WebServer = (function () {
        function WebServer() {
            this._bodyParser = require("body-parser");
            this._cookieParser = require("cookieparser");
            this._favicon = require("favicon");
            this._session = require("express-session");
            this._json = require("json");
            this._multer = require("multer");
            this._app = express();
            this._components = new Array();
            this.http = new httpConfig.VORLON.HttpConfig();
        }
        WebServer.prototype.init = function () {
            for (var id in this._components) {
                var component = this._components[id];
                component.addRoutes(this._app);
            }
        };
        Object.defineProperty(WebServer.prototype, "components", {
            get: function () {
                return this._components;
            },
            set: function (comp) {
                this._components = comp;
            },
            enumerable: true,
            configurable: true
        });
        WebServer.prototype.start = function () {
            var app = this._app;
            this.init();
            //Sets
            app.set('port', process.env.PORT || 1337);
            app.set('views', path.join(__dirname, '../views'));
            app.set('view engine', 'jade');
            //Uses
            app.use(stylus.middleware(path.join(__dirname, '../public')));
            app.use(express.static(path.join(__dirname, '../public')));
            app.use(this._cookieParser);
            app.use(this._favicon);
            app.use(this._session({
                // secret: '1th3is4is3as2e5cr6ec7t7keyf23or1or5lon5',
                expires: false,
                saveUninitialized: true,
                resave: true
            }));
            app.use(this._bodyParser.json());
            app.use(this._bodyParser.urlencoded({ extended: true }));
            app.use(this._multer());
            app.use(vauth.VORLON.Authentication.Passport.initialize());
            app.use(vauth.VORLON.Authentication.Passport.session());
            // app.use(this._flash());
            //Authorization CORS
            //Ressource : http://enable-cors.org
            app.use(function (req, res, next) {
                res.header("Access-Control-Allow-Origin", "*");
                res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
                next();
            });
            vauth.VORLON.Authentication.initAuthentication();
            if (this.http.useSSL) {
                this.http.httpModule = this.http.httpModule.createServer(this.http.options, app).listen(app.get('port'), function () {
                    console.log('Vorlon with SSL listening on port ' + app.get('port'));
                });
            }
            else {
                this.http.httpModule = this.http.httpModule.createServer(app).listen(app.get('port'), function () {
                    console.log('Vorlon listening on port ' + app.get('port'));
                });
            }
            for (var id in this._components) {
                var component = this._components[id];
                component.start(this.http.httpModule);
            }
        };
        Object.defineProperty(WebServer.prototype, "httpServer", {
            get: function () {
                return this.http.httpModule;
            },
            enumerable: true,
            configurable: true
        });
        return WebServer;
    })();
    VORLON.WebServer = WebServer;
})(VORLON = exports.VORLON || (exports.VORLON = {}));
