'use strict';
var cfenv = require('cfenv');
var log4js = require('log4js');
var logger = log4js.getLogger('CloudantAPI');
// var Cloudant = require('cloudant');
var fs = require('fs');
var appEnv = cfenv.getAppEnv();
var nano, db;
var dbCreds = appEnv.getServiceCreds('Cloudant NoSQL DB-gp');
var dbname = 'buy_sell';


if (dbCreds) {
    logger.info('URL is ' + dbCreds.url);
    nano = require('nano')(dbCreds.url);
    db = nano.use(dbname);
} else {
    logger.error('NO DB!');
}
var insertSearchDocument = function (roleId, item, vendorNo, callback) {
    logger.debug('insertSearchDocument:', roleId);
    if (item.TRANSDOC === 'SO') {
        insertSoSearchDocument(roleId, item, vendorNo, callback);
        insertODMSearchDocument(roleId, item, vendorNo, callback);
    } else if (item.TRANSDOC === 'PO') {
        insertPoSearchDocument(roleId, item, vendorNo, callback);
    } else if (item.TRANSDOC === 'SUP') {
        let poItem = item.poitem;
        insertSupplierSearchDocument(roleId, poItem, item, vendorNo, callback);
    }

};
var queryItemNo = function (query, vendorNo, callback) {
    logger.debug('queryItemNo:', query);
    if (query.keyprefix === 'SO') {
        querySoKeyNo(query, vendorNo, callback);
    } else if (query.keyprefix === 'PO') {
        queryPoKeyNo(query, vendorNo, callback);
    } else if (query.keyprefix === 'CPO') {
        queryODMKeyNo(query, vendorNo, callback);
    } else if (query.keyprefix === 'SUP') {
        querySupplierKeyNo(query, vendorNo, callback);
    }

}
var insertSoSearchDocument = function (roleId, docObj, vendorNo, callback) {
    logger.debug('insertSearchDocument--SO--', docObj);
    // var local = this;
    if (docObj.SOCDATE) {
        docObj.SOCDATE = docObj.SOCDATE.replace(/-/g, '');
    }
    db.find({
        selector: {
            "type": "sokey",
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
            logger.info('update the information of the SO', data);
            readDocument(data._id, function (err, dataItem) {
                if (docObj.SOCDATE) {
                    dataItem.rows.orderCreateDate = docObj.SOCDATE;
                }
                if (docObj.SONUMBER) {
                    dataItem.rows.soNo = docObj.SONUMBER;
                }
                if (docObj.PONO) {
                    dataItem.rows.poNo = docObj.PONO;
                }
                if (docObj.CPONO) {
                    dataItem.rows.cPoNo = docObj.CPONO;
                }
                if (docObj.SOTYPE) {
                    dataItem.rows.soType = docObj.SOTYPE;
                }
                if (docObj.SOITEM) {
                    dataItem.rows.itemNo = docObj.SOITEM;
                }
                if (docObj.PARTSNO) {
                    dataItem.rows.partNo = docObj.PARTSNO;
                }
                if (docObj.VENDORNO) {
                    dataItem.rows.vendorNo = docObj.VENDORNO;
                }
                if (docObj.PRNO) {
                    dataItem.rows.prNo = docObj.PRNO;
                }
                updateDocument(dataItem, callback);
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
                    'partNo': docObj.PARTSNO,
                    'vendorNo': docObj.VENDORNO,
                    'prNo': docObj.PRNO
                }
            };
            logger.info('insert the information of the SO', insertObject);
            createDocument(insertObject, callback);
        }
    });
};
var insertPoSearchDocument = function (roleId, docObj, vendorNo, callback) {
    logger.debug('insertSearchDocument--PO--', docObj);
    // var local = this;
    if (docObj.PODate) {
        docObj.PODate = docObj.PODate.replace(/-/g, '');
    }
    db.find({
        selector: {
            "type": "pokey",
            'rows.poNo': {
                '$eq': docObj.PONO
            },
            'rows.itemNo': {
                '$eq': docObj.POItemNO
            }
        }
    }, function (err, result) {
        if (result.docs.length > 0) {
            var data = result.docs[0];
            logger.info('update the information of the PO', data);
            readDocument(data._id, function (err, dataItem) {
                if (docObj.PODate) {
                    dataItem.rows.orderCreateDate = docObj.PODate;
                }
                if (docObj.PONO) {
                    dataItem.rows.poNo = docObj.PONO;
                }
                if (docObj.POTYPE) {
                    dataItem.rows.poType = docObj.POTYPE;
                }
                if (docObj.POItemNO) {
                    dataItem.rows.itemNo = docObj.POItemNO;
                }
                if (docObj.PARTSNO) {
                    dataItem.rows.partNo = docObj.PARTSNO;
                }
                if (docObj.VENDORNO) {
                    dataItem.rows.vendorNo = docObj.VENDORNO;
                }

                updateDocument(dataItem, callback);
            });

        } else {
            var insertObject = {
                "type": "pokey",
                "rows": {
                    'orderCreateDate': docObj.PODate,
                    'poNo': docObj.PONO,
                    'itemNo': docObj.POItemNO,
                    'poType': docObj.POTYPE,
                    'partNo': docObj.PARTSNO,
                    'vendorNo': docObj.VENDORNO
                }
            };
            logger.info('insert the information of the PO', insertObject);
            createDocument(insertObject, callback);
        }
    });
};
var insertODMSearchDocument = function (roleId, docObj, vendorNo, callback) {
    logger.debug('insertSearchDocument--ODM--', docObj);
    // var local = this;
    if (docObj.SOCDATE) {
        docObj.SOCDATE = docObj.SOCDATE.replace(/-/g, '');
    }
    db.find({
        selector: {
            "type": "odmkey",
            'rows.cPoNo': {
                '$eq': docObj.CPONO
            }
        }
    }, function (err, result) {
        if (result.docs.length > 0) {
            var data = result.docs[0];
            logger.info('update the information of the ODM', data);
            readDocument(data._id, function (err, dataItem) {
                if (docObj.SOCDATE) {
                    dataItem.rows.orderCreateDate = docObj.SOCDATE;
                }
                if (docObj.CPONO) {
                    dataItem.rows.cPoNo = docObj.CPONO;
                }
                if (docObj.SONUMBER) {
                    dataItem.rows.soNo = docObj.SONUMBER;
                }
                if (docObj.SOITEM) {
                    dataItem.rows.itemNo = docObj.SOITEM;
                }
                if (docObj.PARTSNO) {
                    dataItem.rows.partNo = docObj.PARTSNO;
                }
                if (docObj.VENDORNO) {
                    dataItem.rows.vendorNo = docObj.VENDORNO;
                }

                updateDocument(dataItem, callback);
            });

        } else {
            var insertObject = {
                "type": "odmkey",
                "rows": {
                    'orderCreateDate': docObj.SOCDATE,
                    'soNo': docObj.SONUMBER,
                    'cPoNo': docObj.CPONO,
                    'itemNo': docObj.SOITEM,
                    'partNo': docObj.PARTSNO,
                    'vendorNo': docObj.VENDORNO
                }
            };
            logger.info('insert the information of the ODM', insertObject);
            createDocument(insertObject, callback);
        }
    });
};
var insertSupplierSearchDocument = function (roleId, poItem, docObj, vendorNo, callback) {
    logger.debug('insertSearchDocument--Supplier--', docObj);
    // var local = this;
    if (poItem.PODate) {
        poItem.PODate = poItem.PODate.replace(/-/g, '');
    }
    db.find({
        selector: {
            "type": "supplierkey",
            'rows.vendorNo': {
                '$eq': vendorNo
            },
            'rows.ASNNumber': {
                '$eq': docObj.ASNNumber
            }
        }
    }, function (err, result) {
        if (result.docs.length > 0) {
            var data = result.docs[0];
            logger.info('update the information of the Supplier', data);
            readDocument(data._id, function (err, dataItem) {
                if (poItem.PODate) {
                    dataItem.rows.orderCreateDate = poItem.PODate;
                }
                if (docObj.ASNNumber) {
                    dataItem.rows.ASNNumber = docObj.ASNNumber;
                }
                if (docObj.PONumber) {
                    dataItem.rows.poNo = docObj.PONumber;
                }
                if (docObj.POItem) {
                    dataItem.rows.itemNo = docObj.POItem;
                }
                if (poItem.PARTSNO) {
                    dataItem.rows.partNo = poItem.PARTSNO;
                }
                if (vendorNo) {
                    dataItem.rows.vendorNo = vendorNo;
                }
                updateDocument(dataItem, callback);
            });

        } else {
            var insertObject = {
                "type": "supplierkey",
                "rows": {
                    'orderCreateDate': poItem.PODate,
                    'ASNNumber': docObj.ASNNumber,
                    'poNo': docObj.PONumber,
                    'itemNo': docObj.POItem,
                    'partNo': poItem.PARTSNO,
                    'vendorNo': vendorNo
                }
            };
            logger.info('insert the information of the Supplier Object ', insertObject);
            createDocument(insertObject, callback);
        }
    });
};

var querySoKeyNo = function (query, vendorNo, callback) {
    logger.debug('queryItemNo--SO:', query);
    var selector = {
        "type": "sokey",
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
    if (query.vendorNo) {
        selector.rows.vendorNo = {"$eq": query.vendorNo};
    }
    if (query.prNo) {
        selector.rows.prNo = {"$eq": query.prNo};
    }
    db.find({
        selector: selector
    }, function (err, data) {
        // db.get('users', function (err, data) {
        logger.debug('querySoKeyNo Error:', err);
        logger.info('querySoKeyNo Data:', data);
        var queryData = [];
        data.docs.forEach(item => {
            var keyObj = {
                KeyPrefix: query.keyprefix,
                KeysStart: [],
                KeysEnd: []
            };
            keyObj.KeysStart.push(item.rows.soNo);
            keyObj.KeysStart.push(item.rows.itemNo);
            queryData.push(keyObj);
            logger.info('Return item:', keyObj);
        });
        callback(queryData);
    });

};
var queryPoKeyNo = function (query, vendorNo, callback) {
    logger.debug('queryItemNo--PO:', query);
    var selector = {
        "type": "pokey",
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
    if (query.poNo) {
        selector.rows.poNo = {"$eq": query.poNo};
    }
    if (query.poType) {
        selector.rows.poType = {"$eq": query.poType};
    }
    if (query.partNo) {
        selector.rows.partNo = {"$eq": query.partNo};
    }
    if (query.vendorNo) {
        selector.rows.vendorNo = {"$eq": query.vendorNo};
    }

    db.find({
        selector: selector
    }, function (err, data) {
        // db.get('users', function (err, data) {
        logger.debug('queryPoKeyNo Error:', err);
        logger.info('queryPoKeyNo Data:', data);
        var queryData = [];
        data.docs.forEach(item => {
            var keyObj = {
                KeyPrefix: query.keyprefix,
                KeysStart: [],
                KeysEnd: []
            };
            keyObj.KeysStart.push(item.rows.poNo);
            keyObj.KeysStart.push(item.rows.itemNo);
            queryData.push(keyObj);
            logger.info('Return item:', keyObj);
        });
        callback(queryData);
    });

};
var queryODMKeyNo = function (query, vendorNo, callback) {
    logger.debug('queryItemNo--ODM:', query);
    var selector = {
        "type": "odmkey",
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

    if (query.cPoNo) {
        selector.rows.cPoNo = {"$eq": query.cPoNo};
    }
    if (query.partNo) {
        selector.rows.partNo = {"$eq": query.partNo};
    }
    if (query.vendorNo) {
        selector.rows.vendorNo = {"$eq": query.vendorNo};
    }
    db.find({
        selector: selector
    }, function (err, data) {
        // db.get('users', function (err, data) {
        logger.debug('queryODMKeyNo Error:', err);
        logger.info('queryODMKeyNo Data:', data);
        var queryData = [];
        data.docs.forEach(item => {
            var keyObj = {
                KeyPrefix: query.keyprefix,
                KeysStart: [],
                KeysEnd: []
            };
            keyObj.KeysStart.push(item.rows.cPoNo);
            queryData.push(keyObj);
            logger.info('Return item:', keyObj);
        });
        callback(queryData);
    });

};
var querySupplierKeyNo = function (query, vendorNo, callback) {
    logger.debug('queryItemNo--Supplier:', query);
    var selector = {
        "type": "supplierkey",
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
    if (query.poNo) {
        selector.rows.poNo = {"$eq": query.poNo};
    }
    if (query.ASNNumber) {
        selector.rows.ASNNumber = {"$eq": query.ASNNumber};
    }
    if (query.partNo) {
        selector.rows.partNo = {"$eq": query.partNo};
    }
    if (vendorNo) {
        selector.rows.vendorNo = {"$eq": vendorNo};
    }

    db.find({
        selector: selector
    }, function (err, data) {
        // db.get('users', function (err, data) {
        logger.debug('querySupplierKeyNo Error:', err);
        logger.info('querySupplierKeyNo Data:', data);
        var queryData = [];
        data.docs.forEach(item => {
            var keyObj = {
                KeyPrefix: query.keyprefix,
                KeysStart: [],
                KeysEnd: []
            };
            keyObj.KeysStart.push(item.rows.vendorNo);
            keyObj.KeysStart.push(item.rows.ASNNumber);
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

var insertNewAttachment = function (fileId, attachement, callback) {
    readDocument(fileId, function (err, data) {
        logger.debug('insertNewAttachment search::', err);
        logger.debug('insertNewAttachment search:', data);
        if (data) {
            logger.debug('the data should be deleted');
            deleteDocument(data, function (err, data) {
                logger.debug('insert Data....');
                insertAttachment(fileId, attachement, callback);
            });
        } else {
            logger.debug('no data need to be deleted');
            insertAttachment(fileId, attachement, callback);
        }
    })
}
var destroyAttachment = function (fileId, attachment, callback) {
    logger.debug('destroyAttachment', fileId, attachment);
    // db.attachment.destroy(docname, attname, [params], [callback])
    db.attachment.destroy(fileId, attachment.originalFilename, function (err, body) {
        logger.debug('destroyAttachment::', err);
        logger.debug('destroyAttachment body::', body);
        callback(err, body);
    });
    // callback();
};

var insertAttachment = function (fileId, attachment, callback) {
    //db.attachment.insert(docname, attname, att, contenttype, [params], [callback])
    fs.readFile(attachment.path, function (err, data) {
        if (!err) {
            db.attachment.insert(fileId, attachment.originalFilename, data, attachment.type,
                function (err, body) {
                    if (!err) {
                        console.log(body);
                    }
                    callback(err, body);

                });
        }
    });
};
var getAttachment = function (doc, fileName, callback) {
    // db.attachment.get(docname, attname, [params], [callback])
    db.attachment.get(doc, fileName, function (err, body) {
        if (!err) {
            console.log('getAttachement...', body);
            fs.writeFile(doc, body, function (err) {
                callback(err, body);
            });
        } else {
            callback(err, body);
        }

    });
};

// create a document
var createDocument = function (docObj, callback) {
    logger.debug("Creating document ");
    // we are specifying the id of the document so we can update and delete it later
    db.insert(docObj, function (err, data) {
        logger.debug('createDocument Error:', err);
        logger.debug('createDocument Data:', data);
        callback(err, data);
    });
};

// read a document
var readDocument = function (docName, callback) {
    logger.debug("Reading document");
    db.get(docName, function (err, data) {
        logger.debug('readDocument Error:', err);
        logger.debug('readDocument Data:', data);
        callback(err, data);
    });
};

// update a document
var updateDocument = function (doc, callback) {
    logger.debug("Updating document");
    // make a change to the document, using the copy we kept from reading it back
    db.insert(doc, function (err, data) {
        logger.debug('updateDocument Error:', err);
        logger.debug('updateDocument Data:', data);
        // keep the revision of the update so we can delete it
        // doc._rev = data.rev;
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
exports.login = login;
exports.queryItemNo = queryItemNo;
exports.insertSearchDocument = insertSearchDocument;
exports.insertNewAttachment = insertNewAttachment;
exports.insertAttachment = insertAttachment;
exports.destroyAttachment = destroyAttachment;
exports.getAttachment = getAttachment;
