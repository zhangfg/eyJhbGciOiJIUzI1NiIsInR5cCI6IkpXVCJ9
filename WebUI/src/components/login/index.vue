<template>
	<div class="login">
		<div class="logo">Buy&Sell Blockchain</div>
		<div class="login-content">
			<el-form ref="loginForm" :model="loginForm" label-width="0px" :rules="loginRules">
				<el-form-item prop="username">
					<icon name="user" class="title"></icon>
					<el-input autofocus="autofocus" v-model="loginForm.username" placeholder="User Name" type="text" />
				</el-form-item>
				<el-form-item prop="password">
					<icon name="password" class="title"></icon>
					<el-input v-model="loginForm.password" placeholder="Password" type="password" />
				</el-form-item>
			</el-form>
			<div class="verification">  
		    <input v-model="inputCode" type="text">
		    <input v-model="checkCode" type="button" @click="createCode()"/>  
		  </div> 
			<p class="button" @click="login">Login</p>
			<div class="progress">
  			<vue-progress-bar></vue-progress-bar>
			</div>
		</div>
		<img src="../../assets/image/right-logo.png" class="logoin-logo" alt="">
	</div>
</template>
<script>
export default {
  data () {
    return {
      loginForm: {
        username: '',
        password: ''
      },
      loginRules: {
        username: [{
          required: true,
          message: 'Please Enter User Name',
          trigger: 'blur'
        }],
        password: [{
          required: true,
          message: 'Please Enter password',
          trigger: 'blur'
        }]
      },
      checkCode: '',
      inputCode: ''
    }
  },
  mounted () {
    this.createCode()
  },
  methods: {
    createCode () {
      let code = ''
      let codeLength = 4
      let random = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
      for (let i = 0; i < codeLength; i++) {
        let index = Math.floor(Math.random() * 36)
        code += random[index]
      }
      this.checkCode = code
    },
    login () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          let inputCode = this.inputCode.toUpperCase()
          if (inputCode.length <= 0) {
            this.$message({
              showClose: true,
              message: 'Please Enter Verification Code'
            })
          } else if (inputCode !== this.checkCode) {
            this.$message({
              showClose: true,
              message: 'Verification Code error'
            })
            this.inputCode = ''
            this.createCode()
          } else {
            this.$Progress.start()
            this.$store.dispatch('getUserInfo', {
              username: this.loginForm.username,
              password: this.loginForm.password
            }).then((response) => {
              if (response.body.success) {
                this.$Progress.finish()
                this.loginForm.username = ''
                this.loginForm.password = ''
                sessionStorage.setItem('accessToken', response.body.token)
                sessionStorage.setItem('roleId', response.body.roleId)
                this.$router.push({ path: 'layout' })
              } else {
                this.$message('User name or password error')
                this.loginForm.username = ''
                this.loginForm.password = ''
              }
            }).then((error) => error)
          }
        }
      })
    }
  }
}
</script>
<style lang="less" scoped>
.login {
	position: relative;
	width: 100%;
	height: 100%;
	background-image: url(../../assets/image/login.jpeg);
	background-repeat: no-repeat;
	background-size: 100% 100%;

	.logoin-logo {
		position: absolute;
		right: 0;
		bottom: 100px;
    width: 60px;
    height: 180px;

	}

	.logo {
		position: absolute;
		top: 30%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #fff;
		font-size: 60px;
	}

	.login-content {
		position: absolute;
		left: 50%;
		top: 70%;
		transform: translate(-50%, -50%);
		color: #6d8589;
		padding: 15px;
		width: 300px;

		.el-input {
			width: 83%;
		}
		
		.progress {
			margin-top: 10px;
			.__cov-progress {
				position: static;
			}
		}

		.title {
			position: relative;
			top: 13px;
			width: 35px;
			height: 40px;
			margin-left: 10px;
			color: #000;
			font-size: 20px;
			background: #fff;
			line-height: 40px;
			text-align: center;
			border-top-left-radius: 4px;
      border-bottom-left-radius: 4px;
		}
		
		.verification {
			input:nth-child(1), input:nth-child(2) {
				outline: medium;
		    width: 100px;
		    height: 30px;
		    border: 0;
		    border-radius: 2px;
		    margin-left: 10px;
		    background: #eef0fb;
			}
			input:nth-child(2) {
		    width: 80px;
		    height: 25px;
		    font-weight: bold;
		    font-size: 15px;
			}
		}

		.button {
			width: 100%;
			height: 45px;
			font-size: 25px;
			background-color: #409eff;
			border-radius: 2px;
			color: #eee;
			line-height: 45px;
			text-align: center;
			cursor: pointer;
			margin-top: 10px;
		}
		.button:hover {
			color: #f00;
		}
	}
}

</style>
