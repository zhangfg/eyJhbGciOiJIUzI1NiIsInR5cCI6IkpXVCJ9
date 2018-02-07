import * as types from './../mutation-types'
import * as constants from './../apiConstant'
import Vue from 'vue'

const state = {
  inventoryInfo: {},
  soiInfo: {}
}

const getters = {
  inventoryInfo: state => state.inventoryInfo,
  soiInfo: state => state.soiInfo
}

const actions = {
  getInventoryInfo ({ commit }, payload) {
    return Vue.http.post(constants.LENOVO_URL + sessionStorage.getItem('roleId') + '/channels/' + constants.CHAINCODE_NAME + '/chaincodes/' + constants.CHANNEL_NAME + '/loi/search', {
      fcn: 'queryByIds',
      args: {
        'PN': ''
      }
    }, {
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer' + ' ' + sessionStorage.getItem('accessToken')
      }
    }).then(datas => {
      datas && commit(types.GET_INVENTORY_INFO, datas)
      return datas
    })
  },
  getSoiInfo ({ commit }, payload) {
    return Vue.http.post(constants.LENOVO_URL + sessionStorage.getItem('roleId') + '/channels/' + constants.CHAINCODE_NAME + '/chaincodes/' + constants.CHANNEL_NAME + '/soi/search', {
      fcn: 'queryByIds',
      args: {
        'PN': ''
      }
    }, {
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer' + ' ' + sessionStorage.getItem('accessToken')
      }
    }).then(datas => {
      datas && commit(types.GET_SOI_INFO, datas)
      return datas
    })
  }
}

const mutations = {
  [types.GET_INVENTORY_INFO] (state, payload) {
    state.inventoryInfo = payload
  },
  [types.GET_SOI_INFO] (state, payload) {
    state.soiInfo = payload
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
