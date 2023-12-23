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