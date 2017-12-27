package main


import (
	"fmt"
	"testing"

	"github.com/hyperledger/fabric/core/chaincode/shim"
)

func checkInit(t *testing.T, stub *shim.MockStub) {
	res := stub.MockInit("1", nil)
	if res.Status != shim.OK {
		fmt.Println("Init failed", string(res.Message))
		t.FailNow()
	}
}

func checkState(t *testing.T, stub *shim.MockStub, name string, value string) {
	bytes := stub.State[name]
	if bytes == nil {
		fmt.Println("State", name, "failed to get value")
		t.FailNow()
	}
	if string(bytes) != value {
		fmt.Println("State value", name, "was not", value, "as expected")
		t.FailNow()
	}
}

func checkQuery(t *testing.T, stub *shim.MockStub, funcName string, args string) {
	res := stub.MockInvoke("1", [][]byte{[]byte(funcName), []byte(args)})
	if res.Status != shim.OK {
		fmt.Println(string(res.Message))
		t.FailNow()
	}
	if res.Payload == nil {
		fmt.Println("Query","", "failed to get value")
		t.FailNow()
	}
	
}

func checkInvoke(t *testing.T, stub *shim.MockStub, args [][]byte) {
	res := stub.MockInvoke("1", args)
	if res.Status != shim.OK {
		fmt.Println("Invoke", args, "failed", string(res.Message))
		t.FailNow()
	}
}


func TestExample02_Init(t *testing.T) {
	scc := new(SmartContract)
	stub := shim.NewMockStub("ex02", scc)

	// Init A=123 B=234
	checkInit(t, stub)
}


func TestExample02_Invoke(t *testing.T) {
	scc := new(SmartContract)
	stub := shim.NewMockStub("ex02", scc)

	// Init A=567 B=678
	checkInit(t, stub)

	// Invoke A->B for 123
	args:= "[{\"SONUMBER\":\"478\",\"SOITEM\":\"1209\",\"SOCDATE\":\"478\",\"SOCTIME\":\"22222\",\"NETPRICE\":\"07\",\"TRANSDOC\":\"SO\"}]"
	checkInvoke(t, stub, [][]byte{[]byte("crSalesOrderInfo"), []byte(args)})
	
	args= "[{\"PONO\":\"478\",\"TRANSDOC\":\"PO\",\"VendorNO\":\"1209\",\"VendorName\":\"478\",\"PODate\":\"22222\",\"POItemNO\":\"07\",\"SONUMBER\":\"478\",\"SOITEM\":\"1209\"}]"
	checkInvoke(t, stub, [][]byte{[]byte("crPurchaseOrderInfo"), []byte(args)})
}

