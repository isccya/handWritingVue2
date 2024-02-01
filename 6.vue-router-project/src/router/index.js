import Vue from 'vue'
// import VueRouter from 'vue-router'
import VueRouter from '@/vue-router'
import Home from '../views/Home.vue'
import About from '../views//About.vue'

// Vue.use 如果里面放一个函数默认会执行
Vue.use(VueRouter) // VueRouter 会调用插件的install方法

// {'/':Home,'/a':HomeA,'/b':HomeB,'/about':About}

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    children: [
      {
        path: 'a', // children中路径不能增加/
        component: {
          render: (h) => <h1>a</h1>
        },

      },
      {
        path: 'b',
        component: {
          render: (h) => <h1>b</h1>
        }
      }
    ]
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    children: [
      {
        path: 'a', // children中路径不能增加/
        component: {
          render: (h) => <h1>about a</h1>
        }
      },
      {
        path: 'b',
        component: {
          render: (h) => <h1>about b</h1>
        }
      }
    ]
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})


// router.beforeEach((from, to, next) => { // 类似于koa express 中间件的概念
//   setTimeout(() => {
//     console.log(1)
//     next();
//   }, 1000)
// })


// router.beforeEach((from, to, next) => { // 类似于koa express 中间件的概念
//   setTimeout(() => {
//     console.log(2)
//     next();
//   }, 1000)
// })

// 导航守卫  当从一个路由切换到另一个路由的时候 会发生什么？
// 组件要先离开 -> beforeRouteLeave
// 切换到新的组件里 （beforeEach） 进入到某个里面
// A ? a=1  -> A ? a=2  组件的更新了 （beforeRouteUpdate）
// 不是更新 ,  就要走路由中配置的钩子  beforeEnter
// 走组件的钩子 beforeRouteEnter
// 确认切换完毕 
// beforeResolve
// 都走完了 afterEach

// [beforeRouteLeave,（beforeEach）,（beforeRouteUpdate）,beforeEnter]


export default router
