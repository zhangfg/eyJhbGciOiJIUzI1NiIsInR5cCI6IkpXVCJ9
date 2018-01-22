package main

import (
	"encoding/json"
	"errors"
	"github.com/hyperledger/fabric/core/chaincode/shim"
)

//附件
type Attachment struct {
	FileId   string `json:"FileId"`   //地址
	FileName string `json:"FileName"` //文件名
	FileType string `json:"FileType"` //文件类型
}

type QueryParam struct {
	KeyPrefix string   `json:"keyPrefix"` //keyPrefix
	KeysStart []string `json:"keysStart"` //keys start
	KeysEnd   []string `json:"keysEnd"`   //keys end
}

type POAndSOOrder struct {
	SONUMBER      string        `json:"SONUMBER"`      //Sales document number
	SOITEM        string        `json:"SOITEM"`        //Sales document Item
	PONO          string        `json:"PONO"`          //PO  no
	POITEM        string        `json:"POITEM"`        //PO  item no
	SalesOrder    SalesOrder    `json:"SalesOrder"`    //Sales Order info, only for search
	PurchaseOrder PurchaseOrder `json:"PurchaseOrder"` //Purchase Order info,only for search
}

// WareHouse Key : "WH" + PN
type WareHouseInfo struct {
	PN       string             `json:"PN"`       // Pull Reference No  KEY
	TRANSDOC string             `json:"TRANSDOC"` //Trans doc type
	Quantity int                `json:"Quantity"` // Quantity
	history  []WareHouseHistory `json:"history"`  // change log
}

type WareHouseHistory struct {
	qty        int    `json:"qty"`        // Quantity
	updateDate string `json:"updateDate"` // Update Date  GR Date or Pull Date
	PullRefNo  string `json:"PullRefNo"`  // Pulling Reference No
	GRNO       string `json:"GRNO"`       // GR NO
}

// new Ledger TODO
// SOI Inventory Key: "SOI" + PN
type SOIInventory struct {
	PN            string `json:"PN"`            //Pull Reference No  KEY
	TRANSDOC      string `json:"TRANSDOC"`      //Trans doc type
	PartDesc      string `json:"PartDesc"`      //part description
	Qty           string `json:"Qty"`           //inventory Quantity
	InventoryType string `json:"InventoryType"` //inventory type(SOI)
	SupplierName  string `json:"SupplierName"`  //supplier name
	COO           string `json:"COO"`           //COO
	Plant         string `json:"Plant"`         //part
	PurchasingOrg string `json:"PurchasingOrg"` //Purchasing org
	Location      string `json:"Location"`      //storage location
}

//Supplier PO   Key: "SUP"+ Vendor No + ASNNumber
type SupplierOrder struct {
	ASNNumber           string        `json:"ASNNumber"`           //ASNNumber   -> Supplier ASN, Inbound Delivery/GR  Reference
	VendorNO            string        `json:"VendorNO"`            //Vendor Number
	TRANSDOC            string        `json:"TRANSDOC"`            //Trans doc type
	PONumber            string        `json:"PONumber"`            //PO Number
	POItem              string        `json:"POItem"`              //PO Number
	ShippedQty          string        `json:"ShippedQty"`          //PO Number
	ASNDate             string        `json:"ASNDate"`             //PO Number
	PromisedDate        string        `json:"PromisedDate"`        //PO Number
	CarrierID           string        `json:"CarrierID"`           //PO Number
	CarrierTrackID      string        `json:"CarrierTrackID"`      //PO Number
	TransporatationMode string        `json:"TransporatationMode"` //PO Number
	CountryOfOrigin     string        `json:"CountryOfOrigin"`     //PO Number
	PackingList         Attachment    `json:"PackingList"`         //Attachments
	SalesOrder          SalesOrder    `json:"SalesOrder"`          //Sales Order info, only for search
	PurchaseOrder       PurchaseOrder `json:"PurchaseOrder"`       //Purchase Order info,only for search
}

//ODM PO   Key: "CPO"+ CPONO
type CPONOFLEXPONO struct {
	CPONO      string       		`json:"CPONO"`         //Customer purchase order number
	FLEXPONO   []string 			`json:"FLEXPONO"` 		//Customer purchase order number
	SONUMBER      string            `json:"SONUMBER"`     //Sales document number
	SOITEM        string           `json:"SOITEM"`        //Sales document Item
	PONO          string           `json:"PONO"`          //PO  no
	POITEM        string           `json:"POITEM"`        //PO  item no
	SalesOrder    SalesOrder       `json:"SalesOrder"`    //Sales Order info, only for search
	PurchaseOrder PurchaseOrder    `json:"PurchaseOrder"` //Purchase Order info,only for search
}

//ODM PO   Key: "FLEX"+ FLEXPONO
type ODMPurchaseOrder struct {
	FLEXPONO      string       	   `json:"FLEXPONO"`         //Customer purchase order number  index
	TRANSDOC      string           `json:"TRANSDOC"`
	Payments      []ODMPayment     `json:"Payments"`      //Billing info
	GRInfos       []ODMGRInfo      `json:"GRInfos"`       //GR info
	CPONO      	  string       	   `json:"CPONO"`         //Customer purchase order number
	CPONOFLEXPONO CPONOFLEXPONO    `json:"SalesOrder"`    //Sales Order info, only for search
}


type ODMPayment struct {
	FlexInvoiceNO string `json:"FlexInvoiceNO"` //Flex Invoice Document
	BILLINGNO     string `json:"BILLINGNO"`     //Billing Document
	INVOICESTATUS string `json:"INVOICESTATUS"` //invoice status
	PAYMENTDATE   string `json:"PAYMENTDATE"`   // date of approval
	GRNO          string `json:"GRNO"`          //FLEX GR No
}
type ODMGRInfo struct {
	GRNO    string `json:"GRNO"`    //FLEX GR No
	PARTNUM string `json:"PARTNUM"` //PART No
	GRQTY   string `json:"GRQTY"`   // received qty
}

//ODM PO   Key: "REF"+ FLEXPONO
type FLEXPONOREF struct {
	FLEXPONO   	string       		`json:"FLEXPONO"`      	//Customer purchase order number
	RefNos   	[]string 			`json:"RefNos"` 			//Reference No
}

// Upload  LOI Pull Data TRANSDOC: "PULL" + Ref No
type ODMLOIMaterial struct {
	RefNo               string `json:"RefNo"`               //Pull Reference No
	//TRANSDOC      		string `json:"TRANSDOC"`
	PullType            string `json:"PullType"`            //Pull type
	Week                string `json:"Week"`                //Week
	PullDate            string `json:"PullDate"`            //Actual Pull Date
	NotesToReceiver     string `json:"NotesToReceiver"`     //NotesToReceiver
	Product             string `json:"Product"`             //Product -- Part NO
	Quantity            int    `json:"Quantity"`            //Quantity
	DlvryDate           string `json:"DlvryDate"`           //RequestedDeliveryDate
	RequestedDate       string `json:"RequestedDate"`       //RequestedDate
	ShipmentInstruction string `json:"ShipmentInstruction"` //ShipmentInstruction
}

// LOI GR Data Key: LOI + PN
type LOIGRInfo struct {
	PN        string      `json:"PN"`        //item PN --Key
	//TRANSDOC  string      `json:"TRANSDOC"`  //Trans doc type
	Qty       int         `json:"Qty"`       //item Quantity
	GRNO      string      `json:"GRNO"`      //DN number
	GRDate    string      `json:"GRDate"`    //GR PO date
	GRHistory []GRHistory `json:"GRHistory"` //GR History
}

type GRHistory struct {
	GRNO   string `json:"GRNO"`   //Lenovo PO number
	Qty    int    `json:"Qty"`    //item Quantity
	GRDate string `json:"GRDate"` //GR PO date
}

//SalesOrder   Key: "SO"+So number + Item_no
type SalesOrder struct {
	SONUMBER    string        `json:"SONUMBER"`    //Sales document number
	SOITEM      string        `json:"SOITEM"`      //Sales document Item
	TRANSDOC    string        `json:"TRANSDOC"`    //Trans doc type
	SOTYPE      string        `json:"SOTYPE"`      //Sales document type
	SOCDATE     string        `json:"SOCDATE"`     //Created date
	SOCTIME     string        `json:"SOCTIME"`     //Created time
	CRAD        string        `json:"CRAD"`        //Request delivery date
	PARTSNO     string        `json:"PARTSNO"`     //Material Number
	PARTSDESC   string        `json:"PARTSDESC"`   //Material desc
	SOQTY       string        `json:"SOQTY"`       //Order quantity
	UNIT        string        `json:"UNIT"`        //Sales unit
	CPONO       string        `json:"CPONO"`       //Customer purchase order number  index
	VENDORNO    string        `json:"VENDORNO"`    //Vendor  Account Number
	VENDORNAME  string        `json:"VENDORNAME"`  //Vendor Name
	SOLDTO      string        `json:"SOLDTO"`      //Sold to party
	NAME1_AG    string        `json:"NAME1_AG"`    //Sold to party Name1
	NAME2_AG    string        `json:"NAME2_AG"`    //Sold to party Name2
	COUNTRY_AG  string        `json:"COUNTRY_AG"`  //Sold to party Country
	CITY_AG     string        `json:"CITY_AG"`     //Sold to party City
	SHIPTO      string        `json:"SHIPTO"`      //Ship to party
	NAME1_WE    string        `json:"NAME1_WE"`    //Ship to party Name1
	NAME2_WE    string        `json:"NAME2_WE"`    //Ship to party Name2
	COUNTRY_WE  string        `json:"COUNTRY_WE"`  //Ship to party Country
	CITY_WE     string        `json:"CITY_WE"`     //Ship to party City
	PRIORITY    string        `json:"PRIORITY"`    //Delivery Priority
	NETPRICE    string        `json:"NETPRICE"`    //Net price
	NETVALUE    string        `json:"NETVALUE"`    //Net value
	CURRENCY    string        `json:"CURRENCY"`    //Currency
	UPDATE      string        `json:"UPDATEDAY"`   //Changed On
	UPTIME     string        `json:"UPTIME"`       //Changed time
	UPNAME      string        `json:"UPNAME"`      //Changed name
	DELFLAG     string        `json:"DELETEFLAG"`  //DELETEFLAG
	PRNO        string        `json:"PRNO"`        //PR No ---Search condition
	PRITEM      string        `json:"PRITEM"`      //PR Item NO
	BILLINFOS   []BillingInfo `json:"BILLINFOS"`   //Billing info
	GIINFOS     []GIInfo      `json:"GIINFOS"`     //GIINFOS
	PONO        string        `json:"PONO"`        //PO  no
	POITEM      string        `json:"POITEM"`      //PO  item no
	ODMPayments []ODMPayment  `json:"ODMPayments"` //Billing info only for search
	ODMGRInfos  []ODMGRInfo   `json:"ODMGRInfos"`  //GR info only for search
}

type BillingInfo struct {
	BILLINGNO   string `json:"BILLINGNO"`     //Billing Document
	BILLINGITEM string `json:"BILLINGITEM"`   //Billing item
	PROINV      string `json:"PROINV"`        //Billing item
	PROINVITEM  string `json:"PROINVITEM"`    //Billing item
	BILLINGTYPE  string `json:"BILLINGTYPE"`  //Billing Type
	CATEGORY     string `json:"CATEGORY"`     //SD document Category
	BPOSTDATE    string `json:"BPOSTDATE"`    //Billing date
	BILLINGCDATE string `json:"BILLINGCDATE"` //Billing created date
	BILLINGTIME  string `json:"BILLINGTIME"`  //Billing created time
	BCANCELNO   string `json:"BCANCELNO"`     //Cancelled billing document number
	PARTSNO     string `json:"PARTSNO"`       //Material Number
	PARTSDESC   string `json:"PARTSDESC"`     //Material description
	BILLINGQTY  string `json:"BILLINGQTY"`    //Actual Invoiced Quantity
	UNIT        string `json:"UNIT"`          //Sales unit
	TAXAMOUNT   string `json:"TAXAMOUNT"`     //Tax amount in document currency
	NETVALUE    string `json:"NETVALUE"`      //Net value
	CURRENCY    string `json:"CURRENCY"`      //Currency
	DNNUMBER    string `json:"DNNUMBER"`      //DNNUMBER      ->GI DN Number
	DNITEM      string `json:"DNITEM"`        //DNITEM
	UPDATE      string `json:"UPDATEDAY"`     //Changed On
	UPTIME      string `json:"UPTIME"`        //Changed time
	UPNAME      string `json:"UPNAME"`        //Changed name
}

// outbound .
type GIInfo struct {
	DNNUMBER   string `json:"DNNUMBER"`   //DN Number
	DNITEM     string `json:"DNITEM"`     //DN Item
	DNDATE     string `json:"DNDATE"`     //DN Date
	PARTSNO    string `json:"PARTSNO"`    //Material Number
	DNQTY      string `json:"DNQTY"`      //Actual quantity delivered
	UNIT       string `json:"UNIT"`       //Sales unit
	GISTATUS   string `json:"GISTATUS"`   //GI status
	PARTSDESC  string `json:"PARTSDESC"`  //GI PARTSDESC
	IBDNNUMBER string `json:"IBDNNUMBER"` //Inbound Delivery NO    -> PO Inbound Delivery NOTE
	IBDNITEM   string `json:"IBDNITEM"`   //Inbound Delivery Item No
	UPDATEDAY  string `json:"UPDATEDAY"`  //GI UPDATEDAY
	UPTIME     string `json:"UPTIME"`     //GI UPTIME
	UPNAME     string `json:"UPNAME"`     //GI UPNAME
}

//PO Key: "PO" + PO Number + Item_no
type PurchaseOrder struct {
	PONO            string            `json:"PONO"`            //PO Number
	POItemNO        string            `json:"POItemNO"`        //PO Item Number
	VendorNO        string            `json:"VendorNO"`        //Vendor Number
	VendorName      string            `json:"VendorName"`      //Vendor Name
	OANO            string            `json:"OANO"`            //OA Number
	OAName          string            `json:"OAName"`          //OA Name
	POTYPE          string            `json:"POTYPE"`          //POTYPE
	PODate          string            `json:"PODate"`          //PO date
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
	SupplierOrders  []SupplierOrder   `json:"SupplierOrders"`  //SupplierOrder
}

type GRInfo struct {
	GRNO            string     `json:"GRNO"`            //GR Number
	FiscalYear      string     `json:"FiscalYear"`      //Fiscal Year
	GRDate          string     `json:"GRDate"`          //GR Posting Date
	ComCode         string     `json:"ComCode"`         //Company Code
	SupDeliveryNote string     `json:"SupDeliveryNote"` //Supplier Delivery Note --> INBD ASN NO 匹配
	GRItemNO        string     `json:"GRItemNO"`        //Item Number
	PARTSNO         string     `json:"PARTSNO"`         //Material Number
	PARTSDESC       string     `json:"PARTSDESC"`       //Material Description
	GRQty           string     `json:"GRQty"`           //Quantity
	Unit            string     `json:"Unit"`            //Unit of Measure
	Plant           string     `json:"Plant"`           //Plant
	SupNO           string     `json:"SupNO"`           //Supplier NO
	UPDATEDAY       string     `json:"UPDATEDAY"`       // PO UPDATEDAY
	UPTIME          string     `json:"UPTIME"`          // PO UPTIME
	UPNAME          string     `json:"UPNAME"`          // PO UPNAME
	Attachment      Attachment `json:"Attachments"`     //Attachments
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
	ASNNO      string `json:"ASNNO"`      //Reference Number    ->   Supplier ASN NO
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
	GRNO      string `json:"GRNO"`         //GR Document 		-->GR Number
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
