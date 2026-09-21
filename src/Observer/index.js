import { isObject, isArray } from '../utils.js'
import { newArrayMethods} from './array'
class Observer { 
    constructor(data) {
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable:false
        })
        if (isArray(data)) { 
            data.__proto__ = newArrayMethods;
            this.objectArray(data)
        }
        else { this.walk(data) }
    }
    walk(data) { 
        Object.keys(data).forEach((key) => {  
            defineReactive(data, key, data[key]);
        })
    }
 

   objectArray(value) {
    // console.log("当前观测内容为", JSON.stringify(value));
    // 遍历数组中的每个元素，并对每个元素进行观测
    value.forEach(item => { 
        observer(item)  // 调用observer函数对当前元素进行观测
    })
     
    }
}
function defineReactive(data, key, value) { 
    observer(value)
    Object.defineProperty(data, key, {
        get() {  
            return value
        },
        set(newVal) {
            if (newVal === value) return
            observer(newVal)
            // console.log(`set响应式,newVal为`,JSON.stringify(newVal) ,`value为${value}`)
            value=newVal
         }
    })
}

 
export function observer(data) { 
    if (!isObject(data)) return
    if (data.__ob__) {
        // console.log(data,'已经被观测过了')
        return
    } 
    new Observer(data)
}