<template>
	<div class="header-wrap">
	    <p>Lenovo Blockchain</p>
	    <img v-if="customer === 'lenovo'" src="../../../static/image/lenovo.jpg" alt="">
	    <div v-if="customer === 'flex'" >
	    	flex
	    </div>
	    <div v-if="customer !== 'flex' && customer !== 'lenovo'" >
	    	{{customer}}
	    </div>
	</div>
</template>
<script>
  export default {
    data () {
      return {
        customer: ''
      }
    },
    mounted () {
      this.customer = sessionStorage.getItem('roleId')
    }
  }
</script>
<style lang="less" scoped>
	.header-wrap {
		position: relative;
		background: #f5f5f5;
		padding: 15px 15px;
		font-weight: bold;
		font-size: 24px;
		img, div {
			position: absolute;
			right: 15px;
		}
		>img {
			top: 10px;
			width: 100px;
			display: inline-block;
		}
		>div {
			background: #f00;
			padding: 5px 10px;
			top: 10px;
			color: #fff;
		}
	}
</style>
