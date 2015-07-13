/// <reference path="../Scripts/typings/vorlon/vorlon.core.d.ts" /> 
/// <reference path="../Scripts/typings/vorlon/vorlon.clientMessenger.d.ts" /> 
/// <reference path="../Scripts/typings/vorlon/vorlon.plugin.d.ts" /> 
var VORLON;
(function (VORLON) {
    var DashboardManager = (function () {
        function DashboardManager(sessionid, listenClientid) {
            this._catalogUrl = "/config.json";
            DashboardManager.SessionId = sessionid;
            DashboardManager.ListenClientid = listenClientid;
            DashboardManager.ClientList = new Array();
            DashboardManager.RefreshClients();
            this.loadPlugins();
        }
        DashboardManager.UpdateClientInfo = function () {
            document.querySelector('[data-hook~=session-id]').textContent = DashboardManager.SessionId;
            for (var i = 0; i < DashboardManager.ClientList.length; i++) {
                if (DashboardManager.ClientList[i].clientid === DashboardManager.ListenClientid) {
                    DashboardManager.ListenClientDisplayid = DashboardManager.ClientList[i].displayid;
                }
            }
            document.querySelector('[data-hook~=client-id]').textContent = DashboardManager.ListenClientDisplayid;
        };
        DashboardManager.prototype.loadPlugins = function () {
            var _this = this;
            var xhr = new XMLHttpRequest();
            var divPluginsBottom = document.getElementById("pluginsPaneBottom");
            var divPluginsTop = document.getElementById("pluginsPaneTop");
            var divPluginBottomTabs = document.getElementById("pluginsListPaneBottom");
            var divPluginTopTabs = document.getElementById("pluginsListPaneTop");
            var coreLoaded = false;
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var catalog;
                        try {
                            catalog = JSON.parse(xhr.responseText);
                        }
                        catch (ex) {
                            throw new Error("The catalog JSON is not well-formed");
                        }
                        var pluginLoaded = 0;
                        var pluginstoload = 0;
                        for (var i = 0; i < catalog.plugins.length; i++) {
                            if (catalog.plugins[i].enabled) {
                                pluginstoload++;
                            }
                        }
                        for (var i = 0; i < catalog.plugins.length; i++) {
                            var plugin = catalog.plugins[i];
                            if (!plugin.enabled) {
                                continue;
                            }
                            var existingLocation = document.querySelector('[data-plugin=' + plugin.id + ']');
                            if (!existingLocation) {
                                var pluginmaindiv = document.createElement('div');
                                pluginmaindiv.classList.add('plugin');
                                pluginmaindiv.classList.add('plugin-' + plugin.id.toLowerCase());
                                pluginmaindiv.setAttribute('data-plugin', plugin.id);
                                var plugintab = document.createElement('div');
                                plugintab.classList.add('tab');
                                plugintab.textContent = plugin.name;
                                plugintab.setAttribute('data-plugin-target', plugin.id);
                                if (plugin.panel === "bottom") {
                                    if (divPluginsBottom.children.length === 1) {
                                        pluginmaindiv.classList.add("active");
                                    }
                                    divPluginsBottom.appendChild(pluginmaindiv);
                                    divPluginBottomTabs.appendChild(plugintab);
                                }
                                else {
                                    if (divPluginsTop.children.length === 1) {
                                        pluginmaindiv.classList.add("active");
                                    }
                                    divPluginsTop.appendChild(pluginmaindiv);
                                    divPluginTopTabs.appendChild(plugintab);
                                }
                            }
                            var pluginscript = document.createElement("script");
                            pluginscript.setAttribute("src", "/vorlon/plugins/" + plugin.foldername + "/vorlon." + plugin.foldername + ".dashboard.min.js");
                            pluginscript.onload = function (oError) {
                                pluginLoaded++;
                                if (pluginLoaded >= pluginstoload) {
                                    var getUrl = window.location;
                                    var baseUrl = getUrl.protocol + "//" + getUrl.host;
                                    VORLON.Core.StartDashboardSide(baseUrl, DashboardManager.SessionId, DashboardManager.ListenClientid, _this.divMapper);
                                    if (!coreLoaded && !VORLON.Core.Messenger.onWaitingEventsReceived) {
                                        VORLON.Core.Messenger.onWaitingEventsReceived = _this._onClientUpdateWaitingEvents;
                                        VORLON.Core.Messenger.onRefreshClients = _this._onRefreshClients;
                                        coreLoaded = true;
                                    }
                                }
                            };
                            document.body.appendChild(pluginscript);
                        }
                        var addPluginBtn = document.createElement('div');
                        addPluginBtn.className = "tab";
                        addPluginBtn.innerText = "+";
                        divPluginTopTabs.appendChild(addPluginBtn);
                        addPluginBtn.addEventListener('click', function () {
                            window.open("http://www.vorlonjs.io/plugins", "_blank");
                        });
                        var collaspseBtn = document.createElement('div');
                        collaspseBtn.className = "fa fa-expand expandBtn";
                        divPluginBottomTabs.appendChild(collaspseBtn);
                        collaspseBtn.addEventListener('click', function () {
                            divPluginsBottom.style.height = 'calc(100% - 58px)';
                            divPluginsTop.style.height = '50px';
                            $('.hsplitter', divPluginsTop.parentElement).css('top', '50px');
                        });
                        var collaspseTopBtn = document.createElement('div');
                        collaspseTopBtn.className = "fa fa-expand expandBtn";
                        divPluginTopTabs.appendChild(collaspseTopBtn);
                        collaspseTopBtn.addEventListener('click', function () {
                            divPluginsBottom.style.height = '50px';
                            divPluginsTop.style.height = 'calc(100% - 58px)';
                            $('.hsplitter', divPluginsTop.parentElement).css('top', 'calc(100% - 58px)');
                        });
                        DashboardManager.UpdateClientInfo();
                    }
                }
            };
            xhr.open("GET", this._catalogUrl);
            xhr.send();
        };
        DashboardManager.prototype.divMapper = function (pluginId) {
            var divId = pluginId + "div";
            return (document.getElementById(divId) || document.querySelector("[data-plugin=" + pluginId + "]"));
        };
        DashboardManager.RefreshClients = function () {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        DashboardManager.ClientList = new Array();
                        var clients = JSON.parse(xhr.responseText);
                        //console.log("dashboard clients ", clients);
                        var divClientsListPane = document.getElementById("clientsListPaneContent");
                        while (divClientsListPane.hasChildNodes()) {
                            divClientsListPane.removeChild(divClientsListPane.lastChild);
                        }
                        var clientlist = document.createElement("ul");
                        divClientsListPane.appendChild(clientlist);
                        var contains = false;
                        if (clients && clients.length) {
                            for (var j = 0; j < clients.length; j++) {
                                if (clients[j].clientid === DashboardManager.ListenClientid) {
                                    contains = true;
                                    break;
                                }
                            }
                        }
                        if (!contains || clients.length === 0) {
                            var elt = document.querySelector('.dashboard-plugins-overlay');
                            VORLON.Tools.RemoveClass(elt, 'hidden');
                        }
                        if (clients.length === 0) {
                            DashboardManager.ResetDashboard(false);
                        }
                        for (var i = 0; i < clients.length; i++) {
                            var client = clients[i];
                            if (DashboardManager.ListenClientid === "") {
                                DashboardManager.ListenClientid = client.clientid;
                            }
                            var pluginlistelement = document.createElement("li");
                            pluginlistelement.classList.add('client');
                            if (client.clientid === DashboardManager.ListenClientid) {
                                pluginlistelement.classList.add('active');
                            }
                            clientlist.appendChild(pluginlistelement);
                            var pluginlistelementa = document.createElement("a");
                            pluginlistelementa.textContent = " " + client.name + " - " + client.displayid;
                            pluginlistelementa.setAttribute("href", "/dashboard/" + DashboardManager.SessionId + "/" + client.clientid);
                            pluginlistelementa.id = client.clientid;
                            pluginlistelement.appendChild(pluginlistelementa);
                            DashboardManager.ClientList.push(client);
                            DashboardManager.UpdateClientWaitingInfo(client.clientid, client.waitingevents);
                        }
                    }
                }
            };
            xhr.open("GET", "/api/getclients/" + DashboardManager.SessionId);
            xhr.send();
        };
        DashboardManager.prototype.identify = function () {
            VORLON.Core.Messenger.sendRealtimeMessage("", { "_sessionid": DashboardManager.SessionId }, 1 /* Dashboard */, "identify");
        };
        DashboardManager.ResetDashboard = function (reload) {
            if (reload === void 0) { reload = true; }
            var sessionid = DashboardManager.SessionId;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        if (reload) {
                            location.reload();
                        }
                    }
                }
            };
            xhr.open("GET", "/api/reset/" + sessionid);
            xhr.send();
        };
        DashboardManager.prototype._onRefreshClients = function () {
            DashboardManager.RefreshClients();
        };
        DashboardManager.prototype._onClientUpdateWaitingEvents = function (message) {
            DashboardManager.UpdateClientWaitingInfo(message.metadata.clientId, message.metadata.waitingEvents);
        };
        DashboardManager.UpdateClientWaitingInfo = function (clientid, waitingevents) {
            var clientLink = document.getElementById(clientid);
            for (var id in DashboardManager.ClientList) {
                var client = DashboardManager.ClientList[id];
                if (client.clientid === clientid) {
                    clientLink.textContent = " " + client.name + " - " + client.displayid + " (" + waitingevents + ")";
                }
            }
        };
        DashboardManager.getSessionId = function () {
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        var sessionId = xhr.responseText;
                        window.location.assign("/dashboard/" + sessionId);
                    }
                }
            };
            xhr.open("GET", "/api/createsession");
            xhr.send();
        };
        return DashboardManager;
    })();
    VORLON.DashboardManager = DashboardManager;
})(VORLON || (VORLON = {}));
