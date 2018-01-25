/**
 * Copyright 2017 IBM All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an 'AS IS' BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the License for the specific language governing permissions and
 *  limitations under the License.
 */
'use strict';
var cfenv = require('cfenv');
var log4js = require('log4js');
var logger = log4js.getLogger('BlockchainAPI');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');
var util = require('util');
var app = express();
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
var cors = require('cors');
var fs = require('fs');
var appEnv = cfenv.getAppEnv();

require('./config.js');
var hfc = require('fabric-client');

var helper = require('./app/helper.js');
var channels = require('./app/create-channel.js');
var join = require('./app/join-channel.js');
var install = require('./app/install-chaincode.js');
var instantiate = require('./app/instantiate-chaincode.js');
var invoke = require('./app/invoke-transaction.js');
var query = require('./app/query.js');
var host = process.env.HOST || hfc.getConfigSetting('host');
var port = process.env.PORT || appEnv.port;
var cloudant = require('./api/cloudant');
var ledgerData = require('./api/ledgerData');
var eventUtil = require('./api/eventutil');
var mutipart = require('connect-multiparty');
var checkfield = require('./api/checkfield');
var multipartMiddleware = mutipart();
///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// SET CONFIGURATONS ////////////////////////////
///////////////////////////////////////////////////////////////////////////////
app.options('*', cors());
app.use(cors());
//support parsing of application/json type post data
app.use(bodyParser.json());
//support parsing of application/x-www-form-urlencoded post data
app.use(bodyParser.urlencoded({
    extended: false
}));
// set secret variable
app.set('secret', 'thisismysecret');
app.use(expressJWT({
    secret: 'thisismysecret'
}).unless({
    path: ['/users', '/downloadfile']
}));
app.use(bearerToken());
app.use(function (req, res, next) {
    if (req.originalUrl.indexOf('/users') >= 0) {
        return next();
    }

    if (req.originalUrl.indexOf('/downloadfile') >= 0) {
        return next();
    }

    var token = req.token;
    jwt.verify(token, app.get('secret'), function (err, decoded) {
        if (err) {
            res.send({
                success: false,
                message: 'Failed to authenticate token. Make sure to include the ' +
                'token returned from /users call in the authorization header ' +
                ' as a Bearer token'
            });
            return;
        } else {
            // add the decoded user name and org name to the request object
            // for the downstream code to use
            req.username = decoded.username;
            req.orgname = decoded.orgName;
            req.company = decoded.company;
            req.vendorNo = decoded.vendorNo + '';

            logger.debug(util.format('Decoded from JWT token: username - %s, orgname - %s, company - %s, vendorNo - %s',
                decoded.username, decoded.orgName, decoded.company, decoded.vendorNo));
            return next();
        }
    });
});

///////////////////////////////////////////////////////////////////////////////
//////////////////////////////// START SERVER /////////////////////////////////
///////////////////////////////////////////////////////////////////////////////
var server = http.createServer(app).listen(port, function () {
});
logger.info('****************** SERVER STARTED ************************');
logger.info('**************  http://' + host + ':' + port +
    '  ******************');
server.timeout = 240000;

eventUtil.triggerEvent();

function getNoAccessMessage() {
    var response = {
        success: false,
        message: ' you have no access to call this service, please concat your administrator'
    };
    return response;
}

function getNoAccessIPMessage() {
    var response = {
        success: false,
        message: ' it seems that you are connecting Blockchain service from a wrong location, please concat your administrator'
    };
    return response;
}

function getErrorMessage(field) {
    var response = {
        success: false,
        message: field + ' field is missing or Invalid in the request'
    };
    return response;
}

function getLoginErrorMessage() {
    var response = {
        success: false,
        message: ' user id or password is incorrect!'
    };
    return response;
}

function getInvokeErrorMessage(bcerror) {
    // logger.info('bcerror is '+bcerror);
    var response = {
        success: false,
        message: '' + bcerror
    };
    return response;
}

function getInvokeSuccessMessage(txId) {
    var response = {
        success: true,
        message: '',
        transactionId: txId
    };
    return response;
}

function getQuerySuccessMessage(jsonStr) {
    var response = {
        success: true,
        message: '',
        data: jsonStr
    };
    return response;
}

function prepareArgs(args, userRole) {
    var rstArgs = [];
    rstArgs.push(userRole);
    rstArgs.push(args[0]);
    return rstArgs;
}

function prepareVendor(args, vendorNo) {
    var rstArgs = [];
    rstArgs.push(args);
    rstArgs.push(vendorNo);
    return rstArgs;
}

function getClientIp(req) {
    var ip = req.headers['x-forwarded-for'] ||
        req.ip ||
        req.connection.remoteAddress ||
        req.socket.remoteAddress ||
        req.connection.socket.remoteAddress || '';
    if (ip.split(',').length > 0) {
        ip = ip.split(',')[0]
    }
    return ip;
};

function checkIPValidate(ip) {
    let checkIpIsValid = hfc.getConfigSetting('checkIpIsValid');
    if (checkIpIsValid) {
        cloudant.checkIP(ip).then(flag => {
            logger.debug('checkIPValidate::',flag);
            return flag;
        });
    } else {
        return true;
    }
}


///////////////////////////////////////////////////////////////////////////////
///////////////////////// REST ENDPOINTS START HERE ///////////////////////////
///////////////////////////////////////////////////////////////////////////////
// Register and enroll user
app.post('/users', function (req, res) {
    var username = req.body.username;
    // var orgName = req.body.orgName;
    var password = req.body.password;

    logger.debug('End point : /users');
    logger.debug('User name : ' + username);
    logger.debug(' get_client_ip:' + getClientIp(req));

    var ipAddress = getClientIp(req);

    let checkIpIsValid = hfc.getConfigSetting('checkIpIsValid');
    if (checkIpIsValid) {
        cloudant.checkIP(ipAddress).then(flag => {
            logger.debug('checkIPValidate::',flag);
            if(!flag){
                res.json(getNoAccessIPMessage());
                return;
            }
        });
    }
    // logger.debug('Org name  : ' + orgName);
    if (!username) {
        res.json(getErrorMessage('\'username\''));
        return;
    }
    if (!password) {
        res.json(getErrorMessage('\'password\''));
        return;
    }
    cloudant.login(username, password, function (data) {
        if (data && data.length > 0) {
            logger.info("login success!!!");
            var orgName = data[0].rows.orgName;
            var company = data[0].rows.company;
            var vendorNo = data[0].rows.vendorNo;
            var token = jwt.sign({
                exp: Math.floor(Date.now() / 1000) + parseInt(hfc.getConfigSetting('jwt_expiretime')),
                username: username,
                orgName: orgName,
                company: company,
                vendorNo: vendorNo
            }, app.get('secret'));
            helper.getRegisteredUsers(username, orgName, true).then(function (response) {
                if (response && typeof response !== 'string') {
                    response.token = token;
                    response.roleId = company;
                    res.json(response);
                } else {
                    res.json({
                        success: false,
                        message: response
                    });
                }
            });
        } else {
            logger.error("login failed");
            res.json(getLoginErrorMessage());
        }
    });

});

// app.get('/:role/channels/:channelName/chaincodes/:chaincodeName/downloadfile', function (req, res) {
app.get('/downloadfile', function (req, res) {
    // var fileId = req.query.fileId;
    // var vendorNo = req.query.vendorNo;
    // var fileName = req.query.fileName;

    var file = req.query.file.split('-');
    // logger.debug('channelName  : ' + channelName);
    // logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('req.query.file : ' + req.query.file);

    // if (!chaincodeName) {
    //     res.json(getErrorMessage('\'chaincodeName\''));
    //     return;
    // }
    // if (!channelName) {
    //     res.json(getErrorMessage('\'channelName\''));
    //     return;
    // }
    if (!file || file.length < 2) {
        res.json(getErrorMessage('\'file\''));
        return;
    }
    var fileId = file[0];
    var fileName = file[1];
    logger.debug('fileId  : ' + fileId);
    logger.debug('fileName  : ' + fileName);

    // var fileId = vendorNo + '_' + asnno;
    cloudant.getAttachment(fileId, fileName,
        function (err, data) {
            if (err) {
                res.json(getErrorMessage(err))
            } else {
                res.download(fileId, fileName,
                    function (err) {
                        if (err) {
                            logger.info('download err,', err);
                        } else {
                            logger.info('downloaded successfully');
                            fs.unlink(fileId, (err) => {
                                if (err) {
                                    console.log(err);
                                }
                                logger.debug('FILE [' + fileId + '] REMOVED!');
                            });
                        }
                    });
            }
        });
});
// Create Channel
app.post('/channels', function (req, res) {
    logger.info('<<<<<<<<<<<<<<<<< C R E A T E  C H A N N E L >>>>>>>>>>>>>>>>>');
    logger.debug('End point : /channels');
    var channelName = req.body.channelName;
    var channelConfigPath = req.body.channelConfigPath;
    logger.debug('Channel name : ' + channelName);
    logger.debug('channelConfigPath : ' + channelConfigPath); //../artifacts/channel/mychannel.tx
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!channelConfigPath) {
        res.json(getErrorMessage('\'channelConfigPath\''));
        return;
    }

    channels.createChannel(channelName, channelConfigPath, req.username, req.orgname)
        .then(function (message) {
            res.send(message);
        });
});
// Join Channel
app.post('/channels/:channelName/peers', function (req, res) {
    logger.info('<<<<<<<<<<<<<<<<< J O I N  C H A N N E L >>>>>>>>>>>>>>>>>');
    var channelName = req.params.channelName;
    var peers = req.body.peers;
    logger.debug('channelName : ' + channelName);
    logger.debug('peers : ' + peers);
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!peers || peers.length == 0) {
        res.json(getErrorMessage('\'peers\''));
        return;
    }

    join.joinChannel(channelName, peers, req.username, req.orgname)
        .then(function (message) {
            res.send(message);
        });
});
// Install chaincode on target peers
app.post('/chaincodes', function (req, res) {
    logger.debug('==================== INSTALL CHAINCODE ==================');
    var peers = req.body.peers;
    var chaincodeName = req.body.chaincodeName;
    var chaincodePath = req.body.chaincodePath;
    var chaincodeVersion = req.body.chaincodeVersion;
    logger.debug('peers : ' + peers); // target peers list
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('chaincodePath  : ' + chaincodePath);
    logger.debug('chaincodeVersion  : ' + chaincodeVersion);
    if (!peers || peers.length == 0) {
        res.json(getErrorMessage('\'peers\''));
        return;
    }
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!chaincodePath) {
        res.json(getErrorMessage('\'chaincodePath\''));
        return;
    }
    if (!chaincodeVersion) {
        res.json(getErrorMessage('\'chaincodeVersion\''));
        return;
    }

    install.installChaincode(peers, chaincodeName, chaincodePath, chaincodeVersion, req.username, req.orgname)
        .then(function (message) {
            res.send(message);
        });
});
// Instantiate chaincode on target peers
app.post('/channels/:channelName/chaincodes', function (req, res) {
    logger.debug('==================== INSTANTIATE CHAINCODE ==================');
    var chaincodeName = req.body.chaincodeName;
    var chaincodeVersion = req.body.chaincodeVersion;
    var channelName = req.params.channelName;
    var fcn = req.body.fcn;
    var args = req.body.args;
    logger.debug('channelName  : ' + channelName);
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('chaincodeVersion  : ' + chaincodeVersion);
    logger.debug('fcn  : ' + fcn);
    logger.debug('args  : ' + args);
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!chaincodeVersion) {
        res.json(getErrorMessage('\'chaincodeVersion\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!args) {
        res.json(getErrorMessage('\'args\''));
        return;
    }
    instantiate.instantiateChaincode(channelName, chaincodeName, chaincodeVersion, fcn, args, req.username, req.orgname)
        .then(function (message) {
            res.send(message);
        });
});
// Invoke transaction on chaincode on target peers
app.post('/:role/channels/:channelName/chaincodes/:chaincodeName', function (req, res) {
    logger.debug('==================== INVOKE ON CHAINCODE ==================');
    var peers = req.body.peers;
    var chaincodeName = req.params.chaincodeName;
    var channelName = req.params.channelName;
    var role = req.params.role;

    var fcn = req.body.fcn;
    var args = req.body.args;
    var str = JSON.stringify(args);
    args = prepareVendor(str, req.vendorNo);
    // var rstArgs = [];
    // rstArgs.push(str);
    // rstArgs.push(req.vendorNo);
    // args = rstArgs;
    logger.debug('channelName  : ' + channelName);
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('req.vendorNo : ' + req.vendorNo);
    logger.debug('fcn  : ' + fcn);
    logger.debug('args  : ' + args);
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!fcn) {
        res.json(getErrorMessage('\'fcn\''));
        return;
    }
    if (!args) {
        res.json(getErrorMessage('\'args\''));
        return;
    }
     var checkResult = checkfield.checkField(fcn, req.body.args);
    if (checkResult !== '') {
        return res.json(getInvokeErrorMessage(checkResult));
    }
    logger.debug('==================== INSERT DATA TO DATABASE==================');
    var reqData = req.body.args;
    reqData.filter(item => item.TRANSDOC === 'SO' || item.TRANSDOC === 'PO' || fcn === 'crMappingFlexPO'
    || fcn === 'initWHQty' || fcn === 'crCGoodReceiveInfo' || (fcn === 'crCMaterialPulling' && item.PullType === 'LOI'))
        .forEach(item => {
        cloudant.insertSearchDocument(fcn, role, item, req.vendorNo, function (err, body) {
            if (err) {
                logger.error('Error creating document - ', err.message);
                return;
            }
            logger.debug('all records inserted.');
        });
    });

    reqData.filter(item => item.TRANSDOC === 'SUP').forEach(item => {
        let queryFcn = 'queryByIds';
        var queryData = [];

        var keyObj = {
            KeyPrefix: 'PO',
            KeysStart: [],
            KeysEnd: []
        };
        if (item.PONumber && item.PONumber !== '') {
            keyObj.KeysStart.push(item.PONumber);
            keyObj.KeysStart.push(item.POItem);
            queryData.push(keyObj);
        }

        var pojsonStr = JSON.stringify(queryData);
        var poArgsArr = [];
        poArgsArr.push(pojsonStr);
        var poArgsStr = prepareArgs(poArgsArr, role);
        // logger.debug('poArgsStr', poArgsStr);
        query.queryChaincode(peers, channelName, chaincodeName, poArgsStr, queryFcn, req.username, req.orgname)
            .then(function (pomessage) {
                // logger.debug('pomessage', pomessage);
                if (pomessage && typeof pomessage === 'string' && pomessage.includes(
                        'Error:')) {
                    // res.json(getInvokeErrorMessage(pomessage));
                } else {
                    var respPoObj;
                    if (typeof pomessage !== 'string') {
                        respPoObj = pomessage;
                    } else {
                        respPoObj = JSON.parse(pomessage);
                    }
                    respPoObj.forEach(poitem => {
                        item.poitem = poitem;
                        cloudant.insertSearchDocument(fcn, role, item, req.vendorNo, function (err, body) {
                            if (err) {
                                logger.error('Error creating document - ', err.message);
                                return;
                            }
                            logger.debug('all records inserted.');
                        });
                    });
                }
            }, (err) => {
                logger.debug('error is ' + err);
                // res.json(getInvokeErrorMessage(err));
            });

    });

    invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname)
        .then(function (message) {
            res.json(getInvokeSuccessMessage(message));
        }, (err) => {
            logger.debug('error is ' + err);
            res.json(getInvokeErrorMessage('System Error'));
        });
});
// Query on chaincode on target peers
app.get('/:role/channels/:channelName/chaincodes/:chaincodeName', function (req, res) {
    logger.debug('==================== QUERY BY CHAINCODE ==================');
    var channelName = req.params.channelName;
    var chaincodeName = req.params.chaincodeName;
    let args = req.query.args;
    let fcn = req.query.fcn;
    let peer = req.query.peer;

    logger.debug('channelName : ' + channelName);
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('fcn : ' + fcn);
    logger.debug('args : ' + args);

    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!fcn) {
        res.json(getErrorMessage('\'fcn\''));
        return;
    }
    if (!args) {
        res.json(getErrorMessage('\'args\''));
        return;
    }
    args = args.replace(/'/g, '"');
    args = JSON.parse(args);
    logger.debug(args);

    query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname)
        .then(function (message) {
            res.json(getInvokeSuccessMessage(message));
        });
});
app.post('/:role/channels/:channelName/chaincodes/:chaincodeName/upload', multipartMiddleware, function (req, res) {
// app.post('/upload', multipartMiddleware, function (req, res) {
    logger.debug('==================== upload ON CHAINCODE ==================');
    logger.debug(req.files);
    logger.debug('req.body', req.body);
    logger.debug(req.files.attachment);
    var ASNNO = req.body.ASNNO;
    var peers = req.body.peers;
    var chaincodeName = req.params.chaincodeName;
    var channelName = req.params.channelName;
    var role = req.params.role;
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    var attachment = req.files.attachment;

    if (attachment) {
        var fileId = req.vendorNo + '_' + ASNNO;
        // var fileId = ASNNO;

        cloudant.insertNewAttachment(fileId, attachment, function (err, data) {
            logger.debug('start to insert data to blockchain');
            if (err) {
                res.json(getErrorMessage(err))
            } else {
                logger.info('file is inserted database successfully!!!');
                var fcn = 'crSupplierOrderInfo';
                var args = [{
                    "TRANSDOC": "UL",
                    "ASNNumber": ASNNO,
                    "PackingList":
                        {
                            "FileId": fileId,
                            "FileName": attachment.originalFilename,
                            "FileType": attachment.type,
                        }
                }];
                logger.debug('UPLoad File INFO ', args);
                var str = JSON.stringify(args);
                args = prepareVendor(str, req.vendorNo);
                logger.debug('req.vendorNo=' + req.vendorNo);
                logger.debug('req.username=' + req.username);
                logger.debug('req.vendorgnameorNo=' + req.orgname);
                logger.debug('req.peers=' + peers);
                invoke.invokeChaincode(peers, channelName, chaincodeName, fcn, args, req.username, req.orgname)
                    .then(function (message) {
                        res.json(getInvokeSuccessMessage(message));
                    }, (err) => {
                        logger.debug('error is ' + err);
                        res.json(getInvokeErrorMessage('System Error'));
                    });
            }
        });

    } else {
        res.json(getInvokeErrorMessage('Upload file failed!!'));
    }
});
app.post('/:role/channels/:channelName/chaincodes/:chaincodeName/download', function (req, res) {

    logger.debug('==================== Download ON CHAINCODE ==================');
    var peers = req.body.peers;
    var chaincodeName = req.params.chaincodeName;
    var channelName = req.params.channelName;
    var role = req.params.role;
    var asnno = req.body.asnno;
    var vendorNo = req.body.vendorNo;
    if (!vendorNo) {
        vendorNo = req.vendorNo;
    }
    logger.debug('channelName  : ' + channelName);
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('req.vendorNo : ' + vendorNo);
    logger.debug('ASNNUMBER  : ' + asnno);
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!asnno) {
        res.json(getErrorMessage('\'ASNNUMBER\''));
        return;
    }

    logger.debug('==================== Download DATA TO DATABASE==================');


    let queryFcn = 'queryByIds';
    var queryData = [];

    var keyObj = {
        KeyPrefix: 'SUP',
        KeysStart: [],
        KeysEnd: []
    };
    keyObj.KeysStart.push(vendorNo);
    keyObj.KeysStart.push(asnno);
    queryData.push(keyObj);
    var jsonStr = JSON.stringify(queryData);
    var argsArr = [];
    argsArr.push(jsonStr);
    var argsArr = prepareArgs(argsArr, role);
    logger.debug('argsArr', argsArr);
    query.queryChaincode(peers, channelName, chaincodeName, argsArr, queryFcn, req.username, req.orgname)
        .then(function (message) {
            // logger.debug('pomessage', pomessage);
            if (message && typeof message === 'string' && message.includes(
                    'Error:')) {
                res.json(getInvokeErrorMessage('System Error'));
            } else {
                var respObjects;
                if (typeof message !== 'string') {
                    respObjects = message;
                } else {
                    respObjects = JSON.parse(message);
                }
                if (respObjects.length === 0) {
                    res.json(getInvokeErrorMessage('ASN NO  or attachment doesn\'t exist!'));
                }
                respObjects.forEach(respObj => {
                    if (respObj && respObj.PackingList) {
                        logger.debug('download ID, Name:', respObj.PackingList.FileId, respObj.PackingList.FileName);
                        if (respObj.PackingList.FileId) {
                            cloudant.getAttachment(respObj.PackingList.FileId, respObj.PackingList.FileName,
                                function (err, data) {
                                    if (err) {
                                        res.json(getErrorMessage(err))
                                    } else {
                                        res.download(respObj.PackingList.FileId, respObj.PackingList.FileName,
                                            function (err) {
                                                if (err) {
                                                    logger.info('download err,', err);
                                                } else {
                                                    logger.info('downloaded successfully');
                                                    fs.unlink(respObj.PackingList.FileId, (err) => {
                                                        if (err) {
                                                            console.log(err);
                                                        }
                                                        logger.debug('FILE [' + respObj.PackingList.FileId + '] REMOVED!');
                                                    });
                                                }
                                            });


                                        // res.set({
                                        //     "Content-type": respObj.PackingList.FileType,
                                        //     "Content-Disposition": "attachment;filename=" + encodeURI(respObj.PackingList.FileName)
                                        // });
                                        // // //data = Buffer.concat([new Buffer('\xEF\xBB\xBF', 'binary'), new Buffer(data)]);
                                        // res.setHeader('Content-Length', data.length);
                                        // // res.write(data, 'binary');
                                        // res.write(data);
                                        // res.end();
                                    }
                                });
                        } else {
                            res.json(getInvokeErrorMessage('PackingList does not exist'));
                        }


                    }
                });

            }
        }, (err) => {
            logger.debug('error is ' + err);
            res.json(getInvokeErrorMessage('System Error'));
        });
});

app.post('/:role/channels/:channelName/chaincodes/:chaincodeName/query', function (req, res) {
    logger.debug('==================== query ON CHAINCODE ==================');
    var channelName = req.params.channelName;
    var chaincodeName = req.params.chaincodeName;
    var fcn = req.body.fcn;
    var args = req.body.args;
    let peer = req.query.peer;
    var role = req.params.role;
    args = prepareArgs(args, role);

    logger.debug('channelName : ' + channelName);
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('fcn : ' + fcn);
    logger.debug('args : ' + args);
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!fcn) {
        res.json(getErrorMessage('\'fcn\''));
        return;
    }
    if (!args) {
        res.json(getErrorMessage('\'args\''));
        return;
    }
    query.queryChaincode(peer, channelName, chaincodeName, args, fcn, req.username, req.orgname)
        .then(function (message) {
            if (message && typeof message === 'string' && message.includes(
                    'Error:')) {
                res.json(getInvokeErrorMessage('System Error'));
            } else {
                res.json(getQuerySuccessMessage(message));
            }

        }, (err) => {
            logger.debug('error is ' + err);
            res.json(getInvokeErrorMessage('System Error'));
        });
});

app.post('/:role/channels/:channelName/chaincodes/:chaincodeName/:keyprefix/search', function (req, res) {
    logger.debug('==================== query ON CHAINCODE ==================');
    var channelName = req.params.channelName;
    var chaincodeName = req.params.chaincodeName;
    var keyprefix = req.params.keyprefix;
    var fcn = req.body.fcn;
    var args = req.body.args;
    args.keyprefix = keyprefix.toUpperCase();
    let peer = req.query.peer;
    var role = req.params.role;

    logger.debug('channelName : ' + channelName);
    logger.debug('chaincodeName : ' + chaincodeName);
    logger.debug('fcn : ' + fcn);
    logger.debug('args : ' + args);
    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }
    if (!fcn) {
        res.json(getErrorMessage('\'fcn\''));
        return;
    }
    if (!args) {
        res.json(getErrorMessage('\'args\''));
        return;
    }
    if (req.company !== role) {
        logger.debug('role:', req.company, role);
        res.json(getNoAccessMessage());
        return;
    }
    cloudant.queryItemNo(args, req.vendorNo, function (resp) {
        // logger.debug('resp', resp);
        var jsonStr = JSON.stringify(resp);
        // logger.debug(jsonStr);
        var argsArr = [];
        argsArr.push(jsonStr);
        var argsStr = prepareArgs(argsArr, role);
        logger.debug('argsStr', argsStr);
        query.queryChaincode(peer, channelName, chaincodeName, argsStr, fcn, req.username, req.orgname)
            .then(function (message) {
                if (message && typeof message === 'string' && message.includes(
                        'Error:')) {
                    res.json(getInvokeErrorMessage('System Error'));
                } else {
                    var respObj;

                    if (typeof message !== 'string') {
                        respObj = message;
                    } else {
                        respObj = JSON.parse(message);
                    }
                    logger.debug('get response', respObj);
                    var response = [];
                    respObj.forEach(soItem => {
                        var resp = ledgerData.prepareSearchData(keyprefix, soItem);
                        logger.debug('get--- response', resp);
                        response.push(resp);
                    });
                    res.json(getQuerySuccessMessage(response));
                }

            }, (err) => {
                logger.debug('error is ' + err);
                res.json(getInvokeErrorMessage('System Error'));
            });
    });

});

app.post('/:role/channels/:channelName/chaincodes/:chaincodeName/block', function (req, res) {
    logger.debug('==================== query ON CHAINCODE ==================');
    var channelName = req.params.channelName;
    var chaincodeName = req.params.chaincodeName;
    let peer = req.query.peer;
    var role = req.params.role;

    logger.debug('channelName : ' + channelName);
    logger.debug('chaincodeName : ' + chaincodeName);

    if (!chaincodeName) {
        res.json(getErrorMessage('\'chaincodeName\''));
        return;
    }
    if (!channelName) {
        res.json(getErrorMessage('\'channelName\''));
        return;
    }

    if (req.company !== role) {
        logger.debug('role:', req.company, role);
        res.json(getNoAccessMessage());
        return;
    }

    query.getChannelHeight(peer, channelName, req.orgname).then(data => {
        var len = data;
        logger.debug('length::::' + len);
        var promiseList = [];
        let minIndex = (len - 5 > 0) ? (len - 5) : 0;
        for (var index = len - 1; index >= minIndex; index--) {
            let promise = query.getBlockByNumber(peer, index, req.username, req.orgname);
            promiseList.push(promise);
        }
        var response = {
            success: true,
            message: '',
            size: len,
            data: []
        };
        Promise.all(promiseList).then(datas => {
            logger.debug('block datas:', datas);
            datas.forEach(item => {
                logger.debug('block item:' + JSON.stringify(item));
                let blockInfo = {};
                blockInfo.blockNo = item.header.number.low;
                if (item.data.data.length > 0) {
                    let blockData = item.data.data[0];
                    blockInfo.timestamp = blockData.payload.header.channel_header.timestamp;
                    blockInfo.tx_id = blockData.payload.header.channel_header.tx_id;
                }
                response.data.push(blockInfo);
            });
            res.json(response);
        });
    });
});

//  Query Get Block by BlockNumber
app.get('/channels/:channelName/blocks/:blockId', function (req, res) {
    logger.debug('==================== GET BLOCK BY NUMBER ==================');
    let blockId = req.params.blockId;
    let peer = req.query.peer;
    logger.debug('channelName : ' + req.params.channelName);
    logger.debug('BlockID : ' + blockId);
    logger.debug('Peer : ' + peer);
    if (!blockId) {
        res.json(getErrorMessage('\'blockId\''));
        return;
    }

    query.getBlockByNumber(peer, blockId, req.username, req.orgname)
        .then(function (message) {
            res.send(message);
        });
});
// Query Get Transaction by Transaction ID
app.get('/channels/:channelName/transactions/:trxnId', function (req, res) {
    logger.debug(
        '================ GET TRANSACTION BY TRANSACTION_ID ======================'
    );
    logger.debug('channelName : ' + req.params.channelName);
    let trxnId = req.params.trxnId;
    let peer = req.query.peer;
    if (!trxnId) {
        res.json(getErrorMessage('\'trxnId\''));
        return;
    }

    query.getTransactionByID(peer, trxnId, req.username, req.orgname)
        .then(function (message) {
            res.send(message);
        });
});
// Query Get Block by Hash
app.get('/channels/:channelName/blocks', function (req, res) {
    logger.debug('================ GET BLOCK BY HASH ======================');
    logger.debug('channelName : ' + req.params.channelName);
    let hash = req.query.hash;
    let peer = req.query.peer;
    if (!hash) {
        res.json(getErrorMessage('\'hash\''));
        return;
    }

    query.getBlockByHash(peer, hash, req.username, req.orgname).then(
        function (message) {
            res.send(message);
        });
});
//Query for Channel Information
app.get('/channels/:channelName', function (req, res) {
    logger.debug(
        '================ GET CHANNEL INFORMATION ======================');
    logger.debug('channelName : ' + req.params.channelName);
    let peer = req.query.peer;

    query.getChainInfo(peer, req.username, req.orgname).then(
        function (message) {
            res.send(message);
        });
});
// Query to fetch all Installed/instantiated chaincodes
app.get('/chaincodes', function (req, res) {
    var peer = req.query.peer;
    var installType = req.query.type;
    //TODO: add Constnats
    if (installType === 'installed') {
        logger.debug(
            '================ GET INSTALLED CHAINCODES ======================');
    } else {
        logger.debug(
            '================ GET INSTANTIATED CHAINCODES ======================');
    }

    query.getInstalledChaincodes(peer, installType, req.username, req.orgname)
        .then(function (message) {
            res.send(message);
        });
});
// Query to fetch channels
app.get('/channels', function (req, res) {
    logger.debug('================ GET CHANNELS ======================');
    logger.debug('peer: ' + req.query.peer);
    var peer = req.query.peer;
    if (!peer) {
        res.json(getErrorMessage('\'peer\''));
        return;
    }

    query.getChannels(peer, req.username, req.orgname)
        .then(function (message) {
            res.send(message);
        });
});

