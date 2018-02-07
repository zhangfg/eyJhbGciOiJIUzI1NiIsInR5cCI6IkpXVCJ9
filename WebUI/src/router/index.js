import Vue from 'vue'
import Router from 'vue-router'
import layout from '@/components/layout/index'
import search from '@/components/orderQuery/index'
import upload from '@/components/upload/index'
import Inventory from '@/components/Inventory/index'
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
        requireAuth: true
      },
      component: search
    }, {
      path: 'upload',
      name: 'upload',
      meta: {
        requireAuth: true
      },
      component: upload
    }, {
      path: 'Inventory',
      name: 'Inventory',
      meta: {
        requireAuth: true
      },
      component: Inventory
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
