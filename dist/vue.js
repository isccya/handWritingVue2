(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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

  // 我们希望重写数组上的方法

  var oldArrayProto = Array.prototype; //获取数组的原型

  var newArrayProto = Object.create(oldArrayProto);
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    newArrayProto[method] = function () {
      var _oldArrayProto$method;
      //这里重写了数组的方法
      console.log(method);
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
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
  console.log(newArrayProto);

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
    Object.defineProperty(target, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observe(newValue);
        value = newValue;
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

  //对模板进行编译处理

  function compileToFunction(template) {
    // 1.将template转换为AST语法树

    // 2.生成render方法(render方法执行后返回的是虚拟DOM)
    console.log(template);
  }

  function initMixin(Vue) {
    //给Vue添加init方法
    Vue.prototype._init = function (options) {
      //初始化操作
      var vm = this;
      vm.$options = options; //将用户选项挂载到实例上

      // 初始化状态
      initState(vm);
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
          // 这里需要对模板进行编译
          var render = compileToFunction(template);
          ops.render = render;
        }
      }
    };
  }

  function Vue(options) {
    //options就是用户的选项,包括data,computed等等
    this._init(options);
  }
  initMixin(Vue); //给vue对象扩展了init方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
