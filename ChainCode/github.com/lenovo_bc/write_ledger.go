package main

import (
	// "bytes"
	"fmt"
	"errors"
	// "encoding/pem"
	// "crypto/x509"
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// update PO
func updatePurchaseOrderBySupplier(stub shim.ChaincodeStubInterface, valAsbytes []byte) (error, string, []byte) {
	supOrder := SupplierOrder{}
	err := json.Unmarshal(valAsbytes, &supOrder)
	if err != nil {
		return err, "", valAsbytes
	}
	err, key := generateKey(stub, PO_KEY, []string{supOrder.PONumber, supOrder.POItem})
	if err != nil {
		return err, "", valAsbytes
	}
	fmt.Println("write data,SUP - PO for - " + key)
	//business control
	//get SO object from ledger
	poAsbytes, err := stub.GetState(key)
	var b []byte
	if err == nil && poAsbytes != nil {
		var oldPoObj = PurchaseOrder{}
		err = json.Unmarshal(poAsbytes, &oldPoObj)
		if err != nil {
			return err, "", valAsbytes
		}
		exist := false
		for _, order := range oldPoObj.SupplierOrders {
			if order.ASNNumber == supOrder.ASNNumber && order.VendorNO == supOrder.VendorNO {
				exist = true
				fmt.Println("update data,SUP - PO for - " + key)
				order.ShippedQty = supOrder.ShippedQty
				order.ASNDate = supOrder.ASNDate
				order.PromisedDate = supOrder.PromisedDate
				order.CarrierID = supOrder.CarrierID
				order.CarrierTrackID = supOrder.CarrierTrackID
				order.TransporatationMode = supOrder.TransporatationMode
				order.CountryOfOrigin = supOrder.CountryOfOrigin
				order.PackingList = supOrder.PackingList
			}
		}
		if !exist {
			fmt.Println("insert data,SUP - PO for - " + key)
			oldPoObj.SupplierOrders = append(oldPoObj.SupplierOrders, supOrder)
		}
		b, _ = json.Marshal(oldPoObj)
		return nil, key, b
	} else {
		return errors.New(err.Error()), "", nil
	}

}

//创建，修改SO信息
func crSalesOrderInfo(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println(" update SO crSalesOrderInfo  ")
	fmt.Println("write data, crSalesOrderInfo for - ", args)
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting json to create/update SO")
	}
	jsonStr := args[0]
	vendorNo := args[1]
	fmt.Println("write data, SO data - "+vendorNo, jsonStr)

	var salesOrders [] SalesOrder
	err := json.Unmarshal([]byte(jsonStr), &salesOrders)
	if err != nil {
		return shim.Error(err.Error())
	}
	for _, salesOrder := range salesOrders {
		if salesOrder.SONUMBER != "" && salesOrder.SOITEM != "" {
			err, key := generateKey(stub, SO_KEY, []string{salesOrder.SONUMBER, salesOrder.SOITEM})
			if err != nil {
				return shim.Error(err.Error())
			}
			fmt.Println("write data, SO for - " + key)

			//business control
			//get SO object from ledger
			valAsbytes, err := stub.GetState(key)

			var b []byte
			if err == nil && valAsbytes != nil {
				var oldSalesOrder = SalesOrder{}
				err = json.Unmarshal(valAsbytes, &oldSalesOrder)
				if err != nil {
					return shim.Error(err.Error())
				}

				if salesOrder.TRANSDOC == "SO" {
					salesOrder.PONO = oldSalesOrder.PONO
					salesOrder.POITEM = oldSalesOrder.POITEM
					salesOrder.BILLINFOS = oldSalesOrder.BILLINFOS
					salesOrder.GIINFOS = oldSalesOrder.GIINFOS
					b, _ = json.Marshal(salesOrder)
				} else if salesOrder.TRANSDOC == "BL" {
					oldSalesOrder.BILLINFOS = salesOrder.BILLINFOS
					b, _ = json.Marshal(oldSalesOrder)
				} else if salesOrder.TRANSDOC == "GI" {
					oldSalesOrder.GIINFOS = salesOrder.GIINFOS
					b, _ = json.Marshal(oldSalesOrder)
				}
			} else {
				b, _ = json.Marshal(salesOrder)
				if (salesOrder.CPONO != "") {
					var c []byte
					cPOOrder := ODMPurchaseOrder{}
					err, cpoKey := generateKey(stub, CPO_KEY, []string{salesOrder.CPONO})
					cpoObjAsbytes, err := stub.GetState(cpoKey)
					if err != nil {
						return shim.Error(err.Error())
					}
					if err == nil && cpoObjAsbytes != nil {
						fmt.Println("write data, update SO-CPO for - " + cpoKey)
						err = json.Unmarshal(cpoObjAsbytes, &cPOOrder)
						cPOOrder.CPONO = salesOrder.CPONO
						cPOOrder.SONUMBER = salesOrder.SONUMBER
						cPOOrder.SOITEM = salesOrder.SOITEM
						c, _ = json.Marshal(cPOOrder)
					} else {
						fmt.Println("write data, insert SO-CPO for - " + cpoKey)
						cPOOrder.CPONO = salesOrder.CPONO
						cPOOrder.SONUMBER = salesOrder.SONUMBER
						cPOOrder.SOITEM = salesOrder.SOITEM
						c, _ = json.Marshal(cPOOrder)
					}
					stub.PutState(cpoKey, c)
				}

			}
			stub.PutState(key, b)
		} else {
			return shim.Error("SalesOrder's number and item no is required")
		}
	}
	return shim.Success(nil)
}

//创建，修改PO信息
func crPurchaseOrderInfo(stub shim.ChaincodeStubInterface, args [] string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting json to create/update farm")
	}
	jsonStr := args[0]
	vendorNo := args[1]
	fmt.Println("write data, PO data - "+vendorNo, jsonStr)
	var objs []PurchaseOrder
	// obj := PurchaseOrder{}
	err := json.Unmarshal([]byte(jsonStr), &objs)
	if err != nil {
		return shim.Error(err.Error())
	}
	for _, obj := range objs {
		if obj.PONO != "" && obj.POItemNO != "" {
			err, key := generateKey(stub, PO_KEY, []string{obj.PONO, obj.POItemNO})
			if err != nil {
				return shim.Error(err.Error())
			}
			fmt.Println("write data,PO for - " + key)
			//business control
			//get SO object from ledger
			valAsbytes, err := stub.GetState(key)
			var b []byte
			if err == nil && valAsbytes != nil {
				var oldPoObj = PurchaseOrder{}
				err = json.Unmarshal(valAsbytes, &oldPoObj)
				if err != nil {
					shim.Error(err.Error())
				}
				fmt.Println("write data, for obj.TRANSDOC- " + obj.TRANSDOC)
				//fmt.Println(obj)

				if obj.TRANSDOC == "PO" {
					obj.GRInfos = oldPoObj.GRInfos
					obj.Confirmation = oldPoObj.Confirmation
					obj.InboundDelivery = oldPoObj.InboundDelivery
					obj.Invoice = oldPoObj.Invoice
					b, _ = json.Marshal(obj)
					//update SO
					// fmt.Println("SO no is "+obj.SONUMBER )
					// fmt.Println("SO item is "+obj.SOITEM )
					// if(obj.SONUMBER != "" && obj.SOITEM != ""){
					// 	err,soKey:= generateKey(stub,SO_KEY,[]string{obj.SONUMBER,obj.SOITEM})
					// 	if err != nil {
					// 		return shim.Error(err.Error())
					// 	}
					// 	// fmt.Println("SO soKey is "+soKey )
					// 	valAsbytes, err = stub.GetState(soKey)
					// 	// fmt.Println("valAsbytesSO  is "+string(valAsbytes) )
					// 	if err == nil && valAsbytes !=nil {
					// 		var oldSalesOrder = SalesOrder{}
					// 		err = json.Unmarshal(valAsbytes,&oldSalesOrder)
					// 		if err == nil {
					// 			oldSalesOrder.PONO = obj.PONO
					// 			oldSalesOrder.POITEM = obj.POItemNO
					// 			soByte,_ := json.Marshal(oldSalesOrder)
					// 			stub.PutState (soKey,soByte)
					// 		}
					// 	}
					// }
				} else if obj.TRANSDOC == "GR" {
					oldPoObj.GRInfos = obj.GRInfos
					b, _ = json.Marshal(oldPoObj)

				} else if obj.TRANSDOC == "POCON" {
					oldPoObj.Confirmation = obj.Confirmation
					b, _ = json.Marshal(oldPoObj)

				} else if obj.TRANSDOC == "INV" {
					oldPoObj.Invoice = obj.Invoice
					b, _ = json.Marshal(oldPoObj)

				} else if obj.TRANSDOC == "INDN" {
					oldPoObj.InboundDelivery = obj.InboundDelivery
					b, _ = json.Marshal(oldPoObj)
				}
			} else {
				if obj.TRANSDOC == "PO" {
					//update SO
					if (obj.SONUMBER != "" && obj.SOITEM != "") {
						err, soKey := generateKey(stub, SO_KEY, []string{obj.SONUMBER, obj.SOITEM})
						if err != nil {
							return shim.Error(err.Error())
						}
						fmt.Println("SO soKey is " + soKey)
						valAsbytes, err = stub.GetState(soKey)
						// fmt.Println("valAsbytesSO  is "+string(valAsbytes) )
						if err == nil && valAsbytes != nil {
							var oldSalesOrder = SalesOrder{}
							err = json.Unmarshal(valAsbytes, &oldSalesOrder)
							if err == nil {
								oldSalesOrder.PONO = obj.PONO
								oldSalesOrder.POITEM = obj.POItemNO
								soByte, _ := json.Marshal(oldSalesOrder)
								stub.PutState(soKey, soByte)

								//update CPO Info
								if (oldSalesOrder.CPONO != "") {
									var c []byte
									cPOOrder := ODMPurchaseOrder{}
									err, cpoKey := generateKey(stub, CPO_KEY, []string{oldSalesOrder.CPONO})
									cpoObjAsbytes, err := stub.GetState(cpoKey)
									if err != nil {
										return shim.Error(err.Error())
									}
									if err == nil && cpoObjAsbytes != nil {
										fmt.Println("write data, update SO-CPO for - " + cpoKey)
										err = json.Unmarshal(cpoObjAsbytes, &cPOOrder)
										cPOOrder.CPONO = oldSalesOrder.CPONO
										cPOOrder.PONO = oldSalesOrder.PONO
										cPOOrder.POITEM = oldSalesOrder.POITEM
										c, _ = json.Marshal(cPOOrder)
									} else {
										fmt.Println("write data, insert SO-CPO for - " + cpoKey)
										cPOOrder.CPONO = oldSalesOrder.CPONO
										cPOOrder.PONO = oldSalesOrder.PONO
										cPOOrder.POITEM = oldSalesOrder.POITEM
										c, _ = json.Marshal(cPOOrder)
									}
									stub.PutState(cpoKey, c)
								}
							}
						}
					}
				}
				b, _ = json.Marshal(obj)
			}
			stub.PutState(key, b)
		} else {
			return shim.Error("PurchaseOrder's number and  item no is required")
		}
	}
	return shim.Success(nil)
}

//修改 CPO信息
func crCPurchaseOrderInfo(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting json to create/update CPO")
	}
	jsonStr := args[0]
	//vendorNo := args[1]
	fmt.Println("write data, CPONO data - ", jsonStr)
	var cPOrders [] ODMPurchaseOrder

	err := json.Unmarshal([]byte(jsonStr), &cPOrders)
	if err != nil {
		return shim.Error(err.Error())
	}
	for _, order := range cPOrders {
		if order.CPONO != "" {
			err, cpoKey := generateKey(stub, CPO_KEY, []string{order.CPONO})
			fmt.Println("write data, CPO for - " + cpoKey)
			if err != nil {
				return shim.Error(err.Error())
			}
			cpoObjAsbytes, err := stub.GetState(cpoKey)
			if err == nil && cpoObjAsbytes != nil {
				var c []byte
				cPOOrder := ODMPurchaseOrder{}
				err = json.Unmarshal(cpoObjAsbytes, &cPOOrder)
				if err != nil {
					return shim.Error(err.Error())
				}
				if order.TRANSDOC == "GR" {
					for _, subObject := range order.GRInfos {
						//cPOOrder.GRInfos = append(cPOOrder.GRInfos, subObject)
						var exist = false
						for i, child := range cPOOrder.GRInfos {
							if child.GRNO == subObject.GRNO {
								cPOOrder.GRInfos[i] = subObject
								exist = true
							}
						}
						if (exist == false) {
							cPOOrder.GRInfos = append(cPOOrder.GRInfos, subObject)
						}

					}
				} else if order.TRANSDOC == "PY" {

					for _, subObject := range order.Payments {
						//cPOOrder.Payments = append(cPOOrder.Payments, subObject)
						var exist = false
						for i, child := range cPOOrder.Payments {
							if child.FlexInvoiceNO == subObject.FlexInvoiceNO {
								cPOOrder.Payments[i] = subObject
								exist = true
							}
						}
						if (!exist) {
							cPOOrder.Payments = append(cPOOrder.Payments, subObject)
						}
					}
				} else if order.TRANSDOC == "LP" {
					cPOOrder.LOIMaterials = order.LOIMaterials
				} else if order.TRANSDOC == "LI" {
					for _, subObject := range order.LOIInventorys {
						cPOOrder.LOIInventorys = append(cPOOrder.LOIInventorys, subObject)
					}
				} else if order.TRANSDOC == "SP" {
					for _, subObject := range order.SOIPulls {
						cPOOrder.SOIPulls = append(cPOOrder.SOIPulls, subObject)
					}
				} else if order.TRANSDOC == "SI" {
					for _, subObject := range order.SOIInventorys {
						cPOOrder.SOIInventorys = append(cPOOrder.SOIInventorys, subObject)
					}
				}
				c, _ = json.Marshal(cPOOrder)
				stub.PutState(cpoKey, c)
			} else {
				fmt.Println("insert CPO object", order)
				var c []byte
				cPOOrder := ODMPurchaseOrder{}
				if order.TRANSDOC == "GR" {
					cPOOrder.GRInfos = order.GRInfos
				} else if order.TRANSDOC == "PY" {
					cPOOrder.Payments = order.Payments
				} else if order.TRANSDOC == "LP" {
					cPOOrder.LOIMaterials = order.LOIMaterials
				} else if order.TRANSDOC == "LI" {
					cPOOrder.LOIInventorys = order.LOIInventorys
				} else if order.TRANSDOC == "SP" {
					cPOOrder.SOIPulls = order.SOIPulls
				} else if order.TRANSDOC == "SI" {
					cPOOrder.SOIInventorys = order.SOIInventorys
				}
				c, _ = json.Marshal(cPOOrder)
				stub.PutState(cpoKey, c)
			}
		} else {
			return shim.Error("PO number is required")
		}
	}
	return shim.Success(nil)
}

//修改 Supplier信息
func crSupplierOrderInfo(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting json to create/update Supplier Object")
	}
	jsonStr := args[0]
	vendorNo := args[1]
	fmt.Println("write data, Supplier Object data - "+vendorNo, jsonStr)

	var supOrders [] SupplierOrder

	err := json.Unmarshal([]byte(jsonStr), &supOrders)
	if err != nil {
		return shim.Error(err.Error())
	}
	for _, order := range supOrders {
		order.VendorNO = vendorNo
		if order.VendorNO != "" && order.ASNNumber != "" {
			err, sup_key := generateKey(stub, SUPPLIER_KEY, []string{order.VendorNO, order.ASNNumber})
			fmt.Println("write data, Suplier part for - " + sup_key)
			if err != nil {
				return shim.Error(err.Error())
			}
			supObjAsbytes, err := stub.GetState(sup_key)
			var c []byte
			if err == nil && supObjAsbytes != nil {
				supOrder := SupplierOrder{}
				err = json.Unmarshal(supObjAsbytes, &supOrder)
				fmt.Println("write data, Suplier part for - ", supOrder)
				fmt.Println("write data, Suplier part for2 - ", order)
				if err != nil {
					return shim.Error(err.Error())
				}
				if order.TRANSDOC == "UL" { // upload
					supOrder.PackingList = order.PackingList
				}
				c, _ = json.Marshal(supOrder)
			} else {
				c, _ = json.Marshal(order)
			}
			if (order.PONumber != "" && order.POItem != "") {
				err, poKey, b := updatePurchaseOrderBySupplier(stub, c)
				if err != nil {
					return shim.Error(err.Error())
				}
				if b == nil {
					return shim.Error("PO item NO is not correct")
				}
				stub.PutState(poKey, b)
			}

			stub.PutState(sup_key, c)

		} else {
			return shim.Error("ASNNumber is required")
		}
	}
	return shim.Success(nil)
}

func removeFromStateByKey(stub shim.ChaincodeStubInterface, args [] string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments")
	}

	jsonStr := args[0]
	param := QueryParam{}
	err := json.Unmarshal([]byte(jsonStr), &param)
	if err != nil {
		return shim.Error(err.Error())
	}

	if param.KeyPrefix == "" {
		return shim.Error("Invalid object name")
	}

	if len(param.KeysStart) == 0 {
		return shim.Error("Query keys are required")
	}

	resultsIterator, err := stub.GetStateByPartialCompositeKey(param.KeyPrefix, param.KeysStart)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		err = stub.DelState(queryResponse.Key)
	}
	return shim.Success(nil)
}

// func  testCertificate(stub shim.ChaincodeStubInterface, args []string) pb.Response{
// 	creatorByte,_:= stub.GetCreator()
// 	certStart := bytes.IndexAny(creatorByte, "-----BEGIN")
// 	if certStart == -1 {
// 	   fmt.Errorf("No certificate found")
// 	}
// 	certText := creatorByte[certStart:]
// 	bl, _ := pem.Decode(certText)
// 	if bl == nil {
// 	   fmt.Errorf("Could not decode the PEM structure")
// 	}

// 	cert, err := x509.ParseCertificate(bl.Bytes)
// 	if err != nil {
// 	   fmt.Errorf("ParseCertificate failed")
// 	}
// 	uname:=cert.Subject.CommonName
// 	fmt.Println("Name:"+uname)
// 	return shim.Success([]byte("Called testCertificate "+uname))
//  }
