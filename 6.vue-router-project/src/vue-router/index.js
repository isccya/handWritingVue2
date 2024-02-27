import install, { Vue } from './install';
import createMatcher from './create-matcher'
import HashHistory from './history/hash';
import BrowserHistory from './history/history';

class VueRouter {
    constructor(options) {
        // 用户传递的路由配置，我们可以对这个配置进行一个路由映射
        let routes = options.routes || [];
        this.beforeEachHooks = [];
        // 变成映射表 方便后续的匹配操作  可以匹配也可以添加新的路由 
        this.matcher = createMatcher(routes);
        let mode = options.mode || 'hash';
        if (mode === 'hash') {
            this.history = new HashHistory(this); // hashchange
        } else if (mode === 'history') {
            this.history = new BrowserHistory(this); // historyPushState
        }
        // 根据不同的模式创建对应的路由系统
    }
    match(location) {
        return this.matcher.match(location)
    }
    
    push(location) {
        // 修改url里面方法有两种可能:1是直接修改url,hash和history里面有监听事件变化,然后直接进行跳转逻辑.2是前进后退,调用push方法改变url并走跳转逻辑.
    //    router-link点击后会触发这个push方法,这个方法再去调用transitionTo
        return this.history.push(location);
    }
    beforeEach(cb){
        this.beforeEachHooks.push(cb);
    }
    init(app) {
        let history = this.history;
        // 根据路径的变化匹配对应的组件来进行渲染， 路径变化了 需要更新视图 （响应式的）

        // 根据路径匹配到对应的组件 来渲染，之后监听路由变化

        history.transitionTo(history.getCurrentLocation(), () => {
            history.setupListener(); // 监听路由的变化
        })
        // 每次路由切换的时候都需调用listen方法中的回调实现更新

        history.listen((newRoute)=>{ // 这个目的就是更新 _route的值使它能够发生变化， 数据变化会自动重新渲染视图
            app._route = newRoute
        });

    }
}
// 为什么要多发明一个install方法，原因就是如果用户导出了一个类？ 在类上写一个install方法，会优先调用install方法



// 1) 我们需要将用户的配置进行映射
// 2) 要将根实例注入的router属性共享给每个组件

VueRouter.install = install

export default VueRouter;