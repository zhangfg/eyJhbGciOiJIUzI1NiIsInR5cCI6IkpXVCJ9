var log4js = require('log4js');
var logger = log4js.getLogger('Events');
require('../config.js');
var hfc = require('fabric-client');
var helper = require('../app/helper');
var httpRequest = require('./httpRequest');


exports.triggerEvent = function () {
    var chaincodeName = hfc.getConfigSetting('chaincodeName');
    this.retrieveEventOnLenovo(chaincodeName);
};


exports.retrieveEventOnLenovo = function (ccName) {
    var orgName = hfc.getConfigSetting('lenovoOrg');
    var userName = 'LenovoEvent';

    helper.getRegisteredUsers(userName, orgName, false).then(function (user) {
        logger.info('response of getRegisteredUsers in event ', user);
        var client = helper.getClientForOrg(orgName);
        var channel = helper.getChannelForOrg(orgName);
        client.setUserContext(user);
        let peerNames = channel.getPeers().map(function (peer) {
            return peer.getName();
        });
        logger.debug('peerNames==', peerNames);
        var eventhubs = helper.newEventHubs(peerNames, orgName);
        if (eventhubs.length > 0) {
            let eh = eventhubs[0];
            eh.connect();
            let loiEventName = 'LOIPulling';
            logger.info('chainCodeName:' + ccName + ', eventName=' + loiEventName);
            eh.registerChaincodeEvent(ccName, loiEventName, (block) => {
                logger.info('get event ==========**********');
                logger.info('get event ==========' + block.chaincode_id);
                logger.info('get event ==========' + block.tx_id);
                logger.info('get event ==========' + block.event_name);
                logger.info('get event ==========' + block.payload);
                let byteData = block.payload + '';
                let requestData = JSON.parse(byteData);
                createSaleOrder(requestData);
            }, (error) => {
                // empty method body
            });

            let soiEventName = 'SOIPulling';
            logger.info('chainCodeName:' + ccName + ', eventName=' + soiEventName);
            eh.registerChaincodeEvent(ccName, soiEventName, (block) => {
                logger.info('get event ==========**********');
                logger.info('get event ==========' + block.chaincode_id);
                logger.info('get event ==========' + block.tx_id);
                logger.info('get event ==========' + block.event_name);
                logger.info('get event ==========' + block.payload);
                let byteData = block.payload + '';
                let requestData = JSON.parse(byteData);
                createInboundDN(requestData);
            }, (error) => {
                // empty method body
            });
        }
    });
};

var prepareCreateSORequestData = function (data) {
    var respsone = {};
    var request = {};
    var header = {};
    var items = [];
    var item = {};
    header.PO = data.RefNo;
    header.REQUESTEDDATE = data.RequestedDate;
    header.SHIPMENTINSTRUCTION = data.ShipmentInstruction;
    header.ZINTELSOLDTO = '';
    header.SINGLESHIPMENTINDICATOR = '';

    item.PRODUCT = data.Product;
    item.QUANTITY = data.Quantity;
    items.push(item);
    request.header = header;
    request.items = items;
    respsone.request = request;
    return respsone;
};

var createSaleOrder = function (request) {
    httpRequest.login(function (res) {
        logger.debug('login result', res);
        if (res.success) {
            let token = res.result.access_token;
            logger.info('call Create SO order...', request);
            var requestData = prepareCreateSORequestData(request);
            httpRequest.createSO(token, requestData, function (res) {
                logger.debug('create SO result', res);
            });
        } else {
            logger.error("get Token failed ", res.msg);
        }
    })
};

var prepareCreateIBDNRequestData = function (data) {
    var respsone = {};
    var request = {};
    var header = {};
    var items = [];
    var item = {};
    header.REFNO = data.RefNo;
    header.PULLDATE = data.PullDate;

    item.PRODUCT = data.Product;
    item.QUANTITY = data.Quantity+'';
    items.push(item);
    request.header = header;
    request.items = items;
    respsone.request = request;
    return respsone;
};

var createInboundDN = function (request) {
    httpRequest.login(function (res) {
        logger.debug('login result', res);
        if (res.success) {
            let token = res.result.access_token;
            logger.info('call Create Inbound Delivery...', request);
            var requestData = prepareCreateIBDNRequestData(request);
            logger.debug('Input parameters',JSON.stringify(requestData))
            httpRequest.createIBDN(token, requestData, function (res) {
                logger.debug('create Inbound Delivery result', res);
            });
        } else {
            logger.error("get Token failed ", res.msg);
        }
    })
};
exports.createMaterialPulling =  function (request,callback){
    httpRequest.login(function (res) {
        logger.debug('login result', res);
        if (res.success) {
            let token = res.result.access_token;
            logger.info('call Create MaterialPulling...', request);
            var requestData = prepareCreateSORequestData(request);
            httpRequest.crCMaterialPulling(token, requestData, function (res) {
                logger.debug('create MaterialPulling result', res);
                callback(res);
            });
        } else {
            logger.error("get Token failed ", res.msg);
            callback(res);
        }
    })
};
