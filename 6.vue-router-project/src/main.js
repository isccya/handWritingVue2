import Vue from 'vue' // 这里用的vue是runtime 不包含我们的compiler
import App from './App.vue'
import router from './router' // 前端路由

const vm = new Vue({
  name:'root',
  router,
  render: h => h(App) // 渲染组件, 内部_c 发现是对象的话会调用组件的render方法进行渲染
}).$mount('#app')


// 路由：  前端路由  后端路由？
// 后端路由  我们提交一个表单元素， 服务端会根据提交内容，校验提交结果，最终在服务端发生跳转 （重定向）  主要是针对这种前后端不分离的项目
// 前端路由  跳转不由后端来控制了前端控制 （根据路径不同 渲染不同的组件。 不经过服务端, 不会刷新页面）

// Node中没有前端url地址， 所以内部采用的是 memeryHistory   node + vue中实现路由跳转  (服务端渲染能用到)


//前端路由 1） hash模式  根据hash值的不同，可以渲染不同组件  我们可以通过window.addEventListener('hashchange')可以监控到hash值的变化
// hash 路由的问题 1） 丑 所有的路径都有# (锚点)    2） 服务端无法获取锚点 服务端无法根据对应的路径来解析内容 （无法实现seo优化） 不需要服务端支持
// history 模式 这个是h5提供的api  好处没有#  可以改变路径 ( 同时强制刷新的时候 会带上路径，服务端可以解析此路径。  支持seo优化) 需要服务端支持的

// History模式也只有第一次加载才能seo吧，后续的路由页面咋办   (后续页面基于historyAPI跳转即可)
// history必须配合SSR才可以做seo吧…   (需要服务端配合)
// 前端路由需要服务端获取锚点做什么用  （获取不到）
// seo  收集的是url地址，hash 路由不会被收集 切换的路由 但是histrory 如果不走 服务器 也不会被收集吧？ 
// history一定会走服务器路径的  （如果只是在前端页面跳转 可以不走服务器）

// 服务端渲染的特点是 根据路径渲染出一个完整的html字符串返回给浏览器