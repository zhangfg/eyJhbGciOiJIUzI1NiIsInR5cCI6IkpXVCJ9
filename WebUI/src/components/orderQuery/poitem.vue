<template>
	<div class="item-wrap">
		<el-table :data="getSoItem.data" empty-text="No Data" border>
			<el-table-column prop="Customer" label="Customer">
			</el-table-column>
			<el-table-column prop="OAName" label="Supplier OA">
			</el-table-column>
			<el-table-column prop="PONO" label="PO NO">
			</el-table-column>
			<el-table-column prop="SONUMBER" label="SO NO">
			</el-table-column>
			<el-table-column prop="PARTSNO" label="Lenovo Part NO">
			</el-table-column>
			<el-table-column prop="DlvyQty" label="Delivery Qty">
			</el-table-column>
			<el-table-column prop="ASNNO" label="Supplier Delivery Note">
			</el-table-column>
			<el-table-column prop="IBDNNUMBER" label="Inbound Delivery">
			</el-table-column>
			<el-table-column prop="GRNO" label="GR Document">
			</el-table-column>
			<el-table-column prop="INVOICE" label="Invoice">
			</el-table-column>
			<el-table-column prop="DNNUMBER" label="Outbound Delivery">
			</el-table-column>
			<el-table-column prop="DNDATE" label="Delivery Date">
			</el-table-column>
			<el-table-column prop="UPDATEDAY" label="Commercial Invoice">
			</el-table-column>
			<el-table-column prop="BILLINGNO" label="Billing">
			</el-table-column>
			<el-table-column prop="DNQTY" label="ODM Invoice Status">
			</el-table-column>
			<el-table-column prop="CRAD" label="Customer Requested Date">
			</el-table-column>
			<el-table-column prop="IDDlvyDate" label="Supplier Goods Arrive date ( CDD)">
			</el-table-column>
			<el-table-column prop="UPDATEDAY" label="ODM GR NO">
			</el-table-column>
			<el-table-column prop="" label="Packaging List">
				<template slot-scope="scope">
					<el-button type="text" size="small">Download</el-button>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>
<script>
export default {
  data () {
    return {
    }
  },
  props: {
    grData: {
      type: Object
    },
    searchInfoData: {
      type: Array
    }
  },
  computed: {
    getSoItem () {
      let poItem = ''
      if (this.searchInfoData) {
        this.searchInfoData.map(item => {
          if (item.POITEM === this.grData.POITEM && item.PONO === this.grData.PONO) {
            poItem = item
          }
        })
      }
      return poItem
    }
  }
}
</script>
