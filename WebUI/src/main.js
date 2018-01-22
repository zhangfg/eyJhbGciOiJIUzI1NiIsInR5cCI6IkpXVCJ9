// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import VueResource from 'vue-resource'
import store from './vuex/store'
import './assets/common.less'
import Icon from 'vue-svg-icon/Icon.vue'

Vue.config.productionTip = false

Vue.use(ElementUI)

Vue.use(VueResource)

Vue.component('icon', Icon)

router.beforeEach((to, from, next) => {
  if (to.path === '/login') {
    next()
  } else {
    if (to.meta.requireAuth && !sessionStorage.getItem('accessToken')) {
      next({
        path: '/login'
      })
    } else {
      next()
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  template: '<App/>',
  components: { App }
})
