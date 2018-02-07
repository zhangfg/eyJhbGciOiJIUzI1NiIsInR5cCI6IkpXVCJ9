import * as types from './../mutation-types'
import * as constants from './../apiConstant'
import Vue from 'vue'

const state = {
  userInfo: {},
  searchBlockMessage: {}
}

const getters = {
  userInfo: state => state.userInfo,
  searchBlockMessage: state => state.searchBlockMessage
}

function Login (currentEnv) {
  let login = ''
  if (currentEnv === 'lenovo') {
    login = constants.LENOVO_URL
  } else if (currentEnv === 'odm' || currentEnv === 'flex') {
    login = constants.ODM_URL
  } else {
    login = constants.SUPPLIER_URL
  }
  return login
}

const actions = {
  getUserInfo ({ commit }, payload) {
    return Vue.http.post(Login(window.currentEnv) + 'users', {
      username: payload.username,
      password: payload.password
    }).then(datas => {
      datas && commit(types.GET_USER_INFO, datas)
      return datas
    })
  },
  getSearchBlockMessage ({ commit }, payload) {
    return Vue.http.post(Login(sessionStorage.getItem('roleId')) + sessionStorage.getItem('roleId') + '/channels/' + constants.CHAINCODE_NAME + '/chaincodes/' + constants.CHANNEL_NAME + '/block', {}, {
      headers: {
        'content-type': 'application/json',
        'authorization': 'Bearer' + ' ' + sessionStorage.getItem('accessToken')
      }
    }).then(datas => {
      datas && commit(types.GET_SEARCH_BLOCK_MESSAGE, datas)
      return datas
    })
  }
}

const mutations = {
  [types.GET_USER_INFO] (state, payload) {
    state.userInfo = payload
  },
  [types.GET_SEARCH_BLOCK_MESSAGE] (state, payload) {
    state.searchBlockMessage = payload
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
