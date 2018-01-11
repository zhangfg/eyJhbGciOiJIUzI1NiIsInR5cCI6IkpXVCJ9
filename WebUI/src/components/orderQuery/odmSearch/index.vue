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
			<label>LenovoSoNo</label>
			<el-input v-model="searchData.soNo" placeholder="Please Enter Content"></el-input>
		</div>
		<div>
			<label>PoNo</label>
			<el-input v-model="searchData.poNo" placeholder="Please Enter Content"></el-input>
		</div>
		<div>
			<label>VendorNo</label>
			<el-input v-model="searchData.soType" placeholder="Please Enter Content"></el-input>
		</div>
		<div>
			<label>LenovoPartNo</label>
			<el-input v-model="searchData.partNo" placeholder="Please Enter Content"></el-input>
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
        poNo: '',
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
      if (this.searchData.startDate === '' && this.searchData.endDate === '' && this.searchData.soNo === '' && this.searchData.poNo === '' && this.searchData.VendorNo === '' && this.searchData.partNo === '') {
        this.$message({
          showClose: true,
          message: 'Please enter a search condition at least!',
          type: 'error'
        })
      } else {
        this.$store.dispatch('getSearchOdmData', {
          fcn: 'queryByIds',
          args: this.searchData
        }).then(() => {
          this.searchInfo = this.searchOdmData.body
          this.searchData = {
            startDate: '',
            endDate: '',
            soNo: '',
            poNo: '',
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