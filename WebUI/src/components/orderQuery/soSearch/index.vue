<template>
	<div class="wrap">
		<div class="search-form">
		<div>
			<label>LenovoSoCreateDate</label>
			<el-date-picker v-model="searchData.startDate" type="date" @change="getStartTime" value-format="yyyy-MM-dd" placeholder="Please Enter startDate">
			</el-date-picker>
		</div>
		<div>
			<el-date-picker v-model="searchData.endDate" type="date" @change="getEndTime" value-format="yyyy-MM-dd" placeholder="Please Enter endDate">
			</el-date-picker>
		</div>
		<div>
      <label>LenovoSoNo</label>
      <el-input v-model="searchData.soNo" placeholder="Please Enter Content"></el-input>
    </div>
    <div>
			<label>SoOrderType</label>
			<el-input v-model="searchData.soOrder" placeholder="Please Enter Content"></el-input>
		</div>
	</div>
	<div class="search-form">
		<div>
			<label>VendorNo</label>
			<el-input v-model="searchData.vendorNo" placeholder="Please Enter Content"></el-input>
		</div>
		<div>
			<label>LenovoPartNo</label>
			<el-input v-model="searchData.partNo" placeholder="Please Enter Content"></el-input>
		</div>
		<div>
			<label>CustomerPoNo</label>
			<el-input v-model="searchData.customerPoNo" placeholder="Please Enter Content"></el-input>
		</div>
    <div>
      <label>LenovoPRNo</label>
      <el-input v-model="searchData.prNo" placeholder="Please Enter Content"></el-input>
    </div>
		<el-button class="search" @click="search">Search</el-button>
	</div>
	<document-header :searchInfo="searchInfo"></document-header>
	</div>
</template>
<script>
import { mapGetters } from 'vuex'
import documentHeader from '../documentHeader.vue'
export default {
  components: {
    documentHeader
  },
  data () {
    return {
      searchInfo: {},
      datesTime: '',
      searchData: {
        startDate: '',
        endDate: '',
        soNo: '',
        soOrder: '',
        partNo: '',
        customerPoNo: '',
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
      if (this.searchData.startDate === '' && this.searchData.endDate === '' && this.searchData.soNo === '' && this.searchData.soOrder === '' && this.searchData.partNo === '' && this.searchData.customerPoNo === '' && this.searchData.prNo === '' && this.searchData.vendorNo === '') {
        this.$message({
          showClose: true,
          message: 'Please enter a search condition at least!',
          type: 'error'
        })
      } else {
        this.$store.dispatch('getSearchSoData', {
          fcn: 'queryByIds',
          args: this.searchData
        }).then(() => {
          this.searchInfo = this.searchSoData.body
          this.searchData = {
            startDate: '',
            endDate: '',
            soNo: '',
            soOrder: '',
            partNo: '',
            customerPoNo: '',
            prNo: '',
            vendorNo: ''
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