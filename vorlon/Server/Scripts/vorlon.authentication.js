var VORLON;
(function (VORLON) {
    var Authentication = (function () {
        function Authentication() {
        }
        Authentication.initAuthentication = function () {
            Authentication.Passport.use(new Authentication.LocalStrategy(function (username, password, done) {
                // insert your MongoDB check here. For now, just a simple hardcoded check.
                if (username === 'vorlon' && password === 'vorlon') {
                    done(null, { user: username });
                }
                else {
                    done(null, false);
                }
            }));
            Authentication.Passport.serializeUser(function (user, done) {
                done(null, user.id);
            });
            Authentication.Passport.deserializeUser(function (id, done) {
                done(null, { 'id': '1', 'login': 'vorlon' });
            });
        };
        Authentication.ensureAuthenticated = function (req, res, next) {
            if (!Authentication.ActivateAuth || req.isAuthenticated()) {
                return next();
            }
            res.redirect('/login');
        };
        Authentication.Passport = require("passport");
        Authentication.LocalStrategy = require("passport-local").Strategy;
        Authentication.ActivateAuth = false;
        return Authentication;
    })();
    VORLON.Authentication = Authentication;
})(VORLON = exports.VORLON || (exports.VORLON = {}));
;
