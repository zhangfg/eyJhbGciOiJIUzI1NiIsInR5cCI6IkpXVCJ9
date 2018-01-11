<template>
	<div class="login">
		<div class="logo">BlockChain</div>
		<div class="login-content">
			<el-form ref="loginForm" :model="loginForm" label-width="0px" :rules="loginRules">
				<el-form-item prop="username">
					<p class="title">USER NAME</p>
					<el-input autofocus="autofocus" v-model="loginForm.username" placeholder="Please Enter User Name" type="text" />
				</el-form-item>
				<el-form-item prop="password">
					<p class="title">password</p>
					<el-input v-model="loginForm.password" placeholder="Please Enter password" type="password" />
				</el-form-item>
			</el-form>
			<p class="button" @click="login">Login</p>
		</div>
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
          message: '      Please Enter User Name',
          trigger: 'blur'
        }],
        password: [{
          required: true,
          message: 'Please Enter password',
          trigger: 'blur'
        }]
      }
    }
  },
  methods: {
    login () {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.$store.dispatch('getUserInfo', {
            username: this.loginForm.username,
            password: this.loginForm.password
          }).then((response) => {
          // 这里在isLogin方法中先判断一下后台返回的是否为空值，如果不是然后提交后台返回的值。
            if (response.body != null) {
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
	background: linear-gradient(to right bottom, #253338, #658b8e);

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

		.title {
			height: 30px;
			margin-left: 10px;
		}

		.button {
			width: 100%;
			height: 45px;
			font-size: 25px;
			background-color: #a7b7b8;
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
