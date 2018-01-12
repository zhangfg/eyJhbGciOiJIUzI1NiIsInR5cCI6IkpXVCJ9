import * as types from './../mutation-types'
import * as constants from './../apiConstant'
import Vue from 'vue'

const state = {
  searchSoData: {},
  searchPoData: {},
  searchOdmData: {},
  searchSupplierData: {}
}

const getters = {
  searchSoData: state => state.searchSoData,
  searchPoData: state => state.searchPoData,
  searchOdmData: state => state.searchOdmData,
  searchSupplierData: state => state.searchSupplierData
}

const actions = {
  getSearchSoData ({ commit }, payload) {
    return Vue.http.post(constants.LENOVO_URL + sessionStorage.getItem('roleId') + '/channels/' + constants.CHAINCODE_NAME + '/chaincodes/' + constants.CHANNEL_NAME + '/so/search', {
      fcn: payload.fcn,
      args: payload.args
    }, {
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer' + ' ' + sessionStorage.getItem('accessToken')
      }
    }).then(datas => {
      datas && commit(types.GET_SEARCH_SO_DATA, datas)
      return datas
    })
  },
  getSearchPoData ({ commit }, payload) {
    return Vue.http.post(constants.LENOVO_URL + sessionStorage.getItem('roleId') + '/channels/' + constants.CHAINCODE_NAME + '/chaincodes/' + constants.CHANNEL_NAME + '/po/search', {
      fcn: payload.fcn,
      args: payload.args
    }, {
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer' + ' ' + sessionStorage.getItem('accessToken')
      }
    }).then(datas => {
      datas && commit(types.GET_SEARCH_PO_DATA, datas)
      return datas
    })
  },
  getSearchOdmData ({ commit }, payload) {
    return Vue.http.post(constants.ODM_URL + sessionStorage.getItem('roleId') + '/channels/' + constants.CHAINCODE_NAME + '/chaincodes/' + constants.CHANNEL_NAME + '/cpo/search', {
      fcn: payload.fcn,
      args: payload.args
    }, {
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer' + ' ' + sessionStorage.getItem('accessToken')
      }
    }).then(datas => {
      datas && commit(types.GET_SEARCH_ODM_DATA, datas)
      return datas
    })
  },
  getSearchSupplierData ({ commit }, payload) {
    return Vue.http.post(constants.SUPPLIER_URL + sessionStorage.getItem('roleId') + '/channels/' + constants.CHAINCODE_NAME + '/chaincodes/' + constants.CHANNEL_NAME + '/sup/search', {
      fcn: payload.fcn,
      args: payload.args
    }, {
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer' + ' ' + sessionStorage.getItem('accessToken')
      }
    }).then(datas => {
      datas && commit(types.GET_SEARCH_SUPPLIER_DATA, datas)
      return datas
    })
  }
}

const mutations = {
  [types.GET_SEARCH_SO_DATA] (state, payload) {
    state.searchSoData = payload
  },
  [types.GET_SEARCH_PO_DATA] (state, payload) {
    state.searchPoData = payload
  },
  [types.GET_SEARCH_ODM_DATA] (state, payload) {
    state.searchOdmData = payload
  },
  [types.GET_SEARCH_SUPPLIER_DATA] (state, payload) {
    state.searchSupplierData = payload
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
