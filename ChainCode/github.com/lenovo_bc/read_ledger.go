package main

import (
	// "github.com/hyperledger/fabric/core/chaincode/lib/cid"
	// "encoding/pem"
	// "crypto/x509"
	"errors"
	"encoding/json"
	"bytes"
	"strconv"
	"time"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

func filterByUserRole(valAsbytes []byte, KeyPrefix string, userRole string) (error, []byte) {
	fmt.Println("filterByUserRole,KeyPrefix=" + KeyPrefix + ",userRole=" + userRole)
	if KeyPrefix == SO_KEY {
		return filterSalesOrder(valAsbytes, userRole)
	} else if KeyPrefix == PO_KEY {
		return filterPurchaseOrder(valAsbytes, userRole)
	} else if KeyPrefix == FLEX_KEY {
		return filterCPurchaseOrder(valAsbytes, userRole)
	} else {
		return nil, valAsbytes
	}
	return errors.New("Unknown query type '" + KeyPrefix + "'"), nil
}

func filterSalesOrder(valAsbytes []byte, userRole string) (error, []byte) {
	salesOrder := SalesOrder{}
	err := json.Unmarshal(valAsbytes, &salesOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	if userRole != ROLE_ID_LENOVO && userRole != ROLE_ID_ODM {
		salesOrder.NETPRICE = STAR
		salesOrder.NETVALUE = STAR
		salesOrder.CURRENCY = STAR
		for _, billing := range salesOrder.BILLINFOS {
			billing.NETVALUE = STAR
			billing.TAXAMOUNT = STAR
			billing.CURRENCY = STAR
		}

	}
	b, err := json.Marshal(salesOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	return nil, b
}

func filterPurchaseOrder(valAsbytes []byte, userRole string) (error, []byte) {
	fmt.Println("filterPurchaseOrder,userRole=" + userRole)
	purchaseOrder := PurchaseOrder{}
	err := json.Unmarshal(valAsbytes, &purchaseOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	if userRole != ROLE_ID_LENOVO && userRole != ROLE_ID_ODM {
		//purchaseOrder.POItemChgDate = STAR;
	}
	b, err := json.Marshal(purchaseOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	return nil, b
}

func filterCPurchaseOrder(valAsbytes []byte, userRole string) (error, []byte) {
	fmt.Println("filterCPurchaseOrder,userRole=" + userRole)
	cPoOrder := ODMPurchaseOrder{}
	err := json.Unmarshal(valAsbytes, &cPoOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	if userRole != ROLE_ID_LENOVO && userRole != ROLE_ID_ODM {
		//purchaseOrder.POItemChgDate = STAR;
		for _, cpo := range cPoOrder.ODMPayments {
			cpo.INVOICESTATUS = STAR
		}
	}
	b, err := json.Marshal(cPoOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	return nil, b
}

func integrateLedger(stub shim.ChaincodeStubInterface, valAsbytes []byte, KeyPrefix string, userRole string) (error, []byte) {
	fmt.Println("integrateLedger,KeyPrefix=" + KeyPrefix + ",userRole=" + userRole)
	if KeyPrefix == SO_KEY {
		return integrateSalesOrderLedger(stub, valAsbytes, userRole)
	} else if KeyPrefix == PO_KEY {
		return integratePurchaseOrderLedger(stub, valAsbytes, userRole)
	} else if KeyPrefix == FLEX_KEY {
		return integrateFlexPurchaseOrderLedger(stub, valAsbytes, userRole)
	} else if KeyPrefix == CPO_KEY {
		return integrateCustomerPurchaseOrderLedger(stub, valAsbytes, userRole)
	} else if KeyPrefix == SUPPLIER_KEY {
		return integrateSupplierOrderLedger(stub, valAsbytes, userRole)
	} else if KeyPrefix == WAREHOUSE_KEY {
		return integrateWareHouseLedger(stub, valAsbytes, userRole)
	} else {
		return nil, valAsbytes
	}
	return errors.New("Unknown query type '" + KeyPrefix + "'"), nil
}

func integrateSalesOrderLedger(stub shim.ChaincodeStubInterface, valAsbytes []byte, userRole string) (error, []byte) {

	salesOrder := SalesOrder{}
	err := json.Unmarshal(valAsbytes, &salesOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	order := POAndSOOrder{}
	order.SONUMBER = salesOrder.SONUMBER
	order.SOITEM = salesOrder.SOITEM
	order.PONO = salesOrder.PONO
	order.POITEM = salesOrder.POITEM
	var c []byte
	if salesOrder.CPONO != "" {
		err, cpoKey := generateKey(stub, CPO_KEY, []string{salesOrder.CPONO})
		fmt.Println("get CPO object in SO,CPO key:" + cpoKey)
		if err == nil {
			cpoObjAsbytes, err := stub.GetState(cpoKey)
			err, cpoObjAsbytes = filterByUserRole(cpoObjAsbytes, CPO_KEY, userRole)
			if err == nil && cpoObjAsbytes != nil {
				cpoOrder := CPONOFLEXPONO{}
				err := json.Unmarshal(cpoObjAsbytes, &cpoOrder)
				if err == nil {
					for _, flexPONo := range cpoOrder.FLEXPONO {
						flexOrder := ODMPurchaseOrder{}
						err, flexKey := generateKey(stub, FLEX_KEY, []string{flexPONo})
						fmt.Println("get Flex object in SO,Flex key:" + flexKey)
						if err == nil {
							flexObjAsbytes, err := stub.GetState(flexKey)
							err, flexObjAsbytes = filterByUserRole(flexObjAsbytes, FLEX_KEY, userRole)
							if err == nil && flexObjAsbytes != nil {
								err = json.Unmarshal(flexObjAsbytes, &flexOrder)
								salesOrder.ODMPayments = append(salesOrder.ODMPayments, flexOrder.ODMPayments...)
								salesOrder.ODMGRInfos = append(salesOrder.ODMGRInfos, flexOrder.ODMGRInfos...)
							}
						}
					}

				}
			}
		}
	}

	order.SalesOrder = salesOrder
	if salesOrder.PONO != "" && salesOrder.POITEM != "" {
		POOrder := PurchaseOrder{}
		err, poKey := generateKey(stub, PO_KEY, []string{salesOrder.PONO, salesOrder.POITEM})
		fmt.Println("get PO object in SO,PO key:" + poKey)
		if err == nil {
			poObjAsbytes, err := stub.GetState(poKey)
			if err == nil {
				err, poObjAsbytes = filterByUserRole(poObjAsbytes, PO_KEY, userRole)
				if err == nil && poObjAsbytes != nil {
					err = json.Unmarshal(poObjAsbytes, &POOrder)
					for _, inbdItem := range POOrder.InboundDelivery {
						supOrder := SupplierOrder{}
						err, supKey := generateKey(stub, SUPPLIER_KEY, []string{inbdItem.VendorNO, inbdItem.ASNNO})
						fmt.Println("get Supplier object in SO,Supplier key:" + supKey)
						if err == nil {
							supObjAsbytes, err := stub.GetState(supKey)
							err, supObjAsbytes = filterByUserRole(supObjAsbytes, SUPPLIER_KEY, userRole)
							if err == nil {
								err, supObjAsbytes = filterByUserRole(supObjAsbytes, SUPPLIER_KEY, userRole)
								if err == nil && supObjAsbytes != nil {
									err = json.Unmarshal(supObjAsbytes, &supOrder)
									inbdItem.SupplierOrder = supOrder
								}
							}
						}
					}

					order.PurchaseOrder = POOrder
				}

			}
		}
	}

	c, _ = json.Marshal(order)
	return nil, c
}
func integratePurchaseOrderLedger(stub shim.ChaincodeStubInterface, valAsbytes []byte, userRole string) (error, []byte) {
	purchaseOrder := PurchaseOrder{}
	err := json.Unmarshal(valAsbytes, &purchaseOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	var c []byte
	order := POAndSOOrder{}
	order.SONUMBER = purchaseOrder.SONUMBER
	order.SOITEM = purchaseOrder.SOITEM
	order.PONO = purchaseOrder.PONO
	order.POITEM = purchaseOrder.POItemNO
	if purchaseOrder.SONUMBER != "" && purchaseOrder.SOITEM != "" {
		salesOrder := SalesOrder{}
		err, soKey := generateKey(stub, SO_KEY, []string{purchaseOrder.SONUMBER, purchaseOrder.SOITEM})
		fmt.Println("get SO object in PO,SO key:" + soKey)
		if err == nil {
			soObjAsbytes, err := stub.GetState(soKey)
			if err == nil && soObjAsbytes != nil {
				err, soObjAsbytes = filterByUserRole(soObjAsbytes, SO_KEY, userRole)
				err = json.Unmarshal(soObjAsbytes, &salesOrder)

				err, cpoKey := generateKey(stub, CPO_KEY, []string{salesOrder.CPONO})
				fmt.Println("get CPO object in SO,CPO key:" + cpoKey)
				if err == nil {
					cpoObjAsbytes, err := stub.GetState(cpoKey)
					err, cpoObjAsbytes = filterByUserRole(cpoObjAsbytes, CPO_KEY, userRole)
					if err == nil && cpoObjAsbytes != nil {
						cpoOrder := CPONOFLEXPONO{}
						err := json.Unmarshal(cpoObjAsbytes, &cpoOrder)
						if err == nil {
							for _, flexPONo := range cpoOrder.FLEXPONO {
								flexOrder := ODMPurchaseOrder{}
								err, flexKey := generateKey(stub, FLEX_KEY, []string{flexPONo})
								fmt.Println("get Flex object in SO,Flex key:" + flexKey)
								if err == nil {
									flexObjAsbytes, err := stub.GetState(flexKey)
									err, flexObjAsbytes = filterByUserRole(flexObjAsbytes, FLEX_KEY, userRole)
									if err == nil && flexObjAsbytes != nil {
										err = json.Unmarshal(flexObjAsbytes, &flexOrder)
										salesOrder.ODMPayments = append(salesOrder.ODMPayments, flexOrder.ODMPayments...)
										salesOrder.ODMGRInfos = append(salesOrder.ODMGRInfos, flexOrder.ODMGRInfos...)
									}
								}
							}

						}
					}

				}

				order.SalesOrder = salesOrder
			}
		}
	}
	for _, inbdItem := range purchaseOrder.InboundDelivery {
		supOrder := SupplierOrder{}
		err, supKey := generateKey(stub, SUPPLIER_KEY, []string{inbdItem.VendorNO, inbdItem.ASNNO})
		fmt.Println("get Supplier object in SO,Supplier key:" + supKey)
		if err == nil {
			supObjAsbytes, err := stub.GetState(supKey)
			if err == nil {
				err, supObjAsbytes = filterByUserRole(supObjAsbytes, SUPPLIER_KEY, userRole)
				if err == nil && supObjAsbytes != nil {
					err = json.Unmarshal(supObjAsbytes, &supOrder)
					inbdItem.SupplierOrder = supOrder
				}

			}
		}
	}
	order.PurchaseOrder = purchaseOrder
	c, _ = json.Marshal(order)
	return nil, c
}

func integrateFlexPurchaseOrderLedger(stub shim.ChaincodeStubInterface, valAsbytes []byte, userRole string) (error, []byte) {
	flexOrder := ODMPurchaseOrder{}
	err := json.Unmarshal(valAsbytes, &flexOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	var c []byte
	if flexOrder.CPONO != "" {
		err, cpoKey := generateKey(stub, CPO_KEY, []string{flexOrder.CPONO})
		fmt.Println("get CPO object in Flex Object, cpokey:" + cpoKey)
		if err == nil {
			cpoObjAsbytes, err := stub.GetState(cpoKey)
			err, cpoObjAsbytes = filterByUserRole(cpoObjAsbytes, CPO_KEY, userRole)
			if err == nil && cpoObjAsbytes != nil {
				cPoOrder := CPONOFLEXPONO{}
				err := json.Unmarshal(cpoObjAsbytes, &cPoOrder)
				if err == nil {
					if cPoOrder.SONUMBER != "" && cPoOrder.SOITEM != "" {
						soOrder := SalesOrder{}
						err, soKey := generateKey(stub, SO_KEY, []string{cPoOrder.SONUMBER, cPoOrder.SOITEM})
						fmt.Println("get SO object in Flex Object, sokey:" + soKey)
						if err == nil {
							soObjAsbytes, err := stub.GetState(soKey)
							if err == nil && soObjAsbytes != nil {
								err, soObjAsbytes = filterByUserRole(soObjAsbytes, SO_KEY, userRole)
								err = json.Unmarshal(soObjAsbytes, &soOrder)
								cPoOrder.SalesOrder = soOrder
							}
						}
					}

					if cPoOrder.PONO != "" && cPoOrder.POITEM != "" {
						poOrder := PurchaseOrder{}
						err, poKey := generateKey(stub, PO_KEY, []string{cPoOrder.PONO, cPoOrder.POITEM})
						fmt.Println("get PO object in Flex Object, poKey:" + poKey)
						if err == nil {
							poObjAsbytes, err := stub.GetState(poKey)
							if err == nil && poObjAsbytes != nil {
								err, poObjAsbytes = filterByUserRole(poObjAsbytes, PO_KEY, userRole)
								err = json.Unmarshal(poObjAsbytes, &poOrder)
								for _, inbdItem := range poOrder.InboundDelivery {
									supOrder := SupplierOrder{}
									err, supKey := generateKey(stub, SUPPLIER_KEY, []string{inbdItem.VendorNO, inbdItem.ASNNO})
									fmt.Println("get Supplier object in SO,Supplier key:" + supKey)
									if err == nil {
										supObjAsbytes, err := stub.GetState(supKey)
										if err == nil && supObjAsbytes != nil {
											err, supObjAsbytes = filterByUserRole(supObjAsbytes, SUPPLIER_KEY, userRole)
											err = json.Unmarshal(supObjAsbytes, &supOrder)
											inbdItem.SupplierOrder = supOrder
										}
									}
								}
								cPoOrder.PurchaseOrder = poOrder
							}
						}
					}

				}
				flexOrder.CPONOFLEXPONO = cPoOrder
			}
		}
	}

	c, _ = json.Marshal(flexOrder)
	return nil, c
}

func integrateCustomerPurchaseOrderLedger(stub shim.ChaincodeStubInterface, valAsbytes []byte, userRole string) (error, []byte) {
	cPoOrder := CPONOFLEXPONO{}
	err := json.Unmarshal(valAsbytes, &cPoOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	var c []byte
	if cPoOrder.SONUMBER != "" && cPoOrder.SOITEM != "" {
		soOrder := SalesOrder{}
		err, soKey := generateKey(stub, SO_KEY, []string{cPoOrder.SONUMBER, cPoOrder.SOITEM})
		fmt.Println("get SO object in CPO, sokey:" + soKey)
		if err == nil {
			soObjAsbytes, err := stub.GetState(soKey)
			if err == nil && soObjAsbytes != nil {
				err, soObjAsbytes = filterByUserRole(soObjAsbytes, SO_KEY, userRole)
				err = json.Unmarshal(soObjAsbytes, &soOrder)
				cPoOrder.SalesOrder = soOrder
			}
		}
	}

	if cPoOrder.PONO != "" && cPoOrder.POITEM != "" {
		poOrder := PurchaseOrder{}
		err, poKey := generateKey(stub, PO_KEY, []string{cPoOrder.PONO, cPoOrder.POITEM})
		fmt.Println("get PO object in CPO, poKey:" + poKey)
		if err == nil {
			poObjAsbytes, err := stub.GetState(poKey)
			if err == nil && poObjAsbytes != nil {
				err, poObjAsbytes = filterByUserRole(poObjAsbytes, PO_KEY, userRole)
				err = json.Unmarshal(poObjAsbytes, &poOrder)
				for _, inbdItem := range poOrder.InboundDelivery {
					supOrder := SupplierOrder{}
					err, supKey := generateKey(stub, SUPPLIER_KEY, []string{inbdItem.VendorNO, inbdItem.ASNNO})
					fmt.Println("get Supplier object in SO,Supplier key:" + supKey)
					if err == nil {
						supObjAsbytes, err := stub.GetState(supKey)
						if err == nil && supObjAsbytes != nil {
							err, supObjAsbytes = filterByUserRole(supObjAsbytes, SUPPLIER_KEY, userRole)
							err = json.Unmarshal(supObjAsbytes, &supOrder)
							inbdItem.SupplierOrder = supOrder
						}
					}
				}
				cPoOrder.PurchaseOrder = poOrder
			}
		}
	}

	c, _ = json.Marshal(cPoOrder)
	return nil, c
}

func integrateSupplierOrderLedger(stub shim.ChaincodeStubInterface, valAsbytes []byte, userRole string) (error, []byte) {
	supOrder := SupplierOrder{}
	err := json.Unmarshal(valAsbytes, &supOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	var c []byte

	if supOrder.PONumber != "" && supOrder.POItem != "" {
		poOrder := PurchaseOrder{}
		err, poKey := generateKey(stub, PO_KEY, []string{supOrder.PONumber, supOrder.POItem})
		fmt.Println("get PO object in Supplier, poKey:" + poKey)
		if err == nil {
			poObjAsbytes, err := stub.GetState(poKey)
			if err == nil && poObjAsbytes != nil {
				err, poObjAsbytes = filterByUserRole(poObjAsbytes, PO_KEY, userRole)
				err = json.Unmarshal(poObjAsbytes, &poOrder)
				supOrder.PurchaseOrder = poOrder

				soOrder := SalesOrder{}
				err, soKey := generateKey(stub, SO_KEY, []string{poOrder.SONUMBER, poOrder.SOITEM})
				fmt.Println("get SO object in Supplier, sokey:" + soKey)
				if err == nil {
					soObjAsbytes, err := stub.GetState(soKey)
					if err == nil && soObjAsbytes != nil {
						err, soObjAsbytes = filterByUserRole(soObjAsbytes, SO_KEY, userRole)
						err = json.Unmarshal(soObjAsbytes, &soOrder)
						supOrder.SalesOrder = soOrder
					}
				}
			}
		}
	}

	c, _ = json.Marshal(supOrder)
	return nil, c
}

func integrateWareHouseLedger(stub shim.ChaincodeStubInterface, valAsbytes []byte, userRole string) (error, []byte) {
	whOrder := WareHouseInfo{}
	err := json.Unmarshal(valAsbytes, &whOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	var c []byte
	for _, whHistory := range whOrder.WHHistory {
		if whHistory.GRNO != "" {
			grOrder := LOIGRInfo{}
			err, grKey := generateKey(stub, LOI_KEY, []string{whHistory.GRNO})
			if err == nil {
				grObjAsbytes, err := stub.GetState(grKey)
				err, grObjAsbytes = filterByUserRole(grObjAsbytes, LOI_KEY, userRole)
				if err == nil && grObjAsbytes != nil {
					err = json.Unmarshal(grObjAsbytes, &grOrder)
					whHistory.LOIGRInfo = grOrder
				}
			}
		}
		if whHistory.PullRefNo != "" {
			pullOrder := ODMLOIMaterial{}
			err, pullKey := generateKey(stub, PULL_KEY, []string{whHistory.PullRefNo})
			if err == nil {
				pullObjAsbytes, err := stub.GetState(pullKey)
				err, pullObjAsbytes = filterByUserRole(pullObjAsbytes, PULL_KEY, userRole)
				if err == nil && pullObjAsbytes != nil {
					err = json.Unmarshal(pullObjAsbytes, &pullOrder)

					if pullOrder.FLEXPONO != "" {
						// GET CPONO
						err, cpoKey := generateKey(stub, CPO_KEY, []string{pullOrder.FLEXPONO})
						if err == nil {
							cpoObject := CPONOFLEXPONO{}
							cpoObjAsbytes, err := stub.GetState(cpoKey)
							err, cpoObjAsbytes = filterByUserRole(cpoObjAsbytes, CPO_KEY, userRole)
							if err == nil && cpoObjAsbytes != nil {
								err = json.Unmarshal(cpoObjAsbytes, &cpoObject)

								//if cpoObject.SONUMBER != "" && cpoObject.SOITEM != "" {
								//	soOrder := SalesOrder{}
								//	err, soKey := generateKey(stub, SO_KEY, []string{cpoObject.SONUMBER, cpoObject.SOITEM})
								//	fmt.Println("get SO object in Flex Object, sokey:" + soKey)
								//	if err == nil {
								//		soObjAsbytes, err := stub.GetState(soKey)
								//		if err == nil {
								//			err, soObjAsbytes = filterByUserRole(soObjAsbytes, SO_KEY, userRole)
								//			err = json.Unmarshal(soObjAsbytes, &soOrder)
								//			cpoObject.SalesOrder = soOrder
								//		}
								//	}
								//}
								//
								//if cpoObject.PONO != "" && cpoObject.POITEM != "" {
								//	poOrder := PurchaseOrder{}
								//	err, poKey := generateKey(stub, PO_KEY, []string{cpoObject.PONO, cpoObject.POITEM})
								//	fmt.Println("get PO object in Flex Object, poKey:" + poKey)
								//	if err == nil {
								//		poObjAsbytes, err := stub.GetState(poKey)
								//		if err == nil {
								//			err, poObjAsbytes = filterByUserRole(poObjAsbytes, PO_KEY, userRole)
								//			err = json.Unmarshal(poObjAsbytes, &poOrder)
								//			cpoObject.PurchaseOrder = poOrder
								//		}
								//	}
								//}
								pullOrder.CPONOFLEXPONO = cpoObject
							}
						}
					}
					whHistory.GRMaterial = pullOrder
				}
			}

		}
	}
	c, _ = json.Marshal(whOrder)
	return nil, c
}

//根据ID查询账本
func queryById(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	err, keyStart, _ := generateQueryKey(stub, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	jsonStr := args[1]
	param := QueryParam{}
	json.Unmarshal([]byte(jsonStr), &param)
	keyPrefix := param.KeyPrefix
	userRole := args[0]

	valAsbytes, err := stub.GetState(keyStart)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + keyStart + "\"}"
		return shim.Error(jsonResp)
	}

	err, valAsbytes = filterByUserRole(valAsbytes, keyPrefix, userRole)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + keyStart + "\"}"
		return shim.Error(jsonResp)
	}
	err, valAsbytes = integrateLedger(stub, valAsbytes, keyPrefix, userRole)
	fmt.Println("- end read")
	return shim.Success(valAsbytes)
}

func getQueryResultById(stub shim.ChaincodeStubInterface, queryKey string) (error, []byte) {
	valAsbytes, err := stub.GetState(queryKey)
	fmt.Println("query data, key - " + queryKey)
	if err != nil || valAsbytes == nil {
		return errors.New("\"Error\":\"Failed to get state for " + queryKey + "\""), nil
	}
	//fmt.Println("query data, data - " + string(valAsbytes))
	return nil, valAsbytes
}

func queryByIds(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments.")
	}

	var params []QueryParam
	jsonStr := args[1]
	userRole := args[0]
	fmt.Println("userRole:" + userRole)
	err := json.Unmarshal([]byte(jsonStr), &params)
	if err != nil {
		return shim.Error(err.Error())
	}

	var buffer bytes.Buffer
	buffer.WriteString("[")
	bArrayMemberAlreadyWritten := false

	for _, param := range params {
		keyPrefix := param.KeyPrefix
		keysStart := param.KeysStart
		keysEnd := param.KeysEnd
		err, keyStart, _ := generateQueryKey2(stub, keyPrefix, keysStart, keysEnd)
		if err != nil {
			return shim.Error(err.Error())
		}
		err, valAsbytes := getQueryResultById(stub, keyStart)
		if err != nil {
			return shim.Error(err.Error())
		}
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}

		// buffer.WriteString("\"Record\":")
		// Record is a JSON object, so we write as-is
		err, valAsbytes = filterByUserRole(valAsbytes, keyPrefix, userRole)
		if err != nil {
			return shim.Error(err.Error())
		}
		err, valAsbytes = integrateLedger(stub, valAsbytes, keyPrefix, userRole)
		if err != nil {
			return shim.Error(err.Error())
		}
		//fmt.Println("query data, after integrateLedger " + string(valAsbytes))
		buffer.WriteString(string(valAsbytes))
		// buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	return shim.Success(buffer.Bytes())
}

//查询历史
func queryHistoryById(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	err, keyStart, _ := generateQueryKey(stub, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	resultsIterator, err := stub.GetHistoryForKey(keyStart)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false

	for resultsIterator.HasNext() {
		response, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}

		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}

		buffer.WriteString("{\"TxId\":")
		buffer.WriteString("\"")
		buffer.WriteString(response.TxId)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Value\":")

		if response.IsDelete {
			buffer.WriteString("null")
		} else {
			buffer.WriteString(string(response.Value))
		}
		buffer.WriteString(", \"Timestamp\":")
		buffer.WriteString("\"")
		buffer.WriteString(time.Unix(response.Timestamp.Seconds, int64(response.Timestamp.Nanos)).String())
		buffer.WriteString("\"")

		buffer.WriteString(", \"IsDelete\":")
		buffer.WriteString("\"")
		buffer.WriteString(strconv.FormatBool(response.IsDelete))
		buffer.WriteString("\"")

		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	//fmt.Printf("- getHistory returning:\n%s", buffer.String())

	return shim.Success(buffer.Bytes())
}

//根据ID的Range查询
func queryByIdRange(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	fmt.Println("starting read")
	err, keyStart, keyEnd := generateQueryKey(stub, args)
	if err != nil {
		return shim.Error(err.Error())
	}

	jsonStr := args[1]
	param := QueryParam{}
	json.Unmarshal([]byte(jsonStr), &param)
	keyPrefix := param.KeyPrefix
	userRole := args[0]

	resultsIterator, err := stub.GetStateByRange(keyStart, keyEnd)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		err, valAsbytes := filterByUserRole(queryResponse.Value, keyPrefix, userRole)
		err, valAsbytes = integrateLedger(stub, valAsbytes, keyPrefix, userRole)
		buffer.WriteString(string(valAsbytes))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	//fmt.Printf("- getByRange queryResult:\n%s\n", buffer.String())

	return shim.Success(buffer.Bytes())
}

// query by compositeKey
func queryByPartialCompositeKey(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments.")
	}

	jsonStr := args[1]
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

	userRole := args[0]

	resultsIterator, err := stub.GetStateByPartialCompositeKey(param.KeyPrefix, param.KeysStart)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		err, valAsbytes := filterByUserRole(queryResponse.Value, param.KeyPrefix, userRole)
		err, valAsbytes = integrateLedger(stub, valAsbytes, param.KeyPrefix, userRole)
		buffer.WriteString(string(valAsbytes))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	//fmt.Printf("- getByRange queryResult:\n%s\n", buffer.String())
	return shim.Success(buffer.Bytes())
}

// get query with mango query -- support CouchDB
func getQueryResult(stub shim.ChaincodeStubInterface, args []string) pb.Response {

	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments.")
	}

	queryString := args[1]
	// userRole:= args[0]

	resultsIterator, err := stub.GetQueryResult(queryString)
	if err != nil {
		return shim.Error(err.Error())
	}
	defer resultsIterator.Close()

	var buffer bytes.Buffer
	buffer.WriteString("[")

	bArrayMemberAlreadyWritten := false
	for resultsIterator.HasNext() {
		queryResponse, err := resultsIterator.Next()
		if err != nil {
			return shim.Error(err.Error())
		}
		// Add a comma before array members, suppress it for the first array member
		if bArrayMemberAlreadyWritten == true {
			buffer.WriteString(",")
		}
		buffer.WriteString("{\"Key\":")
		buffer.WriteString("\"")
		buffer.WriteString(queryResponse.Key)
		buffer.WriteString("\"")

		buffer.WriteString(", \"Record\":")
		// Record is a JSON object, so we write as-is
		buffer.WriteString(string(queryResponse.Value))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	//fmt.Printf("- getQueryResult :\n%s\n", buffer.String())
	return shim.Success(buffer.Bytes())
}

// func  testCertificate(stub shim.ChaincodeStubInterface, args []string) pb.Response{
// 	creatorByte,_:= stub.GetCreator()
// 	certStart := bytes.IndexAny(creatorByte, "-----BEGIN")
// 	if certStart == -1 {
// 		return shim.Error("No certificate found")
// 	}
// 	certText := creatorByte[certStart:]
// 	bl, _ := pem.Decode(certText)
// 	if bl == nil {
// 		return shim.Error("Could not decode the PEM structure")
// 	}

// 	cert, err := x509.ParseCertificate(bl.Bytes)
// 	if err != nil {
// 	   return shim.Error("ParseCertificate failed")
// 	}
// 	uname:=cert.Subject.CommonName

// 	Issuer:= cert.Issuer.CommonName
// 	fmt.Println("Name:"+uname)

// 	// var bArray []byte 
// 	// for _, ext := range cert.Extensions {
// 	// 	bArray = ext.Value
// 	// }

// 	// fmt.Println("bArray:"+bArray)
// 	return shim.Success([]byte("Called testCertificate:"+uname+"   issuer:"+Issuer))
// 	// return shim.Success(creatorByte)
//  }
