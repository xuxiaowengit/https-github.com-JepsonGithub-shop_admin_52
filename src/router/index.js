// 配置所有的路由功能
import Vue from 'vue'
import VueRouter from 'vue-router'

import Home from '../pages/Home.vue'
import Login from '../pages/Login.vue'
import Users from '../pages/Users.vue'
import Roles from '../pages/Roles.vue'
import Rights from '../pages/Rights.vue'

Vue.use(VueRouter)

const router = new VueRouter({
  // 开发阶段，可以直接用，但是如果上线了，一定需要后端的处理
  // 对于没有配置的url，不能去404，去index.html
  // localhost:3000  ===> index.html
  // localhost:3000/#/login ===> index.html
  // localhost:3000/login ===> index.html
  // localhost:3000/home ===> index.html
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: '/home'
    },
    {
      path: '/login',
      component: Login
    },
    {
      path: '/home',
      component: Home,
      children: [
        // 子路由：会自动加上父路由的路径  /home/users
        /*
          嵌套路由： 给某个路由配置子路由
            1. 给路由规则加一个属性： children
            2. 在组件提供子路由的出口 router-view

          注意点：配置子路由的path的注意
          1. 如果path是相对路径， 会自动拼上 父路由的path
          2. 如果path是绝对路径，不会拼上父路由的path
        */
        {
          path: '/users',
          component: Users
        },
        {
          path: '/roles',
          component: Roles
        },
        {
          path: '/rights',
          component: Rights
        }
      ]
    }
  ]
})

// 注册了前置的导航守卫
// from: 从哪儿来
// to: 到哪儿去
// next()  next()：放行  next('/login')
router.beforeEach(function (to, from, next) {
  // console.log('to', to)
  // console.log('from', from)
  // console.log('next', next)
  // 去localStorage中获取到token
  // 放行： 去login  token
  const token = localStorage.getItem('token')
  if (to.path === '/login' || token) {
    next()
  } else {
    next('/login')
  }
})

export default router
