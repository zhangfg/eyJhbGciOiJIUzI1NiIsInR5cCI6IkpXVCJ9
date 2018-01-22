<template>
  <div class="wrap">
    <div v-if="lenovoCustomer === 'lenovo'">
      <el-tabs v-model="defaultSo" type="card">
        <el-tab-pane label="Search By SO" name="first">
          <search-by-so></search-by-so>
        </el-tab-pane>
        <el-tab-pane label="Search By PO" name="second">
          <search-by-po></search-by-po>
        </el-tab-pane>
      </el-tabs>
    </div>
    <odm-search v-if="lenovoCustomer === 'flex'"></odm-search>
    <supplier-search v-if="lenovoCustomer !== 'flex' && lenovoCustomer !== 'lenovo'"></supplier-search>
  </div>
</template>
<script>
import searchBySo from '@/components/orderQuery/soSearch/index.vue'
import searchByPo from '@/components/orderQuery/poSearch/index.vue'
import odmSearch from '@/components/orderQuery/odmSearch/index.vue'
import supplierSearch from '@/components/orderQuery/supplierSearch/index.vue'
export default {
  data () {
    return {
      defaultSo: 'first',
      lenovoCustomer: ''
    }
  },
  components: {
    searchBySo,
    searchByPo,
    odmSearch,
    supplierSearch
  },
  mounted () {
    this.lenovoCustomer = sessionStorage.getItem('roleId')
  }
}
</script>