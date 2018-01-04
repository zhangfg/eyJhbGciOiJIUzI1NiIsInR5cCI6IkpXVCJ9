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
	if KeyPrefix == "SO" {
		return filterSalesOrder(valAsbytes, userRole);
	} else if KeyPrefix == "PO" {
		return filterPurchaseOrder(valAsbytes, userRole);
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
	if userRole != "lenovo" {
		salesOrder.NETPRICE = STAR;
		salesOrder.NETVALUE = STAR;
	}
	b, err := json.Marshal(salesOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	return nil, b
}

func filterPurchaseOrder(valAsbytes []byte, userRole string) (error, []byte) {
	purchaseOrder := PurchaseOrder{}
	err := json.Unmarshal(valAsbytes, &purchaseOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	if userRole != "lenovo" {
		purchaseOrder.POItemChgDate = STAR;
	}
	b, err := json.Marshal(purchaseOrder)
	if err != nil {
		return errors.New(err.Error()), nil
	}
	return nil, b
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
	fmt.Println("- end read")
	return shim.Success(valAsbytes)
}

func getQueryResultById(stub shim.ChaincodeStubInterface, queryKey string) (error, []byte) {
	valAsbytes, err := stub.GetState(queryKey)
	fmt.Println("query data, for - " + queryKey)
	if err != nil {
		return errors.New("\"Error\":\"Failed to get state for " + queryKey + "\""), nil
	}
	return nil, valAsbytes
}

func queryByIds(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments.")
	}

	var params []QueryParam
	jsonStr := args[1]
	userRole := args[0]
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
	fmt.Printf("- getHistory returning:\n%s", buffer.String())

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
		buffer.WriteString(string(valAsbytes))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")

	fmt.Printf("- getByRange queryResult:\n%s\n", buffer.String())

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
		buffer.WriteString(string(valAsbytes))
		buffer.WriteString("}")
		bArrayMemberAlreadyWritten = true
	}
	buffer.WriteString("]")
	fmt.Printf("- getByRange queryResult:\n%s\n", buffer.String())
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
	fmt.Printf("- getQueryResult :\n%s\n", buffer.String())
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
