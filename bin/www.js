#!/usr/bin/env nodevar http = require("http")var https = require("https")var fs = require("fs")var debug = require('debug')('ozanam-gala');var app = require('../app');app.set('port', process.env.PORT || 3000);app.set('portssl', process.env.PORTSSL || 8000);//HTTP servervar serverHttp = http.createServer(app)serverHttp.on('error', function(err) {  console.error(err)})serverHttp.listen(app.get('port'), function(){  console.log('Express server listening on port ' + app.get('port'));});//HTTPS serverif (process.env.ENABLESSL === 'yes') {  files = [    "DigiCertCA.crt",    "TrustedRoot.crt"  ]  var file, _i, _len, ca;  ca = []  for (_i = 0, _len = files.length; _i < _len; _i++) {    file = files[_i];    ca.push(fs.readFileSync("private/" + file));  }  var options = {    ca: ca,    key: fs.readFileSync('private/privatekey.pem'),    cert: fs.readFileSync('private/certificate.pem')  };  var serverSSL = https.createServer(options, app)  serverSSL.on('error', function(err) {    console.error(err)  })  serverSSL.listen(app.get('portssl'), function() {    console.log('Express server listening on port ' + app.get('portssl'));  });}process.on('uncaughtException', function (err) {  console.error('uncaughtException:', err.message)  console.error(err.stack)  process.exit(1)})process.on('exit', function() {  console.log('closing db connections...')  require('./lib/shared-db').close()});