import Dep from './Dep'
import { queueWatcher} from './schedule'
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
         console.log("watcher-update", "查重并缓存需要更新的 watcher");
        queueWatcher(this)
    }
    run() { 
         console.log("watcher-run", "真正执行视图更新");
        this.get()
    }
}
export default Watcher