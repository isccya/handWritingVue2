import { isSameVnode } from ".";

// 创建真实DOM
export function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    if (typeof tag == 'string') { //元素节点
        vnode.el = document.createElement(tag)
        patchProps(vnode.el, {}, data);
        children.forEach(child => {
            vnode.el.appendChild(createElm(child))
        });
    } else { //文本节点
        vnode.el = document.createTextNode(text)
    }
    return vnode.el;
}
// 创建真实DOM中的元素节点时候添加元素属性
export function patchProps(el, oldProps, props) {
    // 老的属性中有,新的没有,要删除老的
    let oldStyles = oldProps.style || {}
    let newStyles = props.style || {}
    for (let key in oldStyles) { //老的样式有,新没有则删除
        if (!newStyles[key]) {
            el.style[key] = ''
        }
    }
    for (let key in oldProps) { //老的属性有,新没有则删除
        if (!props[key]) {
            el.removeAttribute(key)
        }
    }

    for (let key in props) { // 把新的属性全部放上去
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}

// 写的是渲染过程,把真实DOM放到页面中了,并且返回新创建的真实DOM
export function patch(oldVnode, vnode) {
    const isRealElement = oldVnode.nodeType
    if (isRealElement) {
        const elm = oldVnode; //获取真实DOM
        const parentElm = elm.parentNode //拿到父元素
        const newElm = createElm(vnode) //创建新DOM
        parentElm.insertBefore(newElm, elm.nextSibling) //替换
        parentElm.removeChild(elm) //删除老节点
        return newElm
    } else {
        /**
         * diff算法
         * 1. 两个节点不是同一个节点 直接删除老的换上新的
         * 2. 两个节点是同一个节点(判断节点的tag和key) 比较两个节点的属性是否有异同(复用老的节点,将新的属性更新)
         * 3. 节点比较完比较两个人儿子
         * */
        return patchVnode(oldVnode, vnode)
        // 不是相同节点

    }
}

// diff算法比较两个节点
function patchVnode(oldVnode, vnode) {
    // 不是相同节点直接替换
    if (!isSameVnode(oldVnode, vnode)) {
        let el = createElm(vnode)
        oldVnode.el.parentNode.replaceChild(el, oldVnode.el) // 用老节点的父亲替换
        return el;
    }
    // 是相同节点
    let el = vnode.el = oldVnode.el // 复用老节点的真实DOM元素
    if (!oldVnode.tag) { //是文本
        if (oldVnode.text !== vnode.text) {
            el.textContent = vnode.text //用新文本覆盖老的
        }
    }
    // 是标签 是标签我们需要对比标签的属性
    patchProps(el, oldVnode.data, vnode.data)

    // 比较儿子节点 比较时候 一方有儿子,一方没儿子



    // 两方都有儿子

    let oldChildren = oldVnode.children || {}
    let newChildren = vnode.children || {}


    if (oldChildren.length > 0 && newChildren.length > 0) {
        // 完整的diff算法,比较两个的儿子
        updateChildren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) { //没有老的,有新的
        mountChildren(el, newChildren)
    } else if (newChildren.length > 0) { //没有新的,有老的
        el.innerHTML = '' //可以循环删除
    }



    return el
}


function mountChildren(el, newChildren) {
    for (let i = 0; i < newChildren.length; i++) {
        el.appendChild(createElm(child))
    }
}

function updateChildren(el, oldChildren, newChildren) {
    // vue2采用双指针方式比较两个节点 
    let oldStartIndex = 0
    let newStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1

    let oldStartVnode = oldChildren[0]
    let newStartVnode = newChildren[0]
    let oldEndVnode = oldChildren[oldEndIndex]
    let newEndVnode = newChildren[newEndIndex]
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
        // 双方有一方头指针大于尾部指针则停止循环(大于)
    }
    console.log(oldStartVnode, newStartVnode, oldEndVnode, newEndVnode);


}