'use strict';
var cfenv = require('cfenv');
var log4js = require('log4js');
var logger = log4js.getLogger('LedgerData');

var prepareSearchData = function (keyprefix, respObj) {
    keyprefix = keyprefix.toUpperCase();
    if (keyprefix === 'SO') {
        return prepareSOSearchData(respObj);
    } else if (keyprefix === 'PO') {
        return preparePOSearchData(respObj);
    } else if (keyprefix === 'ODM') {
        return prepareODMSearchData(respObj);
    } else if (keyprefix === 'SUPPLIER') {
        return prepareSupplierSearchData(respObj);
    }

};

var prepareSOSearchData = function (data) {
    var res = {};
    res.SONUMBER = data.SONUMBER;
    res.SOITEM = data.SOITEM;
    res.SOTYPE = data.SOTYPE;
    res.SOCDATE = data.SOCDATE;
    res.SOQTY = data.SOQTY;
    res.UNIT = data.UNIT;
    res.PARTSNO = data.PARTSNO;
    res.PARTSDESC = data.PARTSDESC;
    res.VENDORNO = data.VENDORNO;
    res.VENDORNAME = data.VENDORNAME;
    res.CRAD = data.CRAD;
    res.SOLDTO = data.SOLDTO;
    res.NAME1_AG = data.NAME1_AG;
    res.NAME2_AG = data.NAME2_AG;
    res.CPONO = data.CPONO;
    res.CITY_WE = data.CITY_WE;
    res.PRNO = data.PRNO;
    res.PONO = data.PONO;
    res.POITEM = data.POITEM;
    res.data = [];
    if (data.GIINFOS) {
        data.GIINFOS.forEach(giItem => {
            var item = {};
            item.DNNUMBER = giItem.DNNUMBER;
            item.DNDATE = giItem.DNDATE;
            if (data.BILLINFOS) {
                data.BILLINFOS.filter(blItem => blItem.DNNUMBER === giItem.DNNUMBER).forEach(blItem => {
                    item.PROINV = blItem.PROINV;
                    item.PROINVITEM = blItem.PROINVITEM;
                    item.BILLINGNO = blItem.BILLINGNO;
                    item.BILLINGITEM = blItem.BILLINGITEM;
                    if (data.ODMPayments) {
                        data.ODMPayments.filter(odmItem => blItem.BILLINGNO === odmItem.BILLINGNO).forEach(odmItem => {
                            item.INVOICESTATUS = odmItem.INVOICESTATUS;
                            item.PAYMENTDATE = odmItem.PAYMENTDATE;
                        });
                    }
                });
            }
            res.data.push(...item);
        });
    }
    return res;
};

var preparePOSearchData = function (data) {
    var res = {};
    res.PONO = data.PONO;
    res.POItemNO = data.POItemNO;
    res.POTYPE = data.POTYPE;
    res.PODate = data.PODate;
    res.PARTSNO = data.PARTSNO;
    res.POQty = data.POQty;
    res.Unit = data.Unit;
    res.PARTSDESC = data.PARTSDESC;
    res.PARTSNO = data.PARTSNO;
    res.VENDORNO = data.VENDORNO;
    res.VENDORNAME = data.VENDORNAME;
    res.OANO = data.OANO;
    res.OAName = data.OAName;
    res.ContractNO = data.ContractNO;
    res.ContractItemNO = data.ContractItemNO;

    res.data = [];
    if (data.InboundDelivery) {
        data.InboundDelivery.forEach(indnItem => {
            var item = {};
            item.DlvyQty = indnItem.DlvyQty;
            item.ASNNO = indnItem.ASNNO;
            item.IBDNNUMBER = indnItem.IBDNNUMBER;
            item.IDDlvyDate = indnItem.IDDlvyDate;
            if (data.GRInfos) {
                data.GRInfos.filter(grItem => indnItem.ASNNO === grItem.SupDeliveryNote).forEach(grItem => {
                    item.GRNO = grItem.GRNO;
                });
            }
            if (data.SupplierOrders) {
                data.SupplierOrders.filter(supItem => supItem.ASNNumber === indnItem.ASNNO).forEach(supItem => {
                    item.PackingList = supItem.PackingList;
                });
            }
            res.data.push(...item);
        });
    }
    return res;
};

var prepareODMSearchData = function (data) {
    var res = {};
    res.CPONO = data.CPONO;
    res.SONUMBER = data.SONUMBER;
    res.SOITEM = data.SOITEM;
    res.PONO = data.PONO;
    res.POITEM = data.POITEM;

    res.SOTYPE = data.SalesOrder.SOTYPE;
    res.PARTSNO = data.SalesOrder.PARTSNO;
    res.PARTSDESC = data.SalesOrder.PARTSDESC;
    res.SOQTY = data.SalesOrder.SOQTY;
    res.UNIT = data.SalesOrder.UNIT;
    res.VENDORNO = data.SalesOrder.VENDORNO;
    res.VENDORNAME = data.SalesOrder.VENDORNAME;
    res.CRAD = data.SalesOrder.CRAD;
    res.CITY_WE = data.SalesOrder.CITY_WE;


    res.OANO = data.PurchaseOrder.OANO; // PO
    res.OAName = data.PurchaseOrder.OAName; // PO

    res.data = [];
    if (data.ODMPayments) {
        data.ODMPayments.forEach(odmItem => {
            var item = {};
            item.INVOICESTATUS = odmItem.INVOICESTATUS;
            item.PAYMENTDATE = odmItem.PAYMENTDATE;
            item.BILLINGNO = odmItem.BILLINGNO;
            if (data.SalesOrder && data.SalesOrder.BILLINFOS) {
                data.SalesOrder.BILLINFOS.filter(blItem => blItem.BILLINGNO === odmItem.BILLINGNO).forEach(blItem => {
                    item.PROINV = blItem.PROINV;
                    if (data.SalesOrder.GIInfo) {
                        data.SalesOrder.GIInfo.filter(giItem => giItem.DNNUMBER === blItem.DNNUMBER).forEach(giItem => {
                            if (data.PurchaseOrder && data.PurchaseOrder.InboundDelivery) {
                                data.PurchaseOrder.InboundDelivery.filter(inbdItem => inbdItem.IBDNNUMBER === giItem.IBDNNUMBER)
                                    .forEach(inbdItem => {
                                        item.IDDlvyDate = inbdItem.IDDlvyDate;
                                        if (data.PurchaseOrder.GRInfos) {
                                            data.PurchaseOrder.GRInfos.filter(grItem => inbdItem.ASNNO === grItem.SupDeliveryNote)
                                                .forEach(grItem => {
                                                    item.GRNO = grItem.GRNO;
                                                });
                                        }
                                        if (data.PurchaseOrder.SupplierOrders) {
                                            data.PurchaseOrder.SupplierOrders.filter(supItem => inbdItem.ASNNO === supItem.ASNNumber)
                                                .forEach(supItem => {
                                                    item.PackingList = supItem.PackingList;
                                                });
                                        }
                                    });
                            }
                        });
                    }
                });
            }

            res.data.push(...item);
        });
    }
    return res;
};

var prepareSupplierSearchData = function (data) {
    var res = {};
    res.ASNNumber = data.ASNNumber;
    res.VendorNO = data.VendorNO;
    res.PONumber = data.PONumber;
    res.POItem = data.POItem;

    res.POTYPE = data.PurchaseOrder.POTYPE;
    res.PARTSNO = data.PurchaseOrder.PARTSNO;
    res.POQty = data.PurchaseOrder.POQty;
    res.Unit = data.PurchaseOrder.Unit;
    res.PARTSDESC = data.PurchaseOrder.PARTSDESC;
    res.ContractNO = data.PurchaseOrder.ContractNO;
    res.ContractItemNO = data.PurchaseOrder.ContractItemNO;
    res.OANO = data.PurchaseOrder.OANO;
    res.OAName = data.PurchaseOrder.OAName;
    res.SONUMBER = data.PurchaseOrder.SONUMBER;
    res.SOITEM = data.PurchaseOrder.SOITEM;

    res.CRAD = data.SalesOrder.CRAD;
    res.NAME1_AG = data.SalesOrder.NAME1_AG;
    res.NAME2_AG = data.SalesOrder.NAME2_AG;
    res.CPONO = data.SalesOrder.CPONO;
    res.CITY_WE = data.SalesOrder.CITY_WE;
    res.SOLDTO = data.SalesOrder.SOLDTO;

    res.data = [];

    if (data.PurchaseOrder && data.PurchaseOrder.InboundDelivery) {
        data.PurchaseOrder.InboundDelivery.filter(inbdItem => inbdItem.ASNNO === data.ASNNumber)
            .forEach(inbdItem => {
                var item = {};
                item.IDDlvyDate = inbdItem.IDDlvyDate;
                item.ASNNO = inbdItem.ASNNO;
                item.IBDNNUMBER = inbdItem.IBDNNUMBER;
                item.TrackID = inbdItem.TrackID;
                item.MOT = inbdItem.MOT;
                item.TrackID = inbdItem.TrackID;
                item.DlvyQty = inbdItem.DlvyQty;
                item.TrackID = inbdItem.TrackID;
                if (data.PurchaseOrder.GRInfos) {
                    data.PurchaseOrder.GRInfos.filter(grItem => inbdItem.ASNNO === grItem.SupDeliveryNote)
                        .forEach(grItem => {
                            item.GRNO = grItem.GRNO;
                        });
                }
                if (data.PurchaseOrder.SupplierOrders) {
                    data.PurchaseOrder.SupplierOrders.filter(supItem => inbdItem.ASNNO === supItem.ASNNumber)
                        .forEach(supItem => {
                            item.PackingList = supItem.PackingList;
                        });
                }
                if (data.SalesOrder && data.SalesOrder.GIInfo) {
                    data.SalesOrder.GIInfo.filter(giItem => giItem.IBDNNUMBER === inbdItem.IBDNNUMBER).forEach(giItem => {
                        item.DNNUMBER = giItem.DNNUMBER;
                        item.DNITEM = giItem.DNITEM;
                        item.DNDATE = giItem.DNDATE;
                    });
                }
                res.data.push(...item);
            });
    }
    return res;
};

exports.prepareSearchData = prepareSearchData;