<template>
	<div class="header-wrap">
	    <p><img v-if="customer === 'lenovo'" src="../../assets/image/logo.png" alt=""><span>Lenovo Buy&Sell Blockchain</span></p>
	    <img class="lenovo-word" v-if="customer === 'lenovo'" src="../../assets/image/lenovo.png" alt="">
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

		>p {
			height: 40px;
			img {
				width: 35px;
				margin-top: 2px;
			}
			span {   
			 	font-weight: bold;
		    font-size: 30px;
		    display: inline-block;
		    position: absolute;
		    top: 14px;
		    left: 60px;
			}
		}
		
		.lenovo-word {
			position: absolute;
			right: 15px;
			top: 13px;
			width: 100px;
		}
	}
</style>
