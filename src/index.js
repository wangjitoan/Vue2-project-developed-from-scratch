import {initMixin} from './init'
function Vue(options) { 
    // 初始化el和data
    const vm=this
    vm._init(options);
}
// 挂载上方法
initMixin(Vue)
export default Vue;