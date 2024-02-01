## 生成AST语法树
1.  获取模板字符串后,从头到尾先解析开始标签,获得其标签名,属性,和结束标签和标签文本内容.模板字符串不断裁剪到为空.
2.  根据开始标签,文本,结束标签创建AST节点,注意根节点的判断,以及父子节点关系,通过一个栈数据结构和全局变量判断父子节点
3.  开始标签会进栈,结束标签出栈,文本会直接作为当前父节点的属性,栈结尾的元素即为当前的要进栈元素的***父节点***
4.  最终形成AST语法树.每一层是一个节点,有父节点,子节点,和自身属性.


## 渲染函数执行生成虚拟DOM(AST语法树代码拼接成渲染函数)
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
## 响应式原理
**init.js**:两个方面.一是vue初始化数据,二是$mount挂载到指定的template模板,模板转换成AST语法树,AST语法树代码生成渲染函数.
- 初始化数据方面 
1. **state.js**:(initData方法里)对数据进行劫持(将数据代理到实例本身.)
2. **observe.js**:每个数据通过Observer上的walk方法,经过Object.defineProperty变成响应式数据,在get里面进行依赖收集,set里触发更新,并为每个数据添加dep属性.(闭包添加)
3. **dep.js**:每个数据有subs数组收集使用该数据的watcher.数据被读取时候调用get,get里面调用dep.depend()让watcher收集该依赖,数据被修改时候调用dep.notify()更新依赖该数据的watcher.
- 模板渲染挂载方面
1. **lifecycle.js**:每一个组件创建一个watcher,执行渲染函数创建虚拟DOM,虚拟DOM渲染成真实DOM.
2. **watcher.js**:get方法,会把当前watcher添加到全局上,执行渲染过程,访问数据get,数据get把全局watcher添加到自己sub队列中.


## 数组响应式原理
1. **array.js**: 重写了数组方法,push,pop等等,调用原生数组方法,并dep.notify(每个对象也会有闭包dep,而且它会在对象的__ob__属性中,数组中要调用)通知对应的watcher实现更新.数组中对象也会做响应式处理.
2. **observe.js**: 观察的对象是数组的话,修改它的原型,并监视数组中对象.
## watch侦听器
1. **state.js**:初始化侦听器,获取用户传入的watch参数,循环遍历,key是用户要侦听的数据名(可能为函数返回一个值,也可能就是字符串),handler是用户侦听的回调函数(可能是字符串,数组,函数,最终都处理成函数).将key和handler传入$watch.
2. **index.js**:$watch为这个数据创建watcher,并携带user:true
3. **watcher.js**:watcher里,判断数据是字符串还是函数,最终都要转为函数(因为watcher还要用于渲染watcher)放到getter上.回调cb放到this.cb.执行get,将getter返回的侦听的数据放到this.value上.
4. **watcher.js**:在get里面,访问了侦听的数据,数据subs添加侦听器的watcher.
5. **dep.js**:当侦听的数据被修改后,调用dep.notify(),执行subs里面收集的watcher.update()
6.**watcher.js**:run里面,user标识是侦听器的watch,执行cb回调函数
```
watch也会创建一个watcher,侦听的数据会把watcher添加到自己的subs队
列中,数据被修改调用dep.notify更新所有watcher,包括侦听的watcher.

```
## 生命周期
1. 内部使用了发布订阅模式,将用户写的钩子维护成一个数组,再用callHook方法调用.
2. 合并成数组,先子再父那一块.
```
initLifecycle(vm) //组件的父子关系 $parent $children
initEvents(vm) //初始化$on $off $emit
initRender(vm) // 不重要先过.
callHook(vm, 'beforeCreate', undefined, false) //beforeCreate
initInjections(vm) // resolve injections before data/props
initState(vm)
initProvide(vm) // resolve provide after data/props
callHook(vm, 'created') // created
**lifecycle.ts** :
挂载组件的方法mountComponent里:
一开始就调用 callHook(vm, 'beforeMount')

new Watcher执行完后,也就是挂载完后
调用 callHook(vm, 'mounted') //渲染完毕后调用.可以获取真实DOM

每次watcher更新前会调用watcher上的before函数,清空调度队列时候,会
调用watcher里的before方法.before方法里会调用beforeUpdate钩子.

更新完即渲染完后会调用updated钩子.

$destroy被调用,就会调用beforeDestroy钩子.然后执行销毁,清理所有watcher,卸载watcher.

销毁完后调用destoryed钩子.

```
## nextTick
1. **watcher.js**:(触发某个数据的setter方法后，它的setter函数会通知闭包中的Dep，Dep则会调用它管理的所有Watch对象。触发Watch对象的update实现。组件更新会调用update方法)update方法调用queueWatcher,过滤同名的watcher(去重)然后放到队列中,调用nextTick异步批处理,一次事件循环里数据更新只会更新一次,在异步中更新(异步更新前可以一直推watcher进队列)(所以内部源码更新也是调用了nextTick)
2. **watcher.js**:nextTick中,用一个队列维护异步任务,callbacks缓冲用户调用nextTick传入的函数和渲染wather传入的函数,如果没有异步任务推到任务队列中(waiting=false),则将该callbacks推到异步任务中执行.(在该callbacks执行前的事件循环(同步),可以一直推送函数进callbacks.)
ps: 更新才会触发set,触发update函数,初次渲染是同步调用set.


## computed计算属性
1. **state.js**:初始化计算属性,获取用户传入的computed参数,循环遍历,获取每一个计算属性的参数,为每一个计算属性创建一个watcher,并将所有计算属性的watcher放到组件实例上.同时代理计算属性到组件实例上,因为模板访问数据还是要从实例上拿.
2. **state.js**:defineComputed代理数据,get方法来源于createComputedGetter,get里面获取到对应属性的watcher,如果是脏数据,重新计算,不脏返回旧值,实现了缓存.如果watcher队列中还有渲染watcher,计算属性依赖的数据要把渲染watcher也放到自己subs中
3. **watcher.js**:初始化因为lazy变量控制,计算属性不会第一次就计算.dirty值默认为true.第一次在模板中使用计算属性时,调用计算属性get,get里判断dirty为true,进行evaluate计算,将计算值保存到value中(watcher里面getter是用户原本传入的get),在计算时候会访问计算属性依赖的数据,这些数据subs收集计算属性的watcher,计算后将值设置为不脏,实现缓存.
4. **dep.js**:当计算属性依赖的数据被修改后,调用dep.notify(),执行subs里面收集的watcher.update()
5. **watcher.js**:update方法里,lazy标明是计算属性,将dirty值设置为true,标明是脏数据要重新求值.然后渲染watcher执行update,渲染模板读取计算属性,访问计算属性getter,计算属性因为脏数据重新求值.
```
每个计算属性会代理到实例上,后续渲染会访问,同时重写getter方法,有一
个变量dirty控制是否使用缓存数据,如果是脏数据则需重新求值,否则使用
缓存数据.每个计算属性会创建一个watcher,初始化时候lazy变量控制不会
默认求值.当计算属性被访问时候,默认为脏数据,进行求值,同时把自己watcher放到全局,
计算属性依赖的数据会把其添加到自己subs中,当修改这些数据时候,让
dirty变量为true,会让watcher更新.
```
## mixin(复用)
1. **GolbalAPI.js**:全局API中有一个mixin方法,用户传入复用的选项,添加到Vue构造函数的options属性中.
2. **init.js**:当前实例上会有一个$options属性保存全局的选项和用户传入的实例选项. 
- ps:
    1. 在Vue.mixin之前声明的组件,不会有mixin方法.
    2. 可以单独注入一个mixin对象(单纯一个对象里面包括一些选项)

## Vue.extend(data为什么是函数)
1. **GlobalAPI.js**:创建组件过程是通过*Vue.extend*,Vue.extend根据用户传入的选项返回一个*Vue子类的构造函数*,如果传入的选项是一样的话会***复用该构造函数***,调用该构造函数创建组件.用户选项会放在构造函数$options中,如果data是对象则会共享内存.应该采用工厂模式去返回一个对象.初始化一个组件时候,会通过原型调用Vue上的init方法.里面合并Vue全局的options到组件实例上.
2. **init.js**:
```
对于Vue实例来说:
vm.$options  <===合并全局mixin,coponents的选项和用户传入的选项.
对于组件实例来说:
vm.$options  <===是合并组件实例的选项和用户传入的选项.
(所以为了有全局属性,在extend方法中还有一次合并)
```
ps:extend里面有缓存,多次传入同一选项不会创建新的Sub子类,会复用.传入的选项我们会保留在构造函数的$options上,所以data要为函数,不然会共享内存地址造成数据脏乱.

## Vue.component
1. **GlobalAPI.js**:Vue.options.components存储全局组件,id和对应的definition; Vue.options.components[id] = 包装成构造函数

## 组件渲染过程
1. **vdom/index.js**:在父组件render函数执行过程中,创建子组件的虚拟节点,createElementVnode,从父组件实例上获取子组件的构造函数,返回虚拟节点,并在虚拟节点`属性`上绑定hook对象,对象中有init方法,init方法调用组件虚拟节点上的构造函数获取到组件实例,并将组件实例保存到虚拟节点中,将组件实例挂载,因为挂载结果保存在实例的$el,所以虚拟节点也可以访问到$el.
2. **lifeCycle**:父组件调用update,update执行patch.
3. **patch.js**:创建组件节点时候,会去调用组件属性`上的`的init方法,返回虚拟节点上的组件实例的$el.
- `ps`:
1. 正常子组件渲染,在子组件虚拟节点转换为真实节点时候,会调用init方法,进行挂载,创建watcher,生命周期等等,并返回真组件实例.
2. 函数式组件只调用render,拿到虚拟节点后渲染,不会进行其他逻辑.
3. 异步组件是根据promise状态返回不同的虚拟节点,再走正常逻辑转换为子组件.
