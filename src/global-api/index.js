import { mergeOptions } from "../utils";
export function initGlobalAPI(Vue) {
    Vue.options = {}
    Vue.mixin = function (options) { 
        Vue.options = mergeOptions(this.options, options)
        return this
     }
    Vue.component = function (options) {};
    Vue.filter = function (options) { };
    Vue.directive = function (options) {};
}
 