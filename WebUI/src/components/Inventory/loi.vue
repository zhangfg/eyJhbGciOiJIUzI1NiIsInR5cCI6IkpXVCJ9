<template>
	<div class="wrap" v-if="inventoryInfo && inventoryInfo.body">
    <el-table :data="inventoryInfo.body.data" height="700" empty-text="No Data" border>
      <el-table-column prop="PN" label="Part No." width="140">
        <template slot-scope="scope">
          <el-button type="text" size="small" @click="search(scope.row)">{{scope.row.PN}}</el-button>
        </template>
      </el-table-column>
      <el-table-column prop="total" label="Inventory Quantity" width="140"></el-table-column>
    </el-table>
		<total-data :partNo="acrossPartNo"></total-data>
	</div>
</template>
<script>
import { mapGetters } from 'vuex'
import totalData from './totalData'
export default {
  data () {
    return {
      searchInfo: [],
      acrossPartNo: ''
    }
  },
  components: {
    totalData
  },
  computed: {
    ...mapGetters(['inventoryInfo'])
  },
  mounted () {
    this.$store.dispatch('getInventoryInfo')
  },
  methods: {
    search (row) {
      this.acrossPartNo = row.PN
    }
  }
}
</script>
<style lang="less" scoped>
.wrap {
  overflow: hidden;
  padding: 0 0 15px 15px;
  .el-table {
    width: 280px;
    float: left;
  }
}
</style>