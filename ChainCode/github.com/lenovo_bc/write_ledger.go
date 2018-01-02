package main

import (
	// "bytes"
	// "fmt"
	// "encoding/pem"
	// "crypto/x509"
	"encoding/json"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

//创建，修改SO信息
func crSalesOrderInfo(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting json to create/update SO")
	}
	jsonStr := args[0]
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
	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting json to create/update farm")
	}
	jsonStr := args[0]
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
			//fmt.Println("query data, for - " + key)
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
				//fmt.Println("query data, for obj.TRANSDOC- " + obj.TRANSDOC)
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
						// fmt.Println("SO soKey is "+soKey )
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
