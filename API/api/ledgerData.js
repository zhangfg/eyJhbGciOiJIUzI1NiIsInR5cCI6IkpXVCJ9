'use strict';
var moment = require('moment');
var log4js = require('log4js');
var logger = log4js.getLogger('LedgerData');

var prepareSearchData = function (keyprefix, respObj, asnNO) {
    keyprefix = keyprefix.toUpperCase();
    if (keyprefix === 'SO') {
        return prepareSOSearchData(respObj);
    } else if (keyprefix === 'PO') {
        return preparePOSearchData(respObj);
    } else if (keyprefix === 'CPO') {
        return prepareODMSearchData(respObj);
    } else if (keyprefix === 'SUP') {
        return prepareSupplierPOSearchData(respObj, asnNO);
    } else if (keyprefix === 'SOI') {
        return prepareSOIData(respObj);
    } else if (keyprefix === 'LOI') {
        return prepareLOIData(respObj);
    }

};

var prepareSOSearchData = function (data) {
    var res = {};
    res.SONUMBER = data.SONUMBER;
    res.SOITEM = data.SOITEM;
    res.PONO = data.PONO;
    res.POITEM = data.POITEM;

    if (data.SalesOrder && data.SalesOrder.SONUMBER !== "") {
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


    if (data.PurchaseOrder && data.PurchaseOrder.PONO !== "") {
        var poData = data.PurchaseOrder;
        res.POTYPE = poData.POTYPE;
        res.PODate = poData.PODate;
        res.PARTSNO = poData.PARTSNO;
        res.POQty = poData.POQty;
        // res.Unit = poData.Unit;
        res.OANO = poData.OANO;
        res.OAName = poData.OAName;
        res.OA = poData.OANO + ' ' + poData.OAName;
        res.ContractNO = poData.ContractNO;
        res.ContractItemNO = poData.ContractItemNO;
    }

    res.data = [];
    if (data.PurchaseOrder && data.PurchaseOrder.PONO !== "") {
        var poData = data.PurchaseOrder;
        if (poData.InboundDelivery) {
            poData.InboundDelivery.forEach(indnItem => {
                var item = {};
                item.OAName = poData.OAName;
                item.OANO = poData.OANO;
                item.OA = poData.OANO + ' ' + poData.OAName;
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

                if (indnItem.SupplierOrder) {
                    item.PackingList = indnItem.SupplierOrder.PackingList;
                }
                if (data.SalesOrder && data.SalesOrder.SONUMBER !== "") {
                    var soData = data.SalesOrder;
                    item.Customer = soData.SOLDTO + '/' + soData.NAME1_AG + ' ' + soData.NAME2_AG;
                    item.SONUMBER = data.SONUMBER;
                    item.PARTSNO = soData.PARTSNO;
                    item.PARTSDESC = soData.PARTSDESC;
                    item.CRAD = soData.CRAD;

                    item.CGRInfos = [];
                    if (soData.ODMGRInfos) {
                        let GRNOs = [];
                        soData.ODMGRInfos.forEach(odmgr => {
                            // item.GRQty = odmgr.GRQTY;
                            // item.CGRNO = odmgr.GRNO;
                            let grInfo = {
                                CGRNO: odmgr.GRNO,
                                GRQty: odmgr.GRQTY
                            };
                            item.CGRInfos.push(grInfo);
                            GRNOs.push(odmgr.GRNO);
                        });
                        item.CGRNO = GRNOs.join(',');
                    }

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
                                                    // item.CGRNO = odmItem.GRNO;
                                                    // item.GRQty = 0;
                                                    // if (soData.ODMGRInfos) {
                                                    //     soData.ODMGRInfos.filter(odmgr => odmgr.GRNO === odmItem.GRNO)
                                                    //         .forEach(odmgr => {
                                                    //             item.GRQty += parseInt(odmgr.GRQTY);
                                                    //         });
                                                    // }
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
    } else if (data.SalesOrder && data.SalesOrder.SONUMBER !== "") {
        var soData = data.SalesOrder;
        logger.info('data.SalesOrder', data.SalesOrder);
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

                item.CGRInfos = [];
                if (soData.ODMGRInfos) {
                    let GRNOs = [];
                    soData.ODMGRInfos.forEach(odmgr => {
                        // item.GRQty = odmgr.GRQTY;
                        // item.CGRNO = odmgr.GRNO;
                        let grInfo = {
                            CGRNO: odmgr.GRNO,
                            GRQty: odmgr.GRQTY
                        };
                        item.CGRInfos.push(grInfo);
                        GRNOs.push(odmgr.GRNO);
                    });
                    item.CGRNO = GRNOs.join(',');
                }
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
                                // item.CGRNO = odmItem.GRNO;
                                // item.GRQty = 0;
                                // if (soData.ODMGRInfos) {
                                //     soData.ODMGRInfos.filter(odmgr => odmgr.GRNO === odmItem.GRNO)
                                //         .forEach(odmgr => {
                                //             item.GRQty += parseInt(odmgr.GRQTY);
                                //         });
                                // }
                            });
                        }
                    });
                }
                if (data.PurchaseOrder && data.PurchaseOrder.PONO !== "") {
                    var poData = data.PurchaseOrder;
                    item.OAName = poData.OAName;
                    item.OANO = poData.OANO;
                    item.OA = poData.OANO + ' ' + poData.OAName;
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
                                if (inbdItem.SupplierOrder) {
                                    item.PackingList = inbdItem.SupplierOrder.PackingList;
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
    if (data.PurchaseOrder && data.PurchaseOrder.PONO !== "") {
        var poData = data.PurchaseOrder;
        res.POTYPE = poData.POTYPE;
        res.PODate = poData.PODate;
        res.POQty = poData.POQty;
        res.Unit = poData.Unit;
        res.PARTSDESC = poData.PARTSDESC;
        res.PARTSNO = poData.PARTSNO;
        res.VENDORNO = poData.VendorNO;
        res.VENDORNAME = poData.VendorName;
        res.OANO = poData.OANO;
        res.OAName = poData.OAName;
        res.OA = poData.OANO + ' ' + poData.OAName;
        res.ContractNO = poData.ContractNO;
        res.ContractItemNO = poData.ContractItemNO;
    }

    if (data.SalesOrder && data.SalesOrder.SONUMBER !== "") {
        var soData = data.SalesOrder;
        res.SONUMBER = soData.SONUMBER;
        res.SOITEM = soData.SOITEM;
        res.SOTYPE = soData.SOTYPE;
        res.SOCDATE = soData.SOCDATE;
        res.SOQTY = soData.SOQTY;
        // res.UNIT = soData.UNIT;
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
    if (data.PurchaseOrder && data.PurchaseOrder.PONO !== "") {
        var poData = data.PurchaseOrder;
        if (poData.InboundDelivery) {
            poData.InboundDelivery.forEach(indnItem => {
                var item = {};
                item.OAName = poData.OAName;
                item.OANO = poData.OANO;
                item.OA = poData.OANO + ' ' + poData.OAName;
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
                if (indnItem.SupplierOrder) {
                    item.PackingList = indnItem.SupplierOrder.PackingList;
                }

                if (data.SalesOrder && data.SalesOrder.SONUMBER !== "") {
                    var soData = data.SalesOrder;
                    if (soData.SOLDTO) {
                        item.Customer = soData.SOLDTO + '/' + soData.NAME1_AG + ' ' + soData.NAME2_AG;
                    }
                    item.SONUMBER = data.SONUMBER;

                    item.CRAD = soData.CRAD;

                    item.CGRInfos = [];
                    if (soData.ODMGRInfos) {
                        let GRNOs = [];
                        soData.ODMGRInfos.forEach(odmgr => {
                            // item.GRQty = odmgr.GRQTY;
                            // item.CGRNO = odmgr.GRNO;
                            let grInfo = {
                                CGRNO: odmgr.GRNO,
                                GRQty: odmgr.GRQTY
                            };
                            item.CGRInfos.push(grInfo);
                            GRNOs.push(odmgr.GRNO);
                        });
                        item.CGRNO = GRNOs.join(',');
                    }

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
                                                        // item.CGRNO = odmItem.GRNO;
                                                        // item.GRQty = 0;
                                                        // if (soData.ODMGRInfos) {
                                                        //     soData.ODMGRInfos.filter(odmgr => odmgr.GRNO === odmItem.GRNO)
                                                        //         .forEach(odmgr => {
                                                        //             item.GRQty += parseInt(odmgr.GRQTY);
                                                        //         });
                                                        // }
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
    res.FLEXPONO = data.FLEXPONO;
    res.CPONO = data.CPONO;

    if (data.CPONOFLEXPONO) {
        var odmData = data.CPONOFLEXPONO;
        res.SONUMBER = odmData.SONUMBER;
        res.SOITEM = odmData.SOITEM;
        res.PONO = odmData.PONO;
        res.POITEM = odmData.POITEM;

        if (odmData.SalesOrder && odmData.SalesOrder.SONUMBER !== "") {
            var soData = odmData.SalesOrder;
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
        if (odmData.PurchaseOrder && odmData.PurchaseOrder.PONO !== "") {
            var poData = odmData.PurchaseOrder;
            res.OANO = poData.OANO; // PO
            res.OAName = poData.OAName; // PO
            res.OA = poData.OANO + ' ' + poData.OAName;
        }
    }

    res.data = [];
    if (data.ODMPayments) {
        data.ODMPayments.forEach(odmItem => {
            var item = {};
            item.CPONO = data.CPONO;
            item.FLEXPONO = data.FLEXPONO;

            if (data.CPONOFLEXPONO) {
                var odmData = data.CPONOFLEXPONO;
                item.SONUMBER = odmData.SONUMBER;
                if (odmData.PurchaseOrder && odmData.PurchaseOrder.PONO !== "") {
                    var poData = odmData.PurchaseOrder;
                    item.OA = poData.OANO + ' ' + poData.OAName;
                }
                if (odmData.SalesOrder && odmData.SalesOrder.SONUMBER !== "") {
                    var soData = odmData.SalesOrder;
                    item.PARTSNO = soData.PARTSNO;
                    item.CRAD = soData.CRAD;
                }
            }

            item.INVOICESTATUS = odmItem.INVOICESTATUS;
            item.PAYMENTDATE = odmItem.PAYMENTDATE;
            item.BILLINGNO = odmItem.BILLINGNO;
            item.CGRNO = odmItem.GRNO;
            item.GRQty = 0;
            if (data.ODMGRInfos) {
                data.ODMGRInfos.filter(odmgr => odmgr.GRNO === odmItem.GRNO)
                    .forEach(odmgr => {
                        item.GRQty += parseInt(odmgr.GRQTY);
                    });
            }
            if (data.CPONOFLEXPONO) {
                var odmData = data.CPONOFLEXPONO;
                if (odmData.SalesOrder && odmData.SalesOrder.SONUMBER !== "" && odmData.SalesOrder.BILLINFOS) {
                    odmData.SalesOrder.BILLINFOS.filter(blItem => blItem.BILLINGNO === odmItem.BILLINGNO).forEach(blItem => {
                        item.PROINV = blItem.PROINV;
                        if (odmData.SalesOrder.GIInfo) {
                            odmData.SalesOrder.GIInfo.filter(giItem => giItem.DNNUMBER === blItem.DNNUMBER).forEach(giItem => {
                                if (odmData.PurchaseOrder && odmData.PurchaseOrder.PONO !== "" && data.PurchaseOrder.InboundDelivery) {
                                    odmData.PurchaseOrder.InboundDelivery.filter(inbdItem => inbdItem.IBDNNUMBER === giItem.IBDNNUMBER)
                                        .forEach(inbdItem => {
                                            item.IDDlvyDate = inbdItem.IDDlvyDate;
                                            if (odmData.PurchaseOrder.GRInfos) {
                                                odmData.PurchaseOrder.GRInfos.filter(grItem => inbdItem.ASNNO === grItem.SupDeliveryNote)
                                                    .forEach(grItem => {
                                                        item.GRNO = grItem.GRNO;
                                                    });
                                            }

                                            if (inbdItem.SupplierOrder) {
                                                item.PackingList = inbdItem.SupplierOrder.PackingList;
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
    return res;
};

var prepareSupplierPOSearchData = function (data, asnNO) {

    var res = {};
    res.SONUMBER = data.SONUMBER;
    res.SOITEM = data.SOITEM;
    res.PONO = data.PONO;
    res.POITEM = data.POITEM;
    if (data.PurchaseOrder && data.PurchaseOrder.PONO !== "") {
        var poData = data.PurchaseOrder;
        res.POTYPE = poData.POTYPE;
        res.PODate = poData.PODate;
        res.PARTSNO = poData.PARTSNO;
        res.POQty = poData.POQty;
        res.Unit = poData.Unit;
        res.PARTSDESC = poData.PARTSDESC;
        res.ContractNO = poData.ContractNO;
        res.ContractItemNO = poData.ContractItemNO;
    }

    if (data.SalesOrder && data.SalesOrder.SONUMBER !== "") {
        var soData = data.SalesOrder;
        res.CRAD = soData.CRAD;
        res.NAME_AG = soData.NAME1_AG + ' ' + soData.NAME2_AG;
        res.CPONO = soData.CPONO;
        res.CITY_WE = soData.CITY_WE;
        res.SONUMBER = soData.SONUMBER;
        res.SOITEM = soData.SOITEM;
        res.SOTYPE = soData.SOTYPE;
    }
    res.data = [];
    if (data.PurchaseOrder && data.PurchaseOrder.PONO !== "") {
        var poData = data.PurchaseOrder;
        if (poData.InboundDelivery) {
            poData.InboundDelivery.forEach(indnItem => {
                var item = {};
                item.OAName = poData.OAName;
                item.OANO = poData.OANO;
                item.OA = poData.OANO + ' ' + poData.OAName;
                item.PONO = data.PONO;
                item.PARTSDESC = poData.PARTSDESC;
                item.PARTSNO = poData.PARTSNO;
                item.DlvyQty = indnItem.DlvyQty;
                item.ASNNO = indnItem.ASNNO;
                item.IBDNNUMBER = indnItem.IBDNNUMBER;
                item.TrackID = indnItem.TrackID;
                item.MOT = indnItem.MOT;
                item.IDDlvyDate = indnItem.IDDlvyDate;
                if (poData.GRInfos) {
                    poData.GRInfos.filter(grItem => indnItem.ASNNO === grItem.SupDeliveryNote).forEach(grItem => {
                        item.GRNO = grItem.GRNO;
                    });
                }
                if (indnItem.SupplierOrder) {
                    item.PackingList = indnItem.SupplierOrder.PackingList;
                }

                if (data.SalesOrder && data.SalesOrder.SONUMBER !== "") {
                    var soData = data.SalesOrder;
                    if (soData.SOLDTO) {
                        item.Customer = soData.SOLDTO + '/' + soData.NAME1_AG + ' ' + soData.NAME2_AG;   /////
                    }
                    item.SONUMBER = data.SONUMBER;

                    item.CRAD = soData.CRAD;

                    item.CGRInfos = [];
                    if (soData.ODMGRInfos) {
                        let GRNOs = [];
                        soData.ODMGRInfos.forEach(odmgr => {
                            let grInfo = {
                                CGRNO: odmgr.GRNO,
                                GRQty: odmgr.GRQTY
                            };
                            item.CGRInfos.push(grInfo);
                            GRNOs.push(odmgr.GRNO);
                        });
                        item.CGRNO = GRNOs.join(',');
                    }

                    if (soData.GIINFOS) {
                        soData.GIINFOS.filter(giItem => giItem.IBDNNUMBER === indnItem.IBDNNUMBER)
                            .forEach(giItem => {
                                item.DNNUMBER = giItem.DNNUMBER;
                                item.DNDATE = giItem.DNDATE;
                            });
                    }
                }

                if (asnNO !== '' && item.ASNNO === asnNO) {
                    res.data.push(item);
                } else if (asnNO === '') {
                    res.data.push(item);
                }
            });
        }
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
    if (data.PurchaseOrder && data.PurchaseOrder.PONO !== "") {
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
        res.OA = data.PurchaseOrder.OANO + ' ' + data.PurchaseOrder.OAName;
    }
    if (data.SalesOrder && data.SalesOrder.SONUMBER !== "") {
        res.CRAD = data.SalesOrder.CRAD;
        res.NAME_AG = data.SalesOrder.NAME1_AG + ' ' + data.SalesOrder.NAME2_AG;
        res.NAME1_AG = data.SalesOrder.NAME1_AG;
        res.NAME2_AG = data.SalesOrder.NAME2_AG;
        res.CPONO = data.SalesOrder.CPONO;
        res.CITY_WE = data.SalesOrder.CITY_WE;
        res.SOLDTO = data.SalesOrder.SOLDTO;
    }

    res.data = [];

    if (data.PurchaseOrder && data.PurchaseOrder.PONO !== "" && data.PurchaseOrder.InboundDelivery) {
        data.PurchaseOrder.InboundDelivery.filter(inbdItem => inbdItem.ASNNO === data.ASNNumber)
            .forEach(inbdItem => {
                var item = {};
                if (data.SalesOrder && data.SalesOrder.SONUMBER !== "") {
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
                if (data.SalesOrder && data.SalesOrder.SONUMBER !== "" && data.SalesOrder.GIInfo) {
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

var prepareLOIData = function (data) {
    logger.debug('prepareLOIData', data);
    var ystd = moment().subtract(1, 'days').format('YYYYMMDD');
    // moment().day(-7); // last Sunday (0 - 7)
    // moment().day(-1); // last Saturday (6 - 7)
    var lastweekStart = moment().day(-6).format('YYYYMMDD');
    var lastweekEnd = moment().day(0).format('YYYYMMDD');
    // var thisweekStart = moment().day(0).format('YYYYMMDD');
    // var thisweekEnd = moment().day(6).format('YYYYMMDD');
    logger.debug('prepareLOIData lastweek:' + lastweekStart + '-' + lastweekEnd);
    var res = {};
    res.PN = data.PN;
    res.total = data.Quantity;
    res.lastweekPullTotal = 0;
    res.lastweekGRTotal = 0;
    res.ystdPullTotal = 0;
    res.ystdGRTotal = 0;

    res.data = [];
    if (data.WHHistory) {
        data.WHHistory.forEach(history => {
            let item = {};
            item.PN = data.PN;
            item.UpdateDate = history.UpdateDate;
            item.PullRefNo = history.PullRefNo;
            item.GRNO = history.GRNO;

            if (history.PullRefNo && history.PullRefNo !== '') {
                item.Qty = 0 - history.Qty;
                item.NO = history.PullRefNo;
            } else {
                item.Qty = history.Qty;
                item.NO = history.GRNO;
            }
            if (history.GRMaterial) {
                item.Week = history.GRMaterial.Week;
                item.FLEXPONO = history.GRMaterial.FLEXPONO;
                if (history.GRMaterial.CPONOFLEXPONO) {
                    let cpoObject = history.GRMaterial.CPONOFLEXPONO;
                    item.SONUMBER = cpoObject.SONUMBER;
                }
            }

            if (history.UpdateDate >= lastweekStart && history.UpdateDate <= lastweekEnd) {
                if (history.GRNO && history.GRNO !== '') {
                    res.lastweekGRTotal = res.lastweekGRTotal + history.Qty;
                }
                if (history.PullRefNo && history.PullRefNo !== '') {
                    res.lastweekPullTotal = res.lastweekPullTotal - history.Qty;
                }
            }
            if (history.UpdateDate === ystd) {
                if (history.GRNO && history.GRNO !== '') {
                    res.ystdGRTotal = res.ystdGRTotal + history.Qty;
                }
                if (history.PullRefNo && history.PullRefNo !== '') {
                    res.ystdPullTotal = res.ystdPullTotal - history.Qty;
                }
            }

            res.data.push(item);
        });
    }
    return res;
};
var prepareSOIData = function (data) {
    var res = {};
    res.PN = data.PN;
    res.total = data.Qty;
    res.PartDesc = data.PartDesc;
    res.SupplierName = data.SupplierName;
    return res;
};
exports.prepareSearchData = prepareSearchData;