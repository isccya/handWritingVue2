export default {
    functional: true,
    render(h, { parent, data }) {
        // 默认先渲染app.vue中的router-view   是router-view
        // 在渲染about中的router-view
        // 1.app.vue [0] 是router-view
        // 2.home.vue  [1]  router-view
        // 3.a.vue  [2] router-view
        data.routerView = true;
        let route = parent.$route; // 我们刚才所谓的$route
        let depth = 0;
        while (parent) {
            // _vnode对应的是组件的渲染函数中的虚拟节点    $vnode 代表的是home组件本身 
            // $vnode 是_vnode 的父亲
            console.log(parent.$vnode)
            if (parent.$vnode && parent.$vnode.data.routerView) {
                depth++;
            }
            parent = parent.$parent; // 不停的向上查找父组件
        }
        let record = route.matched[depth];
        if (!record) { // 没有匹配到组件直接return 
            return h();
        }
        // 这里只是为了渲染 而且不记录在父子关系中  $parent $children 创建父子关系
        return h(record.component, data);
    }
}