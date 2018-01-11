<template>
	<div v-if="searchInfo" class="document-header-wrap">
		<div v-if="searchInfo.data">
      <p class="title">Document Header</p>
			<el-table :data="searchInfo.data" empty-text="No Data" border>
				<el-table-column prop="SOTYPE" label="SOTYPE">
				</el-table-column>
				<el-table-column prop="SONUMBER" label="SO">
				</el-table-column>
				<el-table-column prop="SOITEM" label="SOITEM">
					<template slot-scope="scope">
						<el-button @click="soitemClick(scope.row)" type="text" size="small">{{scope.row.SOITEM}}</el-button>
					</template>
				</el-table-column>
        <el-table-column prop="POTYPE" label="POTYPE">
        </el-table-column>
				<el-table-column prop="PONO" label="PO">
				</el-table-column>
				<el-table-column prop="POITEM" label="POITEM">
					<template slot-scope="scope">
						<el-button @click="poitemClick(scope.row)" type="text" size="small">{{scope.row.POITEM}}</el-button>
					</template>
				</el-table-column>
				<el-table-column prop="PARTSNO" label="PartNo">
				</el-table-column>
				<el-table-column prop="SOQTY" label="Quantity">
				</el-table-column>
				<el-table-column prop="Unit" label="Unit">
				</el-table-column>
				<el-table-column prop="PARTSDESC" label="Description">
				</el-table-column>
				<el-table-column prop="CRAD" label="CustomerRequiredSchedule">
				</el-table-column>
				<el-table-column prop="SOLDTO" label="CustomerNo">
				</el-table-column>
				<el-table-column prop="NAME_AG" label="CustomerName">
        </el-table-column>
        <el-table-column prop="CPONO" label="CustomerPoNo">
        </el-table-column>
        <el-table-column prop="VENDORNO" label="VendorNo">
        </el-table-column>
        <el-table-column prop="VENDORNAME" label="VendorName">
        </el-table-column>
        <el-table-column prop="OANO" label="OANo">
        </el-table-column>
        <el-table-column prop="CITY_WE" label="ShipToLocation">
        </el-table-column>
        <el-table-column prop="ContractNO" label="ContractNO">
        </el-table-column>
        <el-table-column prop="ContractItemNO" label="ContractItemNO">
				</el-table-column>
        <el-table-column prop="PRNO" label="PRNo">
        </el-table-column>
			</el-table>
		</div>
		<el-dialog :visible.sync="soitemTableVisible">
			<soitem :giData="giData" :searchInfoData="searchInfo.data"></soitem>
		</el-dialog>
		<el-dialog :visible.sync="poitemTableVisible">
			<poitem :grData="grData" :searchInfoData="searchInfo.data"></poitem>
		</el-dialog>
	</div>
</template>
<script>
import soitem from './soitem.vue'
import poitem from './poitem.vue'

export default {
  data () {
    return {
      soitemTableVisible: false,
      poitemTableVisible: false,
      giData: {
        SONUMBER: '',
        SOITEM: ''
      },
      grData: {
        PONO: '',
        POITEM: ''
      }
    }
  },
  components: {
    soitem,
    poitem
  },
  props: {
    searchInfo: {
      type: Object
    }
  },
  methods: {
    soitemClick (row) {
      this.giData = {
        SONUMBER: row.SONUMBER,
        SOITEM: row.SOITEM
      }
      this.soitemTableVisible = true
    },
    poitemClick (row) {
      this.grData = {
        PONO: row.PONO,
        POITEM: row.POITEM
      }
      this.poitemTableVisible = true
    }
  }
}
</script>
<style lang="less" scoped>
.document-header-wrap {
  .title {
    font-weight: bold;
    margin-top: 15px;
    margin-bottom: 15px;
  }
}
</style>
