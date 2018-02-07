<template>
  <div v-if="tableData" class="total-wrap">
    <div class="total-message">
      <div class="total-content">
        <p>Total</p>
        <p>{{tableData.total}}</p>
      </div>
      <div class="total-content">
        <p>Last Week Pull</p>
        <p>{{tableData.lastweekPullTotal}}</p>
      </div>
      <div class="total-content">
        <p>Last Week GR</p>
        <p>{{tableData.lastweekGRTotal}}</p>
      </div>
      <div class="total-content">
        <p>Yesterday Pull</p>
        <p>{{tableData.ystdPullTotal}}</p>
      </div>
      <div class="total-content">
        <p>Yesterday GR</p>
        <p>{{tableData.ystdGRTotal}}</p>
      </div>
    </div>
    <div class="pagination-table">
      <el-table :data="tableData.data" empty-text="No Data" border>
        <el-table-column prop="SONUMBER" label="Lenovo SO">
        </el-table-column>
        <el-table-column prop="FLEXPONO" label="ODM PO" width="120">
        </el-table-column>
        <el-table-column prop="Week" label="Week" width="120">
        </el-table-column>
        <el-table-column prop="UpdateDate" label="Actual Pull Date/GR Date" width="170">
        </el-table-column>
        <el-table-column prop="PN" label="PN">
        </el-table-column>
        <el-table-column prop="Qty" label="Qty">
        </el-table-column>
        <el-table-column prop="NO" label="Pull Reference No./GR No." width="170">
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  props: {
    partNo: {
      type: String
    }
  },
  computed: {
    ...mapGetters(['inventoryInfo']),
    tableData () {
      let tableData = ''
      this.inventoryInfo.body.data.map((item) => {
        if (item.PN === this.partNo) {
          tableData = item
        }
      })
      return tableData
    }
  }
}
</script>
<style lang="less" scoped>
.total-wrap {
  margin: 20px 0;
  padding-left: 300px;
  padding-right: 20px;
  .total-message {
    margin-bottom: 20px;
    display: flex;
    justify-content: space-around;
    .total-content {
      width: 150px;
      height: 150px;
      background: #3f9eff;
      font-size: 15px;
      color: #fff;
      border-radius: 2px;
      >p {
        text-align: center;
        margin-top: 25px;
      }
      p:nth-child(2) {
        font-size: 50px;
      }
    }
  }
  .pagination-table {
    display: flex;
  }
}
</style>