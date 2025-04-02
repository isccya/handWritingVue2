import { isSameVnode } from ".";

function createComponent(vnode){ //组件
    let i = vnode.data
    if((i = i.hook) && (i = i.init)){
        i(vnode) //初始化组件,找到init方法
    }
    if(vnode.componentInstance) return true //说明是组件
}

// 创建真实DOM
export function createElm(vnode) {
    let { tag, data, children, text } = vnode;
    if (typeof tag == 'string') { //元素节点



        // 创建真实元素 也要区分是组件还是元素
        if(createComponent(vnode)){ //组件 vnode.componentInstance.$el
            return vnode.componentInstance.$el // vm.$el 对应的就是组件渲染的结果
        }


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
export function patchProps(el, oldProps = {}, props = {}) {
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


    if(!oldVnode){ //这就是组件的挂载
        return createElm(vnode) //vm.$el 对应的是组件渲染的结果.
    }




    const isRealElement = oldVnode.nodeType // nodeType属性是节点原生属性.
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
    } else if (oldChildren.length > 0) { //没有新的,有老的
        el.innerHTML = '' //可以循环删除
    }
    return el
}

// 新的子节点全部添加到el中
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

    function makeIndexByKey(children) {
        let map = {

        }
        children.forEach((child, index) => {
            map[child.key] = index;
        })
        return map
    }

    let map = makeIndexByKey(oldChildren)
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {// 双方有一方头指针大于尾部指针则停止循环(大于)
        // 为空则往后移动
        if (!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex]
        } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex]
        }
        // 比较头指针
        else if (isSameVnode(oldStartVnode, newStartVnode)) {
            patchVnode(oldStartVnode, newStartVnode) //如果是相同节点,递归比较子节点
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        }
        // 比较尾指针
        else if (isSameVnode(oldEndVnode, newEndVnode)) {
            patchVnode(oldEndVnode, newEndVnode) //如果是相同节点,递归比较子节点
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        }
        // 交叉对比, 旧abcd -> 新dabc
        else if (isSameVnode(oldEndVnode, newStartVnode)) {
            patchVnode(oldEndVnode, newStartVnode);
            el.insertBefore(oldEndVnode.el, oldStartVnode.el) //将老的尾巴移动到老的前面
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        }
        // 交叉对比, abcd -> 新bcda
        else if (isSameVnode(oldStartVnode, newEndVnode)) {
            patchVnode(oldStartVnode, newEndVnode);
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling) //将老的头移动到老的尾部
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else {
            // 乱序比对
            // 根据老的列表做一个映射关系,用新的去找,找到则移动,找不到则删除,最后多余的删除.
            let moveIndex = map[newStartVnode.key]
            if (moveIndex !== undefined) { //如果老节点中有新节点
                let moveVnode = oldChildren[moveIndex]
                el.insertBefore(moveVnode.el, oldStartVnode.el)
                oldChildren[moveIndex] = undefined; //表示这个节点已经移动走了
                patchVnode(moveVnode, newStartVnode);//比对属性和子节点
            } else { // m找不到,直接插入
                el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
            }
            newStartVnode = newChildren[++newStartIndex] //往后移动新指针
        }
    }
    if (newStartIndex <= newEndIndex) { //多余的新子节点放入
        console.log();
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            // 可能向后追加,也可能向前追加.
            let childElm = createElm(newChildren[i])
            let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null //获取下一个元素.(为什么有下一个节点真实DOM?因为比较过程中复用了)
            el.insertBefore(childElm, anchor) //anchor为null时候会认为是appendChild
        }
    }
    if (oldStartIndex <= oldEndIndex) { //多余的老子节点删除
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            if (oldChildren[i]) {
                el.removeChild(oldChildren[i].el);
            }
        }
    }
}