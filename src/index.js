import { initMixin } from './init'
import { renderMixin } from './render'
import { lifecycleMixin } from './lifecycle'
import { initGlobalAPI } from './global-api'
// 调试
import { compileToFunction } from './compiler'
import { createElm,patch} from './vdom/patch'
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
// 调试用
Vue.compileToFunction = compileToFunction
Vue.createElm = createElm
Vue.patch=patch
export default Vue;