import { isFunction } from './utils'
import { observer} from './Observer'
export function initState(vm) {
    const opts = vm.$options
    // data初始化
    if (opts.data) { 
        initData(vm)
    }
    // props初始化
    // watch初始化
    // computed 初始化
}
function initData(vm) {
    let data = vm.$options.data
    data = vm._data = isFunction(data) ? data.call(vm) : data
    // 进行数据劫持
    observer(data)
    proxy(vm, '_data')
} 
function proxy(vm, source) {
    Object.keys(vm[source]).forEach(
        (key) => {
            Object.defineProperty(vm, key, {
                get() {
                    return vm[source][key]
                },
                set(val) {
                    vm[source][key]=val
                }
            })
        }
    )
  
 }