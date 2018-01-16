<template>
  <div v-if="searchInfo" class="document-header-wrap">
    <div v-if="searchInfo.data">
      <p class="title">Document Header</p>
      <el-table :data="searchInfo.data" empty-text="No Data" border>
        <el-table-column prop="POTYPE" label="PO Type">
        </el-table-column>
        <el-table-column prop="PONumber" label="Lenovo PO">
        </el-table-column>
        <el-table-column prop="POItem" label="PO Item">
          <template slot-scope="scope">
            <el-button @click="supplieritemClick(scope.row)" type="text" size="small">{{scope.row.CPONO}}</el-button>
          </template>
        </el-table-column>
        <el-table-column prop="PARTSNO" label="Part Number">
        </el-table-column>
        <el-table-column prop="POQty" label="Quantity">
        </el-table-column>
        <el-table-column prop="Unit" label="Unit">
        </el-table-column>
        <el-table-column prop="PARTSDESC" label="Description">
        </el-table-column>
        <el-table-column prop="CRAD" label="Customer Required Date">
        </el-table-column>
        <el-table-column prop="NAME_AG" label="Customer Name">
        </el-table-column>
        <el-table-column prop="SONUMBER" label="Lenovo SO">
        </el-table-column>
        <el-table-column prop="CPONO" label="Customer PO no">
        </el-table-column>
        <el-table-column prop="CITY_WE" label="Ship to Location">
        </el-table-column>
        <el-table-column prop="ContractNO" label="Contract No">
        </el-table-column>
        <el-table-column prop="ContractItemNO" label="Contract item">
        </el-table-column>
      </el-table>
    </div>
    <el-dialog :visible.sync="supplieritemTableVisible">
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
        PONumber: '',
        POItem: ''
      }
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
        PONumber: row.PONumber,
        POItem: row.POItem
      }
      this.supplieritemTableVisible = true
    }
  }
}
</script>
