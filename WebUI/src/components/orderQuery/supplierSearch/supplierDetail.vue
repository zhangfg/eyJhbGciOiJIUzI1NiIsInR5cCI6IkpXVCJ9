<template>
  <div v-if="searchInfo" class="document-header-wrap">
    <div v-if="searchInfo.data">
      <el-table :data="searchInfo.data" empty-text="No Data" border>
        <el-table-column prop="POTYPE" label="PO Type">
        </el-table-column>
        <el-table-column prop="PONumber" label="Lenovo PO" width="120">
        </el-table-column>
        <el-table-column prop="POItem" label="PO Item" width="160">
          <template slot-scope="scope">
            <el-button @click="supplieritemClick(scope.row)" type="text" size="small">{{scope.row.POItem}}</el-button>
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
        <el-table-column prop="NAME_AG" label="Customer Name" width="140">
        </el-table-column>
        <el-table-column prop="SONUMBER" label="Lenovo SO" width="120">
        </el-table-column>
        <el-table-column prop="CPONO" label="Customer PO no." width="140">
        </el-table-column>
        <el-table-column prop="CITY_WE" label="Ship to Location" width="140">
        </el-table-column>
        <el-table-column prop="ContractNO" label="Contract No." width="120">
        </el-table-column>
        <el-table-column prop="ContractItemNO" label="Contract item" width="120">
        </el-table-column>
      </el-table>
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
