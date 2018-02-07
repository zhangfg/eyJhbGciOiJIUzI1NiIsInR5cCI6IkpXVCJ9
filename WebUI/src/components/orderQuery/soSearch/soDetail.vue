<template>
	<div v-if="searchInfo" class="document-header-wrap">
		<div v-if="searchInfo.data">
			<el-table :data="searchInfo.data.slice((currentPage-1)*pagesize,currentPage*pagesize)" empty-text="No Data" border>
				<el-table-column prop="SOTYPE" label="SO Type">
				</el-table-column>
				<el-table-column prop="SONUMBER" label="SO" width="120">
				</el-table-column>
				<el-table-column prop="SOITEM" label="SO Item">
					<template slot-scope="scope">
						<el-button @click="soitemClick(scope.row)" type="text" size="small">{{scope.row.SOITEM}}</el-button>
					</template>
				</el-table-column>
        <el-table-column prop="POTYPE" label="PO Type">
        </el-table-column>
				<el-table-column prop="PONO" label="PO" width="120">
				</el-table-column>
				<el-table-column prop="POITEM" label="PO Item">
					<template slot-scope="scope">
						<el-button @click="poitemClick(scope.row)" type="text" size="small">{{scope.row.POITEM}}</el-button>
					</template>
				</el-table-column>
				<el-table-column prop="PARTSNO" label="Part No." width="120">
				</el-table-column>
        <el-table-column prop="SOQTY" label="Quantity">
        </el-table-column>
				<el-table-column prop="UNIT" label="Unit">
				</el-table-column>
				<el-table-column prop="PARTSDESC" label="Description" width="120">
				</el-table-column>
				<el-table-column prop="CRAD" label-class-name="blue" label="ODM Required Schedule" width="120">
				</el-table-column>
				<el-table-column prop="SOLDTO" label-class-name="blue" label="ODM No." width="120">
				</el-table-column>
				<el-table-column prop="NAME_AG" label-class-name="blue" label="ODM Name" width="130">
        </el-table-column>
        <el-table-column prop="CPONO" label-class-name="blue" label="ODM PO No." width="140">
        </el-table-column>
        <el-table-column prop="VENDORNO" label="Vendor No." width="120">
        </el-table-column>
        <el-table-column prop="VENDORNAME" label="Vendor Name" width="120">
        </el-table-column>
        <el-table-column prop="OANO" label="OA No." width="120">
        </el-table-column>
        <el-table-column prop="CITY_WE" label="Ship To Location" width="130">
        </el-table-column>
        <el-table-column prop="ContractNO" label="Contract No." width="120">
        </el-table-column>
        <el-table-column prop="ContractItemNO" label="Contract Item No." width="140">
				</el-table-column>
        <el-table-column prop="PRNO" label="PR No." width="120">
        </el-table-column>
			</el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" background layout="prev, pager, next" :current-page="currentPage" :page-size="pagesize" :total="searchInfo.data.length"></el-pagination>
		</div>
		<el-dialog :visible.sync="soitemTableVisible" width="100%">
			<so-item :giData="giData" :searchInfoData="searchInfo.data"></so-item>
		</el-dialog>
		<el-dialog :visible.sync="poitemTableVisible" width="100%">
			<po-item :grData="grData" :searchInfoData="searchInfo.data"></po-item>
		</el-dialog>
	</div>
</template>
<script>
import soItem from './soItem.vue'
import poItem from './poItem.vue'

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
      },
      pagesize: 5,
      currentPage: 1
    }
  },
  components: {
    soItem,
    poItem
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
    },
    handleSizeChange (size) {
      this.pagesize = size
    },
    handleCurrentChange (currentPage) {
      this.currentPage = currentPage
    }
  }
}
</script>