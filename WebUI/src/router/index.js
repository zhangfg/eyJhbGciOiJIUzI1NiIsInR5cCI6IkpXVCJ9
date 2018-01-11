import Vue from 'vue'
import Router from 'vue-router'
import layout from '@/components/layout/index'
import search from '@/components/orderQuery/index'
import upload from '@/components/upload/index'
import login from '@/components/login/index'

Vue.use(Router)

export default new Router({
  routes: [{
    path: '/layout',
    name: 'layout',
    component: layout,
    children: [{
      path: 'search',
      name: 'search',
      meta: {
        requireAuth: true // 添加该字段，表示进入这个路由是需要登录的
      },
      component: search
    }, {
      path: 'upload',
      name: 'upload',
      meta: {
        requireAuth: true // 添加该字段，表示进入这个路由是需要登录的
      },
      component: upload
    }],
    redirect: '/layout/search'
  }, {
    path: '/',
    redirect: '/login'
  }, {
    path: '/login',
    name: 'login',
    component: login
  }, {
    path: '*',
    component: search,
    redirect: '/layout/search'
  }]
})
