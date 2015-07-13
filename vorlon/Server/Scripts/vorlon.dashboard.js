var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
var vauth = require("./vorlon.authentication");
var VORLON;
(function (VORLON) {
    var Dashboard = (function () {
        function Dashboard() {
            //Nothing for now
        }
        Dashboard.prototype.addRoutes = function (app) {
            app.route('/').get(vauth.VORLON.Authentication.ensureAuthenticated, this.defaultDashboard);
            app.route('/dashboard').get(vauth.VORLON.Authentication.ensureAuthenticated, this.defaultDashboard);
            app.route('/dashboard/').get(vauth.VORLON.Authentication.ensureAuthenticated, this.defaultDashboard);
            app.route('/dashboard/:sessionid').get(vauth.VORLON.Authentication.ensureAuthenticated, this.dashboard);
            app.route('/dashboard/:sessionid/reset').get(vauth.VORLON.Authentication.ensureAuthenticated, this.dashboardServerReset);
            app.route('/dashboard/:sessionid/:clientid').get(vauth.VORLON.Authentication.ensureAuthenticated, this.dashboardWithClient);
            //login
            app.post('/login', vauth.VORLON.Authentication.Passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/', failureFlash: false }));
            app.route('/login').get(this.login);
        };
        Dashboard.prototype.start = function (httpServer) {
            //Not implemented
        };
        //Routes
        Dashboard.prototype.defaultDashboard = function (req, res) {
            res.redirect('/dashboard/default');
        };
        Dashboard.prototype.dashboard = function (req, res) {
            res.render('dashboard', { title: 'Dashboard', sessionid: req.params.sessionid, clientid: "" });
        };
        Dashboard.prototype.dashboardWithClient = function (req, res) {
            res.render('dashboard', { title: 'Dashboard', sessionid: req.params.sessionid, clientid: req.params.clientid });
        };
        Dashboard.prototype.getsession = function (req, res) {
            res.render('getsession', { title: 'Get Session' });
        };
        Dashboard.prototype.login = function (req, res) {
            res.render('login', { message: 'Please login' });
        };
        Dashboard.prototype.dashboardServerReset = function (req, res) {
            var sessionid = req.params.sessionid;
            var xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                    if (xhr.status === 200) {
                        res.send("Done.");
                    }
                }
            };
            xhr.open("GET", "http://" + req.headers.host + "/api/reset/" + sessionid);
            xhr.send();
        };
        return Dashboard;
    })();
    VORLON.Dashboard = Dashboard;
})(VORLON = exports.VORLON || (exports.VORLON = {}));
;
