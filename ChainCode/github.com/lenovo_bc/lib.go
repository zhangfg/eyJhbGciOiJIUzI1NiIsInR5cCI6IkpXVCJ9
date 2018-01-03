package main

import (
	"encoding/json"
	"errors"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

//附件
type Attachment struct {
	FileId   string `json:"ID"`       //地址
	FileType string `json:"FileType"` //文件类型
}

type QueryParam struct {
	KeyPrefix string   `json:"keyPrefix"` //keyPrefix
	KeysStart []string `json:"keysStart"` //keys start
	KeysEnd   []string `json:"keysEnd"`   //keys end
}

//Request Data
type ODMInfoReq struct {
	CPONO         string `json:"CPONO"`
	TRANSDOC      string `json:"TRANSDOC"`
	PARTNUM       string `json:"PARTNUM"` //PART No
	GRQTY         string `json:"GRQTY"`   // received qty
	INVOICENUM    string `json:"INVOICENUM"`
	INVOICESTATUS string `json:"INVOICESTATUS"`
	PAYMENTDATE   string `json:"PAYMENTDATE"`
}

//ODM PO   Key: "CPO"+ CPO No
type ODMPurchaseOrder struct {
	CPONO    string `json:"CPONO"`    //Customer purchase order number  index  --ODM
	SONUMBER string `json:"SONUMBER"` //Sales document number  --ODM
	SOITEM   string `json:"SOITEM"`   //Sales document Item    --ODM
	//TRANSDOC   string        `json:"TRANSDOC"`   //Trans doc type         --ODM
	SOCDATE     string       `json:"SOCDATE"`     //Created date           --ODM
	SOCTIME     string       `json:"SOCTIME"`     //Created time           --ODM
	PARTSNO     string       `json:"PARTSNO"`     //Material Number        --ODM
	SOQTY       string       `json:"SOQTY"`       //Order quantity         --ODM
	UNIT        string       `json:"UNIT"`        //Sales unit             --ODM
	ODMPayments []ODMPayment `json:"ODMPayments"` //Billing info
	GRInfo      []ODMGRInfo  `json:"GRInfo"`      //GR info
}

type ODMPayment struct {
	BILLINGNO     string `json:"BILLINGNO"`     //Billing Document
	BILLINGITEM   string `json:"BILLINGITEM"`   //Billing item
	BILLINGTYPE   string `json:"BILLINGTYPE"`   //Billing Type
	INVOICESTATUS string `json:"INVOICESTATUS"` //invoice status
	PAYMENTDATE   string `json:"PAYMENTDATE"`   // date of approval
}
type ODMGRInfo struct {
	PARTNUM string `json:"PARTNUM"` //PART No
	GRQTY   string `json:"GRQTY"`   // received qty
}
//SalesOrder   Key: "SO"+So number + Item_no
type SalesOrder struct {
	SONUMBER   string `json:"SONUMBER"`          //Sales document number  --ODM
	SOITEM     string `json:"SOITEM"`            //Sales document Item    --ODM
	TRANSDOC   string `json:"TRANSDOC"`          //Trans doc type         --ODM
	SOTYPE     string `json:"SOTYPE"`            //Sales document type
	SOCDATE    string `json:"SOCDATE"`           //Created date           --ODM
	SOCTIME    string `json:"SOCTIME"`           //Created time           --ODM
	CRAD       string `json:"CRAD"`              //Request delivery date
	PARTSNO    string `json:"PARTSNO"`           //Material Number        --ODM
	PARTSDESC  string `json:"PARTSDESC"`         //Material desc
	SOQTY      string `json:"SOQTY"`             //Order quantity                    --ODM
	UNIT       string `json:"UNIT"`              //Sales unit                        --ODM
	CPONO      string `json:"CPONO"`             //Customer purchase order number  index  --ODM
	VENDORNO   string `json:"VENDORNO"`          //Vendor  Account Number
	SOLDTO     string `json:"SOLDTO"`            //Sold to party
	NAME1_AG   string `json:"NAME1_AG"`          //Sold to party Name1
	NAME2_AG   string `json:"NAME2_AG"`          //Sold to party Name2
	COUNTRY_AG string `json:"COUNTRY_AG"`        //Sold to party Country
	CITY_AG    string `json:"CITY_AG"`           //Sold to party City
	SHIPTO     string `json:"SHIPTO"`            //Ship to party
	NAME1_WE   string `json:"NAME1_WE"`          //Ship to party Name1
	NAME2_WE   string        `json:"NAME2_WE"`   //Ship to party Name2
	COUNTRY_WE string        `json:"COUNTRY_WE"` //Ship to party Country
	CITY_WE    string        `json:"CITY_WE"`    //Ship to party City
	PRIORITY  string        `json:"PRIORITY"`    //Delivery Priority
	NETPRICE  string        `json:"NETPRICE"`    //Net price
	NETVALUE  string        `json:"NETVALUE"`    //Net value
	CURRENCY  string        `json:"CURRENCY"`    //Currency
	UPDATE    string        `json:"UPDATEDAY"`   //Changed On
	UPTIME    string        `json:"UPTIME"`      //Changed time
	UPNAME    string        `json:"UPNAME"`      //Changed name
	DELFLAG   string        `json:"DELETEFLAG"`  //DELETEFLAG
	PRNO      string        `json:"PRNO"`        //PR No
	PRITEM    string        `json:"PRITEM"`      //PR Item NO
	BILLINFOS []BillingInfo `json:"BILLINFOS"`   //Billing info
	GIINFOS   []GIInfo      `json:"GIINFOS"`     //GIINFOS
	PONO      string        `json:"PONO"`        //PO  no
	POITEM    string        `json:"POITEM"`      //PO  item no
}

type BillingInfo struct {
	BILLINGNO    string `json:"BILLINGNO"`    //Billing Document
	BILLINGITEM  string `json:"BILLINGITEM"`  //Billing item
	BILLINGTYPE  string `json:"BILLINGTYPE"`  //Billing Type
	CATEGORY     string `json:"CATEGORY"`     //SD document Category
	BPOSTDATE    string `json:"BPOSTDATE"`    //Billing date
	BILLINGCDATE string `json:"BILLINGCDATE"` //Billing created date
	BILLINGTIME  string `json:"BILLINGTIME"`  //Billing created time
	BCANCELNO  string `json:"BCANCELNO"`      //Cancelled billing document number
	PARTSNO    string `json:"PARTSNO"`        //Material Number
	PARTSDESC  string `json:"PARTSDESC"`      //Material description
	BILLINGQTY string `json:"BILLINGQTY"`     //Actual Invoiced Quantity
	UNIT       string `json:"UNIT"`           //Sales unit
	TAXAMOUNT  string `json:"TAXAMOUNT"`      //Tax amount in document currency
	NETVALUE   string `json:"NETVALUE"`       //Net value
	CURRENCY   string `json:"CURRENCY"`       //Currency
	DNNUMBER   string `json:"DNNUMBER"`       //DNNUMBER
	DNITEM     string `json:"DNITEM"`         //DNITEM
	UPDATE     string `json:"UPDATEDAY"`      //Changed On
	UPTIME     string `json:"UPTIME"`         //Changed time
	UPNAME     string `json:"UPNAME"`         //Changed name
}

//PO Key: "PO" + PO Number + Item_no
type PurchaseOrder struct {
	PONO            string            `json:"PONO"`            //PO Number
	VendorNO        string            `json:"VendorNO"`        //Vendor Number
	VendorName      string            `json:"VendorName"`      //Vendor Name
	OANO            string            `json:"OANO"`            //OA Number
	OAName          string            `json:"OAName"`          //OA Name
	POTYPE          string            `json:"POTYPE"`          //POTYPE
	PODate          string            `json:"PODate"`          //PO date
	POItemNO        string            `json:"POItemNO"`        //PO Item Number
	TRANSDOC        string            `json:"TRANSDOC"`        //Trans doc type
	SONUMBER        string            `json:"SONUMBER"`        //SO Number
	SOITEM          string            `json:"SOITEM"`          //SO Item Number
	PARTSNO         string            `json:"PARTSNO"`         //Material Number
	PARTSDESC       string            `json:"PARTSDESC"`       //Material Description
	POQty           string            `json:"POQty"`           //Quantity
	Unit            string            `json:"Unit"`            //Unit of Measure
	Plant           string            `json:"Plant"`           //Plant
	POItemChgDate   string            `json:"POItemChgDate"`   //Item change Date
	POItemSts       string            `json:"POItemSts"`       //PO Item status(Delete)
	ContractNO      string            `json:"ContractNO"`      //Contract No
	ContractItemNO  string            `json:"ContractItemNO"`  //Contract Item No
	IncoTerm        string            `json:"IncoTerm"`        //Inco Term
	PaymentTerm     string            `json:"PaymentTerm"`     //payment
	UPDATEDAY       string            `json:"UPDATEDAY"`       //PO UPDATEDAY
	UPTIME          string            `json:"UPTIME"`          //PO UPTIME
	UPNAME          string            `json:"UPNAME"`          //PO UPNAME
	GRInfos         []GRInfo          `json:"GRInfos"`         //GR Info
	Confirmation    []Confirmation    `json:"Confirmation"`    //Confirmation
	InboundDelivery []InboundDelivery `json:"InboundDelivery"` //Inbound Delivery
	Invoice         []Invoice         `json:"Invoice"`         //Invoice
}

type GRInfo struct {
	GRNO            string `json:"GRNO"`              //GR Number
	FiscalYear      string `json:"FiscalYear"`        //Fiscal Year
	GRDate          string `json:"GRDate"`            //GR Posting Date
	ComCode         string `json:"ComCode"`           //Company Code
	SupDeliveryNote string `json:"SupDeliveryNote"`   //Supplier Delivery Note --> INBD ASN NO
	GRItemNO        string `json:"GRItemNO"`          //Item Number
	PARTSNO         string `json:"PARTSNO"`           //Material Number
	PARTSDESC       string `json:"PARTSDESC"`         //Material Description
	GRQty           string `json:"GRQty"`             //Quantity
	Unit            string `json:"Unit"`              //Unit of Measure
	Plant           string `json:"Plant"`             //Plant
	SupNO           string `json:"SupNO"`             //Supplier NO
	UPDATEDAY       string `json:"UPDATEDAY"`         // PO UPDATEDAY
	UPTIME          string       `json:"UPTIME"`      // PO UPTIME
	UPNAME          string       `json:"UPNAME"`      // PO UPNAME
	Attachments     []Attachment `json:"Attachments"` //Attachments
}

type Confirmation struct {
	CnfSeqNO        string       `json:"CnfSeqNO"`       //Confirmation Sequence Number
	CnfRfrnNO      	string       `json:"CnfRfrnNO"`      //Confirmation Reference Number
	CnfQty          string       `json:"CnfQty"`         //Confirmed Quantity
	CnfDlvryDate    string       `json:"CnfDlvryDate"`   //Delivery Date
	CnfCrtnDate 	string       `json:"CnfCrtnDate"`    //Creation Date
	UPDATEDAY       string       `json:"UPDATEDAY"`      // Confirmation UPDATEDAY
	UPTIME          string       `json:"UPTIME"`         // Confirmation UPTIME
	UPNAME          string       `json:"UPNAME"`         // Confirmation UPNAME
}

type InboundDelivery struct {
	IBDNNUMBER string `json:"IBDNNUMBER"` //Delivery Number
	VendorNO   string `json:"VendorNO"`   //Vendor Number
	IDCrtDate  string `json:"IDCrtDate"`  //Creation  Date
	IDDlvyDate string `json:"IDDlvyDate"` //Delivery Date
	IncoTerm   string `json:"IncoTerm"`   //Inco Term
	ASNNO      string `json:"ASNNO"`      //Reference Number
	IBDNITEM   string `json:"IBDNITEM"`   //Delivery Item Number
	PARTSNO    string `json:"PARTSNO"`    //Material Number
	PARTSDESC  string `json:"PARTSDESC"`  //Material Description
	DlvyQty    string `json:"DlvyQty"`    //Quantity
	COO        string `json:"COO"`        //COO
	TrackID    string `json:"TrackID"`    //Carrier Tracking ID
	MOT        string `json:"MOT"`        //MOT
	UPDATEDAY  string `json:"UPDATEDAY"`  // InboundDelivery UPDATEDAY
	UPTIME     string `json:"UPTIME"`     // InboundDelivery UPTIME
	UPNAME     string `json:"UPNAME"`     // InboundDelivery UPNAME
}

type GIInfo struct {
	DNNUMBER   string `json:"DNNUMBER"`   //DN Number
	DNITEM     string `json:"DNITEM"`     //DN Item
	PARTSNO    string `json:"PARTSNO"`    //Material Number
	DNQTY      string `json:"DNQTY"`      //Actual quantity delivered
	UNIT       string `json:"UNIT"`       //Sales unit
	GISTATUS   string `json:"GISTATUS"`   //GI status
	PARTSDESC  string `json:"PARTSDESC"`  //GI PARTSDESC
	IBDNNUMBER string `json:"IBDNNUMBER"` //Inbound Delivery NO
	IBDNITEM   string `json:"IBDNITEM"`   //Inbound Delivery Item No
	UPDATEDAY  string `json:"UPDATEDAY"`  //GI UPDATEDAY
	UPTIME     string `json:"UPTIME"`     //GI UPTIME
	UPNAME     string `json:"UPNAME"`     //GI UPNAME
}

type Invoice  struct {
	InvNO  		string `json:"InvNO"`   //Invoice Number
	FiscalYear  string `json:"FiscalYear"` //Fiscal Year
	InvType   	string `json:"InvType"`  //Document Type
	DocDate     string `json:"DocDate"`    //Document Date
	PostDate    string `json:"PostDate"`   //Posting Date
	BaseDate  string `json:"BaseDate"`     //Baseline Date
	VenInvNO  string `json:"VenInvNO"`     //Vendor Invoice Number
	comCode   string `json:"comCode"`      //Company Code
	VendorNO  string `json:"VendorNO"`     //Vendor Number
	InvStatus string `json:"InvStatus"`    //Inv. Status
	InvItemNO string `json:"InvItemNO"`    //Item Number
	PARTNO    string `json:"PARTNO"`       //Part Number
	InvQty    string `json:"InvQty"`       //Quantity
	Unit      string `json:"Unit"`         //Unit of Measure
	GRNO      string `json:"GRNO"`         //GR Document -->GR
	UPDATEDAY string `json:"UPDATEDAY"`    //GI UPDATEDAY
	UPTIME    string `json:"UPTIME"`       //GI UPTIME
	UPNAME    string `json:"UPNAME"`       //GI UPNAME
}

//生成Key
func generateKey(stub shim.ChaincodeStubInterface, keyPrefix string, keyArray []string) (error, string) {
	if keyPrefix == "" {
		return errors.New("Invalid object name"), ""
	}
	key, _ := stub.CreateCompositeKey(keyPrefix, keyArray)
	return nil, key
}

//生成查询Key
func generateQueryKey(stub shim.ChaincodeStubInterface, args []string) (error, string, string) {

	keyStart := ""
	keyEnd := ""

	if len(args) != 2 {
		return errors.New("Incorrect number of arguments."), keyStart, keyEnd
	}

	jsonStr := args[1]
	param := QueryParam{}
	err := json.Unmarshal([]byte(jsonStr), &param)
	if err != nil {
		return errors.New(err.Error()), keyStart, keyEnd
	}

	if param.KeyPrefix == "" {
		return errors.New("Invalid object name"), keyStart, keyEnd
	}
	if len(param.KeysStart) > 0 {
		keyStart, _ = stub.CreateCompositeKey(param.KeyPrefix, param.KeysStart)
	} else {
		return errors.New("Keys start is required"), keyStart, keyEnd
	}
	if len(param.KeysEnd) > 0 {
		keyEnd, _ = stub.CreateCompositeKey(param.KeyPrefix, param.KeysEnd)
	}
	return nil, keyStart, keyEnd
}

func generateQueryKey2(stub shim.ChaincodeStubInterface, keyPrefix string, keysStart []string, keysEnd []string) (error, string, string) {

	keyStart := ""
	keyEnd := ""

	if keyPrefix == "" {
		return errors.New("Invalid object name"), keyStart, keyEnd
	}
	if len(keysStart) > 0 {
		keyStart, _ = stub.CreateCompositeKey(keyPrefix, keysStart)
	} else {
		return errors.New("Keys start is required"), keyStart, keyEnd
	}
	if len(keysEnd) > 0 {
		keyEnd, _ = stub.CreateCompositeKey(keyPrefix, keysEnd)
	}
	return nil,keyStart, keyEnd
}
