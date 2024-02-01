import routerLink from "./components/router-link";
import routerView from "./components/router-view";

export let Vue;
function install(_Vue) {
    Vue = _Vue; // 将传入的Vue的够赞函数变为全局的
    Vue.mixin({ // mergeOptions 所有组件初始化都会采用这个方法
        beforeCreate() {
            // 这样写只是 有router才加没有router没有加
            // this.$router = this.$options?.router 
            // 组件渲染是从父到子的
            if (this.$options.router) {
                // 根实例上传递了router
                this._routerRoot = this; // 根实例
                this._router = this.$options.router;

                // this._router.push / match / init
                this._router.init(this); // this就是我们整个的应用 new Vue

                // 给根实例添加一个属性 _route 就是当前的current对象
                Vue.util.defineReactive(this,'_route',this._router.history.current) // 这里将current变成了响应式对象

                // 改变的是current 两个不是一个对象 , 内部改的是current 我们需要改变这个_route
                // this._router 拿到根实例
                // this._route 拿到current对象
            } else {
                // 在所有组件上都增加一个_routerRoot 指向根实例
                this._routerRoot = this.$parent && this.$parent._routerRoot
            }
            // 这种
            // 在组件中都可以通过 
        }
    });
    // 在实例上取值的时候 会去拿到_router属性  代理
    Object.defineProperty(Vue.prototype, '$router', {
        get() {
            return this._routerRoot && this._routerRoot._router
        }
    })
    Object.defineProperty(Vue.prototype,'$route',{ // 所有组件里面都有一个$route属性 对应的就是我们里面写的current
        get(){
            return this._routerRoot && this._routerRoot._route
        }
    })
    // 这里不能直接将属性定义在原型上, 只有通过new Vue中传入了router才能被共享

    // react中叫children vue中所有的插槽会被变到 vm.$slots对象上
    Vue.component('router-link', routerLink)
    Vue.component('router-view',routerView)

}
export default install;