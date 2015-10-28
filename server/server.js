var loopback = require('loopback');
var boot = require('loopback-boot');
var config = require('../config/keys'); //Braintree Keys
var bodyParser = require('body-parser');

var braintree = require('braintree');
var gateway = braintree.connect({
  environment: braintree.Environment.Sandbox,
  merchantId: config.merchantId,
  publicKey: config.publicKey,
  privateKey: config.privateKey
});

var app = module.exports = loopback();

app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    var baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      var explorerPath = app.get('loopback-component-explorer').mountPath;
      console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};
  
//Generate Client Token
app.get("/client-token", function(req, res) {
  gateway.clientToken.generate({}, function(err, response){
    res.send(response.clientToken);
  });
});

//Recieve Payment Info
app.post("/checkout", bodyParser(), function (req, res) {
  var nonce = req.body.payment_method_nonce;
  // Use payment method nonce here
  if(nonce === undefined) {
    res.send({"error":"undefined nonce"});
  }
  console.log(nonce);
});


// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});
