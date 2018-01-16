<template>
	<div v-if="searchInfo" class="document-header-wrap">
		<div v-if="searchInfo.data">
      <p class="title">Document Header</p>
			<el-table :data="searchInfo.data" empty-text="No Data" border>
        <el-table-column prop="CPONO" label="PO">
          <template slot-scope="scope">
            <el-button @click="odmitemClick(scope.row)" type="text" size="small">{{scope.row.CPONO}}</el-button>
          </template>
        </el-table-column>
				<el-table-column prop="SOTYPE" label="SO Type">
				</el-table-column>
				<el-table-column prop="SONUMBER" label="Lenovo SO">
				</el-table-column>
        <el-table-column prop="PONO" label="Lenovo PO">
        </el-table-column>
				<el-table-column prop="PARTSNO" label="PartNumber">
				</el-table-column>
				<el-table-column prop="SOQTY" label="Quantity">
				</el-table-column>
				<el-table-column prop="UNIT" label="Unit">
				</el-table-column>
				<el-table-column prop="PARTSDESC" label="Description">
				</el-table-column>
				<el-table-column prop="CRAD" label="Required Date">
				</el-table-column>
        <el-table-column prop="VENDORNO" label="Supplier NO">
        </el-table-column>
				<el-table-column prop="VENDORNAME" label="Supplier Name">
				</el-table-column>
				<el-table-column prop="OANO" label="Supplier OA NO">
        </el-table-column>
        <el-table-column prop="OAName" label="Supplier OA Name">
        </el-table-column>
        <el-table-column prop="CITY_WE" label="Ship to Location">
        </el-table-column>
			</el-table>
		</div>
		<el-dialog :visible.sync="odmitemTableVisible">
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
      odmPono: ''
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
    }
  }
}
</script>
