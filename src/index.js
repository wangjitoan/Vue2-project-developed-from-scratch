import { initMixin } from './init'
import { renderMixin } from './render'
import { lifecycleMixin } from './lifecycle'
import { initGlobalAPI} from './global-api'
function Vue(options) { 
    // 初始化el和data
    const vm=this
    vm._init(options);
}
// 挂载上方法
initMixin(Vue)
renderMixin(Vue)
lifecycleMixin(Vue)
initGlobalAPI(Vue)
export default Vue;