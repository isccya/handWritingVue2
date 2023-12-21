(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

    // 静态方法 
    var strats = {};
    var LIFECYCLE = ['beforeCreate', 'created'];
    LIFECYCLE.forEach(function (hook) {
      strats[hook] = function (p, c) {
        if (c) {
          if (p) {
            //如果儿子有,父亲有,拼在一起
            return p.concat(c);
          } else {
            return [c];
          }
        } else {
          return p; //如果没有儿子,则用父亲的即可
        }
      };
    });
    function mergeOptions(parent, child) {
      var options = {};
      for (var key in parent) {
        mergeField(key);
      }
      for (var _key in child) {
        if (!parent.hasOwnProperty(_key)) {
          mergeField(_key);
        }
      }
      function mergeField(key) {
        // 用策略模式减少if else
        if (strats[key]) {
          options[key] = strats[key](parent[key], child[key]);
        } else {
          options[key] = child[key] || parent[key];
        }
      }
      return options;
    }

    function initGlobalAPI(Vue) {
      Vue.options = {}; //上面是合并后的配置

      Vue.mixin = function (mixin) {
        // 将用户的选项和全局options进行合并
        this.options = mergeOptions(this.options, mixin);
        return this;
      };
    }

    function _iterableToArrayLimit(r, l) {
      var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
      if (null != t) {
        var e,
          n,
          i,
          u,
          a = [],
          f = !0,
          o = !1;
        try {
          if (i = (t = t.call(r)).next, 0 === l) {
            if (Object(t) !== t) return;
            f = !1;
          } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
        } catch (r) {
          o = !0, n = r;
        } finally {
          try {
            if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
          } finally {
            if (o) throw n;
          }
        }
        return a;
      }
    }
    function _toPrimitive(t, r) {
      if ("object" != typeof t || !t) return t;
      var e = t[Symbol.toPrimitive];
      if (void 0 !== e) {
        var i = e.call(t, r || "default");
        if ("object" != typeof i) return i;
        throw new TypeError("@@toPrimitive must return a primitive value.");
      }
      return ("string" === r ? String : Number)(t);
    }
    function _toPropertyKey(t) {
      var i = _toPrimitive(t, "string");
      return "symbol" == typeof i ? i : String(i);
    }
    function _typeof(o) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
        return typeof o;
      } : function (o) {
        return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
      }, _typeof(o);
    }
    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }
    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
      }
    }
    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }
    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }
    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }
    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }
    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;
      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
      return arr2;
    }
    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    // 我们希望重写数组上的方法

    var oldArrayProto = Array.prototype; //获取数组的原型

    var newArrayProto = Object.create(oldArrayProto);
    var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
    methods.forEach(function (method) {
      newArrayProto[method] = function () {
        var _oldArrayProto$method;
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }
        //这里重写了数组的方法
        // console.log(method);
        var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); //内部调用原来的方法
        var inserted;
        var ob = this.__ob__;
        switch (method) {
          case 'push':
          case 'unshift':
            inserted = args;
            break;
          case 'splice':
            inserted = args.slice(2);
        }
        if (inserted) {
          ob.observeArray(inserted);
        }
        return result;
      };
    });
    // console.log(newArrayProto);

    var id$1 = 0;
    /**
     * dep每个属性都有,目的是收集watcher
     * 
     * */
    var Dep = /*#__PURE__*/function () {
      function Dep() {
        _classCallCheck(this, Dep);
        this.id = id$1++; //属性的dep收集watcher
        this.subs = []; //存放属性对应的watcher有哪些
      }
      _createClass(Dep, [{
        key: "depend",
        value: function depend() {
          // 不希望重复记录watcher
          Dep.target.addDep(this); //让watcher记住dep

          // dep和watcher是一个多对多关系
        }
      }, {
        key: "addSub",
        value: function addSub(watcher) {
          this.subs.push(watcher);
        }
      }, {
        key: "nodify",
        value: function nodify() {
          this.subs.forEach(function (watcher) {
            return watcher.update();
          }); //告诉watcher要更新了
        }
      }]);
      return Dep;
    }();
    Dep.target = null;

    var Observer = /*#__PURE__*/function () {
      function Observer(data) {
        _classCallCheck(this, Observer);
        // Object,defineProperty只能劫持已经存在的属性
        Object.defineProperty(data, '__ob__', {
          //给数据添加了一个标识,如果数据上有_ob_说明这个数据被观测过了
          value: this,
          enumerable: false //将下划线ob变成不可枚举(循环时候无法获取)
        });
        // data._ob_ = this; 
        if (Array.isArray(data)) {
          //如果代理的数据是数组,不能给数组每一个索引都作响应式,很少有arr[876]这样的需求,只对数组方法里面做响应式,还有数组里面的对象作响应式
          data.__proto__ = newArrayProto; //保留数组原有的特性,并且可以重写部分方法
          this.observeArray(data); //如果数组中存放的是对象,可以监测到对象的变化
        } else {
          this.walk(data);
        }
      }
      _createClass(Observer, [{
        key: "walk",
        value: function walk(data) {
          // 循环对象,对属性依次劫持
          Object.keys(data).forEach(function (key) {
            return defineReactive(data, key, data[key]);
          });
        }
      }, {
        key: "observeArray",
        value: function observeArray(data) {
          data.forEach(function (item) {
            return observe(item);
          }); //把数组里的对象都变成响应式
        }
      }]);
      return Observer;
    }(); // !!!最终定义对象属性为响应式的方法!!!
    function defineReactive(target, key, value) {
      //闭包 属性劫持
      observe(value); //递归,值是对象,也对对象内部的值做劫持
      var dep = new Dep(); //每一个属性都有dep
      Object.defineProperty(target, key, {
        // ***在数据的get方法进行依赖收集,访问了数据===>组件依赖这些数据***
        get: function get() {
          if (Dep.target) {
            dep.depend(); //让这个属性记住当前的watcher
          }
          return value;
        },
        // ***在数据的set方法进行依赖追踪,数据修改===>组件更新***
        set: function set(newValue) {
          if (newValue === value) return;
          observe(newValue);
          value = newValue;
          dep.nodify(); //通知更新
        }
      });
    }
    function observe(data) {
      // 对这个对象劫持
      if (_typeof(data) !== 'object' || data === null) {
        return; //只对对象劫持
      }
      if (data._ob_ instanceof Observer) {
        //说明这个对象被代理过了
        return data._ob_;
      }
      return new Observer(data);
    }

    function initState(vm) {
      var opts = vm.$options;
      if (opts.data) {
        initData(vm);
      }
    }

    // 解决访问vm属性要vm_data.name这种写法,直接vm.name
    function proxy(vm, target, key) {
      Object.defineProperty(vm, key, {
        //vm.name
        get: function get() {
          return vm[target][key]; //vm._data.name
        },
        set: function set(newValue) {
          vm[target][key] = newValue;
        }
      });
    }
    function initData(vm) {
      var data = vm.$options.data; //data可能是函数,也可能是对象
      typeof data === 'function' ? data.call(vm) : data; //data是用户返回的对象

      vm._data = data; //将返回的对象放到了_data上
      // 对数据进行劫持 vue2里采用了一个api defineProperty
      observe(data);
      for (var key in data) {
        proxy(vm, '_data', key);
      }
    }

    /**
     * 获取模板字符串后,从头到尾先解析开始标签,获得其标签名,属性,和结束标签和标签文本内容.模板字符串不断裁剪到为空.
     * 根据开始标签,文本,结束标签创建AST节点,注意根节点的判断,以及父子节点关系,通过一个栈数据结构判断父子节点
     * 开始标签会进栈,结束标签出栈,文本会直接作为当前父节点的属性,栈结尾的元素即为当前的要进栈元素的***父节点***
     * 最终形成AST语法树.每一层是一个节点,有父节点,子节点,和自身属性.
     * 
     * */

    var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
    var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
    var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 他匹配到的分组是一个 标签名  <xxx 匹配到的是开始 标签的名字
    var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配的是</xxxx>  最终匹配到的分组就是结束标签的名字
    var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性
    // 第一个分组就是属性的key value 就是 分组3/分组4/分组五
    var startTagClose = /^\s*(\/?)>/; // <div> <br/>

    // vue3 采用的不是使用正则
    // 对模板进行编译处理  
    function parseHTML(html) {
      var ELEMENT_TYPE = 1;
      var TEXT_TYPE = 3;
      var stack = []; // 用于存放元素的
      var currentParent; // 指向的是栈中的最后一个
      var root;
      function createASTElement(tag, attrs) {
        return {
          tag: tag,
          type: ELEMENT_TYPE,
          children: [],
          attrs: attrs,
          parent: null
        };
      }
      function start(tag, attrs) {
        var node = createASTElement(tag, attrs); //创建一个ast节点
        if (!root) {
          //没有根节点,当前元素就是根节点
          root = node;
        }
        if (currentParent) {
          node.parent = currentParent; //子知父
          currentParent.children.push(node); //父知子
        }
        stack.push(node);
        currentParent = node; //父节点为栈中最后一个元素
      }
      function chars(text) {
        //文本放到当前指向的节点
        text = text.replace(/\s/g, '');
        text && currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent
        });
      }
      function end(tag) {
        stack.pop(); //弹出最后一个
        currentParent = stack[stack.length - 1];
      }

      // 模板解析完多少,就前进多少
      function advance(n) {
        html = html.substring(n);
      }

      // 解析开始标签及其里面的属性
      function parseStartTag() {
        var start = html.match(startTagOpen);
        // 1.匹配到开始标签
        if (start) {
          var match = {
            tagName: start[1],
            //标签名
            attrs: []
          };
          advance(start[0].length);
          // 2.如果不是开始标签的结束,就一直匹配属性,把属性值放入match.attrs中
          var attr, _end;
          while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
            advance(attr[0].length);
            match.attrs.push({
              name: attr[1],
              value: attr[3] || attr[4] || attr[5]
            } || true);
          }
          // 3.匹配到结束符号
          if (_end) {
            advance(_end[0].length);
          }
          return match;
        }
        return false; //不是开始标签
      }
      while (html) {
        // 如果textEnd 为0 说明是一个开始标签或者结束标签
        // 如果textEnd > 0说明就是文本的结束位置
        var textEnd = html.indexOf('<'); // 如果indexOf中的索引是0 则说明是个标签
        if (textEnd === 0) {
          var startTagMatch = parseStartTag(); //开始标签的匹配
          if (startTagMatch) {
            start(startTagMatch.tagName, startTagMatch.attrs);
            continue;
          }
          var endTagMatch = html.match(endTag);
          if (endTagMatch) {
            end(endTagMatch[1]);
            advance(endTagMatch[0].length);
            continue;
          }
        }
        if (textEnd > 0) {
          var text = html.substring(0, textEnd); //文本内容
          if (text) {
            chars(text);
            advance(text.length); //解析到的文本
          }
        }
      }
      return root;
    }

    function genProps(attrs) {
      var str = ''; // {name,value}
      var _loop = function _loop() {
        var attr = attrs[i];
        if (attr.name === 'style') {
          // color:red;background:red => {color:'red'}
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            // qs 库
            var _item$split = item.split(':'),
              _item$split2 = _slicedToArray(_item$split, 2),
              key = _item$split2[0],
              value = _item$split2[1];
            obj[key] = value;
          });
          attr.value = obj;
        }
        str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ","); // a:b,c:d,
      };
      for (var i = 0; i < attrs.length; i++) {
        _loop();
      }
      return "{".concat(str.slice(0, -1), "}");
    }
    var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }}  匹配到的内容就是我们表达式的变量
    function gen(node) {
      if (node.type === 1) {
        return codegen(node);
      } else {
        // 文本
        var text = node.text;
        if (!defaultTagRE.test(text)) {
          return "_v(".concat(JSON.stringify(text), ")");
        } else {
          //_v( _s(name)+'hello' + _s(name))
          var tokens = [];
          var match;
          defaultTagRE.lastIndex = 0;
          var lastIndex = 0;
          // split
          while (match = defaultTagRE.exec(text)) {
            var index = match.index; // 匹配的位置  {{name}} hello  {{name}} hello 
            if (index > lastIndex) {
              tokens.push(JSON.stringify(text.slice(lastIndex, index)));
            }
            tokens.push("_s(".concat(match[1].trim(), ")"));
            lastIndex = index + match[0].length;
          }
          if (lastIndex < text.length) {
            tokens.push(JSON.stringify(text.slice(lastIndex)));
          }
          return "_v(".concat(tokens.join('+'), ")");
        }
      }
    }
    function genChildren(children) {
      return children.map(function (child) {
        return gen(child);
      }).join(',');
    }
    function codegen(ast) {
      var children = genChildren(ast.children);
      var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
      return code;
    }
    function compileToFunction(template) {
      // 1.将template转换为AST语法树
      var ast = parseHTML(template);

      // 2.生成render方法(render方法执行后返回的是虚拟DOM)
      var code = codegen(ast);

      // 模板引擎的实现原理 就是 with  + new Function 

      code = "with(this){return ".concat(code, "}");
      var render = new Function(code);
      return render;
    }

    /**
     * 每个组件对应一个watcher,页面渲染的逻辑放到watcher里
     * 每个属性有一个dep (属性是被观察者), watcher是观察者(属性变化了会通知观察者来更新)
     * 
     * 需要给每个数据增加一个dep,目的就是收集watcher
        一个组件有多个数据(n个数据对应一个视图) n个dep对应一个watcher
        一个数据对应多个组件
        多对多 
     * */

    /**
     *  nextTick原理???
     * 1.数据更新后不会立刻更新页面,而是异步更新.
     * 2.数据更新会触发依赖这个数据的组件的watcher进行更新,会用一个队列缓冲一个事件循环中所有变更的数据,保存对应的watcher
     * 3.nexttick会把队列中watcher的更新操作放到异步任务中,采用了优雅降级的方式,
     * 原生的Promise.then、MutationObserver和setImmediate，上述三个都不支持最后使用setTimeout
     * 4.异步任务执行完后,清空队列.如果要在页面更新后访问DOM的话,也要用nextTick方法,相当于在watcher更新的异步任务后面排一个异步任务
     * 
     * */
    var id = 0;
    var Watcher = /*#__PURE__*/function () {
      //不同组件有不同的watcher ,目前只有根组件有
      function Watcher(vm, fn, options) {
        _classCallCheck(this, Watcher);
        this.id = id++;
        this.renderWatcher = options; //是一个渲染过程
        this.getter = fn; // getter意味着调用这个函数可以发生取值操作
        this.deps = []; // 后续 我们实现计算属性,和一些清理工作需要
        this.depsId = new Set();
        this.get();
      }
      _createClass(Watcher, [{
        key: "addDep",
        value: function addDep(dep) {
          // 一个组件对应多个属性 重复的属性也不用记录
          var id = dep.id;
          if (!this.depsId.has(id)) {
            this.deps.push(id);
            this.depsId.add(id);
            dep.addSub(this); //watcher已经记住dep并且去重,此时让dep记住watcher
          }
        }
      }, {
        key: "get",
        value: function get() {
          // 用不到的数据就不会收集
          Dep.target = this; //把当前渲染组件的watcher放在全局上,组件渲染会访问数据,数据里get方法会把把该组件添加到自己的dep中
          this.getter(); //会去vm上取值 vm._update(vm._render) 取name 和age
          Dep.target = null; // 渲染完之后清空
        }
      }, {
        key: "update",
        value: function update() {
          queueWatcher(this); //把当前watcher暂存,避免一个数据修改就更新整个页面
          // this.get()
        }
      }, {
        key: "run",
        value: function run() {
          this.get();
        }
      }]);
      return Watcher;
    }();
    var queue = [];
    var has = {}; //用对象去重watcher
    var pending = false; //防抖

    function flushSchedulerQueue() {
      var flushQueue = queue.slice(0);
      queue = [];
      has = {};
      pending = false;
      flushQueue.forEach(function (q) {
        return q.run();
      }); // 在刷新的过程中可能还有新的watcher，重新放到queue中
    }
    function queueWatcher(watcher) {
      var id = watcher.id;
      if (!has[id]) {
        queue.push(watcher);
        has[id] = true;
        // 不管update执行多少次,但是最终只刷新一轮
        if (!pending) {
          nextTick(flushSchedulerQueue); //同步任务里面最后一次赋值(同步前面可能赋值多次)后,异步任务再执行更新,所以是批处理
          pending = true;
        }
      }
    }
    // 又来一次这种方法,多个执行合成一个:一个变量,开个异步
    // 控制更新顺序
    var callbacks = [];
    var waiting = false;
    function flushCallbacks() {
      var cbs = callbacks.slice(0);
      waiting = false;
      callbacks = [];
      cbs.forEach(function (cb) {
        return cb();
      });
    }
    // nextTick不是创建了异步任务,而是将异步任务维护到队列中
    function nextTick(cb) {
      callbacks.push(cb);
      if (!waiting) {
        Promise.resolve().then(flushCallbacks);
        waiting = true;
      }
    }

    /**
     * 这个文件是创建虚拟节点
     * */

    // h()  _c()
    function createElementVNode(vm, tag, data) {
      //创建元素虚拟节点
      if (data == null) {
        data = {};
      }
      var key = data.key;
      if (key) {
        delete data.key;
      }
      for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
        children[_key - 3] = arguments[_key];
      }
      return vnode(vm, tag, key, data, children);
    }
    // _v();
    function createTextVNode(vm, text) {
      //创建文本虚拟节点
      return vnode(vm, undefined, undefined, undefined, undefined, text);
    }
    // ast一样吗？ ast做的是语法层面的转化 他描述的是语法本身 (可以描述js css html)
    // 我们的虚拟dom 是描述的dom元素，可以增加一些自定义属性  (描述dom的)
    function vnode(vm, tag, key, data, children, text) {
      return {
        vm: vm,
        tag: tag,
        key: key,
        data: data,
        children: children,
        text: text
        // ....
      };
    }

    // 创建真实DOM
    function createElm(vnode) {
      var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;
      if (typeof tag == 'string') {
        //元素节点
        vnode.el = document.createElement(tag);
        patchProps(vnode.el, data);
        children.forEach(function (child) {
          vnode.el.appendChild(createElm(child));
        });
      } else {
        //文本节点
        vnode.el = document.createTextNode(text);
      }
      return vnode.el;
    }
    // 创建真实DOM中的元素节点时候添加元素属性
    function patchProps(el, props) {
      for (var key in props) {
        if (key === 'style') {
          for (var styleName in props.style) {
            el.style[styleName] = props.style[styleName];
          }
        } else {
          el.setAttribute(key, props[key]);
        }
      }
    }

    // 写的是初渲染过程
    function patch(oldVnode, vnode) {
      var isRealElement = oldVnode.nodeType;
      if (isRealElement) {
        var elm = oldVnode; //获取真实DOM
        var parentElm = elm.parentNode; //拿到父元素
        var newElm = createElm(vnode); //创建新DOM
        parentElm.insertBefore(newElm, elm.nextSibling); //替换
        parentElm.removeChild(elm); //删除老节点
        return newElm;
      }
    }
    function initLifeCycle(Vue) {
      // 将vnode转化成真实dom
      Vue.prototype._update = function (vnode) {
        var vm = this;
        var el = vm.$el;
        //patch方法里面把虚拟节点转换为真实节点,并把模板中替换旧节点
        vm.$el = patch(el, vnode);
      };

      // _c('div',{},...children)
      Vue.prototype._c = function () {
        return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };
      // _v(text)
      Vue.prototype._v = function () {
        return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
      };
      Vue.prototype._s = function (value) {
        if (_typeof(value) !== 'object') return value;
        return JSON.stringify(value);
      };
      Vue.prototype._render = function () {
        // 渲染时候会去实例取值,就将属性和视图绑定在一起
        return this.$options.render.call(this); // 通过ast语法转义后生成的render方法
      };
    }

    //挂载
    function mountComponent(vm, el) {
      vm.$el = el; // 这里的el 是通过querySelector处理过的

      // 1.调用render方法产生虚拟节点 虚拟DOM
      var updateComponent = function updateComponent() {
        vm._update(vm._render());
      };
      new Watcher(vm, updateComponent, true); //true用于标识是一个渲染watcher

      // 2.根据虚拟DOM产生真实DOM 

      // 3.插入到el元素中
    }
    // vue核心流程 1） 创造了响应式数据  2） 模板转换成ast语法树  
    // 3) 将ast语法树转换了render函数 4) 后续每次数据更新可以只执行render函数 (无需再次执行ast转化的过程)
    // render函数会去产生虚拟节点（使用响应式数据）
    // 根据生成的虚拟节点创造真实的DOM

    function callHook(vm, hook) {
      //调用钩子函数
      var handlers = vm.$options[hook];
      if (handlers) {
        handlers.forEach(function (handlers) {
          return handlers.call(vm);
        });
      }
    }

    function initMixin(Vue) {
      //给Vue添加init方法
      Vue.prototype._init = function (options) {
        //初始化操作
        var vm = this;
        vm.$options = mergeOptions(this.constructor.options, options); //将用户选项挂载到实例上

        // 初始化状态
        callHook(vm, 'beforeCreate');
        initState(vm);
        callHook(vm, 'created');
        if (options.el) {
          vm.$mount(options.el); //实现数据的挂载
        }
      };
      Vue.prototype.$mount = function (el) {
        var vm = this;
        el = document.querySelector(el);
        var ops = vm.$options;
        // render==>template==>el.outerHTML
        if (!ops.render) {
          //先查找一下有没有写render函数
          var template; //没有render看一下是否写了template,没写template采用外部的template
          if (!ops.template && el) {
            //没有写模板,但写了el
            template = el.outerHTML;
          } else {
            if (el) {
              template = ops.template; //如果有el,则采用模板内容
            }
          }
          // 写了template就用写了的template
          if (template) {
            // 这里需要对模板进行编译,即生成AST树,根据AST树代码生成渲染函数.
            var render = compileToFunction(template);
            ops.render = render;
          }
        }
        mountComponent(vm, el); //组件的挂载
      };
    }

    function Vue(options) {
      //options就是用户的选项,包括data,computed等等
      this._init(options);
    }
    Vue.prototype.$nextTick = nextTick;
    initMixin(Vue); //给vue对象扩展了init方法
    initLifeCycle(Vue); //添加vue的生命周期
    initGlobalAPI(Vue); // 添加vue的全局方法

    return Vue;

}));
//# sourceMappingURL=vue.js.map
