<template>
	<div class="search-wrap">
    <div class="search-form">
      <div class="timer">
        <label>Lenovo PO Create Date</label>
        <p>
          <el-date-picker v-model="searchData.startDate" type="date" @change="getStartTime" value-format="yyyy-MM-dd" placeholder="Please Enter startDate">
          </el-date-picker>
          <span>--</span>
          <el-date-picker v-model="searchData.endDate" type="date" @change="getEndTime" value-format="yyyy-MM-dd" placeholder="Please Enter endDate">
          </el-date-picker>
        </p>
      </div>
      <div class="search-content">
        <div class="condition-group">
          <div>
            <label>Lenovo PO No.</label>
            <el-input v-model="searchData.poNo" placeholder="Please Enter Content"></el-input>
          </div>
          <div>
            <label>PO Order Type</label>
            <el-input v-model="searchData.poType" placeholder="Please Enter Content"></el-input>
          </div>
        </div>
        <div class="condition-group">
          <div>
            <label>Vendor No.</label>
            <el-input v-model="searchData.vendorNo" placeholder="Please Enter Content"></el-input>
          </div>
          <div>
            <label>Lenovo Part No.</label>
            <el-input v-model="searchData.partNo" placeholder="Please Enter Content"></el-input>
          </div>
        </div>
      </div>
      <el-button class="search" @click="search">Search</el-button>
    </div>
  	<po-detail :searchInfo="searchInfo"></po-detail>
	</div>
</template>
<script>
import { mapGetters } from 'vuex'
import poDetail from './poDetail.vue'
export default {
  components: {
    poDetail
  },
  data () {
    return {
      searchInfo: {},
      datesTime: '',
      searchData: {
        startDate: '',
        endDate: '',
        poNo: '',
        poType: '',
        vendorNo: '',
        partNo: ''
      }
    }
  },
  computed: {
    ...mapGetters(['searchPoData'])
  },
  methods: {
    search () {
      if (this.searchData.startDate === '' && this.searchData.endDate === '' && this.searchData.vendorNo === '' && this.searchData.poNo === '' && this.searchData.poType === '' && this.searchData.partNo === '') {
        this.$message({
          showClose: true,
          message: 'Please enter a search condition at least!',
          type: 'error'
        })
      } else {
        const loading = this.$loading({
          lock: true,
          text: 'Searching From Blockchain',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$store.dispatch('getSearchPoData', {
          fcn: 'queryByIds',
          args: this.searchData
        }).then((res) => {
          loading.close()
          if (res.body.success && res.body.data.length > 0) {
            this.searchInfo = this.searchPoData.body
          } else {
            this.$message({
              showClose: true,
              message: 'No Data',
              type: 'error'
            })
          }
        })
      }
    },
    getStartTime (date) {
      this.searchData.startDate = date
    },
    getEndTime (date) {
      this.searchData.endDate = date
    }
  }
}
</script>
<style lang="less" scoped>
.search-content {
  overflow: hidden;
  .condition-group {
    float: left;
    margin-right: 300px;
  }
}

</style>