<template>
	<div class="item-wrap">
		<el-table :data="getSoItem.data" empty-text="No Data" border>
			<el-table-column prop="Customer" label="ODM" width="120">
			</el-table-column>
			<el-table-column prop="OAName" label="Supplier OA" width="120">
			</el-table-column>
			<el-table-column prop="PONO" label="PO No." width="120">
			</el-table-column>
			<el-table-column prop="SONUMBER" label="SO No." width="120">
			</el-table-column>
			<el-table-column prop="PARTSNO" label="Lenovo Part No." width="130">
			</el-table-column>
			<el-table-column prop="DlvyQty" label="Delivery Qty" width="120">
			</el-table-column>
			<el-table-column prop="ASNNO" label-class-name="green" label="Supplier Delivery Note" width="130">
			</el-table-column>
			<el-table-column prop="IBDNNUMBER" label="Inbound Delivery" width="130">
			</el-table-column>
			<el-table-column prop="GRNO" label="GR Document" width="120">
			</el-table-column>
			<el-table-column prop="INVOICE" label="Invoice" width="120">
			</el-table-column>
			<el-table-column prop="DNNUMBER" label="Outbound Delivery" width="150">
			</el-table-column>
			<el-table-column prop="DNDATE" label="Delivery Date" width="120">
			</el-table-column>
			<el-table-column prop="PROINV" label="Commercial Invoice" width="150">
			</el-table-column>
			<el-table-column prop="BILLINGNO" label="Billing" width="120">
			</el-table-column>
			<el-table-column prop="INVOICESTATUS"  label-class-name="blue" label="ODM Invoice Status" width="120">
			</el-table-column>
			<el-table-column prop="CRAD"  label-class-name="blue" label="ODM Requested Date" width="120">
			</el-table-column>
			<el-table-column prop="IDDlvyDate" label="Supplier Goods Arrive date (CDD)" width="120">
			</el-table-column>
			<el-table-column prop="CGRNO" label-class-name="blue" label="ODM GR No." width="120">
			</el-table-column>
			<el-table-column prop=""  label-class-name="green" label="Packaging List" width="120">
				<template slot-scope="scope">
						<a v-if="scope.row.PackingList && scope.row.PackingList.FileId !== ''" :href="'https://lbstest.mybluemix.net/downloadfile?fileId=' + scope.row.PackingList.FileId + '&' + 'fileName=' + scope.row.PackingList.FileName">Download</a>
						<a v-else  title="No files can be downloaded" class="ban">Download</a>
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
