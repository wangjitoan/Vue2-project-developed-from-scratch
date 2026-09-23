import { patch } from './vdom/patch'
import Watcher from './Observer/watcher'
// 生命周期模块
/**
 * 挂载组件函数
 * 该函数负责将组件实例挂载到DOM上，是组件生命周期的重要环节
 * @param {Object} vm - Vue组件实例对象，包含组件的相关数据和状态
 */
export   function mountComponent(vm){
    // 调用组件的render方法生成虚拟DOM
    // 这是组件挂载过程中的关键步骤，会根据组件的数据生成对应的虚拟DOM树
    let updateComponent = () => {
      vm._update(vm._render());
    };
     
    new Watcher(vm, updateComponent, () => { console.log('mountComponent')},true);
}
export function lifecycleMixin(Vue) { 
    // 更新节点函数挂载
    Vue.prototype._update = function (vnode) {
        const vm = this
        // console.log(vnode)
        vm.$el = patch(vm.$el, vnode)
        console.log('依据vdom生成的真实dom',vm.$el)
     }
}