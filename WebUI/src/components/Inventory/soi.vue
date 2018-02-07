<template>
  <div class="soi-table" v-if="soiInfo && soiInfo.body">
    <el-table :data="soiInfo.body.data.slice((currentPage-1)*pagesize,currentPage*pagesize)" empty-text="No Data" border>
      <el-table-column prop="PN" label="Part No." width="200">
      </el-table-column>
      <el-table-column prop="PartDesc" label="Part Description">
      </el-table-column>
      <el-table-column prop="total" label="Inventory Quantity" width="200">
      </el-table-column>
      <el-table-column prop="SupplierName" label="Supplier Name">
      </el-table-column>
    </el-table>
    <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" background layout="prev, pager, next" :current-page="currentPage" :page-size="pagesize" :total="soiInfo.body.data.length"></el-pagination>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      pagesize: 12,
      currentPage: 1
    }
  },
  computed: {
    ...mapGetters(['soiInfo'])
  },
  mounted () {
    this.$store.dispatch('getSoiInfo')
  },
  methods: {
    handleSizeChange (size) {
      this.pagesize = size
    },
    handleCurrentChange (currentPage) {
      this.currentPage = currentPage
    }
  }
}
</script>
<style lang="less" scoped>
  .soi-table {
    margin: 0px 20px;
  }
</style>