<template>
	<div class="upload">
    <div class="content">
      <div>
        <label>ASN No.</label>
        <el-input v-model="uploadData.ASNNO" placeholder="Please Enter Content"></el-input>
      </div>
      <el-upload :disabled="uploadData.ASNNO === ''" class='ensure ensureButt' :data="uploadData" :action="importFileUrl" :headers="headers" name="attachment" :onError="uploadError" :onSuccess="uploadSuccess" :beforeUpload="beforeAvatarUpload">
        <el-button :class="{ ban:uploadData.ASNNO === '' }" size="small" type="primary">Upload File</el-button>
      </el-upload>
      <p>You can only upload *.xls,*.xlsx or *.pdf files</p>
    </div>
	</div>
</template>
<script>
export default {
  data () {
    return {
      importFileUrl: 'https://suptest.mybluemix.net/' + sessionStorage.getItem('roleId') + '/channels/mychannel/chaincodes/BuySell/upload',
      uploadData: {
        ASNNO: ''
      },
      headers: {
        'authorization': 'Bearer' + ' ' + sessionStorage.getItem('accessToken')
      }
    }
  },
  methods: {
    uploadSuccess (response, file, fileList) {
      this.$message({
        showClose: true,
        message: '上传成功'
      })
      console.log(response, file, fileList)
      this.uploadData.ASNNO = ''
    },
    uploadError (response, file, fileList) {
      this.$message({
        showClose: true,
        message: '上传失败，请重试！',
        type: 'error'
      })
    },
    beforeAvatarUpload (file) {
      const xlsFormat = file.name.split('.')[1] === 'xls'
      const xlsxFormat = file.name.split('.')[1] === 'xlsx'
      const pdfFormat = file.name.split('.')[1] === 'pdf'
      const isLt2M = file.size / 1024 / 1024 < 10
      if (!xlsFormat && !xlsxFormat && !pdfFormat) {
        this.$message({
          showClose: true,
          message: '上传模板只能是 xls、xlsx、pdf 格式!',
          type: 'warning'
        })
      }
      if (!isLt2M) {
        this.$message({
          showClose: true,
          message: '上传模板大小不能超过 10MB!',
          type: 'warning'
        })
      }
      /* eslint-disable */
      return xlsFormat || xlsxFormat || pdfFormat && isLt2M
    }
  }
}
</script>
<style lang="less" scoped>
	.upload {
    position: relative;
    height: 100%;
    .content {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      >div {
        margin-bottom: 15px;
        text-align: center;
      }
    }
    .el-input {
      width: 150px !important;
    }
		.el-button--mini, .el-button--small {
			font-size: 16px;
			font-weight: bold;
		}
	}
  .ban {
    cursor:not-allowed;
  }

</style>
