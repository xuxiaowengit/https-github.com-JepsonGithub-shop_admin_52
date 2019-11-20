import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'

// 关闭控制台的提示信息
Vue.config.productionTip = false
// 使用elementui插件
Vue.use(ElementUI)

// 优化1：把axios绑定到vue的原型上
// vue-resource: $http  引用类型
Vue.prototype.$axios = axios
// 优化2：配置axios的默认baseURL
axios.defaults.baseURL = 'http://localhost:8888/api/private/v1/'
// 优化3：配置axios的token， 注意：token会发生改变的，不能配置默认的token值
// axios.defaults.headers.common['Authorization'] = localStorage.getItem('token')
axios.interceptors.request.use(function (config) {
  // console.log('config', config)
  // 请求拦截器中统一的修改config.headers
  // config.baseURL = 'http://localhost:8888/api/private/v1/'
  if (config.url !== 'login') {
    config.headers.Authorization = localStorage.getItem('token')
  }
  return config
}, function (error) {
  return Promise.reject(error)
})

// 配置响应拦截器
axios.interceptors.response.use(function (response) {
  // console.log('响应的数据', response)
  // 拦截到所有的响应，直接把res的data返回
  return response.data
}, function (error) {
  return Promise.reject(error)
})

new Vue({
  router,
  // render: 渲染 app组件到el
  render: h => h(App)
}).$mount('#app')
