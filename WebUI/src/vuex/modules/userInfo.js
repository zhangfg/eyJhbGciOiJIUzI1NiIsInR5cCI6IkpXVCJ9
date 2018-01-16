import * as types from './../mutation-types'
import * as constants from './../apiConstant'
import Vue from 'vue'

const state = {
  userInfo: {}
}

const getters = {
  userInfo: state => state.userInfo
}

function Login (currentEnv) {
  let login = ''
  if (window.currentEnv === 'lenovo') {
    login = constants.LENOVO_URL
  } else if (window.currentEnv === 'odm') {
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
  }
}

const mutations = {
  [types.GET_USER_INFO] (state, payload) {
    state.userInfo = payload
  }
}

export default {
  state,
  getters,
  actions,
  mutations
}
