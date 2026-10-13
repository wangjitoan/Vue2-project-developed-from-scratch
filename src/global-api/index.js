import { mergeOptions, isFunction } from "../utils";
let cid=0
export function initGlobalAPI(Vue) {
    Vue.options = {};
    Vue.options.components = {}
  Vue.mixin = function (options) {
    Vue.options = mergeOptions(this.options, options);
    return this;
  };
  /**
   * 使用基础的 Vue 构造器，创造一个子类
   *
   * @param {*} definition
   */
  Vue.extend = function (extendOptions) {
    //   父类
    const Super = this;
    const Sub = function (extendOptions) {
      this._init(extendOptions);
    };
      //   为什么不能直接写 Sub.prototype = Super.prototype？（重点面试考点）
      Sub.cid=cid++
    Sub.prototype = Object.create(Super.prototype);
    Sub.prototype.constructor = Sub;
    Sub.options = mergeOptions(Super.options, extendOptions);
    Sub["super"] = Super;
    // allow further extension/mixin/plugin usage
      Sub.extend = Super.extend || {};
      Sub.mixin = Super.mixin || {};
      Sub.use = Super.use || {};
    return Sub;
  };;
  Vue.component = function (id, definition) {
    let name = definition.name || id;
    definition.name = name;
      if (!isFunction(definition)) {
          
          definition = Vue.extend(definition); 
    }

      Vue.options.components[name] = definition;
      console.log(1234, Vue.options.component);
  };
  Vue.filter = function (options) {};
  Vue.directive = function (options) {};
}
 