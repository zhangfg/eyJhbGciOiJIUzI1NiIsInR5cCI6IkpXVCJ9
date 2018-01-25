
'use strict'
//引入request 模块
var request = require('request');
var log4js = require('log4js');
var logger = log4js.getLogger('HTTP');

var loginUrl = 'https://soa-test.lenovo.com/api/token';
var createSOUrl = 'https://soa-test.lenovo.com/api/bluemix2ecc_so_creation/1.0/create';
var createIBDNUrl = 'https://soa-test.lenovo.com/api/bluemix2ecc_so_creation/1.0/createibdn';
var createMaterialPulling = 'https://soa-test.lenovo.com/api/bluemix2ecc_so_creation/1.0/simulation';
exports.login = function (callback) {
    let header = getLoginHeader();
    let option = {
        url: loginUrl,
        method: "POST",
        json: true,
        headers: header,
        form: {"grant_type": "client_credentials"}
    };
    request.post(option, function (error, response, body) {
        resultFunction(callback, error, response, body);
    })
};

exports.createSO = function (token, data, callback) {
    let url = createSOUrl;
    let header = getHeader(token);
    let option = {
        url: url,
        method: "POST",
        json: true,
        headers: header,
        body: data
    };
    request(option, function (error, response, body) {
        resultFunction(callback, error, response, body);
    });
};

exports.createIBDN = function (token, data, callback) {
    let url = createIBDNUrl;
    let header = getHeader(token);
    let option = {
        url: url,
        method: "POST",
        json: true,
        headers: header,
        body: data
    };
    request(option, function (error, response, body) {
        resultFunction(callback, error, response, body);
    });
};

function resultFunction(callback, error, response, body) {
    // logger.debug('error:', error);
    // logger.debug('response:', response);
    // logger.debug('body:', body);
    if (!error && response.statusCode === 200) {
        callback({success: true, result: body});
        console.log('request is success ');
    } else {
        console.log('request is error', error);
        callback({success: false, msg: error});
    }
}

function getLoginHeader() {
    return {
        "Content-type": "application/x-www-form-urlencoded",
        "Authorization": "Basic aWY5cnVmRGJ3ME5zYnRZQ0tEaG5MS3h4bDZJYTpMbmx3OWRLd0xreE1ITXpEM1dWR2Z3ZjFkZEVh"
    };
}

function getHeader(token) {
    return {
        "Content-type": "application/json",
        "authorization": "Bearer " + token
    };
}
exports.crCMaterialPulling = function(token,data,callback){
        let url = createMaterialPulling;
        let header = getHeader(token);
        let option = {
            url: url,
            method: "POST",
            json: true,
            headers: header,
            body: data
        };
        request(option, function (error, response, body) {
            resultFunction(callback, error, response, body);
        });
};
