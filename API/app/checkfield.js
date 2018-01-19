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



exports.checkField = function (fcn,args)
{
    if(fcn === 'crCPurchaseOrderInfo')
    {
        var reg = /^[a-zA-Z0-9]+$/;
        for(var i=0;i<args.length;i++){
            switch(args[i].TRANSDOC){
                case 'GR':
                if(typeof args[i].CPONO ===string && args[i].CPONO.length <= 35){
                    return '';
                }else{
                    return 'CPONO check error';
                }
                if(typeof args[i].GRNO ===string){
                    return '';
                }else{
                    return 'GRNO check error';
                }
                if(typeof args[i].PARTNUM <= 18 && reg.test(args[i].PARTNUM)){
                    return '';
                }else{
                    return 'PARTNUM check error';
                }
                if(typeof args[i].GRQTY===number){
                    return '';
                }else{
                    return 'GRQTY check error';
                }
                break;

                case 'PY':
                if(typeof args[i].CPONO === string && args[i].CPONO.length<= 35){
                    return '';
                }else{
                    return 'CPONO check error';
                }
                for(var j=0;j<args[i].ODMPayments.length;j++){
                    if(typeof args[i].ODMPayments[j].FlexInvoiceNO === string){
                        return '';
                    }else{
                        return 'FlexInvoiceNO check error';
                    }
                    if(typeof args[i].ODMPayments[j].GRNO ===string){
                        return '';
                    }else{
                        return 'GRNO check error';
                    }
                    if(typeof args[i].ODMPayments[j].BILLINGNO === string 
                        && args[i].ODMPayments[j].BILLINGNO.length==10){
                            return '';
                        }else{
                            return 'BILLINGNO check error';
                        }
                    if(typeof args[i].ODMPayments[j].INVOICESTATUS==string && args[i].ODMPayments[j].INVOICESTATUS.length==1
                        &&args[i].ODMPayments[j].INVOICESTATUS=='A' ||args[i].ODMPayments[j].INVOICESTATUS=='P'){
                            return '';
                        }else{
                            return 'INVOICESTATUS check error';
                        }
                     if(checkDate2(args[i].ODMPayments[j].PAYMENTDATE) && args[i].ODMPayments[j].PAYMENTDATE.length==8){
                         return '';
                     }else{
                         return 'PAYMENTDATE check error';
                     }    
                }
                break;
                
                case 'LP':
                if(typeof args[i].CPONO == string && args[i].CPONO.length<= 35){
                    for(var j =0;j<args[i].LOIMaterials;j++){
                        if(typeof args[i].LOIMaterials[j].RefNo === string){
                            return '';
                        }else{
                            return 'CPONO check error';
                        }
                        if(typeof args[i].LOIMaterials[j].PullType === string && args[i].LOIMaterials[j].PullType.length===3
                            &&args[i].LOIMaterials[j].PullType === 'LOI'){
                                return '';
                            }else{
                                return 'PullType check error';
                            }
                         if(typeof args[i].LOIMaterials[j].Week===string && args[i].LOIMaterials[j].Week.length ===8){
                            return '';
                         }else{
                            return 'Week check error';
                         }
                         if(typeof args[i].LOIMaterials[j].NotesToReceiver===string&&args[i].LOIMaterials[j].NotesToReceiver.length<=18){
                             return '';
                         }else{
                             return 'NotesToReceiver check error';
                         }  
                         if(typeof args[i].LOIMaterials[j].Quantity === number){
                             return '';
                         } else{
                             return 'Quantity check error';
                         }
                         if(CheckDate2(args[i].LOIMaterials[j].DlveryDate)&&args[i].LOIMaterials[j].DlveryDate.length===8){
                            return '';
                         }else{
                             return 'DlveryDate check error';
                         }
                         if(CheckDate2(args[i].LOIMaterials[j].RequestedDate)&&args[i].LOIMaterials[j].RequestedDat===8){
                             return '';
                         }else{
                             return 'RequestedDate check error';
                         }
                         if(args[i].LOIMaterials[j].ShipmentInstruction===string){
                             return '';
                         }else{
                             return 'ShipmentInstruction check error';
                         }
                    }

                }
                break;

                case 'LG':
                if(typeof args[i].GRNO === string){
                    return '';
                }else{
                    return 'GRNO check error';
                }
                if(typeof args[i].PN === string && args[i].PN.length==18){
                    return '';
                }else{
                    return 'PN check error';
                }
                if(typeof args[i].Qty === number){
                    return '';
                }else{
                    return 'Qty check error';
                }
                if(CheckDate2(args[i].GRDate)&& args[i].GRDate.length === 8){
                    return '';
                }else{
                    return 'GRDate check error';
                }
                break; 
                case 'SP':
                if(typeof args[i].CPONO === string && args[i].CPONO.length<= 35){
                    return '';
                }else{
                    return 'CPONO check error';
                }
                for(var j =0;j<args[i].SOIPulls;j++){
                    if(typeof args[i].SOIPulls[j].PullType === string && args[i].SOIPulls[j].PullType.length===3 && args[i].SOIPulls[j].PullType==='LOI'){
                        return '';
                    }else{
                        return 'PullType check error';
                    }
                    if(typeof args[i].SOIPulls[j].Week === string && args[i].SOIPulls[j].Week.length===8){
                        return '';
                    }else{
                        return 'Week check error';
                    }
                    if(typeof CheckDate2(args[i].SOIPulls[j].PullDate)  
                    && args[i].SOIPulls[j].PullDate.length ===8){
                        return '';
                    }else{
                        return 'PullDate check error';
                    }
                    if(typeof args[i].SOIPulls[j].PN === string && args[i].SOIPulls[j].PN.length<=18){
                        return '';
                    }else{
                        return 'PN check error';
                    }
                    if(typeof args[i].SOIPulls[j].Qty === number){
                        return '';
                    }else{
                        return 'Qty check error';
                    }
                    if(typeof args[i].SOIPulls[j].RefNo ===string && args[i].SOIPulls[j].RefNo.length==10 ){
                        return '';
                    }else{
                        return 'RefNo check error';
                    }
                   
                }
               
                break;
                case 'SI':
                if(typeof args[i].PN === string && args[i].PN.length<= 18)
                {
                    return '';
                }else{
                    return 'PN check error';
                }
                if(typeof args[i].PartDesc === string){
                    return '';
                }else{
                    return 'PartDesc check error';
                }
                if(typeof args[i].InventoryType === string
                    &&args[i].InventoryType.length ===3 && args[i].InventoryType === 'SOI'){
                        return '';
                    }else{
                        return 'InventoryType check error';
                    }
                if(typeof args[i].Qty === number){
                    return '';
                }else{
                    return 'Qty check error';
                }
                if(typeof args[i].SupplierName === string){
                    return '';
                }else{
                    return 'SupplierName check error';
                }
                break; 

            }
        }          
      
      
    }
    

}

function CheckDate2(strInputDate) {
     var reg = /^(\d{4})(\d{2})(\d{2})$/;
    var arr = reg.exec(strInputDate);
    if (strInputDate=="") return true;
    if (!reg.test(strInputDate)&&RegExp.$2<=12&&RegExp.$3<=31){
    return false;
    }
    return true;
    }
