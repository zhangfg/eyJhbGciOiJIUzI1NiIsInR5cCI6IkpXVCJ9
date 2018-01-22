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

                }else{
                    return 'CPONO check constraints are not satisfied.';
                }
                if(typeof args[i].GRNO ===string){
            
                }else{
                    return 'GRNO check constraints are not satisfied.';
                }
                if(typeof args[i].PARTNUM <= 18 && reg.test(args[i].PARTNUM)){
                   
                }else{
                    return 'PARTNUM check constraints are not satisfied.';
                }
                if(typeof args[i].GRQTY===number){
                   
                }else{
                    return 'GRQTY check constraints are not satisfied.';
                }
                break;

                case 'PY':
                if(typeof args[i].CPONO === string && args[i].CPONO.length<= 35){
                   
                }else{
                    return 'CPONO check constraints are not satisfied.';
                }
                for(var j=0;j<args[i].ODMPayments.length;j++){
                    if(typeof args[i].ODMPayments[j].FlexInvoiceNO === string){
                       
                    }else{
                        return 'FlexInvoiceNO check constraints are not satisfied.';
                    }
                    if(typeof args[i].ODMPayments[j].GRNO ===string){
                       
                    }else{
                        return 'GRNO check constraints are not satisfied.';
                    }
                    if(typeof args[i].ODMPayments[j].BILLINGNO === string 
                        && args[i].ODMPayments[j].BILLINGNO.length===10){
                           
                        }else{
                            return 'BILLINGNO check constraints are not satisfied.';
                        }
                    if((typeof args[i].ODMPayments[j].INVOICESTATUS===string)&&args[i].ODMPayments[j].INVOICESTATUS==='A' ||args[i].ODMPayments[j].INVOICESTATUS==='P'){
                            
                        }else{
                            return 'INVOICESTATUS check constraints are not satisfied.';
                        }
                     if(typeof args[i].ODMPayments[j].PAYMENTDATE === string&&CheckDate2(args[i].ODMPayments[j].PAYMENTDATE)){
                        
                     }else{
                         return 'PAYMENTDATE check constraints are not satisfied.';
                     }    
                }
                break;
                
                case 'LP':
                if(typeof args[i].CPONO === string && args[i].CPONO.length<= 35){
                    for(var j =0;j<args[i].LOIMaterials;j++){
                        if(typeof args[i].LOIMaterials[j].RefNo === string){
                           
                        }else{
                            return 'CPONO check constraints are not satisfied.';
                        }
                        if(typeof args[i].LOIMaterials[j].PullType === string &&args[i].LOIMaterials[j].PullType === 'LOI'){
                               
                            }else{
                                return 'PullType check constraints are not satisfied.';
                            }
                         if(typeof args[i].LOIMaterials[j].Week===string && args[i].LOIMaterials[j].Week.length ===8){
                           
                         }else{
                            return 'Week check constraints are not satisfied.';
                         }
                         if(typeof args[i].LOIMaterials[j].NotesToReceiver===string&&args[i].LOIMaterials[j].NotesToReceiver.length<=18){
                            
                         }else{
                             return 'NotesToReceiver check constraints are not satisfied.';
                         }  
                         if(typeof args[i].LOIMaterials[j].Quantity === number){
                            
                         } else{
                             return 'Quantity check constraints are not satisfied.';
                         }
                         if(typeof args[i].LOIMaterials[j].DlveryDate===string&&CheckDate2(args[i].LOIMaterials[j].DlveryDate)){
                          
                         }else{
                             return 'DlveryDate check constraints are not satisfied.';
                         }
                         if(typeof args[i].LOIMaterials[j].RequestedDate===string&&CheckDate2(args[i].LOIMaterials[j].RequestedDate)){
                            
                         }else{
                             return 'RequestedDate check constraints are not satisfied.';
                         }
                         if(args[i].LOIMaterials[j].ShipmentInstruction===string){
                            
                         }else{
                             return 'ShipmentInstruction check constraints are not satisfied.';
                         }
                    }

                }
                break;

                case 'LG':
                if(typeof args[i].GRNO === string){
                   
                }else{
                    return 'GRNO check constraints are not satisfied.';
                }
                if(typeof args[i].PN === string && args[i].PN.length===18){
                   
                }else{
                    return 'PN check constraints are not satisfied.';
                }
                if(typeof args[i].Qty === number){
                   
                }else{
                    return 'Qty check constraints are not satisfied.';
                }
                if(typeof args[i].GRDate === string && CheckDate2(args[i].GRDate) ){
                   
                }else{
                    return 'GRDate check constraints are not satisfied.';
                }
                break; 
                case 'SP':
                if(typeof args[i].CPONO === string && args[i].CPONO.length<= 35){
                   
                }else{
                    return 'CPONO check constraints are not satisfied.';
                }
                for(var j =0;j<args[i].SOIPulls;j++){
                    if(typeof args[i].SOIPulls[j].PullType === string  && args[i].SOIPulls[j].PullType==='LOI'){
                       
                    }else{
                        return 'PullType check constraints are not satisfied.';
                    }
                    if(typeof args[i].SOIPulls[j].Week === string && args[i].SOIPulls[j].Week.length===8){
                        
                    }else{
                        return 'Week check constraints are not satisfied.';
                    }
                    if( typeof args[i].SOIPulls[j].PullDate === string && CheckDate2(args[i].SOIPulls[j].PullDate)){
                        
                    }else{
                        return 'PullDate check constraints are not satisfied.';
                    }
                    if(typeof args[i].SOIPulls[j].PN === string && args[i].SOIPulls[j].PN.length<=18){
                       
                    }else{
                        return 'PN check constraints are not satisfied.';
                    }
                    if(typeof args[i].SOIPulls[j].Qty === number){
                       
                    }else{
                        return 'Qty check constraints are not satisfied.';
                    }
                    if(typeof args[i].SOIPulls[j].RefNo ===string && args[i].SOIPulls[j].RefNo.length===10 ){
                       
                    }else{
                        return 'RefNo check constraints are not satisfied.';
                    }
                   
                }
               
                break;
                case 'SI':
                if(typeof args[i].PN === string && args[i].PN.length<= 18)
                {
                   
                }else{
                    return 'PN check constraints are not satisfied.';
                }
                if(typeof args[i].PartDesc === string){
                   
                }else{
                    return 'PartDesc check constraints are not satisfied.';
                }
                if(typeof args[i].InventoryType === string && args[i].InventoryType === 'SOI'){
                       
                    }else{
                        return 'InventoryType check constraints are not satisfied.';
                    }
                if(typeof args[i].Qty === number){
                   
                }else{
                    return 'Qty check constraints are not satisfied.';
                }
                if(typeof args[i].SupplierName === string){
                   
                }else{
                    return 'SupplierName check constraints are not satisfied.';
                }
                break; 

            }
        }           
      
    }
    
}

function CheckDate2(strInputDate) {
                var parts;
                if(strInputDate.length === 8){
                parts[0]= strInputDate.substring(0,4);
                parts[1]= strInputDate.substring(4,6);
                parts[2]= strInputDate.substring(6,8);
              
                for (i = 0; i < 3; i++) {
                    //如果构成日期的某个部分不是数字，则返回false
                    if (isNaN(parts[i])) {
                        return false;
                    }
                }
              var  y = parts[0]; //年
              var  m = parts[1]; //月
              var  d = parts[2]; //日
                if (y > 3000) {
                    return false;
                }
                var smonth="01,02,03,04,05,06,07,08,09,10,11,12";
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
                            if ((y / 100) * 100 == y && (y / 400) * 400 != y) {
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
    }else{
        return false;
    }
}
