'use strict';
var cfenv = require('cfenv');
var log4js = require('log4js');
var logger = log4js.getLogger('CloudantAPI');
var Cloudant = require('cloudant');
var fs = require('fs');
var appEnv = cfenv.getAppEnv();
var nano, db;
var dbCreds = appEnv.getServiceCreds('Cloudant NoSQL DB-gp');
var dbname = 'buy_sell';

var index = ''

if (dbCreds) {
    logger.info('URL is ' + dbCreds.url);
    nano = require('nano')(dbCreds.url);
    db = nano.use(dbname);
} else {
    logger.error('NO DB!');
}
var insertSearchDocument = function (roleId, docObj, callback) {
    this.insertSoSearchDocument(roleId, docObj, callback);
};
var insertSoSearchDocument = function (roleId, docObj, callback) {
    logger.debug('insertSearchDocument', docObj);
    var local = this;
    if (docObj.SOCDATE) {
        docObj.SOCDATE = docObj.SOCDATE.replace(/-/g, '');
    }
    db.find({
        selector: {
            'rows.soNo': {
                '$eq': docObj.SONUMBER
            },
            'rows.itemNo': {
                '$eq': docObj.SOITEM
            }
        }
    }, function (err, result) {
        if (result.docs.length > 0) {
            var data = result.docs[0];
            logger.info('update the information of the SO');
            local.readDocument(data._id, function (err, soKeyItem) {
                if (docObj.SOCDATE) {
                    soKeyItem.rows.orderCreateDate = docObj.SOCDATE;
                }
                if (docObj.SONUMBER) {
                    soKeyItem.rows.soNo = docObj.SONUMBER;
                }
                if (docObj.PONO) {
                    soKeyItem.rows.poNo = docObj.PONO;
                }
                if (docObj.CPONO) {
                    soKeyItem.rows.cPoNo = docObj.CPONO;
                }
                if (docObj.SOTYPE) {
                    soKeyItem.rows.soType = docObj.SOTYPE;
                }
                if (docObj.SOITEM) {
                    soKeyItem.rows.itemNo = docObj.SOITEM;
                }
                if (docObj.PARTSNO) {
                    soKeyItem.rows.partNo = docObj.PARTSNO;
                }
                local.updateDocument(soKeyItem, callback);
            });

        } else {
            var insertObject = {
                "type": "sokey",
                "rows": {
                    'orderCreateDate': docObj.SOCDATE,
                    'soNo': docObj.SONUMBER,
                    'poNo': docObj.PONO,
                    'cPoNo': docObj.CPONO,
                    'soType': docObj.SOTYPE,
                    'itemNo': docObj.SOITEM,
                    'partNo': docObj.PARTSNO
                }
            };
            local.createDocument(insertObject, callback);
        }
    });
};
var queryItemNo = function (query, callback) {
    logger.debug('queryItemNo:', query);
    var selector = {
        "rows": {}
    };
    if (query.startDate) {
        query.startDate = query.startDate.replace(/-/g, '');
        selector.rows.orderCreateDate = {"$gte": query.startDate};
    }
    if (query.endDate) {
        query.endDate = query.endDate.replace(/-/g, '');
        selector.rows.orderCreateDate = {"$lte": query.endDate};
    }
    if (query.soNo) {
        selector.rows.soNo = {"$eq": query.soNo};
    }
    if (query.poNo) {
        selector.rows.poNo = {"$eq": query.poNo};
    }
    if (query.cPoNo) {
        selector.rows.cPoNo = {"$eq": query.cPoNo};
    }
    if (query.soType) {
        selector.rows.soType = {"$eq": query.soType};
    }
    if (query.partNo) {
        selector.rows.partNo = {"$eq": query.partNo};
    }
    db.find({
        selector: selector
    }, function (err, data) {
        // db.get('users', function (err, data) {
        logger.debug('queryItemNo Error:', err);
        logger.info('queryItemNo Data:', data);
        var queryData = [];
        data.docs.forEach(item => {
            var keyObj = {
                KeyPrefix: query.keyprefix,
                KeysStart: [],
                KeysEnd: []
            }
            keyObj.KeysStart.push(item.rows.soNo);
            keyObj.KeysStart.push(item.rows.itemNo);
            queryData.push(keyObj);
            logger.info('Return item:', keyObj);
        });
        callback(queryData);
    });

};

var login = function (userid, password, callback) {
    logger.debug('Login Data userid:', userid);
    logger.debug('Login Data password:', password);
    db.find({
        selector: {
            'rows.userid': {
                '$eq': userid
            },
            'rows.password': {
                '$eq': password
            }
        }
    }, function (err, data) {
        // db.get('users', function (err, data) {
        logger.debug('Login Error:', err);
        logger.info('Login Data:', data);

        callback(data.docs);
    });

};

// create a document
var createDocument = function (docObj, callback) {
    logger.debug("Creating document ");
    // we are specifying the id of the document so we can update and delete it later
    db.insert(docObj, function (err, data) {
        logger.debug('Error:', err);
        logger.debug('Data:', data);
        callback(err, data);
    });
};

// read a document
var readDocument = function (docName, callback) {
    logger.debug("Reading document 'mydoc'");
    db.get(docName, function (err, data) {
        logger.debug('Error:', err);
        logger.debug('Data:', data);
        callback(err, data);
    });
};

// update a document
var updateDocument = function (doc, callback) {
    logger.debug("Updating document");
    // make a change to the document, using the copy we kept from reading it back
    db.insert(doc, function (err, data) {
        logger.debug('Error:', err);
        logger.debug('Data:', data);
        // keep the revision of the update so we can delete it
        doc._rev = data.rev;
        callback(err, data);
    });
};

// deleting a document
var deleteDocument = function (doc, callback) {
    logger.debug("Deleting document 'mydoc'");
    // supply the id and revision to be deleted
    db.destroy(doc._id, doc._rev, function (err, data) {
        logger.debug('Error:', err);
        logger.debug('Data:', data);
        callback(err, data);
    });
};

var insertAttachment = function (fileName, doc, callback) {
    //db.attachment.insert(docname, attname, att, contenttype, [params], [callback])
    fs.readFile(fileName, function (err, data) {
        if (!err) {
            db.attachment.insert('rabbit', 'rabbit.png', data, 'image/png',
                {rev: '12-150985a725ec88be471921a54ce91452'}, function (err, body) {
                    if (!err)
                        console.log(body);
                });
        }
    });
};
var getAttachment = function (fileName, doc, callback) {
    // db.attachment.get(docname, attname, [params], [callback])
    db.attachment.get('rabbit', 'rabbit.png', function (err, body) {
        if (!err) {
            fs.writeFile('rabbit.png', body);
        }
    });
};
exports.login = login;
exports.queryItemNo = queryItemNo;
exports.insertAttachment = insertAttachment;
exports.getAttachment = getAttachment;
exports.createDocument = createDocument;
exports.readDocument = readDocument;
exports.updateDocument = updateDocument;
exports.deleteDocument = deleteDocument;
exports.insertSoSearchDocument = insertSoSearchDocument;
exports.insertSearchDocument = insertSearchDocument;