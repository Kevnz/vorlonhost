var fs = require("fs");
var http = require("http");
var https = require("https");
var path = require("path");
var VORLON;
(function (VORLON) {
    var HttpConfig = (function () {
        function HttpConfig() {
            console.log(path.join(__dirname, "../config.json"));
            var catalogdata = fs.readFileSync(path.join(__dirname, "../config.json"), "utf8");
            var catalogstring = catalogdata.toString().replace(/^\uFEFF/, '');
            var catalog = JSON.parse(catalogstring);
            console.log(catalog);
            if (catalog.useSSL) {
                this.useSSL = true;
                this.protocol = "https";
                this.httpModule = https;
                this.options = {
                    key: fs.readFileSync(path.join(__dirname,catalog.SSLkey)),
                    cert: fs.readFileSync(path.join(__dirname,catalog.SSLcert))
                };
            }
            else {
                this.useSSL = false;
                this.protocol = "http";
                this.httpModule = http;
            }
        }
        return HttpConfig;
    })();
    VORLON.HttpConfig = HttpConfig;
})(VORLON = exports.VORLON || (exports.VORLON = {}));
