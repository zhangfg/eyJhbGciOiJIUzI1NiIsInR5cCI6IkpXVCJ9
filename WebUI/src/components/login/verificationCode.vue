<template>
	<div>  
    <input v-model="inputCode" type="text">
    <input v-model="checkCode" type="button" @click="createCode()"/>  
    <el-button @click="validate()">Verification</el-button>
  </div> 
</template>
<script>
export default {
  data () {
    return {
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
      let random = new Array(0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R',
     'S','T','U','V','W','X','Y','Z')
      for(let i = 0;i < codeLength;i++) {
        let index = Math.floor(Math.random()*36)
        code += random[index]
      }
      this.checkCode = code
    },
    validate () {
      let inputCode = this.inputCode.toUpperCase()
      if (inputCode.length <= 0) {
        this.$message({
          showClose: true,
          message: 'Please Enter Verification Code'
        })
      } else if (inputCode != this.code ) {
        this.$message({
          showClose: true,
          message: 'Verification Code error'
        })
        this.inputCode = ''
        this.createCode()
      }
    }
  }
}
</script>
<style lang="less" scoped>

</style>
