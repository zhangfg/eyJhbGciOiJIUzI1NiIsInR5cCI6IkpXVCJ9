<template>
	<div class="data-status">
		<div class="total">
			<p>Total blocks</p>
			<p>
				{{number}}
			</p>
		</div>
		<div class="block-message">
			<div class="block-title">Block</div>
			<div v-for="item in message" class="block-content">
				<p class="block-no">{{item.blockNo}}</p>
				<p class="block-time">{{formatDateTime(item.timestamp)}}</p>
			</div>
		</div>
	</div>
</template>
<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      number: '',
      message: []
    }
  },
  computed: {
    ...mapGetters(['searchBlockMessage'])
  },
  mounted () {
    this.$store.dispatch('getSearchBlockMessage').then((data) => {
      this.number = data.body.size
      this.message = data.body.data
    })
  },
  methods: {
    formatDateTime (GMTDate) {
      let date = new Date(GMTDate)
      let y = date.getFullYear()
      let m = date.getMonth() + 1
      m = m < 10 ? ('0' + m) : m
      let d = date.getDate()
      d = d < 10 ? ('0' + d) : d
      let h = date.getHours()
      let minute = date.getMinutes()
      let seconds = date.getSeconds()
      minute = minute < 10 ? ('0' + minute) : minute
      return y + '-' + m + '-' + d + ' ' + h + ':' + minute + ':' + seconds
    }
  }
}
</script>
<style lang="less" scoped>
	.data-status {
	  position: absolute;
	  bottom: 0;
	  width: 100%;
	  .total {
	  	width: 180px;
	  	height: 100px;
	  	margin-left: 10px;
	  	border-radius: 50%;
	  	background: #f0f0f0;
	  	color: #0084ff;
	  	>p {
	  		text-align: center;
	  		padding-top: 15px;
	  	}
	  	p:nth-child(1) {
	  		font-size: 20px;
	  	}
	  	p:nth-child(2) {
	  		font-size: 40px;
	  	}
	  }
	  .block-message {
	  	background: #fff;
  		text-align: center;
	  	.block-title {
  			padding: 10px 0;
	  		border-top: 1px solid #ccc;
	  		border-bottom: 1px solid #ccc;
	  	}
	  	.block-content {
	  		overflow: hidden;
	  		p {
	  			float: left;
	  			border-bottom: 1px solid #ccc;
	  			padding: 10px 5px;
	  		}
	  		.block-no {
				width: 30px;
	  		}
	  		.block-time {
	  			border-left: 1px solid #ccc;
	  		}
	  	}
	  }
	}
</style>
