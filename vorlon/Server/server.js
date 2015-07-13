var vorlonServer = require("./Scripts/vorlon.server");
var vorlonDashboard = require("./Scripts/vorlon.dashboard");
var vorlonWebserver = require("./Scripts/vorlon.webServer");
//WEBSERVER
var webServer = new vorlonWebserver.VORLON.WebServer();
//DASHBOARD
var dashboard = new vorlonDashboard.VORLON.Dashboard();
//VORLON SERVER
var server = new vorlonServer.VORLON.Server();
webServer.components.push(dashboard);
webServer.components.push(server);
webServer.start();
