var express = require('express');
var httpProxy = require('http-proxy');

var cors = require('cors');


var server = express();
server.set('port', 3000);
server.use(express.static(__dirname + '/app'));


// Solution for forwarding from http to https taken from:
// http://stackoverflow.com/questions/15801014/how-to-use-node-http-proxy-for-http-to-https-routing
var proxyOptions = {
    changeOrigin: true,
	 target: {
      https: true
  }
};

// use cors. this will enable cross origin request sharing. even ones with basic authentication.
server.use(cors());
 

var apiProxy = httpProxy.createProxyServer(proxyOptions);
var apiForwardingUrl="";
var APICallCount = 0;

apiProxy.on('proxyReq', function(proxyReq, req, res, options) {
    proxyReq.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");  
     proxyReq.setHeader("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");  
     proxyReq.setHeader("X-Powered-By",' 3.2.1') ;
     proxyReq.setHeader("Content-Type", "application/json;charset=utf-8");  
	     
	 res.setHeader('Access-Control-Allow-Origin', '*');
	 console.log("proxy headers all set!")
});

console.log('Forwarding API requests to ' + apiForwardingUrl);


httpProxy.prototype.onError = function (err) {
    console.log(err);
};


server.all("/", function(req, res) {
	
	apiForwardingUrl = req.query.url;
	APICallCount = APICallCount + 1;
    console.log("Incoming request #"+ APICallCount +" for URL>>" + apiForwardingUrl );
	apiProxy.web(req, res, {target: apiForwardingUrl});
	
});

server.listen(server.get('port'), function() {
    console.log('Express server listening on port ' + server.get('port'));
});