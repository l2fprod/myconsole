var express = require('express');
var proxy = require('http-proxy-middleware');

var app = express();

var proxyOptions = {
  onProxyRes: function(proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization';
  },
  onProxyReq: function(proxyReq, req, res) {
    proxyReq.path = req.originalUrl.substring(`/api/${req.params.region}`.length);
  },
  router: function(req) {
    const targetPath = req.originalUrl.substring(`/api/${req.params.region}`.length);
    return `https://api.${req.params.region}.bluemix.net${targetPath}`;
  },
  target: 'dynamic',
  changeOrigin: true,
  logLevel: 'debug'
};

app.options('/api/:region/*', (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization');
  res.send('OK');
});
app.use('/api/:region', proxy(proxyOptions));

app.listen(process.env.PORT || 8080, function() {
  console.log('server listening on', process.env.PORT || 8080);
});
