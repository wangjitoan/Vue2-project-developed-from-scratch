import { initMixin } from './init'
import {renderMixin }from './render'
function Vue(options) { 
    // 初始化el和data
    const vm=this
    vm._init(options);
}
// 挂载上方法
initMixin(Vue)
renderMixin(Vue)
export default Vue;