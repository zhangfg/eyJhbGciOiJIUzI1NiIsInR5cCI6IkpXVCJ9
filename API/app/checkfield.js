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
var appEnv = cfenv.getAppEnv();

require('./config.js');
var hfc = require('fabric-client');



 function check(fcn,args)
{
    if(fcn == 'crCPurchaseOrderInfo')
    {
        switch(args.TRANSDOC){
            case 'GR':
            if(typeof args.CPONO == string && args.CPONO.length<= 35){
                if(typeof args.ODMGRInfos.GRNO == string&&typeof args.ODMGRInfos.PARTNUM==string&&args.ODMGRInfos.PARTNUM.length<=15&&typeof args.ODMGRInfos.GRQTY==number){
                    return '';
                }else{
                    return 'check error';
                }
            }
            break;
            case 'PY':
            if(typeof args.CPONO == string && args.CPONO.length<= 35){
                if(typeof args.ODMPayments.FlexInvoiceNO == string && typeof args.ODMPayments.GRNO ==string && typeof args.ODMPayments.BILLINGNO == string 
                    && args.ODMPayments.BILLINGNO.length==10&&typeof args.ODMPayments.INVOICESTATUS==string && args.ODMPayments.INVOICESTATUS.length==1
                    &&args.ODMPayments.INVOICESTATUS=='A' ||args.ODMPayments.INVOICESTATUS=='P' &&checkDate2(args.ODMPayments.PAYMENTDATE) && args.ODMPayments.PAYMENTDATE.length==8){
                    return '';
                }else{
                    return 'check error';
                }
            }
            break;
            case 'LP':
            if(typeof args.CPONO == string && args.CPONO.length<= 35){
                if(typeof args.LOIMaterials.RefNo == string && typeof args.LOIMaterials.PullType == string && args.LOIMaterials.PullType.length==3
                    &&args.LOIMaterials.PullType == 'LOI'&& typeof args.LOIMaterials.Week==string && args.LOIMaterials.Week.length ==8 
                    &&typeof args.LOIMaterials.NotesToReceiver == string &&typeof args.LOIMaterials.NotesToReceiver==string&&args.LOIMaterials.NotesToReceiver.length<=18
                    &&typeof args.LOIMaterials.Quantity == number&& CheckDate2(args.LOIMaterials.DlveryDate)&&args.LOIMaterials.DlveryDate.length==8
                    &&CheckDate2(args.LOIMaterials.RequestedDate)&&args.LOIMaterials.RequestedDat==8&&typeof args.LOIMaterials.ShipmentInstruction==string){
                    return '';
                }else{
                    return 'check error';
                }
            }
            break;
            case 'LG':
            if(typeof args.GRNO == string ){
                if(typeof args.PN == string && args.PN.length==18&&typeof args.Qty == number&&CheckDate2(args.GRDate) 
                && args.GRDate.length == 8){
                    return '';
                }else{
                    return 'check error';
                }

            }
            break;
            case 'SP':
            if(typeof args.CPONO == string && args.CPONO.length<= 35){
                if(typeof args.SOIPulls.PullType == string && args.SOIPulls.PullType.length==3 && args.SOIPulls.PullType=='LOI'
                &&typeof args.SOIPulls.Week == string && args.SOIPulls.Week.length==8&&typeof CheckDate2(args.SOIPulls.PullDate)  
                && args.SOIPulls.PullDate.length ==8 &&typeof args.SOIPulls.PN == string && args.SOIPulls.PN.length<=18
                &&typeof args.SOIPulls.Qty == number&&typeof args.SOIPulls.RefNo ==string && args.SOIPulls.RefNo.length==10 ){
                    return '';
                }else{
                    return 'check error';
                }
            }
            break;
            case 'SI':
            if(typeof args.PN == string && args.PN.length<= 18 &&typeof args.PartDesc == string &&typeof args.InventoryType == string
            &&args.InventoryType.length ==3 && args.InventoryType == 'SOI'&&typeof args.Qty == number&&typeof args.SupplierName == string
            ){
                return '';
            }else{
                return 'check error';
            }
            break;
        }
      
      
    }
    

}

function CheckDate2(strInputDate) {
      if (strInputDate == "") return false;
      strInputDate = strInputDate.replace(/-/g, "/");
      var d = new Date(strInputDate);
      if (isNaN(d)) return false;
      var arr = strInputDate.split("/");
      return ((parseInt(arr[0], 10) == d.getFullYear()) && (parseInt(arr[1], 10) == (d.getMonth() + 1)) && (parseInt(arr[2], 10) == d.getDate()));
    }