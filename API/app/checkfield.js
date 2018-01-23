'use strict';
var cfenv = require('cfenv');
var log4js = require('log4js');
var logger = log4js.getLogger('BlockchainAPI');
var express = require('express');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var app = express();
var expressJWT = require('express-jwt');
var jwt = require('jsonwebtoken');
var bearerToken = require('express-bearer-token');
var cors = require('cors');
var appEnv = cfenv.getAppEnv();



exports.checkField = function (fcn, args) {
    if (fcn === 'crCPurchaseOrderInfo') {
        var reg = /^[a-zA-Z0-9]+$/;
        if (args.length > 0) {
            for (var i = 0; i < args.length; i++) {
                switch (args[i].TRANSDOC) {
                    case 'GR':
                        if ((typeof args[i].FLEXPONO !== string) || (args[i].FLEXPONO.length > 35)) {
                            return 'FLEXPONO check constraints are not satisfied.';
                        }
                        if (typeof args[i].GRNO !== string) {
                            return 'GRNO check constraints are not satisfied.';
                        }
                        if ((typeof args[i].PARTNUM.length > 18) || (!reg.test(args[i].PARTNUM))) {
                            return 'PARTNUM check constraints are not satisfied.';
                        }
                        if (typeof args[i].GRQTY !== number) {
                            return 'GRQTY check constraints are not satisfied.';
                        }
                        if ((typeof args[i].GRDate !== string) || (!CheckDate2(args[i].GRDate))) {
                            return 'GRDate check constraints are not satisfied.';
                        }
                        break;

                    case 'PY':
                        if ((typeof args[i].FLEXPONO !== string) || (args[i].FLEXPONO.length > 35)) {
                            return 'CPONO check constraints are not satisfied.';
                        }
                        if (args[i].ODMPayments !== '') {
                            for (var j = 0; j < args[i].ODMPayments.length; j++) {
                                if (typeof args[i].ODMPayments[j].FlexInvoiceNO !== string) {
                                    return 'FlexInvoiceNO check constraints are not satisfied.';
                                }
                                if (typeof args[i].ODMPayments[j].GRNO !== string) {
                                    return 'GRNO check constraints are not satisfied.';
                                }
                                if ((typeof args[i].ODMPayments[j].BILLINGNO !== string)
                                    || (args[i].ODMPayments[j].BILLINGNO.length !== 10)) {
                                    return 'BILLINGNO check constraints are not satisfied.';
                                }
                                if ((typeof args[i].ODMPayments[j].INVOICESTATUS !== string) || (args[i].ODMPayments[j].INVOICESTATUS !== 'A' || args[i].ODMPayments[j].INVOICESTATUS !== 'P')) {
                                    return 'INVOICESTATUS check constraints are not satisfied.';
                                }
                                if ((typeof args[i].ODMPayments[j].PAYMENTDATE !== string) || (!CheckDate2(args[i].ODMPayments[j].PAYMENTDATE))) {
                                    return 'PAYMENTDATE check constraints are not satisfied.';
                                }
                            }
                        }
                        break; 
                }
            }
            return '';
        }

    } else if (fcn === 'crCMaterialPulling') {
        if (args.length > 0) {
            for (var i = 0; i < args.length; i++) {
                if ((typeof args[i].RefNo !== string) || (args[i].length !== 10)) {
                    return 'RefNo check constraints are not satisfied.'
                }
                if ((typeof args[i].PullType !== string) || (args[i].PullType !== 'LOI') || (args[i].PullType !== 'SOI')) {
                    return 'PullType check constraints are not satisfied.';
                }
                if ((typeof args[i].Week !== string) || (args[i].Week.length !== 8)) {
                    return 'Week check constraints are not satisfied.';
                }
                if ((typeof args[i].NotesToReceiver !== string)) {
                    return 'NotesToReceiver check constraints are not satisfied.';
                }
                if ((typeof args[i].Product !== string) || (args[i].Product.length > 18)) {
                    return 'Product check constraints are not satisfied.';
                }
                if (typeof args[i].Quantity !== number) {
                    return 'Quantity check constraints are not satisfied.'
                }
                if ((typeof args[i].DlveryDate !== string) || (!CheckDate2(args[i].DlveryDate))) {
                    return 'DlveryDate check constraints are not satisfied.';
                }
                if ((typeof args[i].RequestedDate !== string) || (!CheckDate2(args[i].RequestedDate))) {
                    return 'RequestedDate check constraints are not satisfied.';
                }
                if (typeof args[i].ShipmentInstruction !== string) {
                    return 'ShipmentInstruction check constraints are not satisfied.';
                }
            }

        }

    } else if (fcn === 'crMappingRefPO') {
        if (args.length > 0) {
            for (var i = 0; i < args.length; i++) {
                if ((typeof args[i].FLEXPONO !== string) || (args[i].FLEXPONO.length > 35)) {
                    return 'FLEXPONO check constraints are not satisfied.';
                }
                if (args[i].RefNos.length > 0) {
                    for (var j = 0; j < args[i].RefNos.length; j++) {
                        if (typeof args[i].RefNos[j] !== string || args[i].RefNos[j] !== 10) {
                            return 'RefNo check constraints are not satisfied.';
                        }
                    }
                }

            }
        }
    } else if (fcn === 'crMappingFlexPO') {
        if (args.length > 0) {
            for (var i = 0; i < args.length; i++) {
                if ((typeof args[i].CPONO !== string) || (args[i].CPONO.length > 35)) {
                    return 'CPONO check constraints are not satisfied.';
                }
                for (var j = 0; j < args[i].FLEXPONO.length; j++) {
                    if ((typeof args[i].FLEXPONO[j] !== string) || (args[i].FLEXPONO[j].length > 35)) {
                        return 'FLEXPONO check constraints are not satisfied.';
                    }

                }
            }
        }
    } else if (fcn === 'crCSOIInventoryInfo') {
        if (args.length > 0) {
            for (var i = 0; i < args.length; i++) {
                if ((typeof args[i].PN !== string) || (args[i].PN.length > 18)) {
                    return 'PN check constraints are not satisfied.';
                }
                if (typeof args[i].PartDesc !== string) {
                    return 'PartDesc check constraints are not satisfied.';
                }
                if ((typeof args[i].InventoryType !== string) || (args[i].InventoryType !== 'SOI')) {
                    return 'InventoryType check constraints are not satisfied.';
                }
                if (typeof args[i].Qty !== number) {
                    return 'Qty check constraints are not satisfied.';
                }
                if (typeof args[i].SupplierName !== string) {
                    return 'SupplierName check constraints are not satisfied.';
                }
            }
        }
    }

    return '';
}

function CheckDate2(strInputDate) {
    var parts;
    if (strInputDate.length === 8) {
        parts[0] = strInputDate.substring(0, 4);
        parts[1] = strInputDate.substring(4, 6);
        parts[2] = strInputDate.substring(6, 8);

        for (var i = 0; i < 3; i++) {
            //如果构成日期的某个部分不是数字，则返回false
            if (isNaN(parts[i])) {
                return false;
            }
        }
        var y = parts[0]; //年
        var m = parts[1]; //月
        var d = parts[2]; //日
        if (y > 3000) {
            return false;
        }
        var smonth = "01,02,03,04,05,06,07,08,09,10,11,12";
        if (smonth.indexOf(m) == -1) {
            return false;
        }
        var sday = "01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31";
        if (sday.indexOf(d) == -1) {
            return false;
        }
        switch (d) {
            case 29:
                if (m == "02") {
                    //如果是2月份
                    if (((y % 4) == 0) && ((y % 100) != 0) || ((y % 400) == 0)) {
                        //如果年份能被100整除但不能被400整除 (即闰年)
                    } else {
                        return false;
                    }
                }
                break;
            case 30:
                if (m == "02") {
                    //2月没有30日
                    return false;
                }
                break;
            case 31:
                if (m == "02" || m == "04" || m == "06" || m == "09" || m == "11") {
                    //2、4、6、9、11月没有31日
                    return false;
                }
                break;
            default:
        }
        return true;
    } else {
        return false;
    }
}
