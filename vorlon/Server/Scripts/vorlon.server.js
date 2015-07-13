var redis = require("redis");
var winston = require("winston");
var socketio = require("socket.io");
var fs = require("fs");
var path = require("path");
var fakeredis = require("fakeredis");
var winstonDisplay = require("winston-logs-display");
var redisConfigImport = require("../config/vorlon.redisconfig");
var redisConfig = redisConfigImport.VORLON.RedisConfig;
var httpConfig = require("../config/vorlon.httpconfig");
var tools = require("./vorlon.tools");
var VORLON;
(function (VORLON) {
    var Server = (function () {
        function Server() {
            this.sessions = new Array();
            this.dashboards = new Array();
            //LOGS      
            winston.cli();
            this._log = new winston.Logger({
                levels: {
                    info: 0,
                    warn: 1,
                    error: 2,
                    verbose: 3,
                    api: 4,
                    dashboard: 5,
                    plugin: 6
                },
                transports: [
                    new winston.transports.Console({
                        level: 'debug',
                        handleExceptions: true,
                        json: false,
                        timestamp: true,
                        colorize: true
                    }),
                    new winston.transports.File({ filename: 'vorlonjs.log' })
                ],
                exceptionHandlers: [
                    new winston.transports.File({ filename: 'exceptions.log', timestamp: true, maxsize: 1000000 })
                ],
                exitOnError: false
            });
            winston.addColors({
                info: 'green',
                warn: 'cyan',
                error: 'red',
                verbose: 'blue',
                api: 'gray',
                dashboard: 'pink',
                plugin: 'yellow'
            });
            this._log.cli();
            //Redis
            if (redisConfig.fackredis === true) {
                this._redisApi = fakeredis.createClient();
            }
            else {
                this._redisApi = redis.createClient(redisConfig._redisPort, redisConfig._redisMachine);
                this._redisApi.auth(redisConfig._redisPassword, function (err) {
                    if (err) {
                        throw err;
                    }
                });
            }
            //SSL
            this.http = new httpConfig.VORLON.HttpConfig();
        }
        Server.prototype.addRoutes = function (app) {
            var _this = this;
            app.get("/api/createsession", function (req, res) {
                _this.json(res, _this.guid());
            });
            app.get("/api/reset/:idSession", function (req, res) {
                var session = _this.sessions[req.params.idSession];
                if (session && session.connectedClients) {
                    for (var client in session.connectedClients) {
                        delete session.connectedClients[client];
                    }
                }
                delete _this.sessions[req.params.idSession];
                res.writeHead(200, {});
                res.end();
            });
            app.get("/api/getclients/:idSession", function (req, res) {
                var session = _this.sessions[req.params.idSession];
                var clients = new Array();
                if (session != null) {
                    var nbClients = 0;
                    for (var client in session.connectedClients) {
                        var currentclient = session.connectedClients[client];
                        if (currentclient.opened) {
                            var name = tools.VORLON.Tools.GetOperatingSystem(currentclient.ua);
                            clients.push({ "clientid": currentclient.clientId, "displayid": currentclient.displayId, "waitingevents": currentclient.waitingevents, "name": name });
                            nbClients++;
                        }
                    }
                    _this._log.info("API : GetClients nb client " + nbClients + " in session " + req.params.idSession, { type: "API", session: req.params.idSession });
                }
                else {
                    _this._log.warn("API : No client in session " + req.params.idSession, { type: "API", session: req.params.idSession });
                }
                //Add header no-cache
                res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
                res.header('Expires', '-1');
                res.header('Pragma', 'no-cache');
                _this.json(res, clients);
            });
            app.get("/api/range/:idsession/:idplugin/:from/:to", function (req, res) {
                _this._redisApi.lrange(req.params.idsession + req.params.idplugin, req.params.from, req.params.to, function (err, reply) {
                    _this._log.info("API : Get Range data from : " + req.params.from + " to " + req.params.to + " = " + reply, { type: "API", session: req.params.idsession });
                    _this.json(res, reply);
                });
            });
            app.post("/api/push", function (req, res) {
                var receiveMessage = req.body;
                _this._log.info("API : Receve data to log : " + JSON.stringify(req.body), { type: "API", session: receiveMessage._idsession });
                _this._redisApi.rpush([receiveMessage._idsession + receiveMessage.id, receiveMessage.message], function (err) {
                    if (err) {
                        _this._log.error("API : Error data log : " + err, { type: "API", session: receiveMessage._idsession });
                    }
                    else {
                        _this._log.info("API : Push data ok", { type: "API", session: receiveMessage._idsession });
                    }
                });
                _this.json(res, {});
            });
            app.get("/vorlon.max.js/", function (req, res) {
                res.redirect("/vorlon.max.js/default");
            });
            app.get("/vorlon.max.js/:idsession", function (req, res) {
                _this._sendVorlonJSFile(false, req, res);
            });
            app.get("/vorlon.js/", function (req, res) {
                res.redirect("/vorlon.js/default");
            });
            app.get("/vorlon.js/:idsession", function (req, res) {
                _this._sendVorlonJSFile(true, req, res);
            });
            app.get("/vorlon.max.autostartdisabled.js/", function (req, res) {
                _this._sendVorlonJSFile(false, req, res, false);
            });
            app.get("/vorlon.autostartdisabled.js/", function (req, res) {
                _this._sendVorlonJSFile(true, req, res, false);
            });
            app.get("/config.json", function (req, res) {
                _this._sendConfigJson(req, res);
            });
            //DisplayLogs
            winstonDisplay(app, this._log);
        };
        Server.prototype._sendConfigJson = function (req, res) {
            var _this = this;
            fs.readFile(path.join(__dirname, "../config.json"), "utf8", function (err, catalogdata) {
                if (err) {
                    _this._log.error("ROUTE : Error reading config.json file");
                    return;
                }
                var configstring = catalogdata.toString().replace(/^\uFEFF/, '');
                res.header('Content-Type', 'application/json');
                res.send(configstring);
            });
        };
        Server.prototype._sendVorlonJSFile = function (ismin, req, res, autostart) {
            var _this = this;
            if (autostart === void 0) { autostart = true; }
            //Read Socket.io file
            var javascriptFile;
            fs.readFile(path.join(__dirname, "../config.json"), "utf8", function (err, catalogdata) {
                if (err) {
                    _this._log.error("ROUTE : Error reading config.json file");
                    return;
                }
                var configstring = catalogdata.toString().replace(/^\uFEFF/, '');
                console.log(configstring);
                var catalog = JSON.parse(configstring);
                var vorlonpluginfiles = "";
                var javascriptFile = "";
                //read the socket.io file if needed
                if (catalog.includeSocketIO) {
                    javascriptFile += fs.readFileSync(path.join(__dirname, "../public/javascripts/socket.io-1.3.5.js"));
                }
                if (ismin) {
                    vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/vorlon-noplugin.js"));
                }
                else {
                    vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/vorlon-noplugin.max.js"));
                }
                for (var pluginid = 0; pluginid < catalog.plugins.length; pluginid++) {
                    var plugin = catalog.plugins[pluginid];
                    if (plugin && plugin.enabled) {
                        //Read Vorlon.js file
                        if (ismin) {
                            vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".client.min.js"));
                        }
                        else {
                            vorlonpluginfiles += fs.readFileSync(path.join(__dirname, "../public/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".client.js"));
                        }
                    }
                }
                vorlonpluginfiles = vorlonpluginfiles.replace('"vorlon/plugins"', '"' + _this.http.protocol + '://' + req.headers.host + '/vorlon/plugins"');
                javascriptFile += "\r" + vorlonpluginfiles;
                if (autostart) {
                    javascriptFile += "\r (function() { VORLON.Core.StartClientSide('" + _this.http.protocol + "://" + req.headers.host + "/', '" + req.params.idsession + "'); }());";
                }
                res.header('Content-Type', 'application/javascript');
                res.send(javascriptFile);
            });
        };
        Server.prototype.start = function (httpServer) {
            var _this = this;
            //SOCKET.IO
            var io = socketio(httpServer);
            this._io = io;
            //Redis
            var redisConfig = redisConfigImport.VORLON.RedisConfig;
            if (redisConfig.fackredis === false) {
                var pub = redis.createClient(redisConfig._redisPort, redisConfig._redisMachine);
                pub.auth(redisConfig._redisPassword);
                var sub = redis.createClient(redisConfig._redisPort, redisConfig._redisMachine);
                sub.auth(redisConfig._redisPassword);
                var socketredis = require("socket.io-redis");
                io.adapter(socketredis({ pubClient: pub, subClient: sub }));
            }
            //Listen on /
            io.on("connection", function (socket) {
                _this.addClient(socket);
            });
            //Listen on /dashboard
            var dashboardio = io.of("/dashboard").on("connection", function (socket) {
                _this.addDashboard(socket);
            });
        };
        Object.defineProperty(Server.prototype, "io", {
            get: function () {
                return this._io;
            },
            set: function (io) {
                this._io = io;
            },
            enumerable: true,
            configurable: true
        });
        Server.prototype.guid = function () {
            return "xxxxxxxx".replace(/[xy]/g, function (c) {
                var r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            });
        };
        Server.prototype.json = function (res, data) {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            if (typeof data === "string")
                res.write(data);
            else
                res.write(JSON.stringify(data));
            res.end();
        };
        Server.prototype.addClient = function (socket) {
            var _this = this;
            socket.on("helo", function (message) {
                //this._log.warn("CLIENT helo " + message);
                var receiveMessage = JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var data = receiveMessage.data;
                var session = _this.sessions[metadata.sessionId];
                if (session == null) {
                    session = new Session();
                    _this.sessions[metadata.sessionId] = session;
                }
                var client = session.connectedClients[metadata.clientId];
                var dashboard = _this.dashboards[metadata.sessionId];
                if (client == undefined) {
                    var client = new Client(metadata.clientId, data.ua, socket, ++session.nbClients);
                    session.connectedClients[metadata.clientId] = client;
                    _this._log.info(formatLog("PLUGIN", "Send Refresh clientlist to dashboard (" + client.displayId + ")[" + data.ua + "] socketid = " + socket.id, receiveMessage));
                    if (dashboard != undefined) {
                        dashboard.emit("refreshclients");
                    }
                    _this._log.info(formatLog("PLUGIN", "New client (" + client.displayId + ")[" + data.ua + "] socketid = " + socket.id, receiveMessage));
                }
                else {
                    client.socket = socket;
                    client.opened = true;
                    if (dashboard != undefined) {
                        dashboard.emit("refreshclients");
                    }
                    _this._log.info(formatLog("PLUGIN", "Client Reconnect (" + client.displayId + ")[" + data.ua + "] socketid=" + socket.id, receiveMessage));
                }
                _this._log.info(formatLog("PLUGIN", "Number clients in session : " + (session.nbClients + 1), receiveMessage));
                //If dashboard already connected to this socket send "helo" else wait
                if ((metadata.clientId != "") && (metadata.clientId == session.currentClientId)) {
                    _this._log.info(formatLog("PLUGIN", "Send helo to client to open socket : " + metadata.clientId, receiveMessage));
                    socket.emit("helo", metadata.clientId);
                }
                else {
                    _this._log.info(formatLog("PLUGIN", "New client (" + client.displayId + ") wait...", receiveMessage));
                }
            });
            socket.on("message", function (message) {
                //this._log.warn("CLIENT message " + message);
                var receiveMessage = JSON.parse(message);
                var dashboard = _this.dashboards[receiveMessage.metadata.sessionId];
                if (dashboard != null) {
                    var session = _this.sessions[receiveMessage.metadata.sessionId];
                    if (receiveMessage.metadata.clientId === "") {
                    }
                    else {
                        //Send message if _clientID = clientID selected by dashboard
                        if (session && receiveMessage.metadata.clientId === session.currentClientId) {
                            dashboard.emit("message", message);
                            _this._log.info(formatLog("PLUGIN", "PLUGIN=>DASHBOARD", receiveMessage));
                        }
                        else {
                            _this._log.error(formatLog("PLUGIN", "must be disconnected", receiveMessage));
                        }
                    }
                }
                else {
                    _this._log.error(formatLog("PLUGIN", "no dashboard found", receiveMessage));
                }
            });
            socket.on("waitingevents", function (message) {
                //this._log.warn("CLIENT waitingevents " + message);
                var receiveMessage = JSON.parse(message);
                var dashboard = _this.dashboards[receiveMessage.metadata.sessionId];
                if (dashboard != null) {
                    dashboard.emit("waitingevents", message);
                    var session = _this.sessions[receiveMessage.metadata.sessionId];
                    if (session && session.connectedClients) {
                        var client = session.connectedClients[receiveMessage.metadata.clientId];
                        client.waitingevents = receiveMessage.metadata.waitingEvents;
                    }
                }
            });
            socket.on("disconnect", function (message) {
                for (var sessionId in _this.sessions) {
                    var session = _this.sessions[sessionId];
                    for (var clientId in session.connectedClients) {
                        var client = session.connectedClients[clientId];
                        if (client.socket.id === socket.id) {
                            client.opened = false;
                            _this._log.info(formatLog("PLUGIN", "Delete client socket " + socket.id));
                        }
                    }
                }
            });
            socket.on("clientclosed", function (message) {
                //this._log.warn("CLIENT clientclosed " + message);
                var receiveMessage = JSON.parse(message);
                for (var session in _this.sessions) {
                    for (var client in _this.sessions[session].connectedClients) {
                        if (receiveMessage.data.socketid === _this.sessions[session].connectedClients[client].socket.id) {
                            _this.sessions[session].connectedClients[client].opened = false;
                            if (_this.dashboards[session]) {
                                _this._log.info(formatLog("PLUGIN", "Send RefreshClients to Dashboard " + socket.id, receiveMessage));
                                _this.dashboards[session].emit("refreshclients");
                            }
                            else {
                                _this._log.info(formatLog("PLUGIN", "NOT sending RefreshClients, no Dashboard " + socket.id, receiveMessage));
                            }
                            _this._log.info(formatLog("PLUGIN", "Client Close " + socket.id, receiveMessage));
                        }
                    }
                }
            });
        };
        Server.prototype.addDashboard = function (socket) {
            var _this = this;
            socket.on("helo", function (message) {
                //this._log.warn("DASHBOARD helo " + message);
                var receiveMessage = JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var dashboard = _this.dashboards[metadata.sessionId];
                if (dashboard == null) {
                    _this._log.info(formatLog("DASHBOARD", "New Dashboard", receiveMessage));
                }
                else {
                    _this._log.info(formatLog("DASHBOARD", "Reconnect", receiveMessage));
                }
                _this.dashboards[metadata.sessionId] = socket;
                dashboard = socket;
                //if client listen by dashboard send helo to selected client
                if (metadata.listenClientId !== "") {
                    _this._log.info(formatLog("DASHBOARD", "Client selected for :" + metadata.listenClientId, receiveMessage));
                    var session = _this.sessions[metadata.sessionId];
                    if (session != undefined) {
                        _this._log.info(formatLog("DASHBOARD", "Change currentClient " + metadata.clientId, receiveMessage));
                        session.currentClientId = metadata.listenClientId;
                        for (var clientId in session.connectedClients) {
                            var client = session.connectedClients[clientId];
                            if (client.clientId === metadata.listenClientId) {
                                if (client.socket != null) {
                                    _this._log.info(formatLog("DASHBOARD", "Send helo to socketid :" + client.socket.id, receiveMessage));
                                    client.socket.emit("helo", metadata.listenClientId);
                                }
                            }
                            else {
                                _this._log.info(formatLog("DASHBOARD", "Wait for socketid (" + client.socket.id + ")", receiveMessage));
                            }
                        }
                        //Send Helo to DashBoard
                        _this._log.info(formatLog("DASHBOARD", "Send helo to Dashboard", receiveMessage));
                        socket.emit("helo", metadata.listenClientId);
                    }
                }
                else {
                    _this._log.info(formatLog("DASHBOARD", "No client selected for this dashboard"));
                }
            });
            socket.on("protocol", function (message) {
                //this._log.warn("DASHBOARD protocol " + message);
                var receiveMessage = JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var dashboard = _this.dashboards[metadata.sessionId];
                if (dashboard == null) {
                    _this._log.error(formatLog("DASHBOARD", "No Dashboard to send message", receiveMessage));
                }
                else {
                    dashboard.emit("message", message);
                    _this._log.info(formatLog("DASHBOARD", "Dashboard send message", receiveMessage));
                }
            });
            socket.on("identify", function (message) {
                //this._log.warn("DASHBOARD identify " + message);
                var receiveMessage = JSON.parse(message);
                var metadata = receiveMessage.metadata;
                _this._log.info(formatLog("DASHBOARD", "Identify clients", receiveMessage));
                var session = _this.sessions[metadata.sessionId];
                if (session != null) {
                    var nbClients = 0;
                    for (var client in session.connectedClients) {
                        var currentclient = session.connectedClients[client];
                        if (currentclient.opened) {
                            currentclient.socket.emit("identify", currentclient.displayId);
                            _this._log.info(formatLog("DASHBOARD", "Dashboard send identify " + currentclient.displayId + " to socketid : " + currentclient.socket.id, receiveMessage));
                            nbClients++;
                        }
                    }
                    _this._log.info(formatLog("DASHBOARD", "Send " + session.nbClients + " identify(s)", receiveMessage));
                }
                else {
                    _this._log.error(formatLog("DASHBOARD", " No client to identify...", receiveMessage));
                }
            });
            socket.on("message", function (message) {
                //this._log.warn("DASHBOARD message " + message);
                var receiveMessage = JSON.parse(message);
                var metadata = receiveMessage.metadata;
                var arrayClients = _this.sessions[metadata.sessionId];
                if (arrayClients != null) {
                    for (var clientId in arrayClients.connectedClients) {
                        var client = arrayClients.connectedClients[clientId];
                        if (metadata.listenClientId === client.clientId) {
                            client.socket.emit("message", message);
                            _this._log.info(formatLog("DASHBOARD", "DASHBOARD=>PLUGIN", receiveMessage));
                        }
                    }
                }
                else {
                    _this._log.error(formatLog("DASHBOARD", "No client for message", receiveMessage));
                }
            });
            socket.on("disconnect", function (message) {
                for (var dashboard in _this.dashboards) {
                    if (_this.dashboards[dashboard].id === socket.id) {
                        delete _this.dashboards[dashboard];
                        _this._log.info(formatLog("DASHBOARD", "Delete dashboard " + dashboard + " socket " + socket.id));
                    }
                }
                for (var session in _this.sessions) {
                    for (var client in _this.sessions[session].connectedClients) {
                        _this.sessions[session].connectedClients[client].socket.emit("stoplisten");
                    }
                }
            });
        };
        return Server;
    })();
    VORLON.Server = Server;
    var Session = (function () {
        function Session() {
            this.currentClientId = "";
            this.nbClients = -1;
            this.connectedClients = new Array();
        }
        return Session;
    })();
    VORLON.Session = Session;
    var Client = (function () {
        function Client(clientId, ua, socket, displayId, opened) {
            if (opened === void 0) { opened = true; }
            this.clientId = clientId;
            this.ua = ua;
            this.socket = socket;
            this.displayId = displayId;
            this.opened = opened;
            this.waitingevents = 0;
        }
        return Client;
    })();
    VORLON.Client = Client;
    function formatLog(type, message, vmessage) {
        var buffer = [];
        buffer.push(type);
        if (type.length < 10) {
            for (var i = type.length; i < 10; i++) {
                buffer.push(" ");
            }
        }
        buffer.push(" : ");
        if (vmessage) {
            if (vmessage.metadata && vmessage.metadata.sessionId)
                buffer.push(vmessage.metadata.sessionId + " ");
        }
        if (message)
            buffer.push(message + " ");
        if (vmessage) {
            if (vmessage.metadata) {
                if (vmessage.metadata.pluginID) {
                    buffer.push(vmessage.metadata.pluginID);
                    if (vmessage.command)
                        buffer.push(":" + vmessage.command);
                    buffer.push(" ");
                }
                if (vmessage.metadata.clientId) {
                    buffer.push(vmessage.metadata.clientId);
                }
            }
        }
        return buffer.join("");
    }
})(VORLON = exports.VORLON || (exports.VORLON = {}));
