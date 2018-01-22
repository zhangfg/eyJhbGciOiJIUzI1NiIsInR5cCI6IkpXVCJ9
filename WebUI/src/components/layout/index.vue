<template>
	<div class="wrap">
		<div class="tab-list">
			<header-title></header-title>
			<el-menu default-active="2" class="el-menu-vertical-demo" background-color="#545c64" text-color="#fff" active-text-color="#409EFF">
				<router-link to="/layout/search" active-class="active">
					<el-menu-item index="2">
						<i class="el-icon-menu"></i>
						<span slot="title">Search</span>
					</el-menu-item>
				</router-link>
				<router-link to="/layout/upload" v-if="lenovoCustomer !== 'lenovo' && lenovoCustomer !== 'flex'">
					<el-menu-item index="3">
						<i class="el-icon-setting"></i>
						<span slot="title">Upload</span>
					</el-menu-item>
				</router-link>
			</el-menu>
			<div class="view">
				<router-view></router-view>
			</div>
		</div>
	</div>
</template>
<script>
import headerTitle from '@/components/orderQuery/header.vue'
export default {
  data () {
    return {
      lenovoCustomer: true
    }
  },
  components: {
    headerTitle
  },
  mounted () {
    this.lenovoCustomer = sessionStorage.getItem('roleId')
  }
}
</script>
<style lang="less" scoped>
.wrap {
	height: 100%;
	.tab-list {
		height: 100%;
		.el-menu-vertical-demo {
			float: left;
			width: 200px;
			height: 100%;
			a {
			 	text-decoration: none;
		 	}
		 	span {
		 		font-size: 17px;
		 	}
		}
		.view {
			height: 100%;
			margin-left: 200px;
			background: #f0f0f0;
		}
	}
}
</style>
