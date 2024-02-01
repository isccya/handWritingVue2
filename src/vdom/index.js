/**
 * 这个文件是渲染函数render执行时候创建虚拟节点
 * */ 

const isReservedTag = (tag) =>{
    return ['a','div','p','button','ul','li','span'].includes(tag)
}

    // !!!h()!!!  _c()
    export function createElementVNode(vm, tag, data, ...children) { //创建元素虚拟节点
        if (data == null) {
            data = {}
        }
        let key = data.key;
        if (key) {
            delete data.key
        }
        if(isReservedTag(tag)){ // 是原生html的节点
        return vnode(vm, tag, key, data, children);
    }else{
        // 创建一个组件的虚拟节点(包含组件的构造函数)
        let Ctor = vm.$options.components[tag] // !!!组件的构造函数!!!

        // Ctor就是组件的定义,可能是一个Sub类,还有可能是组件的选项
        return createComponentVnode(vm,tag,key,data,children,Ctor)
    }
}

function createComponentVnode(vm,tag,key,data,children,Ctor){
    if(typeof Ctor === 'object'){ // 在components (注意s)里面写的组件,是一个对象.
        Ctor = vm.$options._base.extend(Ctor)
    }
    data.hook = { //创建真实节点时候,如果是组件则调用此init方法.
        init(vnode){
            // 保存组件实例到虚拟节点上
           let instance = vnode.componentInstance = new vnode.componentOptions.Ctor
           instance.$mount() //instance.$el
        }
    }
    return vnode(vm,tag,key,data,children,null,{Ctor})
}



// _v();
export function createTextVNode(vm, text) { //创建文本虚拟节点
    return vnode(vm, undefined, undefined, undefined, undefined, text);
}
// ast一样吗？ ast做的是语法层面的转化 他描述的是语法本身 (可以描述js css html)
// 我们的虚拟dom 是描述的dom元素，可以增加一些自定义属性  (描述dom的)
function vnode(vm, tag, key, data, children, text,componentOptions) {
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        componentOptions // 组件的虚拟节点包括了组件的构造函数.
        // ....
    }
}

// 判断两个虚拟节点是否相同
export function isSameVnode(vnode1,vnode2){
    return vnode1.tag === vnode2.tag && vnode1.key === vnode2.key; // 没有key则key值是undefined,也认为是同节点
}