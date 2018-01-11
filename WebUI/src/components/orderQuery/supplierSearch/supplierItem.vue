<template>
	<div class="item-wrap">
		<el-table :data="getSupplierItem.data" empty-text="No Data" border>
			<el-table-column prop="Customer" label="Customer">
			</el-table-column>
			<el-table-column prop="OA" label="OA">
			</el-table-column>
			<el-table-column prop="PONumber" label="Lenovo PO NO">
			</el-table-column>
			<el-table-column prop="PARTSNO" label="Lenovo Part NO">
			</el-table-column>
			<el-table-column prop="DlvyQty" label="Delivery Qty">
			</el-table-column>
			<el-table-column prop="ASNNO" label="Delivery Note">
			</el-table-column>
			<el-table-column prop="IBDNNUMBER" label="Lenovo Inbound Delivery">
			</el-table-column>
			<el-table-column prop="GRNO" label="Lenovo GR">
			</el-table-column>
			<el-table-column prop="" label="Lenovo Delivery Note">
			</el-table-column>
			<el-table-column prop="" label="Delivery Date">
			</el-table-column>
			<el-table-column prop="" label="Carrier ID">
			</el-table-column>
			<el-table-column prop="" label="Carrier Track ID">
			</el-table-column>
			<el-table-column prop="" label="Transportation Mode">
			</el-table-column>
			<el-table-column prop="CRAD" label="Customer Requested Date">
			</el-table-column>
			<el-table-column prop="" label="Supplier Goods Arrive date ( CDD)">
			</el-table-column>
			<el-table-column prop="" label="ODM GR NO">
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
          if (item.POItem === this.supplierPono.POItem && item.PONumber === this.supplierPono.PONumber) {
            supplierItem = item
          }
        })
      }
      return supplierItem
    }
  }
}
</script>
<style lang="less" scoped>
</style>
