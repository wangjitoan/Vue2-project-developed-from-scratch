let id=0
class Dep{ 
    constructor() { 
        this.id = id++
        this.subs=[]
    }
    depend() { 
        this.subs.push(Dep.target)
    }

}
Dep.target = null
export default Dep