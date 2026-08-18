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
    Object.defineProperty(data, key, {
      get() {
        return value;
      },
      set(newVal) {
        if (newVal === value) return;
        observer(newVal);
        // console.log(`set响应式,newVal为`,JSON.stringify(newVal) ,`value为${value}`)
        value = newVal;
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
        console.log("设置root为", element, JSON.parse(JSON.stringify(element)));
        root = element;
      }
      stack.push(element);
    }
    function end(name) {
      console.log("发射匹配到的结束标签-end,tagName = " + name);
      const node = stack.pop();
      if (node.tag !== name) console.log("标签不匹配");
    }
    function text(chars) {
      console.log("发射匹配到的文本-text,chars = " + chars);
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
  }

  function compileToFunction(template) {
    const ast = parserHTML(template);
    generate(ast);
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
    };
  }

  function Vue(options) {
    // 初始化el和data
    const vm = this;
    vm._init(options);
  }
  // 挂载上方法
  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
