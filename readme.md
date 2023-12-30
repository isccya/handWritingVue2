
## 渲染(补充数据dep和渲染watcher的依赖过程) vue核心
1. **init.js**:在组件init方法中判断用户是否传入el选项,传入的则进行挂载,没传就需要手动挂载.调用$mount方法,$mount方法里确定**挂载的方式(render==>template==>el.outerHTML)**和**渲染函数render(compileToFunction获得)**,并通过mountComponent实现挂载
2. **lifecycle.js**:mountComponent方法里,给每一个组件创建渲染watcher,传入渲染组件的函数.
3. **watcher.js**:(渲染组件的函数在getter中),调用get方法,组件watcher进入队列中,调用getter开始渲染,访问数据时候数据subs记录watcher
4. **lifecycle.js**:_update方法里,调用patch方法将虚拟节点(调用render方法产生虚拟DOM,diff算法对比)转换为真实节点,并把模板中旧节点替换或者是diff算法更新.


## 渲染函数执行生成虚拟DOM
1. **lifecycle**:执行渲染函数render时,调用_c,_v,创建虚拟元素节点和虚拟文本节点(对应vdom/index.js里面的方法)
```
render函数示例
ƒ anonymous(
) {
with(this){return _c('li',{style:{"color":"'blue'","background-color":"'red'"}},_v(_s(name)))}
}
```
2. **vdom/index.js**:创建虚拟元素节点和创建虚拟文本节点都调用了vnode方法,vm是组件实例,tag是标签,data是属性,key是标识(可能在属性中),children是子元素.

## 虚拟DOM转换为真实DOM过程:diff算法
1. **patch.js**:如果两个节点标签不同或key不同,则直接根据新的虚拟DOM生成真实DOM挂载(通过老节点的父元素来挂载,记住vnode.el保存了真实DOM)
2. 是相同节点的话,则复用老虚拟节点的真实DOM,如果是文本,将新虚拟节点文本赋值给老虚拟节点.
3. 比较两个标签属性,老虚拟节点有的样式和属性,新虚拟节点没有的话则删除,再将新虚拟节点属性放到标签上.
4. 比较儿子:
- 老虚拟节点没有子节点,新虚拟节点有,新子节点全部添加
- 新虚拟节点没有子节点,老虚拟节点有,删除老子节点
- 都有情况:
```
1. 创建新老头尾指针,获取新老头尾节点,创建老子节点的映射表(通过key作为对象属性,索引作为对象值)
2. 开始循环:(当节点为空则向后移动(乱序对比时候节点会被清空)),当新老头节点相同或新老尾节点相同,对比复用老头尾节点(这里复用是上面2,3步骤),新老头指针向后,新老尾指针向前.
3. 头尾都不同,交叉比对
旧尾节点比新头节点:相同的话则把旧尾节点放到旧头部(往新节点靠),对比复用
或者是旧头节点比新尾节点:相同的话则把旧头节点放到旧尾部,对比复用
4. 乱序比对:获取旧节点映射表
如果新节点在旧映射表有,获取旧节点,插到头部(因为我们是从头开始排),清空原位置的旧节点,对比复用.
如果没有,创建新节点插到头部
```

## watch侦听器
1. **state.js**:初始化侦听器,获取用户传入的watch参数,循环遍历,key是用户要侦听的数据名(可能为函数返回一个值,也可能就是字符串),handler是用户侦听的回调函数(可能是字符串,数组,函数,最终都处理成函数).将key和handler传入$watch.
2. **index.js**:$watch为这个数据创建watcher,并携带user:true
3. **watcher.js**:watcher里,判断数据是字符串还是函数,最终都要转为函数(因为watcher还要用于渲染watcher)放到getter上.回调cb放到this.cb.执行get,将getter返回的侦听的数据放到this.value上.
4. **watcher.js**:在get里面,访问了侦听的数据,数据subs添加侦听器的watcher.
5. **dep.js**:当侦听的数据被修改后,调用dep.notify(),执行subs里面收集的watcher.update()
6.**watcher.js**:run里面,user标识是侦听器的watch,执行cb回调函数
## computed计算属性
1. **state.js**:初始化计算属性,获取用户传入的computed参数,循环遍历,获取每一个计算属性的参数,为每一个计算属性创建一个watcher,并将所有计算属性的watcher放到组件实例上.同时代理计算属性到组件实例上,因为模板访问数据还是要从实例上拿.
2. **state.js**:defineComputed代理数据,get方法来源于createComputedGetter,get里面获取到对应属性的watcher,如果是脏数据,重新计算,不脏返回旧值,实现了缓存.如果watcher队列中还有渲染watcher,计算属性依赖的数据要把渲染watcher也放到自己subs中
3. **watcher.js**:初始化因为lazy变量控制,计算属性不会第一次就计算.dirty值默认为true.第一次在模板中使用计算属性时,调用计算属性get,get里判断dirty为true,进行evaluate计算,将计算值保存到value中(watcher里面getter是用户原本传入的get),在计算时候会访问计算属性依赖的数据,这些数据subs收集计算属性的watcher,计算后将值设置为不脏,实现缓存.
4. **dep.js**:当计算属性依赖的数据被修改后,调用dep.notify(),执行subs里面收集的watcher.update()
5. **watcher.js**:update方法里,lazy标明是计算属性,将dirty值设置为true,标明是脏数据要重新求值.然后渲染watcher执行update,渲染模板读取计算属性,访问计算属性getter,计算属性因为脏数据重新求值.
## mixin(复用)
1. **GolbalAPI.js**:全局API中有一个mixin方法,用户传入复用的选项,添加到Vue构造函数的options属性中.
2. **init.js**:当前实例上会有一个$options属性保存全局的选项和用户传入的实例选项.
## Vue.extend
1. **GlobalAPI.js**:Vue.extend根据用户传入的选项返回一个Vue子类的构造函数.初始化一个组件时候,会通过原型调用Vue上的init方法.里面合并Vue全局的options到组件实例上
2. **init.js**:
```
对于Vue实例来说:
vm.$options  <===合并全局mixin,coponents的选项和用户传入的选项.
对于组件实例来说:
vm.$options  <===是合并组件实例的选项和用户传入的选项.
(所以为了有全局属性,在extend方法中还有一次合并)
```
## Vue.component
1. **GlobalAPI.js**:Vue.options.components存储全局组件,id和对应的definition; Vue.options.components[id] = 包装成构造函数
## 组件渲染过程(没懂)
- 组件渲染先找到组件的定义,把模板变成render函数,产生虚拟节点,生成真实DOM,真实DOM插入.