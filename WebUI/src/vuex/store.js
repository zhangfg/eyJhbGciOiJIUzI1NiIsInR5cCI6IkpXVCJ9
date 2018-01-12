import Vue from 'vue'
import vuex from 'vuex'
import searchCondition from './modules/searchCondition'
import userInfo from './modules/userInfo'
import download from './modules/download'

Vue.use(vuex)

export default new vuex.Store({
  strict: process.env.NODE_ENV !== 'production',
  modules: {
    searchCondition,
    userInfo,
    download
  }
})
