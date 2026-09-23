import Dep from './Dep'
let id=0
class Watcher { 
    constructor(vm, fn, cb, options) {
      this.vm = vm;
      this.fn = fn;
      this.cb = cb;
      this.getter = fn;
      this.id = id++;
      this.deps = []; // 用于当前 watcher 保存 dep 实例
      this.depsId = new Set(); // 用于当前 watcher 保存 dep 实例的唯一id
      this.get();
    }
    get() { 
        // 取this.vm和this有区别 
        Dep.target=this  
        this.getter()
        Dep.target=null
    }
    addDept(dept) {
        let did = dept.id 
        if (!this.depsId.has(did)) { 
            this.deps.push(dept)
            this.depsId.add(dept.id)
            // dept依赖收集
            dept.addSub(this)
        }
    }
    update() { 
        this.get()
    }
}
export default Watcher