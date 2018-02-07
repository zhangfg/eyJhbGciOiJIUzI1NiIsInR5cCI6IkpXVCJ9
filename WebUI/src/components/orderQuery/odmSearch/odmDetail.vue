<template>
	<div v-if="searchInfo" class="document-header-wrap">
		<div v-if="searchInfo.data">
			<el-table :data="searchInfo.data.slice((currentPage-1)*pagesize,currentPage*pagesize)" empty-text="No Data" border>
        <el-table-column prop="FLEXPONO" label="ODM PO No." width="160">
        </el-table-column>
        <el-table-column prop="CPONO" label="Dummy PO No." width="160">
          <template slot-scope="scope">
            <el-button @click="odmitemClick(scope.row)" type="text" size="small">{{scope.row.CPONO}}</el-button>
          </template>
        </el-table-column>
				<el-table-column prop="SOTYPE" label="SO Type">
				</el-table-column>
				<el-table-column prop="SONUMBER" label="Lenovo SO" width="120">
				</el-table-column>
        <el-table-column prop="PONO" label="Lenovo PO" width="120">
        </el-table-column>
				<el-table-column prop="PARTSNO" label="PartNumber" width="120">
				</el-table-column>
				<el-table-column prop="SOQTY" label="Quantity">
				</el-table-column>
				<el-table-column prop="UNIT" label="Unit">
				</el-table-column>
				<el-table-column prop="PARTSDESC" label="Description" width="120">
				</el-table-column>
				<el-table-column prop="CRAD" label="Required Date" width="120">
				</el-table-column>
        <el-table-column prop="VENDORNO" label="Supplier No." width="120">
        </el-table-column>
				<el-table-column prop="VENDORNAME" label="Supplier Name" width="120">
				</el-table-column>
				<el-table-column prop="OANO" label="Supplier OA No." width="130">
        </el-table-column>
        <el-table-column prop="OAName" label="Supplier OA Name" width="150">
        </el-table-column>
        <el-table-column prop="CITY_WE" label="Ship to Location" width="130">
        </el-table-column>
			</el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" background layout="prev, pager, next" :current-page="currentPage" :page-size="pagesize" :total="searchInfo.data.length"></el-pagination>
		</div>
		<el-dialog :visible.sync="odmitemTableVisible" width="100%">
			<odmitem :odmPono="odmPono" :searchInfoData="searchInfo.data"></odmitem>
		</el-dialog>
	</div>
</template>
<script>
import odmitem from './odmItem.vue'

export default {
  data () {
    return {
      odmitemTableVisible: false,
      odmPono: '',
      pagesize: 5,
      currentPage: 1
    }
  },
  components: {
    odmitem
  },
  props: {
    searchInfo: {
      type: Object
    }
  },
  methods: {
    odmitemClick (row) {
      this.odmPono = row.CPONO
      this.odmitemTableVisible = true
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
