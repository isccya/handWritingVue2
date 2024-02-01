function createRoute(record, location) {
    let matched = [];
    if (record) {
        while (record) {
            matched.unshift(record); // [about,about/a]
            record = record.parent;
        }
    }
    return {
        ...location,
        matched
    }
}
function runQueue(queue,from,to,cb){
    function next(index){
        if(index >= queue.length) return cb();
        let hook = queue[index];
        hook(from,to,()=>next(index+1));
    }
    next(0);
}
class Base {
    constructor(router) {
        this.router = router;
        this.current = createRoute(null, {
            path: '/'
        })

    }
    // 所有的逻辑都要放在这个transitionTo中来实现
    transitionTo(location, listener) {

        // {path:'/',matched:[]}
        // {path:'/',matched:[Home]}


        // 用之前的匹配方法了, 差一个routerView没有实现
        let record = this.router.match(location);
        let route = createRoute(record, { path: location });

        // 当前跳转的路径 和 我们之前存的一样， 而且匹配结果也一样则不再发生跳转了
        if (location === this.current.path && route.matched.length == this.current.matched.length) {
            return
        }


        let queue = [].concat(this.router.beforeEachHooks); // 多个钩子跳转的时候的可以解析后  拼接在一起执行

        runQueue(queue, this.current,route,() => {
            this.current = route; // 这里更新当前的current对象
            // path:'/',matched:[]
            // path:'/about/a',matched:[aboutRecord, aboutARecord]

            // 每次更新的是current，稍后current变化了，我们就可以切换页面显示

            // 如果当路由切换的时候 也应该调用transitionTo方法 在次拿到新的记录

            // /about/b = /about + /b  需要根基匹配的记录找到所有的组件 根据组件渲染到不同的routerView中
            listener && listener();
            this.cb && this.cb(route);
        })
    }


    listen(cb) { // 自定了一个钩子   this._route = route
        this.cb = cb;
    }
}
export default Base;


// 路由钩子的实现 
// 路由权限的实现  钩子 + addRoutes

// $router (方法 this._router)  $route (属性  this.current)