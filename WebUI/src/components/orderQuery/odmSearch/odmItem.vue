<template>
	<div class="item-wrap">
		<el-table :data="getOdmItem.data" empty-text="No Data" border>
			<el-table-column prop="Customer" label="Customer">
			</el-table-column>
			<el-table-column prop="OA" label="Supplier OA">
			</el-table-column>
			<el-table-column prop="CPONO" label="PO NO">
			</el-table-column>
			<el-table-column prop="SONUMBER" label="Lenovo SO NO">
			</el-table-column>
			<el-table-column prop="PARTSNO" label="Lenovo Part NO">
			</el-table-column>
			<el-table-column prop="DlvyQty" label="Delivery Qty">
			</el-table-column>
			<el-table-column prop="" label="Supplier Delivery Note">
			</el-table-column>
			<el-table-column prop="" label="Lenovo Delivery Note">
			</el-table-column>
			<el-table-column prop="" label="Delivery Date">
			</el-table-column>
			<el-table-column prop="CRAD" label="Required Date">
			</el-table-column>
			<el-table-column prop="" label="Supplier Goods Arrive date ( CDD)">
			</el-table-column>
			<el-table-column prop="DNNUMBER" label="GR No">
			</el-table-column>
			<el-table-column prop="" label="Commercial Invoice">
			</el-table-column>
			<el-table-column prop="BILLINGNO" label="Lenovo Invoice">
			</el-table-column>
			<el-table-column prop="" label="Invoice Status">
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
<style lang="less" scoped>
</style>
