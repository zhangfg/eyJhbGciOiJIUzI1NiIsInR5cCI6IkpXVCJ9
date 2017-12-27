package main

import (
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
)

var logger = shim.NewLogger("lenovo_bc")

type SmartContract struct {
}

func (t *SmartContract) Init(stub shim.ChaincodeStubInterface) pb.Response {
	// do nothing
	return shim.Success(nil)
}

func (t *SmartContract) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	function, args := stub.GetFunctionAndParameters()
	fmt.Println(" ")
	fmt.Println("starting invoke, for - " + function)

	if function == "init" {
		return t.Init(stub)
	} else if function == "crSalesOrderInfo" {
		return crSalesOrderInfo(stub, args)
	} else if function == "crPurchaseOrderInfo" {
		return crPurchaseOrderInfo(stub, args)
	} else if function == "queryById" {
		return queryById(stub, args)
	} else if function == "queryHistoryById" {
		return queryHistoryById(stub, args)
	} else if function == "queryByIdRange" {
		return queryByIdRange(stub, args)
	} else if function == "queryByPartialCompositeKey" {
		return queryByPartialCompositeKey(stub, args)
	} else if function == "getQueryResult" {
		return getQueryResult(stub, args)
	} else if function == "queryByIds" {
		return queryByIds(stub, args)
	} else if function == "removeFromStateByKey" {
		return removeFromStateByKey(stub, args)
	}

	fmt.Println("Received unknown invoke function name - " + function)
	return shim.Error("Received unknown invoke function name - '" + function + "'")
}

func (t *SmartContract) query(stub shim.ChaincodeStubInterface) pb.Response {
	return shim.Error("Unknown supported call - Query()")
}

func main() {
	err := shim.Start(new(SmartContract))
	if err != nil {
		logger.Errorf("Error starting smartcontract chaincode: %s", err)
	}
}
