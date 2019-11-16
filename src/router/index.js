// 配置所有的路由功能
import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home
    }
  ]
})

export default router
