/**
 * 这个文件是渲染函数render执行时候创建虚拟节点
 * */ 

// h()  _c()
export function createElementVNode(vm, tag, data, ...children) { //创建元素虚拟节点
    if (data == null) {
        data = {}
    }
    let key = data.key;
    if (key) {
        delete data.key
    }
    return vnode(vm, tag, key, data, children);
}
// _v();
export function createTextVNode(vm, text) { //创建文本虚拟节点
    return vnode(vm, undefined, undefined, undefined, undefined, text);
}
// ast一样吗？ ast做的是语法层面的转化 他描述的是语法本身 (可以描述js css html)
// 我们的虚拟dom 是描述的dom元素，可以增加一些自定义属性  (描述dom的)
function vnode(vm, tag, key, data, children, text) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
        // ....
    }
}

// 判断两个虚拟节点是否相同
export function isSameVnode(vnode1,vnode2){
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key; // 没有key则key值是undefined,也认为是同节点
}