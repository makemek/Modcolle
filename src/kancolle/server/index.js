const KcServer = require('./server');

var ConstServerInfo = {};
ConstServerInfo.World_1          = "203.104.209.71";
ConstServerInfo.World_2          = "203.104.209.87";
ConstServerInfo.World_3          = "125.6.184.16";
ConstServerInfo.World_4          = "125.6.187.205";
ConstServerInfo.World_5          = "125.6.187.229";
ConstServerInfo.World_6          = "125.6.187.253";
ConstServerInfo.World_7          = "125.6.188.25";
ConstServerInfo.World_8          = "203.104.248.135";
ConstServerInfo.World_9          = "125.6.189.7";
ConstServerInfo.World_10         = "125.6.189.39";
ConstServerInfo.World_11         = "125.6.189.71";
ConstServerInfo.World_12         = "125.6.189.103";
ConstServerInfo.World_13         = "125.6.189.135";
ConstServerInfo.World_14         = "125.6.189.167";
ConstServerInfo.World_15         = "125.6.189.215";
ConstServerInfo.World_16         = "125.6.189.247";
ConstServerInfo.World_17         = "203.104.209.23";
ConstServerInfo.World_18         = "203.104.209.39";
ConstServerInfo.World_19         = "203.104.209.55";
ConstServerInfo.World_20         = "203.104.209.102";

Object.keys(ConstServerInfo).forEach(function(world) {
	ConstServerInfo[world] = new KcServer(ConstServerInfo[world]);
})

module.exports = exports = ConstServerInfo;