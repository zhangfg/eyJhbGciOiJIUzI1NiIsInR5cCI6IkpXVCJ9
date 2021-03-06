package main

import (
	// "bytes"
	"fmt"
	//"errors"
	//"strconv"
	// "encoding/pem"
	// "crypto/x509"
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

// Material Pulling
func crCMaterialPulling(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting json to create/update Material Pulling Object")
	}
	jsonStr := args[0]
	//vendorNo := args[1]
	//fmt.Println("write data, Material Pulling Object data - " + vendorNo, jsonStr)

	var materials [] ODMLOIMaterial

	err := json.Unmarshal([]byte(jsonStr), &materials)
	if err != nil {
		return shim.Error(err.Error())
	}
	for _, material := range materials {
		if material.RefNo != "" {
			err, pull_key := generateKey(stub, PULL_KEY, []string{material.RefNo})
			fmt.Println("write data, LOI Material pulling part for - " + pull_key)
			if err != nil {
				return shim.Error(err.Error())
			}

			var c []byte
			c, _ = json.Marshal(material)
			stub.PutState(pull_key, c)
			if material.PullType == PULLTYPE_LOI {
				m, _ := json.Marshal(material)
				err = updateWarehouse(stub, m, "LP")
				if err != nil {
					return shim.Error(err.Error())
				}
				stub.SetEvent("LOIPulling", m)
			}

			if material.PullType == PULLTYPE_SOI {
				m, _ := json.Marshal(material)
				stub.SetEvent("SOIPulling", m)
			}

		} else {
			return shim.Error("Ref number is required")
		}
	}
	return shim.Success(nil)
}

// Ref No. <=> FlexPONO
func crMappingRefPO(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting json to create/update Material Pulling Object")
	}
	jsonStr := args[0]
	//vendorNo := args[1]
	//fmt.Println("write data, Material Pulling Object data - " + vendorNo, jsonStr)

	var refMappings [] FLEXPONOREF

	err := json.Unmarshal([]byte(jsonStr), &refMappings)
	if err != nil {
		return shim.Error(err.Error())
	}
	for _, refMapping := range refMappings {
		if refMapping.FLEXPONO != "" {
			err, ref_key := generateKey(stub, REF_KEY, []string{refMapping.FLEXPONO})
			fmt.Println("write data, Ref No. <=> FlexPONO part for - " + ref_key)
			if err != nil {
				return shim.Error(err.Error())
			}
			var c []byte
			c, _ = json.Marshal(refMapping)
			stub.PutState(ref_key, c)

			for _, refNo := range refMapping.RefNos {
				err, pull_key := generateKey(stub, PULL_KEY, []string{refNo})
				if err != nil {
					return shim.Error(err.Error())
				}
				pullObjAsbytes, err := stub.GetState(pull_key)
				if err == nil && pullObjAsbytes != nil {
					odmLoiMapping := ODMLOIMaterial{}
					err = json.Unmarshal(pullObjAsbytes, &odmLoiMapping)
					if err != nil {
						return shim.Error(err.Error())
					}
					odmLoiMapping.FLEXPONO = refMapping.FLEXPONO
					var d []byte
					d, _ = json.Marshal(odmLoiMapping)
					stub.PutState(pull_key, d)
				}
			}

		} else {
			return shim.Error("Flex PO number is required")
		}
	}
	return shim.Success(nil)
}

// CPONO. <=> FlexPONO
func crMappingFlexPO(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting json to CPONO. <=> FlexPONO Pulling Object")
	}
	jsonStr := args[0]
	//vendorNo := args[1]
	//fmt.Println("write data, CPONO. <=> FlexPONO Object data - " + vendorNo, jsonStr)

	var flexPOs [] CPONOFLEXPONO

	err := json.Unmarshal([]byte(jsonStr), &flexPOs)
	if err != nil {
		return shim.Error(err.Error())
	}
	for _, flexPO := range flexPOs {
		if flexPO.CPONO != "" {
			err, pull_key := generateKey(stub, CPO_KEY, []string{flexPO.CPONO})
			fmt.Println("write data, CPONO. <=> FlexPONO part for - " + pull_key)
			if err != nil {
				return shim.Error(err.Error())
			}
			pullObjAsbytes, err := stub.GetState(pull_key)
			var c []byte
			if err == nil && pullObjAsbytes != nil {
				cpoMapping := CPONOFLEXPONO{}
				err = json.Unmarshal(pullObjAsbytes, &cpoMapping)
				if err != nil {
					return shim.Error(err.Error())
				}
				cpoMapping.FLEXPONO = flexPO.FLEXPONO
				c, _ = json.Marshal(cpoMapping)

			} else {
				c, _ = json.Marshal(flexPO)
			}
			stub.PutState(pull_key, c)

			// Update CPONo.in Flex ledger
			for _, flexPONo := range flexPO.FLEXPONO {
				var b []byte
				err, flexKey := generateKey(stub, FLEX_KEY, []string{flexPONo})
				fmt.Println("write data, Flex for - " + flexKey)
				if err != nil {
					return shim.Error(err.Error())
				}
				cpoAsbytes, err := stub.GetState(flexKey)
				if err != nil {
					return shim.Error(err.Error())
				}
				if cpoAsbytes != nil {
					flexObject := ODMPurchaseOrder{}
					err = json.Unmarshal(cpoAsbytes, &flexObject)
					if err != nil {
						return shim.Error(err.Error())
					}
					flexObject.CPONO = flexPO.CPONO
					b, _ = json.Marshal(flexObject)
				} else {
					flexObject := ODMPurchaseOrder{}
					flexObject.FLEXPONO = flexPONo
					flexObject.CPONO = flexPO.CPONO
					b, _ = json.Marshal(flexObject)
				}
				stub.PutState(flexKey, b)
			}

		} else {
			return shim.Error("CPONO number is required")
		}
	}
	return shim.Success(nil)
}

// update Warehouse

func updateWarehouse(stub shim.ChaincodeStubInterface, valAsbytes []byte, Objtype string) (error) {
	fmt.Println("updateWarehouse  TYPE: " + Objtype)
	if Objtype == "LP" {
		var loiMaterial ODMLOIMaterial
		err := json.Unmarshal(valAsbytes, &loiMaterial)
		if err != nil {
			return err
		}
		err, warehouse_key := generateKey(stub, WAREHOUSE_KEY, []string{loiMaterial.Product})
		fmt.Println("LP: write ledger data in warehouse, warehouse_key:" + warehouse_key)
		if err != nil {
			return err
		}
		var c []byte
		whObjAsbytes, err := stub.GetState(warehouse_key)
		if err != nil {
			return err
		}
		if whObjAsbytes != nil {
			whOrder := WareHouseInfo{}
			err = json.Unmarshal(whObjAsbytes, &whOrder)
			if err != nil {
				return err
			}
			whOrder.Quantity = whOrder.Quantity - loiMaterial.Quantity
			whHistory := WareHouseHistory{}
			whHistory.PullRefNo = loiMaterial.RefNo
			whHistory.UpdateDate = loiMaterial.PullDate
			whHistory.Qty = loiMaterial.Quantity
			whOrder.WHHistory = append(whOrder.WHHistory, whHistory)
			c, _ = json.Marshal(whOrder)
			stub.PutState(warehouse_key, c)
		} else {
			whOrder := WareHouseInfo{}
			whOrder.Quantity = loiMaterial.Quantity
			whOrder.PN = loiMaterial.Product
			whHistory := WareHouseHistory{}
			whHistory.PullRefNo = loiMaterial.RefNo
			whHistory.UpdateDate = loiMaterial.PullDate
			whHistory.Qty = loiMaterial.Quantity

			whOrder.WHHistory = append(whOrder.WHHistory, whHistory)
			c, _ = json.Marshal(whOrder)
			stub.PutState(warehouse_key, c)
		}

	} else if Objtype == "LG" {
		var loiGRInfo LOIGRInfo
		err := json.Unmarshal(valAsbytes, &loiGRInfo)
		if err != nil {
			return err
		}
		var c []byte
		err, warehouse_key := generateKey(stub, WAREHOUSE_KEY, []string{loiGRInfo.PN})
		fmt.Println("LG: write ledger data in warehouse, warehouse_key:" + warehouse_key)

		if err != nil {
			return err
		}
		whObjAsbytes, err := stub.GetState(warehouse_key)
		if err != nil {
			return err
		}
		whOrder := WareHouseInfo{}
		if whObjAsbytes != nil {
			err = json.Unmarshal(whObjAsbytes, &whOrder)
			if err != nil {
				return err
			}
			whOrder.Quantity = whOrder.Quantity + loiGRInfo.Qty
			whHistory := WareHouseHistory{}
			whHistory.GRNO = loiGRInfo.GRNO
			whHistory.UpdateDate = loiGRInfo.GRDate
			whHistory.Qty = loiGRInfo.Qty
			whOrder.WHHistory = append(whOrder.WHHistory, whHistory)
			c, _ = json.Marshal(whOrder)
			stub.PutState(warehouse_key, c)

		} else {
			whOrder.Quantity = loiGRInfo.Qty
			whOrder.PN = loiGRInfo.PN
			whHistory := WareHouseHistory{}
			whHistory.GRNO = loiGRInfo.GRNO
			whHistory.UpdateDate = loiGRInfo.GRDate
			whHistory.Qty = loiGRInfo.Qty
			whOrder.WHHistory = append(whOrder.WHHistory, whHistory)
			c, err = json.Marshal(whOrder)
			if err != nil {
				return err
			}
			stub.PutState(warehouse_key, c)
		}
	}
	return nil
}

//创建，修改SO信息
func crSalesOrderInfo(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	fmt.Println(" update SO crSalesOrderInfo  ")
	fmt.Println("write data, crSalesOrderInfo for - ", args)
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting json to create/update SO")
	}
	jsonStr := args[0]
	//vendorNo := args[1]
	//fmt.Println("write data, SO data - "+vendorNo, jsonStr)

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
					cPOMapping := CPONOFLEXPONO{}
					err, cpoKey := generateKey(stub, CPO_KEY, []string{salesOrder.CPONO})
					cpoObjAsbytes, err := stub.GetState(cpoKey)
					if err != nil {
						return shim.Error(err.Error())
					}
					if err == nil && cpoObjAsbytes != nil {
						fmt.Println("write data, update SO-CPO for - " + cpoKey)
						err = json.Unmarshal(cpoObjAsbytes, &cPOMapping)
						cPOMapping.CPONO = salesOrder.CPONO
						cPOMapping.SONUMBER = salesOrder.SONUMBER
						cPOMapping.SOITEM = salesOrder.SOITEM
						c, _ = json.Marshal(cPOMapping)
					} else {
						fmt.Println("write data, insert SO-CPO for - " + cpoKey)
						cPOMapping.CPONO = salesOrder.CPONO
						cPOMapping.SONUMBER = salesOrder.SONUMBER
						cPOMapping.SOITEM = salesOrder.SOITEM
						c, _ = json.Marshal(cPOMapping)
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
	//vendorNo := args[1]
	//fmt.Println("write data, PO data - " + vendorNo, jsonStr)
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
									cPOMapping := CPONOFLEXPONO{}
									err, cpoKey := generateKey(stub, CPO_KEY, []string{oldSalesOrder.CPONO})
									cpoObjAsbytes, err := stub.GetState(cpoKey)
									if err != nil {
										return shim.Error(err.Error())
									}
									if err == nil && cpoObjAsbytes != nil {
										fmt.Println("write data, update SO-CPO for - " + cpoKey)
										err = json.Unmarshal(cpoObjAsbytes, &cPOMapping)
										cPOMapping.CPONO = oldSalesOrder.CPONO
										cPOMapping.PONO = oldSalesOrder.PONO
										cPOMapping.POITEM = oldSalesOrder.POITEM
										c, _ = json.Marshal(cPOMapping)
									} else {
										fmt.Println("write data, insert SO-CPO for - " + cpoKey)
										cPOMapping.CPONO = oldSalesOrder.CPONO
										cPOMapping.PONO = oldSalesOrder.PONO
										cPOMapping.POITEM = oldSalesOrder.POITEM
										c, _ = json.Marshal(cPOMapping)
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
	//fmt.Println("write data, CPONO data - ", jsonStr)
	var cPOrders [] ODMPurchaseOrder

	err := json.Unmarshal([]byte(jsonStr), &cPOrders)
	if err != nil {
		return shim.Error(err.Error())
	}
	for _, order := range cPOrders {
		if order.FLEXPONO != "" {
			err, flexKey := generateKey(stub, FLEX_KEY, []string{order.FLEXPONO})
			fmt.Println("write data, Flex for - " + flexKey)
			if err != nil {
				return shim.Error(err.Error())
			}
			cpoObjAsbytes, err := stub.GetState(flexKey)
			if err == nil && cpoObjAsbytes != nil {
				var c []byte
				cPOOrder := ODMPurchaseOrder{}
				err = json.Unmarshal(cpoObjAsbytes, &cPOOrder)
				if err != nil {
					return shim.Error(err.Error())
				}
				if order.TRANSDOC == "GR" {
					for _, subObject := range order.ODMGRInfos {
						//cPOOrder.GRInfos = append(cPOOrder.GRInfos, subObject)
						var exist = false
						for i, child := range cPOOrder.ODMGRInfos {
							if child.GRNO == subObject.GRNO {
								cPOOrder.ODMGRInfos[i] = subObject
								exist = true
							}
						}
						if (exist == false) {
							cPOOrder.ODMGRInfos = append(cPOOrder.ODMGRInfos, subObject)
						}

					}
				} else if order.TRANSDOC == "PY" {

					for _, subObject := range order.ODMPayments {
						//cPOOrder.Payments = append(cPOOrder.Payments, subObject)
						var exist = false
						for i, child := range cPOOrder.ODMPayments {
							if child.FlexInvoiceNO == subObject.FlexInvoiceNO {
								cPOOrder.ODMPayments[i] = subObject
								exist = true
							}
						}
						if (!exist) {
							cPOOrder.ODMPayments = append(cPOOrder.ODMPayments, subObject)
						}
					}
				}
				c, _ = json.Marshal(cPOOrder)
				stub.PutState(flexKey, c)
			} else {
				//fmt.Println("insert Flex object", order)
				var c []byte
				cPOOrder := ODMPurchaseOrder{}
				if order.TRANSDOC == "GR" {
					cPOOrder.ODMGRInfos = order.ODMGRInfos
				} else if order.TRANSDOC == "PY" {
					cPOOrder.ODMPayments = order.ODMPayments
				}
				c, _ = json.Marshal(cPOOrder)
				stub.PutState(flexKey, c)
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
	//fmt.Println("write data, Supplier Object data - " + vendorNo, jsonStr)

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
			//if (order.PONumber != "" && order.POItem != "") {
			//	err, poKey, b := updatePurchaseOrderBySupplier(stub, c)
			//	if err != nil {
			//		return shim.Error(err.Error())
			//	}
			//	if b == nil {
			//		return shim.Error("PO item NO is not correct")
			//	}
			//	stub.PutState(poKey, b)
			//}

			stub.PutState(sup_key, c)

		} else {
			return shim.Error("ASNNumber is required")
		}
	}
	return shim.Success(nil)
}

// Upload  LOI GR
func crCGoodReceiveInfo(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting json to create/update Supplier Object")
	}
	jsonStr := args[0]
	//vendorNo := args[1]
	//fmt.Println("write data, Supplier Object data - " + vendorNo, jsonStr)

	var grInfos [] LOIGRInfo

	err := json.Unmarshal([]byte(jsonStr), &grInfos)
	if err != nil {
		return shim.Error(err.Error())
	}
	for _, grInfo := range grInfos {
		if grInfo.PN != "" && grInfo.GRNO != "" {
			err, loi_key := generateKey(stub, LOI_KEY, []string{grInfo.GRNO})
			fmt.Println("write data, LOI GR part for - " + loi_key)
			if err != nil {
				return shim.Error(err.Error())
			}
			//loiObjAsbytes, err := stub.GetState(loi_key)
			var c []byte
			c, _ = json.Marshal(grInfo)
			//if err == nil && loiObjAsbytes != nil {
			//	loiGROrder := LOIGRInfo{}
			//	err = json.Unmarshal(loiObjAsbytes, &loiGROrder)
			//	if err != nil {
			//		return shim.Error(err.Error())
			//	}
			//	loiGROrder.Qty = grInfo.Qty + loiGROrder.Qty
			//	c, _ = json.Marshal(loiGROrder)
			//} else {
			//	c, _ = json.Marshal(grInfo)
			//}
			stub.PutState(loi_key, c)
			err = updateWarehouse(stub, c, "LG")
			if err != nil {
				return shim.Error(err.Error())
			}
		} else {
			return shim.Error("Part NO. and GR NO are required")
		}
	}
	return shim.Success(nil)
}

// Upload  SOI Inventory Data
func crCSOIInventoryInfo(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting json to SOI Inventory Object")
	}
	jsonStr := args[0]
	//vendorNo := args[1]
	//fmt.Println("write data, SOI Inventory Object data - " + vendorNo, jsonStr)

	var soiInventorys [] SOIInventory

	err := json.Unmarshal([]byte(jsonStr), &soiInventorys)
	if err != nil {
		return shim.Error(err.Error())
	}
	for _, inventory := range soiInventorys {
		if inventory.PN != "" {
			err, soi_key := generateKey(stub, SOI_KEY, []string{inventory.PN})
			fmt.Println("write data, SOI Inventory for - " + soi_key)
			if err != nil {
				return shim.Error(err.Error())
			}
			//soiObjAsbytes, err := stub.GetState(soi_key)
			var c []byte
			//if err == nil && soiObjAsbytes != nil {
			//	soiInventory := SOIInventory{}
			//	err = json.Unmarshal(soiObjAsbytes, &soiInventory)
			//	if err != nil {
			//		return shim.Error(err.Error())
			//	}
			//	soiInventory = inventory
			//	c, _ = json.Marshal(soiInventory)
			//} else {
			//	c, _ = json.Marshal(inventory)
			//}
			c, _ = json.Marshal(inventory)
			stub.PutState(soi_key, c)

		} else {
			return shim.Error("PN is required")
		}
	}
	return shim.Success(nil)
}

//init WareHouse
func initWHQty(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting json to init Warehouse Object")
	}
	jsonStr := args[0]
	//vendorNo := args[1]
	//fmt.Println("write data, initial Warehouse Object data - " + vendorNo, jsonStr)

	var warehouses [] LOIGRInfo

	err := json.Unmarshal([]byte(jsonStr), &warehouses)
	if err != nil {
		return shim.Error(err.Error())
	}
	for _, warehouse := range warehouses {
		if warehouse.GRNO == "" {
			warehouse.GRNO = "stocktaking"
		}
		if warehouse.PN != "" && warehouse.GRNO != ""{
			err, warehouse_key := generateKey(stub, WAREHOUSE_KEY, []string{warehouse.PN})
			fmt.Println("write data, WareHouse part for - " + warehouse_key)
			if err != nil {
				return shim.Error(err.Error())
			}
			whObjAsbytes, err := stub.GetState(warehouse_key)
			if err != nil {
				return shim.Error(err.Error())
			}
			whOrder := WareHouseInfo{}
			if whObjAsbytes != nil {
				err = json.Unmarshal(whObjAsbytes, &whOrder)
				if err != nil {
					return shim.Error(err.Error())
				}
				warehouse.Qty = warehouse.Qty - whOrder.Quantity
			}
			err, loi_key := generateKey(stub, LOI_KEY, []string{warehouse.GRNO})
			fmt.Println("write data, LOI GR part for - " + loi_key)
			if err != nil {
				return shim.Error(err.Error())
			}
			var c []byte
			c, _ = json.Marshal(warehouse)
			stub.PutState(loi_key, c)
			err = updateWarehouse(stub, c, "LG")
			if err != nil {
				return shim.Error(err.Error())
			}
		} else {
			return shim.Error(" Fields (PN and Quantity) are required")
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
