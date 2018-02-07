<template>
	<div class="search-wrap">
		<div class="search-form">
  		<div class="timer">
  			<label>Lenovo SO Create Date</label>
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
            <label>Lenovo SO No.</label>
            <el-input v-model="searchData.soNo" placeholder="Please Enter Content"></el-input>
          </div>
          <div>
            <label>SO Order Type</label>
            <el-input v-model="searchData.soType" placeholder="Please Enter Content"></el-input>
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
        <div class="condition-group">
          <div>
            <label>ODM PO No.</label>
            <el-input v-model="searchData.cPoNo" placeholder="Please Enter Content"></el-input>
          </div>
          <div>
            <label>Lenovo PR No.</label>
            <el-input v-model="searchData.prNo" placeholder="Please Enter Content"></el-input>
          </div>
        </div>
      </div>
  		<el-button type="primary" class="search" @click="search">Search</el-button>
    </div>
    <so-detail :searchInfo="searchInfo"></so-detail>
	</div>
</template>
<script>
import { mapGetters } from 'vuex'
import soDetail from './soDetail.vue'
export default {
  components: {
    soDetail
  },
  data () {
    return {
      searchInfo: {},
      datesTime: '',
      searchData: {
        startDate: '',
        endDate: '',
        soNo: '',
        soType: '',
        partNo: '',
        cPoNo: '',
        prNo: '',
        vendorNo: ''
      }
    }
  },
  computed: {
    ...mapGetters(['searchSoData'])
  },
  methods: {
    search () {
      if (this.searchData.startDate === '' && this.searchData.endDate === '' && this.searchData.soNo === '' && this.searchData.soType === '' && this.searchData.partNo === '' && this.searchData.cPoNo === '' && this.searchData.prNo === '' && this.searchData.vendorNo === '') {
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
        this.$store.dispatch('getSearchSoData', {
          fcn: 'queryByIds',
          args: this.searchData
        }).then((res) => {
          loading.close()
          if (res.body.success && res.body.data.length > 0) {
            this.searchInfo = this.searchSoData.body
          } else {
            this.$message({
              showClose: true,
              message: 'No Data',
              type: 'error'
            })
          }
        }).then((error) => error)
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
  display: flex;
  justify-content: space-between;
  .condition-group {
    margin-right: 20px;
  }
}

</style>