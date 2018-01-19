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
    } else if (keyprefix === 'CPO') {
        return prepareODMSearchData(respObj);
    } else if (keyprefix === 'SUP') {
        return prepareSupplierSearchData(respObj);
    }

};

var prepareSOSearchData = function (data) {
    var res = {};
    res.SONUMBER = data.SONUMBER;
    res.SOITEM = data.SOITEM;
    res.PONO = data.PONO;
    res.POITEM = data.POITEM;

    if (data.SalesOrder) {
        var soData = data.SalesOrder;
        res.SOTYPE = soData.SOTYPE;
        res.SOCDATE = soData.SOCDATE;
        res.SOQTY = soData.SOQTY;
        res.UNIT = soData.UNIT;
        res.PARTSNO = soData.PARTSNO;
        res.PARTSDESC = soData.PARTSDESC;
        res.VENDORNO = soData.VENDORNO;
        res.VENDORNAME = soData.VENDORNAME;
        res.CRAD = soData.CRAD;
        res.SOLDTO = soData.SOLDTO;
        res.NAME_AG = soData.NAME1_AG;
        res.NAME1_AG = soData.NAME1_AG + ' ' + soData.NAME2_AG;
        res.NAME2_AG = soData.NAME2_AG;
        res.CPONO = soData.CPONO;
        res.CITY_WE = soData.CITY_WE;
        res.PRNO = soData.PRNO;
    }


    if (data.PurchaseOrder) {
        var poData = data.PurchaseOrder;
        // res.PONO = poData.PONO;
        // res.POItemNO = poData.POItemNO;
        res.POTYPE = poData.POTYPE;
        res.PODate = poData.PODate;
        res.PARTSNO = poData.PARTSNO;
        res.POQty = poData.POQty;
        res.Unit = poData.Unit;
        // res.PARTSDESC = poData.PARTSDESC;
        // res.PARTSNO = poData.PARTSNO;
        // res.VENDORNO = poData.VENDORNO;
        // res.VENDORNAME = poData.VENDORNAME;
        res.OANO = poData.OANO;
        res.OAName = poData.OAName;
        res.ContractNO = poData.ContractNO;
        res.ContractItemNO = poData.ContractItemNO;
    }

    res.data = [];
    if (data.PurchaseOrder) {
        var poData = data.PurchaseOrder;
        if (poData.InboundDelivery) {
            poData.InboundDelivery.forEach(indnItem => {
                var item = {};
                item.OAName = poData.OAName;
                item.OANO = poData.OANO;
                item.PONO = data.PONO;
                item.DlvyQty = indnItem.DlvyQty;
                item.ASNNO = indnItem.ASNNO;
                item.IBDNNUMBER = indnItem.IBDNNUMBER;
                item.IDDlvyDate = indnItem.IDDlvyDate;
                if (poData.GRInfos) {
                    poData.GRInfos.filter(grItem => indnItem.ASNNO === grItem.SupDeliveryNote).forEach(grItem => {
                        item.GRNO = grItem.GRNO;
                        if (poData.Invoice) {
                            poData.Invoice.filter(invoiceItem => invoiceItem.GRNO === grItem.GRNO)
                                .forEach(invoiceItem => {
                                    item.INVOICE = invoiceItem.InvNO + ' ' + invoiceItem.FiscalYear;
                                });
                        }
                    });
                }
                if (poData.SupplierOrders) {
                    poData.SupplierOrders.filter(supItem => supItem.ASNNumber === indnItem.ASNNO).forEach(supItem => {
                        item.PackingList = supItem.PackingList;
                    });
                }

                if (data.SalesOrder) {
                    var soData = data.SalesOrder;
                    item.Customer = soData.SOLDTO + '/' + soData.NAME1_AG + ' ' + soData.NAME2_AG;
                    item.SONUMBER = data.SONUMBER;
                    item.PARTSNO = soData.PARTSNO;
                    item.PARTSDESC = soData.PARTSDESC;
                    item.CRAD = soData.CRAD;
                    if (soData.GIINFOS) {
                        soData.GIINFOS.filter(giItem => giItem.IBDNNUMBER === indnItem.IBDNNUMBER)
                            .forEach(giItem => {
                                item.DNNUMBER = giItem.DNNUMBER;
                                item.DNDATE = giItem.DNDATE;
                                if (soData.BILLINFOS) {
                                    soData.BILLINFOS.filter(blItem => blItem.DNNUMBER === giItem.DNNUMBER).forEach(blItem => {
                                        item.PROINV = blItem.PROINV;
                                        item.PROINVITEM = blItem.PROINVITEM;
                                        item.BILLINGNO = blItem.BILLINGNO;
                                        item.BILLINGITEM = blItem.BILLINGITEM;
                                        if (soData.ODMPayments) {
                                            soData.ODMPayments.filter(odmItem => blItem.BILLINGNO === odmItem.BILLINGNO)
                                                .forEach(odmItem => {
                                                    item.INVOICESTATUS = odmItem.INVOICESTATUS;
                                                    item.PAYMENTDATE = odmItem.PAYMENTDATE;
                                                    item.CGRNO = odmItem.GRNO;
                                                    item.GRQty = 0;
                                                    if (soData.ODMGRInfos) {
                                                        soData.ODMGRInfos.filter(odmgr => odmgr.GRNO === odmItem.GRNO)
                                                            .forEach(odmgr => {
                                                                item.GRQty += parseInt(odmgr.GRQTY);
                                                            });
                                                    }
                                                });
                                        }
                                    });
                                }
                            });
                    }
                }
                res.data.push(item);
            });
        }
    } else if (data.SalesOrder) {
        var soData = data.SalesOrder;
        if (soData.GIINFOS) {
            soData.GIINFOS.forEach(giItem => {
                var item = {};
                item.Customer = soData.SOLDTO + '/' + soData.NAME1_AG + ' ' + soData.NAME2_AG;
                item.SONUMBER = data.SONUMBER;
                item.PARTSNO = soData.PARTSNO;
                item.PARTSDESC = soData.PARTSDESC;
                item.CRAD = soData.CRAD;

                item.DNNUMBER = giItem.DNNUMBER;
                item.DNDATE = giItem.DNDATE;
                if (soData.BILLINFOS) {
                    soData.BILLINFOS.filter(blItem => blItem.DNNUMBER === giItem.DNNUMBER).forEach(blItem => {
                        item.PROINV = blItem.PROINV;
                        item.PROINVITEM = blItem.PROINVITEM;
                        item.BILLINGNO = blItem.BILLINGNO;
                        item.BILLINGITEM = blItem.BILLINGITEM;
                        if (soData.ODMPayments) {
                            soData.ODMPayments.filter(odmItem => blItem.BILLINGNO === odmItem.BILLINGNO).forEach(odmItem => {
                                item.INVOICESTATUS = odmItem.INVOICESTATUS;
                                item.PAYMENTDATE = odmItem.PAYMENTDATE;
                                item.CGRNO = odmItem.GRNO;
                                item.GRQty = 0;
                                if (soData.ODMGRInfos) {
                                    soData.ODMGRInfos.filter(odmgr => odmgr.GRNO === odmItem.GRNO)
                                        .forEach(odmgr => {
                                            item.GRQty += parseInt(odmgr.GRQTY);
                                        });
                                }
                            });
                        }
                    });
                }
                if (data.PurchaseOrder) {
                    var poData = data.PurchaseOrder;
                    item.OAName = poData.OAName;
                    item.OANO = poData.OANO;
                    item.PONO = data.PONO;
                    if (poData.InboundDelivery) {
                        poData.InboundDelivery.filter(inbdItem => giItem.IBDNNUMBER === inbdItem.IBDNNUMBER)
                            .forEach(inbdItem => {
                                item.DlvyQty = inbdItem.DlvyQty;
                                item.ASNNO = inbdItem.ASNNO;
                                item.IBDNNUMBER = inbdItem.IBDNNUMBER;
                                item.IDDlvyDate = inbdItem.IDDlvyDate;

                                if (poData.GRInfos) {
                                    poData.GRInfos.filter(grItem => inbdItem.ASNNO === grItem.SupDeliveryNote)
                                        .forEach(grItem => {
                                            item.GRNO = grItem.GRNO;
                                            if (poData.Invoice) {
                                                poData.Invoice.filter(invoiceItem => invoiceItem.GRNO === grItem.GRNO)
                                                    .forEach(invoiceItem => {
                                                        item.INVOICE = invoiceItem.InvNO + ' ' + invoiceItem.FiscalYear;
                                                    });
                                            }
                                        });
                                }
                                if (poData.SupplierOrders) {
                                    poData.SupplierOrders.filter(supItem => supItem.ASNNumber === inbdItem.ASNNO)
                                        .forEach(supItem => {
                                            item.PackingList = supItem.PackingList;
                                        });
                                }
                            });
                    }
                }
                res.data.push(item);
            });
        }
    }

    return res;
};

var preparePOSearchData = function (data) {
    var res = {};
    res.SONUMBER = data.SONUMBER;
    res.SOITEM = data.SOITEM;
    res.PONO = data.PONO;
    res.POITEM = data.POITEM;
    if (data.PurchaseOrder) {
        var poData = data.PurchaseOrder;
        res.POTYPE = poData.POTYPE;
        res.PODate = poData.PODate;
        res.PARTSNO = poData.PARTSNO;
        res.POQty = poData.POQty;
        res.Unit = poData.Unit;
        res.PARTSDESC = poData.PARTSDESC;
        res.PARTSNO = poData.PARTSNO;
        res.VENDORNO = poData.VendorNO;
        res.VENDORNAME = poData.VendorName;
        res.OANO = poData.OANO;
        res.OAName = poData.OAName;
        res.ContractNO = poData.ContractNO;
        res.ContractItemNO = poData.ContractItemNO;
    }

    if (data.SalesOrder) {
        var soData = data.SalesOrder;
        res.SONUMBER = soData.SONUMBER;
        res.SOITEM = soData.SOITEM;
        res.SOTYPE = soData.SOTYPE;
        res.SOCDATE = soData.SOCDATE;
        res.SOQTY = soData.SOQTY;
        res.UNIT = soData.UNIT;
        res.CRAD = soData.CRAD;
        res.SOLDTO = soData.SOLDTO;
        res.NAME_AG = soData.NAME1_AG + ' ' + soData.NAME2_AG;
        res.NAME1_AG = soData.NAME1_AG;
        res.NAME2_AG = soData.NAME2_AG;
        res.CPONO = soData.CPONO;
        res.CITY_WE = soData.CITY_WE;
        res.PRNO = soData.PRNO;
    }
    res.data = [];
    if (data.PurchaseOrder) {
        var poData = data.PurchaseOrder;
        if (poData.InboundDelivery) {
            poData.InboundDelivery.forEach(indnItem => {
                var item = {};
                item.OAName = poData.OAName;
                item.OANO = poData.OANO;
                item.PONO = data.PONO;
                item.PARTSDESC = poData.PARTSDESC;
                item.PARTSNO = poData.PARTSNO;
                item.DlvyQty = indnItem.DlvyQty;
                item.ASNNO = indnItem.ASNNO;
                item.IBDNNUMBER = indnItem.IBDNNUMBER;
                item.IDDlvyDate = indnItem.IDDlvyDate;
                if (poData.GRInfos) {
                    poData.GRInfos.filter(grItem => indnItem.ASNNO === grItem.SupDeliveryNote).forEach(grItem => {
                        item.GRNO = grItem.GRNO;
                        if (poData.Invoice) {
                            poData.Invoice.filter(invoiceItem => invoiceItem.GRNO === grItem.GRNO)
                                .forEach(invoiceItem => {
                                    item.INVOICE = invoiceItem.InvNO + ' ' + invoiceItem.FiscalYear;
                                });
                        }
                    });
                }
                if (poData.SupplierOrders) {
                    poData.SupplierOrders.filter(supItem => supItem.ASNNumber === indnItem.ASNNO).forEach(supItem => {
                        item.PackingList = supItem.PackingList;
                    });
                }

                if (data.SalesOrder) {
                    var soData = data.SalesOrder;
                    if (soData.SOLDTO) {
                        item.Customer = soData.SOLDTO + '/' + soData.NAME1_AG + ' ' + soData.NAME2_AG;
                    }
                    item.SONUMBER = data.SONUMBER;

                    item.CRAD = soData.CRAD;
                    if (soData.GIINFOS) {
                        soData.GIINFOS.filter(giItem => giItem.IBDNNUMBER === indnItem.IBDNNUMBER)
                            .forEach(giItem => {
                                item.DNNUMBER = giItem.DNNUMBER;
                                item.DNDATE = giItem.DNDATE;
                                if (soData.BILLINFOS) {
                                    soData.BILLINFOS.filter(blItem => blItem.DNNUMBER === giItem.DNNUMBER)
                                        .forEach(blItem => {
                                        item.PROINV = blItem.PROINV;
                                        item.PROINVITEM = blItem.PROINVITEM;
                                        item.BILLINGNO = blItem.BILLINGNO;
                                        item.BILLINGITEM = blItem.BILLINGITEM;
                                        if (soData.ODMPayments) {
                                            soData.ODMPayments.filter(odmItem => blItem.BILLINGNO === odmItem.BILLINGNO)
                                                .forEach(odmItem => {
                                                    item.INVOICESTATUS = odmItem.INVOICESTATUS;
                                                    item.PAYMENTDATE = odmItem.PAYMENTDATE;
                                                    item.CGRNO = odmItem.GRNO;
                                                    item.GRQty = 0;
                                                    if (soData.ODMGRInfos) {
                                                        soData.ODMGRInfos.filter(odmgr => odmgr.GRNO === odmItem.GRNO)
                                                            .forEach(odmgr => {
                                                                item.GRQty += parseInt(odmgr.GRQTY);
                                                            });
                                                    }
                                                });
                                        }
                                    });
                                }
                            });
                    }
                }
                res.data.push(item);
            });
        }
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

    if (data.SalesOrder) {
        var soData = data.SalesOrder;
        res.SOTYPE = soData.SOTYPE;
        res.PARTSNO = soData.PARTSNO;
        res.PARTSDESC = soData.PARTSDESC;
        res.SOQTY = soData.SOQTY;
        res.UNIT = soData.UNIT;
        res.VENDORNO = soData.VENDORNO;
        res.VENDORNAME = soData.VENDORNAME;
        res.CRAD = soData.CRAD;
        res.CITY_WE = soData.CITY_WE;
    }
    if (data.PurchaseOrder) {
        var poData = data.PurchaseOrder;
        res.OANO = poData.OANO; // PO
        res.OAName = poData.OAName; // PO
    }


    res.data = [];
    if (data.Payments) {
        data.Payments.forEach(odmItem => {
            var item = {};
            item.CPONO = data.CPONO;
            item.SONUMBER = data.SONUMBER;
            if (data.PurchaseOrder) {
                var poData = data.PurchaseOrder;
                item.OA = poData.OANO + ' ' + poData.OAName;
            }
            if (data.SalesOrder) {
                var soData = data.SalesOrder;
                item.PARTSNO = soData.PARTSNO;
                item.CRAD = soData.CRAD;
            }

            item.INVOICESTATUS = odmItem.INVOICESTATUS;
            item.PAYMENTDATE = odmItem.PAYMENTDATE;
            item.BILLINGNO = odmItem.BILLINGNO;
            item.CGRNO = odmItem.GRNO;
            item.GRQty = 0;
            if (data.GRInfos) {
                data.GRInfos.filter(odmgr => odmgr.GRNO === odmItem.GRNO)
                    .forEach(odmgr => {
                        item.GRQty += parseInt(odmgr.GRQTY);
                    });
            }
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

            res.data.push(item);
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
    res.PackingList = data.PackingList;
    if (data.PurchaseOrder) {
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
    }
    if (data.SalesOrder) {
        res.CRAD = data.SalesOrder.CRAD;
        res.NAME_AG = data.SalesOrder.NAME1_AG + ' ' + data.SalesOrder.NAME2_AG;
        res.NAME1_AG = data.SalesOrder.NAME1_AG;
        res.NAME2_AG = data.SalesOrder.NAME2_AG;
        res.CPONO = data.SalesOrder.CPONO;
        res.CITY_WE = data.SalesOrder.CITY_WE;
        res.SOLDTO = data.SalesOrder.SOLDTO;
    }

    res.data = [];

    if (data.PurchaseOrder && data.PurchaseOrder.InboundDelivery) {
        data.PurchaseOrder.InboundDelivery.filter(inbdItem => inbdItem.ASNNO === data.ASNNumber)
            .forEach(inbdItem => {
                var item = {};
                if (data.SalesOrder) {
                    item.CRAD = data.SalesOrder.CRAD;
                    item.Customer = data.SalesOrder.SOLDTO + '/' + data.SalesOrder.NAME1_AG + ' ' + data.SalesOrder.NAME2_AG;
                }
                if (data.PurchaseOrder) {
                    item.PONumber = data.PONumber;
                    item.OA = data.PurchaseOrder.OANO + ' ' + data.PurchaseOrder.OAName;
                    item.PARTSNO = data.PurchaseOrder.PARTSNO;
                    item.PARTSDESC = data.PurchaseOrder.PARTSDESC;
                }
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
                item.PackingList = data.PackingList;
                if (data.SalesOrder && data.SalesOrder.GIInfo) {
                    data.SalesOrder.GIInfo.filter(giItem => giItem.IBDNNUMBER === inbdItem.IBDNNUMBER).forEach(giItem => {
                        item.DNNUMBER = giItem.DNNUMBER;
                        item.DNITEM = giItem.DNITEM;
                        item.DNDATE = giItem.DNDATE;
                    });
                }
                res.data.push(item);
            });
    }
    return res;
};

exports.prepareSearchData = prepareSearchData;