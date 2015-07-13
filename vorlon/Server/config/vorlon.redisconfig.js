var VORLON;
(function (VORLON) {
    var RedisConfig = (function () {
        function RedisConfig() {
        }
        RedisConfig.fackredis = true;
        RedisConfig._redisPort = 6379;
        RedisConfig._redisMachine = "";
        RedisConfig._redisPassword = "";
        return RedisConfig;
    })();
    VORLON.RedisConfig = RedisConfig;
})(VORLON = exports.VORLON || (exports.VORLON = {}));
