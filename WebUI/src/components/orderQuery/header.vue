<template>
	<div class="header-wrap">
	    <p></p>
	    <img v-if="customer === 'lenovo'" src="../../assets/image/lenovo.jpg" alt="">
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
		background: #fefefe;
		padding: 8px 15px;
		font-weight: bold;
		font-size: 24px;

		>p {
	    width: 240px;
    	height: 45px;
			background: url(../../assets/image/lenovoBlock.png);
			background-size:  100% 100%;
		}

		img, div {
			position: absolute;
			right: 15px;
		}
		>img {
			top: 14px;
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
