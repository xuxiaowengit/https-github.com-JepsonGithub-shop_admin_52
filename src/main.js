import Vue from 'vue'
import App from './App.vue'
import router from './router'

// 关闭控制台的提示信息
Vue.config.productionTip = false

new Vue({
  router,
  // render: 渲染 app组件到el
  render: h => h(App)
}).$mount('#app')
