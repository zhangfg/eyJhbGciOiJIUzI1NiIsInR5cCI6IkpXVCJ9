<template>
  <div v-if="searchInfo" class="document-header-wrap">
    <div v-if="searchInfo.data">
      <el-table :data="searchInfo.data.slice((currentPage-1)*pagesize,currentPage*pagesize)" empty-text="No Data" border>
        <el-table-column prop="POTYPE" label="PO Type">
        </el-table-column>
        <el-table-column prop="PONO" label="Lenovo PO" width="120">
        </el-table-column>
        <el-table-column prop="POITEM" label="PO Item" width="160">
          <template slot-scope="scope">
            <el-button @click="supplieritemClick(scope.row)" type="text" size="small">{{scope.row.POITEM}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="PARTSNO" label="Part No." width="140">
        </el-table-column>
        <el-table-column prop="POQty" label="Quantity">
        </el-table-column>
        <el-table-column prop="Unit" label="Unit">
        </el-table-column>
        <el-table-column prop="PARTSDESC" label="Description" width="140">
        </el-table-column>
        <el-table-column prop="CRAD" label="Customer Required Date" width="140">
        </el-table-column>
        <el-table-column prop="NAME_AG" label="ODM Name" width="140">
        </el-table-column>
        <el-table-column prop="SONUMBER" label="Lenovo SO" width="120">
        </el-table-column>
        <el-table-column prop="CPONO" label="ODM Dummy PO No." width="140">
        </el-table-column>
        <el-table-column prop="CITY_WE" label="Ship to Location" width="140">
        </el-table-column>
        <el-table-column prop="ContractNO" label="Contract No." width="120">
        </el-table-column>
        <el-table-column prop="ContractItemNO" label="Contract item" width="120">
        </el-table-column>
      </el-table>
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" background layout="prev, pager, next" :current-page="currentPage" :page-size="pagesize" :total="searchInfo.data.length"></el-pagination>
    </div>
    <el-dialog :visible.sync="supplieritemTableVisible" width="100%">
      <supplieritem :supplierPono="supplierPono" :searchInfoData="searchInfo.data"></supplieritem>
    </el-dialog>
  </div>
</template>
<script>
import supplieritem from './supplierItem.vue'

export default {
  data () {
    return {
      supplieritemTableVisible: false,
      supplierPono: {
        PONO: '',
        POITEM: ''
      },
      pagesize: 5,
      currentPage: 1
    }
  },
  components: {
    supplieritem
  },
  props: {
    searchInfo: {
      type: Object
    }
  },
  methods: {
    supplieritemClick (row) {
      this.supplierPono = {
        PONO: row.PONO,
        POITEM: row.POITEM
      }
      this.supplieritemTableVisible = true
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
