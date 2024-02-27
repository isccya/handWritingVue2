# 6.vue-router-project
## install方法
- Vue使用插件的时候是先去找插件身上的install方法,然后如果插件是函数的话,则直接执行插件.因为只有传入`router`的Vue实例及其子组件身上会有路由配置$router,所以是通过Vue.mixin而不是放到Vue构造函数的原型对象上.
> install方法就是把`根实例自身`放到`根实例自身`的_routerRoot属性,子组件_routerRoot访问父组件的_routerRoot从中找到router和route,配置项分享给其子组件.(注意
`router` = new VueRouter,router上有匹配器matcher和history路由系统,
`route`是{matched:[about,about/a],path:'about/a'}) //路由记录表

## VueRouter/index.js
### 匹配器matcher(双核心之一)
 用户传入路由的配置项,根据这个配置项将树状结构扁平化,生成一个匹配器this.matcher(createMatcher).匹配器可以根据路径匹配对应的路由,也可以添加新的路由(匹配器是一个对象包含动态路由addRoute,addRoutes,match三个方法,pathMap是因为闭包原因保留) 
### 路由系统history(双核心之一)
生成对应的路由系统this.history(有hash和history两种),设置监听事件setupListener(路径变化时候获取对应的组件),可以获取当前路径
- `base.js`:因为不同路由系统有相同部分,所有有个公共类base,transitionTo:跳转逻辑都在其中.push时候,初始化时候,监听事件变化时候.this.current保存的是路径前前后后所有的路由记录,也就是_route,也就是 ***$route*** <!--比如about/a就包括 /about组件和/about/a组件-->
### 初始化
根据路径从匹配器中获取对应的组件来渲染,并添加监听事件,路径变化继续调用transitionTo.

## router-link
- router-link其实是组件,props接受to(跳转的路径)

## router-view
- router-link其实也是组件,函数式组件,从route的matched里面拿到组件记录,层级渲染.


<!-- 修改route时候是先修改current,定义其为响应式,但是直接修改了current一整个地址,route无法为响应式,用cb来更新_route使其更新赋值($route是_route defineProperty来的) -->