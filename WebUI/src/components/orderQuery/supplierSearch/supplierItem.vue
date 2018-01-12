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
						<p class="el-icon-download load" @click="Download(scope.row)"></p>
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
  },
  methods: {
    // fileDeal (content, filename) {
    // 	console.log(this)
    //   // 创建隐藏的可下载链接
    //   let eleLink = document.createElement('a')
    //   eleLink.download = filename
    //   eleLink.style.display = 'none'
    //   // 字符内容转变成blob地址
    //   let blob = new Blob([content], { "type" : "application/vnd.ms-excel" })
    //   eleLink.href = URL.createObjectURL(blob)
    //   document.body.appendChild(eleLink)
    //   eleLink.click()
    //   document.body.removeChild(eleLink)
    // },
    Download (row) {
      this.$store.dispatch('getDownload', {
        asnno: row.ASNNO,
        vendorNo: ''
      })
    }
  }
}
</script>
