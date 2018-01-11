<template>
	<div class="wrap">
		<div class="search-form">
		<div>
			<label>OrderCreateDate(Lenovo So)</label>
			<el-date-picker v-model="searchData.startDate" type="date" @change="getStartTime" value-format="yyyy-MM-dd" placeholder="Please Enter startDate">
			</el-date-picker>
		</div>
		<div>
			<el-date-picker v-model="searchData.endDate" type="date" @change="getEndTime" value-format="yyyy-MM-dd" placeholder="Please Enter endDate">
			</el-date-picker>
		</div>
	</div>
	<div class="search-form">
		<div>
			<label>LenovoPoNo</label>
			<el-input v-model="searchData.poNo" placeholder="Please Enter Content"></el-input>
		</div>
		<div>
			<label>AsnNo</label>
			<el-input v-model="searchData.asnNo" placeholder="Please Enter Content"></el-input>
		</div>
		<div>
			<label>LenovoPartNo</label>
			<el-input v-model="searchData.partNo" placeholder="Please Enter Content"></el-input>
		</div>
		<el-button class="search" @click="search">Search</el-button>
	</div>
	<supplier-detail :searchInfo="searchInfo"></supplier-detail>
	</div>
</template>
<script>
import { mapGetters } from 'vuex'
import supplierDetail from './supplierDetail.vue'
export default {
  components: {
    supplierDetail
  },
  data () {
    return {
      searchInfo: {},
      datesTime: '',
      searchData: {
        startDate: '',
        endDate: '',
        poNo: '',
        asnNo: '',
        partNo: ''
      }
    }
  },
  computed: {
    ...mapGetters(['searchSupplierData'])
  },
  methods: {
    search () {
      if (this.searchData.startDate === '' && this.searchData.endDate === '' && this.searchData.poNo === '' && this.searchData.asnNo === '' && this.searchData.partNo === '') {
        this.$message({
          showClose: true,
          message: 'Please enter a search condition at least!',
          type: 'error'
        })
      } else {
        this.$store.dispatch('getSearchSupplierData', {
          fcn: 'queryByIds',
          args: this.searchData
        }).then(() => {
          this.searchInfo = this.searchSupplierData.body
          this.searchData = {
            startDate: '',
            endDate: '',
            poNo: '',
            asnNo: '',
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
.wrap {
  .el-input {
    width: 150px !important;
  }
  .search-form {
    overflow: hidden;
    margin-bottom: 15px;
    margin-left: -15px;
    font-weight: bold;
    >div {
      float: left;
      margin-left: 15px;
      >label {
        font-size: 16px;
      }
    }
    .search {
      margin-left: 15px;
      border: 0;
    }
    .search:hover {
      background: #fff;
      color: #000;
    }
  }
}

</style>