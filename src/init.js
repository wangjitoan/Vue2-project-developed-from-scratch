import { initState } from './state'
import { compileToFunction } from './compiler'
import { mountComponent } from './lifecycle'
import { nextTick } from "./utils";
export function initMixin(vue) {
   
    // 初始化vue的init,作用在于数据初始化、节点挂载
    vue.prototype._init = function (options) {
        // 初始化数据挂载
        const vm = this
        vm.$options = options
        initState(vm)
        if (options.el) {  
            vm.$mount(options.el)
        }
    }
    vue.prototype.$mount = function(el)  { 
        console.log('选中的el', el)
        const vm = this 
        const element = document.querySelector(el)
        vm.$el = element
        const opts = vm.$options
        let template
        if (!opts.render) {
            template = opts.template
            if (!opts.template) { 
                template = element.outerHTML;
               
            }
            console.log('template', template)
            const render = compileToFunction(template);
            opts.render=render
        }
        else { 
            console.log('已经渲染过了')
        }
        mountComponent(vm)
         
    }
        vue.prototype.$nextTick = nextTick;
}