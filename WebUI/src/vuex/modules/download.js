// import * as types from './../mutation-types'
// import * as constants from './../apiConstant'
import Vue from 'vue'
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
