(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function isFunction(val) {
    return typeof val === "function";
  }
  function isObject(val) {
    return typeof val === "object";
  }
  function isArray(val) {
    return Array.isArray(val);
  }
  function nextTick(fn) {
    callBacks.push(fn);
    if (!waiting) {
      Promise.resolve().then(flushsCallbacks);
      waiting = true;
    }
  }
  // 回调函数数组统一排队
  let callBacks = [];
  let waiting = false;
  // 执行
  function flushsCallbacks() {
    callBacks.forEach(item => item());
    callBacks = [];
    waiting = false;
  }

  let oldArrayPrototype = Array.prototype;
  let newArrayMethods = Object.create(oldArrayPrototype);
  let methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];
  methods.forEach(method => {
    newArrayMethods[method] = function (...args) {
      oldArrayPrototype[method].call(this, ...args);
      let ob = this.__ob__;
      let inserters = null;
      switch (method) {
        case 'splice':
          inserters = args.splice(2);
        case 'push':
        case 'unshift':
          inserters = args;
          break;
      }

      // console.log(`重写${method}方法`, inserters)
      if (inserters) ob.objectArray(inserters);
    };
  });

  let id$1 = 0;
  class Dep {
    constructor() {
      this.id = id$1++;
      this.subs = [];
    }
    // dept与watcher双向记住入口
    depend() {
      Dep.target.addDept(this);
    }
    addSub(watcher) {
      this.subs.push(watcher);
    }
    /**
     * 通知方法，用于通知所有订阅者（观察者）更新
     * 该方法会遍历所有订阅者（subs数组）并调用它们的update方法
     */
    notify() {
      // 遍历订阅者数组，对每个订阅者调用update方法
      this.subs.forEach(watcher => watcher.update());
    }
  }
  Dep.target = null;

  class Observer {
    constructor(data) {
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      });
      if (isArray(data)) {
        data.__proto__ = newArrayMethods;
        this.objectArray(data);
      } else {
        this.walk(data);
      }
    }
    walk(data) {
      Object.keys(data).forEach(key => {
        defineReactive(data, key, data[key]);
      });
    }
    objectArray(value) {
      // console.log("当前观测内容为", JSON.stringify(value));
      // 遍历数组中的每个元素，并对每个元素进行观测
      value.forEach(item => {
        observer(item); // 调用observer函数对当前元素进行观测
      });
    }
  }
  function defineReactive(data, key, value) {
    observer(value);
    let dep = new Dep();
    Object.defineProperty(data, key, {
      get() {
        if (Dep.target) {
          dep.depend();
        }
        return value;
      },
      set(newVal) {
        if (newVal === value) return;
        observer(newVal);
        console.log(`set响应式,newVal为`, JSON.stringify(newVal), 'key为', key);
        value = newVal;
        dep.notify();
      }
    });
  }
  function observer(data) {
    if (!isObject(data)) return;
    if (data.__ob__) {
      // console.log(data,'已经被观测过了')
      return;
    }
    new Observer(data);
  }

  function initState(vm) {
    const opts = vm.$options;
    // data初始化
    if (opts.data) {
      initData(vm);
    }
    // props初始化
    // watch初始化
    // computed 初始化
  }
  function initData(vm) {
    let data = vm.$options.data;
    data = vm._data = isFunction(data) ? data.call(vm) : data;
    // 进行数据劫持
    observer(data);
    proxy(vm, '_data');
  }
  function proxy(vm, source) {
    Object.keys(vm[source]).forEach(key => {
      Object.defineProperty(vm, key, {
        get() {
          return vm[source][key];
        },
        set(val) {
          vm[source][key] = val;
        }
      });
    });
  }

  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
  const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
  const startTagOpen = new RegExp(`^<${qnameCapture}`);
  const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;
  // 匹配属性（索引 1 为属性 key、索引 3、4、5 其中一直为属性值）：aaa="xxx"、aaa='xxx'、aaa=xxx
  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  // 匹配结束标签：>
  const startTagClose = /^\s*(\/?)>/;
  // 匹配结束标签，如： </div>
  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
  function parserHTML(html) {
    console.log("parserHTML-html : " + html);
    let root = null;
    let stack = [];
    function createAstElement(tag, attrs, parent) {
      return {
        tag,
        // 标签名
        type: 1,
        // 元素类型为 1
        children: [],
        // 儿子
        parent,
        // 父亲
        attrs // 属性
      };
    }
    function start(name, attrs) {
      console.log("发射匹配到的开始标签-start,tag = " + name + ",attrs = " + JSON.stringify(attrs));
      const parent = stack[stack.length - 1];
      let element = createAstElement(name, attrs, parent);
      if (parent) {
        // element.parent = parent
        parent.children.push(element);
      }
      if (root === null) {
        // console.log("设置root为", element,JSON.parse(JSON.stringify(element)));
        root = element;
      }
      stack.push(element);
    }
    function end(name) {
      // console.log("发射匹配到的结束标签-end,tagName = " + name);
      const node = stack.pop();
      if (node.tag !== name) console.log("标签不匹配");
    }
    function text(chars) {
      // console.log("发射匹配到的文本-text,chars = " + chars);
      let parent = stack[stack.length - 1];
      chars = chars.replace(/\s/g, ""); // 将空格替换为空，即删除空格
      if (chars) {
        parent.children.push({
          type: 2,
          // 文本类型为 2
          text: chars
        });
      }
    }
    function advance(len) {
      html = html.substring(len);
    }
    function parseStartTag() {
      let start = html.match(startTagOpen);
      if (start) {
        const match = {
          tag: start[1],
          attrs: []
        };
        advance(start[0].length);
        // 处理属性
        let end;
        let attr;
        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length);
        }
        // 处理>标签
        if (end) {
          advance(end[0].length);
        }
        return match;
      }
      return false;
    }
    while (html) {
      let index = html.indexOf("<");
      if (index === 0) {
        // 开始和结束标签的情况
        const startTagMatch = parseStartTag();
        if (startTagMatch) {
          start(startTagMatch.tag, startTagMatch.attrs);
          continue;
        }
        // 结束情况
        let endTagMatch;
        if (endTagMatch = html.match(endTag)) {
          end(endTagMatch[1]);
          advance(endTagMatch[0].length);
          continue;
        }
      } else if (index > 0) {
        let chart = html.substring(0, index);
        text(chart);
        advance(chart.length);
      }
    }
    return root;
  }
  function generate(ast) {
    console.log("parserHTML-ast : ", ast);
    let children = genChildren(ast);
    let code = `_c( "${ast.tag}",  {attrs:${ast.attrs.length ? genProps(ast.attrs) : undefined}}, ${children ? children : ''}   )`;
    return code;
  }
  /**
   * 生成属性字符串的函数
   * @param {Array} attrs - 属性数组，每个元素是一个包含name和value属性的对象
   * @returns {String} 返回格式化后的属性字符串
   */
  function genProps(attrs) {
    let str = ''; // 用于拼接属性字符串的变量
    for (let i = 0; i < attrs.length; i++) {
      // 遍历属性数组
      if (attrs[i].name === 'style') {
        // 如果是style属性
        let styles = {};
        // 正则解析： 中间以分号隔开，两测不能有冒号(分割)和分号(结尾)
        attrs[i].value.replace(/([^;:]+):([^;:]+)/g, function () {
          // key：arguments[1]、value：arguments[2]
          styles[arguments[1]] = arguments[2];
        });
        attrs[i].value = styles;
      }
      str += `${attrs[i].name}:${JSON.stringify(attrs[i].value)},`;
    }
    return `{${str.slice(0, -1)}}`;
  }
  function genChildren(el) {
    const children = el.children;
    if (children?.length) {
      let res = children.map(item => gen(item)).join(',');
      return res;
    }
    return false;
  }
  function gen(el) {
    // 标签类型
    if (el.type === 1) {
      return generate(el);
    } else if (el.type === 2) {
      // 文本类型
      const text = el.text;
      if (!defaultTagRE.test(text)) {
        // 思索：既然是字符串化，为什么要使用JSON.stringify 而不使用String,区别在源码转义
        // 静态文本要包装成合法 JS 字符串字面量
        // String(val) 是类型转换：把任意值转成内存里的 JS 字符串，不是生成源码字面量。
        return `_v(${JSON.stringify(text)})`;
      } else {
        let token = [];
        let index = defaultTagRE.lastIndex = 0;
        let match;
        while (match = defaultTagRE.exec(text)) {
          if (index < match.index) {
            token.push(`${JSON.stringify(text.slice(index, match.index))}`);
          }
          token.push(`_s(${match[1]})`);
          index = match.index + match[0].length;
        }
        if (index < text.length) {
          token.push(`${JSON.stringify(text.slice(index, text.length))}`);
        }
        return `_v(${token.join('+')})`;
      }
    } else {
      return false;
    }
  }

  function compileToFunction(template) {
    const ast = parserHTML(template);
    let code = generate(ast);
    console.log('ast', code);
    const render = new Function(`with(this){return  ${code} }`);
    console.log(render.toString());
    return render;
  }

  function patch(el, vnode) {
    // 创建
    const dom = createElement$1(vnode);
    console.log('createElement', vnode);
    console.log(el.parentNode, "el");
    const parentNode = el.parentNode;
    const last = el.nextElementSibling;
    parentNode.insertBefore(dom, last);
    parentNode.removeChild(el);
    return dom;
  }
  function createElement$1(vnode) {
    const {
      vm,
      tag,
      data,
      children,
      key,
      text
    } = vnode;
    if (typeof tag === 'string') {
      // 将真实节点和虚拟节点做映射
      vnode.el = document.createElement(tag);
      // 挂载属性
      updateProperties(vnode.el, data?.attrs);
      if (children.length) {
        children.forEach(item => vnode.el.appendChild(createElement$1(item)));
      }
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }
  function updateProperties(el, props = {}) {
    for (let key in props) {
      let value = props[key];
      if (key === 'style') {
        value = JSON.stringify(props[key]);
      }
      el.setAttribute(key, value);
    }
  }

  let queue = [];
  let has = {};
  let pending = false;
  function queueWatcher(watcher) {
    let id = watcher.id;
    if (!has[id]) {
      has[id] = true;
      queue.push(watcher);
      if (!pending) {
        nextTick(flushschedulerQueue);
        pending = true;
      }
    }
  }
  function flushschedulerQueue() {
    queue.forEach(watcher => watcher.run());
    queue = [];
    pending = false;
    has = {};
  }

  let id = 0;
  class Watcher {
    constructor(vm, fn, cb, options) {
      this.vm = vm;
      this.fn = fn;
      this.cb = cb;
      this.getter = fn;
      this.id = id++;
      this.deps = []; // 用于当前 watcher 保存 dep 实例
      this.depsId = new Set(); // 用于当前 watcher 保存 dep 实例的唯一id
      this.get();
    }
    get() {
      // 取this.vm和this有区别 
      Dep.target = this;
      this.getter();
      Dep.target = null;
    }
    addDept(dept) {
      let did = dept.id;
      if (!this.depsId.has(did)) {
        this.deps.push(dept);
        this.depsId.add(dept.id);
        // dept依赖收集
        dept.addSub(this);
      }
    }
    update() {
      console.log("watcher-update", "查重并缓存需要更新的 watcher");
      queueWatcher(this);
    }
    run() {
      console.log("watcher-run", "真正执行视图更新");
      this.get();
    }
  }

  // 生命周期模块
  /**
   * 挂载组件函数
   * 该函数负责将组件实例挂载到DOM上，是组件生命周期的重要环节
   * @param {Object} vm - Vue组件实例对象，包含组件的相关数据和状态
   */
  function mountComponent(vm) {
    // 调用组件的render方法生成虚拟DOM
    // 这是组件挂载过程中的关键步骤，会根据组件的数据生成对应的虚拟DOM树
    let updateComponent = () => {
      vm._update(vm._render());
    };
    new Watcher(vm, updateComponent, () => {
      console.log('mountComponent');
    }, true);
  }
  function lifecycleMixin(Vue) {
    // 更新节点函数挂载
    Vue.prototype._update = function (vnode) {
      const vm = this;
      // console.log(vnode)
      vm.$el = patch(vm.$el, vnode);
      console.log('依据vdom生成的真实dom', vm.$el);
    };
  }

  function initMixin(vue) {
    // 初始化vue的init,作用在于数据初始化、节点挂载
    vue.prototype._init = function (options) {
      // 初始化数据挂载
      const vm = this;
      vm.$options = options;
      initState(vm);
      if (options.el) {
        vm.$mount(options.el);
      }
    };
    vue.prototype.$mount = function (el) {
      console.log('选中的el', el);
      const vm = this;
      const element = document.querySelector(el);
      vm.$el = element;
      const opts = vm.$options;
      let template;
      if (!opts.render) {
        template = opts.template;
        if (!opts.template) {
          template = element.outerHTML;
        }
        console.log('template', template);
        const render = compileToFunction(template);
        opts.render = render;
      } else {
        console.log('已经渲染过了');
      }
      mountComponent(vm);
    };
    vue.prototype.$nextTick = nextTick;
  }

  function createElement(vm, tag, data = {}, ...children) {
    return vnode(vm, tag, data, ...children, data.key, undefined);
  }
  function createText(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }
  function vnode(vm, tag, data, children, key, text) {
    return {
      vm,
      tag,
      data,
      children,
      key,
      text
    };
  }

  // 渲染
  function renderMixin(vue) {
    vue.prototype._s = function (val) {
      if (isObject(val)) {
        return JSON.stringify(val);
      } else return val;
    };
    // 虚拟文本节点
    vue.prototype._v = function (val) {
      return createText(this, val);
    };
    // 虚拟元素节点
    vue.prototype._c = function (tag, attrs, ...children) {
      return createElement(this, tag, attrs, children);
    };
    vue.prototype._render = function () {
      const vm = this;
      const {
        render
      } = vm.$options;
      let node = render.call(vm);
      console.log(node, '_render执行');
      return node;
    };
  }

  function Vue(options) {
    // 初始化el和data
    const vm = this;
    vm._init(options);
  }
  // 挂载上方法
  initMixin(Vue);
  renderMixin(Vue);
  lifecycleMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
