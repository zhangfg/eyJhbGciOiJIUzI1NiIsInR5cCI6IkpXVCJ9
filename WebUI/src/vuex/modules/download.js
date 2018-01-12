// import * as types from './../mutation-types'
// import * as constants from './../apiConstant'
import Vue from 'vue'
var FileSaver = require('file-saver');
const state = {
}

const getters = {
}

const actions = {
  getDownload ({ commit }, payload) {
    return Vue.http.post('https://supplier1bs.mybluemix.net/' + sessionStorage.getItem('roleId') + '/channels/mychannel/chaincodes/BuySell/download', {
      asnno: payload.asnno,
      vendorNo: payload.vendorNo
    }, {
      headers: {
        'authorization': 'Bearer' + ' ' + sessionStorage.getItem('accessToken')
      }
    }).then((datas) => {
      var blob = new Blob([datas.body], {type: "application/pdf"});
      FileSaver.saveAs(blob, "test.pdf");
    })
  }
}

const mutations = {
}

export default {
  state,
  getters,
  actions,
  mutations
}
