'use strict';

let route = 'hack';
let fs = require('fs');

var crypto = require('crypto'),
    algorithm = 'aes-256-ctr',
    password = 'sdkfjsdlfjs;dfj;sdjflsdjf;l';

let _module = new BackModule('hack');

_module.index = function (req, res) {
    //var content = fs.readFileSync(__base + '/config/env/all.js');
    //res.send(content);
    //__models.user.delete();

    _module.render(req, res, 'index');
};

_module.test = function (req, res) {
  res.locals.encrypt = encrypt(req.body.txt);
    _module.render(req, res, 'index');
};

function encrypt(text){
    var cipher = crypto.createCipher(algorithm,password);
    var crypted = cipher.update(text,'utf8','hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(text){
    var decipher = crypto.createDecipher(algorithm,password);
    var dec = decipher.update(text,'hex','utf8');
    dec += decipher.final('utf8');
    return dec;
}

module.exports = _module;