<template>
	<div class="search-wrap">
    <div class="search-form">
      <div class="timer">
        <label>Order Create Date(Lenovo SO)</label>
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
            <label>PO No.</label>
            <el-input v-model="searchData.cPoNo" placeholder="Please Enter Content"></el-input>
          </div>
        </div>
        <div class="condition-group">
          <div>
            <label>Vendor No.</label>
            <el-input v-model="searchData.VendorNo" placeholder="Please Enter Content"></el-input>
          </div>
          <div>
            <label>Lenovo Part No.</label>
            <el-input v-model="searchData.partNo" placeholder="Please Enter Content"></el-input>
          </div>
        </div>
      </div>
      <el-button class="search" @click="search">Search</el-button>
    </div>
    <odm-detail :searchInfo="searchInfo"></odm-detail>
	</div>
</template>
<script>
import { mapGetters } from 'vuex'
import odmDetail from './odmDetail.vue'
export default {
  components: {
    odmDetail
  },
  data () {
    return {
      searchInfo: {},
      datesTime: '',
      searchData: {
        startDate: '',
        endDate: '',
        soNo: '',
        cPoNo: '',
        VendorNo: '',
        partNo: ''
      }
    }
  },
  computed: {
    ...mapGetters(['searchOdmData'])
  },
  methods: {
    search () {
      if (this.searchData.startDate === '' && this.searchData.endDate === '' && this.searchData.soNo === '' && this.searchData.cPoNo === '' && this.searchData.VendorNo === '' && this.searchData.partNo === '') {
        this.$message({
          showClose: true,
          message: 'Please enter a search condition at least!',
          type: 'error'
        })
      } else {
        const loading = this.$loading({
          lock: true,
          text: 'Searching From Block Chain',
          spinner: 'el-icon-loading',
          background: 'rgba(0, 0, 0, 0.7)'
        })
        this.$store.dispatch('getSearchOdmData', {
          fcn: 'queryByIds',
          args: this.searchData
        }).then((res) => {
          loading.close()
          if (res.body.success) {
            this.searchInfo = this.searchOdmData.body
          } else {
            this.$message({
              showClose: true,
              message: 'No Data',
              type: 'error'
            })
          }
          this.searchData = {
            startDate: '',
            endDate: '',
            soNo: '',
            cPoNo: '',
            VendorNo: '',
            partNo: ''
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
    margin-right: 160px;
  }
}

</style>