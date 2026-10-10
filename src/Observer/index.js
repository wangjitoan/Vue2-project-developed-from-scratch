import { isObject, isArray } from '../utils.js'
import { newArrayMethods } from './array'
import Dep from './Dep'
// 有两类依赖收集器，需要区分
class Observer { 
    constructor(data) {
        // 为观察者实例添加依赖收集属性，实现对象或数组的收集。$set实现的根基
        this.dept=new Dep()
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable:false
        })
        if (isArray(data)) { 
            data.__proto__ = newArrayMethods;
            this.objectArray(data)
        }
        else {
            this.walk(data)
        }
    }
    walk(data) { 
        Object.keys(data).forEach((key) => {  
            defineReactive(data, key, data[key]);
        })
    }
 
// 数组的观测方法
   objectArray(value) {
    // console.log("当前观测内容为", JSON.stringify(value));
    // 遍历数组中的每个元素，并对每个元素进行观测
    value.forEach(item => { 
        observer(item)  // 调用observer函数对当前元素进行观测
    })
     
    }
}
function defineReactive(data, key, value) { 
    let childObj=observer(value)
    let dep = new Dep() 
    Object.defineProperty(data, key, {
        get() {  
            if (Dep.target) { 
                dep.depend()
                if (childObj) {
                  // console.log("key",key,"的子集依赖收集")
                  childObj.dept.depend();
                    // 对数组进行遍历依赖收集，walk遍历对象 根据childObj.dept.depend();实现对对象属性的依赖收集
                    if (isArray(value)) { 
                        dependArray(value)
                    } 
                }
            }
            return value
        },
        set(newVal) {
            if (newVal === value) return
            observer(newVal)
            console.log(`set响应式,newVal为`,JSON.stringify(newVal),'key为',key  )
            value = newVal
            dep.notify()
         }
    })
}

 
export function observer(data) { 
    if (!isObject(data)) return
    if (data.__ob__) {
        // console.log(data,'已经被观测过了')
        return
    }  
    return new Observer(data)
}
function dependArray(value) {
    for (let i = 0; i < value.length; i++) { 
        let current = value[i]
        // 数组或对象进行依赖收集
        current.__ob__ && current.__ob__.dept.depend()
        if (isArray(current)) { 
            dependArray(current)
        }

    }
 }