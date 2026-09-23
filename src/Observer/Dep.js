let id=0
class Dep{ 
    constructor() { 
        this.id = id++
        this.subs=[]
    }
    // dept与watcher双向记住入口
    depend() {  
        Dep.target.addDept(this)
    }
    addSub(watcher) { 
        this.subs.push(watcher);
    }
/**
 * 通知方法，用于通知所有订阅者（观察者）更新
 * 该方法会遍历所有订阅者（subs数组）并调用它们的update方法
 */
    notify() { 
    // 遍历订阅者数组，对每个订阅者调用update方法
        this.subs.forEach(watcher=>watcher.update())
    }

}
Dep.target = null
export default Dep