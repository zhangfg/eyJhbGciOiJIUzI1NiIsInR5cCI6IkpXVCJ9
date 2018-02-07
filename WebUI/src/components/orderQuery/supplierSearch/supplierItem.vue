<template>
	<div class="item-wrap">
		<el-table :data="getSupplierItem.data" empty-text="No Data" border>
			<el-table-column prop="Customer" label="Customer" width="100">
			</el-table-column>
			<el-table-column prop="OA" label="OA" width="120">
			</el-table-column>
			<el-table-column prop="PONO" label="Lenovo PO No." width="120">
			</el-table-column>
			<el-table-column prop="PARTSNO" label="Lenovo Part No." width="140">
			</el-table-column>
			<el-table-column prop="DlvyQty" label="Delivery Qty" width="120">
			</el-table-column>
			<el-table-column prop="ASNNO" label="Delivery Note" width="120">
			</el-table-column>
			<el-table-column prop="IBDNNUMBER" label="Lenovo Inbound Delivery" width="130">
			</el-table-column>
			<el-table-column prop="GRNO" label="Lenovo GR" width="120">
			</el-table-column>
			<el-table-column prop="DNNUMBER" label="Lenovo Delivery Note" width="150">
			</el-table-column>
			<el-table-column prop="DNDATE" label="Delivery Date" width="120">
			</el-table-column>
			<el-table-column prop="" label="Carrier ID" width="120">
			</el-table-column>
			<el-table-column prop="TrackID" label="Carrier Track ID" width="130">
			</el-table-column>
			<el-table-column prop="MOT" label="Transportation Mode" width="120">
			</el-table-column>
			<el-table-column prop="CRAD" label="Customer Requested Date" width="120">
			</el-table-column>
			<el-table-column prop="IDDlvyDate" label="Supplier Goods Arrive date (CDD)" width="120">
			</el-table-column>
			<el-table-column prop="CGRNO" label="ODM GR No." width="120">
			</el-table-column>
			<el-table-column prop="" label="Packaging List" width="120">
				<template slot-scope="scope">
						<a v-if="scope.row.PackingList && scope.row.PackingList.FileId !== ''" :href="'https://suptest.mybluemix.net/downloadfile?fileId=' + scope.row.PackingList.FileId + '&' + 'fileName=' + scope.row.PackingList.FileName">Download</a>
						<a v-else  title="No files can be downloaded" class="ban">Download</a>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>
<script>
export default {
  props: {
    supplierPono: {
      type: Object
    },
    searchInfoData: {
      type: Array
    }
  },
  computed: {
    getSupplierItem () {
      let supplierItem = ''
      if (this.searchInfoData) {
        this.searchInfoData.map(item => {
          if (item.POITEM === this.supplierPono.POITEM && item.PONO === this.supplierPono.PONO) {
            supplierItem = item
          }
        })
      }
      return supplierItem
    }
  }
}
</script>
