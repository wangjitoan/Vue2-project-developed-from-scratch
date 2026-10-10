// 渲染
import { isObject } from './utils'
import { createElement,createText} from './vdom/index'
export function renderMixin(vue) {
    vue.prototype._s = function (val) { 
        if (isObject(val)) {
            return JSON.stringify(val)
        }
        else
            return val;
    }
    // 虚拟文本节点
    vue.prototype._v = function (val) {
       return createText(this,val);
    };
    // 虚拟元素节点
    vue.prototype._c = function (tag, attrs, ...children) {  
      return createElement(this,tag, attrs,children)
    };

    vue.prototype._render = function () {  
         const vm=this
        const { render } = vm.$options
        let node =render.call(vm)
        console.log(node,'_render执行') 
        return node
    }
 }