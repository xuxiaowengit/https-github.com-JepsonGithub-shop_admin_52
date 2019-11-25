import Vue from 'vue'
import App from './App.vue'
import router from './router'
import ElementUI from 'element-ui'
import VueQuillEditor from 'vue-quill-editor'
import 'element-ui/lib/theme-chalk/index.css'
import axios from 'axios'
import moment from 'moment'

import 'quill/dist/quill.core.css'
import 'quill/dist/quill.snow.css'
import 'quill/dist/quill.bubble.css'

// 1. 如果是基于 vue 的插件, 就需要 Vue.use 一下, 在内部会进行全局组件的一些注册 或者一些初始化
// 2. 如果不是基于 vue 的插件, 直接导入即可, 但是如果希望在很多个页面都能用, 挂载到 Vue.prototype 上面

// 关闭控制台的提示信息
Vue.config.productionTip = false
// 使用elementui插件, Vue.use可以帮我们注册第三方的一些全局组件, 供我们使用
Vue.use(ElementUI)

Vue.use(VueQuillEditor /* { default global options } */)

// Vue.use在use了之后, 会自动执行插件内部的 install 方法, 会进行一些Vue全局组件的注册操作
// install: function() {
//   Vue.component('el-button', ..)
//   Vue.component('el-table', ..)
//   Vue.component('el-col', ..)
// }

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

// 定义一个全局的过滤器, 用以处理时间
// 时间戳: 有两种规范 => 以毫秒为单位 或者 以秒为单位
Vue.filter('time', function (value) {
  // moment(时间戳).format(格式化字符串)
  return moment(value * 1000).format('YYYY-MM-DD HH:mm:ss')
})

new Vue({
  router,
  // render: 渲染 app组件到el
  render: h => h(App)
}).$mount('#app')
