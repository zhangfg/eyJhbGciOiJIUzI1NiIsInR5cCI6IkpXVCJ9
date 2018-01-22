<template>
	<div class="item-wrap">
		<el-table :data="getOdmItem.data" empty-text="No Data" border>
			<el-table-column prop="Customer" label="Customer" width="120">
			</el-table-column>
			<el-table-column prop="OA" label="Supplier OA" width="120">
			</el-table-column>
			<el-table-column prop="CPONO" label="PO No." width="120">
			</el-table-column>
			<el-table-column prop="SONUMBER" label="Lenovo SO No." width="120">
			</el-table-column>
			<el-table-column prop="PARTSNO" label="Lenovo Part No." width="130">
			</el-table-column>
			<el-table-column prop="DlvyQty" label="Delivery Qty" width="120">
			</el-table-column>
			<el-table-column prop="" label="Supplier Delivery Note" width="140">
			</el-table-column>
			<el-table-column prop="" label="Lenovo Delivery Note" width="130">
			</el-table-column>
			<el-table-column prop="" label="Delivery Date" width="120">
			</el-table-column>
			<el-table-column prop="CRAD" label="Required Date" width="120">
			</el-table-column>
			<el-table-column prop="" label="Supplier Goods Arrive date (CDD)" width="120">
			</el-table-column>
			<el-table-column prop="DNNUMBER" label="GR No." width="120">
			</el-table-column>
			<el-table-column prop="PROINV" label="Commercial Invoice" width="150">
			</el-table-column>
			<el-table-column prop="BILLINGNO" label="Lenovo Invoice" width="120">
			</el-table-column>
			<el-table-column prop="" label="Invoice Status" width="120">
			</el-table-column>
			<el-table-column prop="" label="Packaging List" width="120">
				<template slot-scope="scope">
						<a v-if="scope.row.PackingList && scope.row.PackingList.FileId !== ''" :href="'https://supplier1bs.mybluemix.net/downloadfile?file=' + scope.row.PackingList.FileId + '-' + scope.row.PackingList.FileName">Download</a>
						<a v-else  title="No files can be downloaded" class="ban">Download</a>
				</template>
			</el-table-column>
		</el-table>
	</div>
</template>
<script>
export default {
  props: {
    odmPono: {
      type: String
    },
    searchInfoData: {
      type: Array
    }
  },
  computed: {
    getOdmItem () {
      let odmItem = ''
      if (this.searchInfoData) {
        this.searchInfoData.map(item => {
          if (item.CPONO === this.odmPono) {
            odmItem = item
          }
        })
      }
      return odmItem
    }
  }
}
</script>
