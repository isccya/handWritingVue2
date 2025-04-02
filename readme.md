## 生成AST语法树 
1.  获取模板字符串后,从头到尾先解析开始标签,获得其标签名,属性,和结束标签和标签文本内容，文本标签也会作为当前父标签的孩子.模板字符串不断裁剪到为空.
2.  根据开始标签,文本,结束标签创建AST节点,注意根节点的判断,以及父子节点关系,通过一个栈数据结构和全局变量判断父子节点
3.  开始标签会进栈,结束标签出栈,文本会直接作为当前父节点的属性,栈结尾的元素即为当前的要进栈元素的***父节点***
4.  最终形成一个树结构，可以进行一些优化，比如静态节点的标记，后续diff对比时候可以直接跳过。

## 纯文本内容修改vue可以检测吗？
- 不可以。vue响应式系统只跟踪通过vue管理的状态变化。静态节点在diff对比时候会跳过。

## ast语法树和虚拟dom区别? 为什么有AST语法树还需要虚拟DOM? 
1. ast语法树出现在***编译阶段***,一般是开发环境的构建工具(如vite)启的**服务器上执行**,把.vue文件生成js代码,生成一个render渲染函数.
2. 虚拟DOM出现在***运行阶段***,由浏览器执行js代码,执行render函数生成虚拟DOM,diff对比,最后生成新的DOM页面.
3. 对于生产环境,模板已经固定,不需要再编译,直接获取js代码执行即可.
## npm run build理解? 
- Vue 项目会将 .vue 文件中的内容转换为 JavaScript，并进行编译、优化，最终打包为浏览器可执行的 JavaScript 文件。然而，这个打包后的文件通常不包含 AST 转换相关的函数文件或编译器代码。
- vue的两个版本:生产环境版本和运行时版本,运行版本没有编译器功能.
## npm run build后发生什么？
1. 去package.json文件找到scripts字段，解析build命令。
2. vue编译器将vue文件转换为浏览器可以识别的js、html、css。
3. webpack执行打包流程，vue文件会用vue-loader处理里面编译的js、html、css。
4. 代码压缩，terserplugin、css压缩、treeshaking。
5. 生成输出文件到dist目录下。

## 渲染函数执行生成虚拟DOM(AST语法树代码拼接成渲染函数) 
1. 将ast语法树对象解析为一个字符串，调用_c创建虚拟标签节点、_v创建虚拟文本节点，with（this），this就是组件实例，上面有响应式的数据。new Function这个字符串，生成渲染函数。
1. **lifecycle**:执行渲染函数render时,调用_c,_v,创建虚拟元素节点和虚拟文本节点(对应vdom/index.js里面的方法)
```
render函数示例
ƒ anonymous(
) {
with(this){return _c('li',{style:{"color":"'blue'","background-color":"'red'"}},_v(_s(name)))}
}
```
2. **vdom/index.js**:创建虚拟元素节点和创建虚拟文本节点都调用了vnode方法,vm是组件实例,tag是标签,data是属性,key是标识(可能在属性中),children是子元素.


## 虚拟DOM=>真实DOM:diff算法 
1. **patch.js**:***比较key和标签***如果两个节点标签不同或key不同,则直接根据新的虚拟DOM生成真实DOM挂载(通过老节点的父元素来挂载,记住vnode.el保存了真实DOM)
2. ***复用节点,修改文本***是相同节点的话,则复用老虚拟节点的真实DOM,如果是文本,将新虚拟节点文本赋值给老虚拟节点.
3. ***修改属性***比较两个标签属性,老虚拟节点有的样式和属性,新虚拟节点没有的话则删除,再将新虚拟节点属性放到标签上.
4. 比较儿子:updateChildren(核心就是旧中有,用旧的)
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
### vue3 diff算法的优化
- https://blog.csdn.net/weixin_43294560/article/details/121928356
1. vue2是全量diff,vue3是静态标记和非全量diff。对于不更新的元素静态元素做静态标记,后续diff对比时候会跳过；动态节点会添加patch flag，标记节点可能的更新类型（比如文本、属性、样式等等），在diff对比时候可以更高效。
2. 只有头头和尾尾比较,最长递增子序列.
3. 对事件做一个缓存,如果新旧虚拟DOM绑定的事件是对同一个函数的引用,则**不会再重复创建函数**重新解绑绑定.
### Object.defineProperty、proxy区别
1. 功能范围：defineProperty只能代理属性，get、set，不能监听删除新增； proxy代理整个对象，增删改查都可以监听。
2. 性能：define需要遍历属性设置getter、setter；proxy只有访问对象时候才触发监听。
3. vue中：vue2是define，不能监听数组的变化和新增的属性（通过补丁函数vue.set、修改数组方法）；vue3是采用proxy支持数组变化和新增属性的监听。
## 响应式原理
**init.js**:两个方面.一是vue初始化数据,二是$mount挂载到指定的template模板,模板转换成AST语法树,AST语法树代码生成渲染函数.***数据劫持+发布-订阅者模式***,watcher联系了getter,setter和页面更新,watcher是订阅者,getter,setter是发布者.
- 初始化数据方面
1. **state.js**:(initData方法里)对数据进行代理(将数据代理到实例本身.)
2. **observe.js**:每个数据通过Observer上的walk方法,经过Object.defineProperty变成响应式数据,在get里面进行依赖收集,set里触发更新,并为每个数据添加dep属性.(闭包添加)
3. **dep.js**:每个数据有subs数组收集使用该数据的watcher.数据被读取时候调用get,get里面调用 ***dep.depend()*** 让watcher收集该依赖,数据被修改时候调用 ***dep.notify()*** 更新依赖该数据的watcher.
- 模板渲染挂载方面
1. **lifecycle.js**:每一个组件创建一个watcher,执行渲染函数创建虚拟DOM,虚拟DOM渲染成真实DOM.
2. **watcher.js**:get方法,会把当前watcher添加到全局上,执行渲染过程,访问数据get,数据get把全局watcher添加到自己sub队列中.

```
响应式原理:整体是采用了 数据劫持+发布订阅的思想,涉及三个方面:模
板编译，数据的劫持处理,,watcher将模板和数据关联起来.

模板编译:模板字符串=>ast语法树=>render函数,render函数生成虚拟
DOM时候会去组件对象上获取数据,会访问get属性.

数据劫持:数据都会变成对象,将这个对象给Observer类处理,Observer
类中将对象的属性经过Object.definProperty处理(vue3是proxy处
理),在处理函数中有个dep类,get,set函数其实是闭包,可以访问dep类.
当该属性被访问调用get时候dep类会收集watcher,当该属性被修改时候
调用set时候dep类会调用notify通知所有依赖该属性的组件watcher进
行更新.

watcher:每一个组件都有watcher,每个watcher被触发更新会执行一个
回调函数,监听器执行监听函数,组件watcher则是执行render函数,重新
渲染页面.
```

## 数组响应式原理 
- **array.js**: 重写了数组方法,push,pop等等,调用原生数组方法,并dep.notify(每个***对象也会有闭包dep,而且它会在对象的__ob__属性中,数组中要调用***)通知对应的watcher实现更新.数组中对象也会做响应式处理.
## vue2响应式原理缺点 
1. 对象新增的属性无法触发响应式,需要通过$set来设置
2. 数组下标修改无法触发响应式,需要通过变异数组方法更改数组.
## vue3响应式原理 
- https://segmentfault.com/a/1190000023554938#item-2
1. 改用proxy,不再使用defineProperty,
数组直接读取下标也能拦截；
新增属性也有响应式。
2. 支持对set,map的响应式,改写了map.set,map.get,map.has,set.add等方法

## 响应式为什么要用 reflect 这种 API  &#10024; 
- 提供一种更一致和可靠的方式来执行底层的 JavaScript 操作（比如属性访问、赋值、删除等）,代码更简洁易读，13种proxy的捕获器和reflect静态方法一一对应。
- reflect第三个参数可以修改this的指向，如果被代理的对象本身有get函数，get函数里面的this默认指向对象本身。get函数this需要指向proxy，这样才能访问代理对象的a、b，触发响应式依赖收集。
```
如果页面只用了c数据没有用a、b数据，a、b数据更改也要触发页面更
新，所以要访问代理的a、b，让a、b进行依赖收集。
 const obj = {
            a: 1,
            b: 2,
            get c() {
                return this.a + this.b;
            }
        }
        let proxy = new Proxy(obj, {
            get(target, key) {
                console.log("read", key);
                // return Reflect.get(target,key,proxy)
                return target[key];
            }
        })
        console.log(proxy.c);
```

## watch侦听器 
1. **state.js**:初始化侦听器,获取用户传入的watch参数,循环遍历,key是用户要侦听的数据名(可能为函数返回一个值,也可能就是字符串),handler是用户侦听的回调函数(可能是字符串,数组,函数,最终都处理成函数).将key和handler传入$watch.
2. **index.js**:$watch为这个数据创建watcher,并携带user:true
3. **watcher.js**:watcher里,判断数据是字符串还是函数,最终都要转为函数(因为watcher还要用于渲染watcher)放到getter上.回调cb放到this.cb.执行get,将getter返回的侦听的数据放到this.value上(重点是getter里面读取了一遍数据).
4. **watcher.js**:在get里面,访问了侦听的数据,数据subs添加侦听器的watcher.
5. **dep.js**:当侦听的数据被修改后,调用dep.notify(),执行subs里面收集的watcher.update().
6. **watcher.js**:run里面,user标识是侦听器的watch,执行cb回调函数

>watch侦听器会经过底层的$watch API处理,即创建一个watcher,也是采用了**发布订阅模式**，侦听的数据会```被读一遍(就是监听的数据一定转换为函数getter执行一遍)```然后把watcher添加到自己的subs队列中,数据被修改调用dep.notify更新所有watcher,包括侦听的watcher.

>对比computed和watch: 前者不支持异步支持缓存.后者支持异步不支持缓存.

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
默认求值.当计算属性被访问时候,默认为脏数据,进行求值,同时把自己
watcher放到全局,计算属性依赖的数据会把其添加到自己subs中,当修改
这些数据时候,让dirty变量为true,会让watcher更新.

数据代理
lazy
dirty
依赖收集
```


## nextTick 
1. **watcher.js**:(触发某个数据的setter方法后，它的setter函数会通知闭包中的Dep，Dep则会调用它管理的所有Watch对象。触发Watch对象的update实现。组件更新会调用update方法)update方法调用queueWatcher,过滤同名的watcher(去重)然后放到队列中,调用nextTick异步批处理,一次事件循环里数据更新只会更新一次,在异步中更新(异步更新前可以一直推watcher进队列)(所以内部源码更新也是调用了nextTick)
2. **watcher.js**:nextTick中,用一个队列维护异步任务,callbacks缓冲用户调用nextTick传入的函数和渲染wather传入的函数,如果没有异步任务推到任务队列中(waiting=false),则将该callbacks推到异步任务中执行.(在该callbacks执行前的事件循环(同步),可以一直推送函数进callbacks.)
ps: 更新才会触发set,触发update函数,初次渲染是同步调用set.
> 用队列缓存一次事件循环中需要执行的函数,通过一个变量控制.异步任务是通过优雅降级的方式,先采用promise.then==>MutationObserver(指定DOM发生变化时候会调用)==>setImmediate最后再采用setTimeout,是对js事件循环的应用.

<!-- ## mixin(复用) 
1. **GolbalAPI.js**:全局API中有一个mixin方法,用户传入复用的选项,添加到Vue构造函数的options属性中.
2. **init.js**:当前实例上会有一个$options属性保存全局的选项和用户传入的实例选项.
- ps:
    1. 在Vue.mixin之前声明的组件,不会有mixin方法.
    2. 可以单独注入一个mixin对象(单纯一个对象里面包括一些选项)
> 如果是全局mixin,会放在Vue构造函数options属性上,init初始化时候将构造函数options和用户选项mergeOptions合并.
>如果是组件,组件会通过extend创建子构造函数,子构造函数合并Vue构造函数的options和用户选项到子构造函数身上.实例初始化时候去子构造函数身上获取. -->
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

## 组件渲染过程 
1. **vdom/index.js**:在父组件render函数执行过程中,创建子组件的虚拟节点,createElementVnode,从父组件实例上获取子组件的构造函数(也可能是组件选项),返回虚拟节点,并在虚拟节点`属性`上绑定hook对象,对象中有init方法,init方法调用组件虚拟节点上的构造函数获取到组件实例,并将组件实例保存到虚拟节点中,将组件实例挂载,因为挂载结果保存在实例的`$el`,所以虚拟节点也可以访问到$el.
2. **lifeCycle**:父组件调用update,update执行patch.
3. **patch.js**:创建组件节点时候,会去调用组件属性`上的`的init方法,返回虚拟节点上的组件实例的$el.

> 父组件创建虚拟节点时候,创建子组件虚拟节点时候,会从父组件选项中拿到子组件的构造函数,并放在子组件虚拟节点上.在创建真实节点时候,会调用子组件虚拟节点的构造函数方法返回子组件真实节点,再进行渲染.组件更新时候也会复用$el 

- `正常子组件 函数式组件 异步组件对比`:
1. 正常子组件渲染,在子组件虚拟节点转换为真实节点时候,会调用init方法,进行挂载,创建watcher,生命周期等等,并返回真组件实例.
2. 函数式组件只调用render,拿到虚拟节点后渲染,不会进行其他逻辑.
3. 异步组件是根据promise状态返回不同的虚拟节点,再走正常逻辑转换为子组件.
