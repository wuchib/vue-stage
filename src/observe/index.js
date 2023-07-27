import { newArrayProto } from "./array";
class Observer{
    constructor(data){
        //  object.defineProperty只能劫持已经存在的属性 (vue里面会为此单独写一些api $set $delete)
        Object.defineProperty(data,'__ob__',{    // 将__ob__变成不可枚举 （循环时无法获取到）
            value:this,
            enumerable:false
        })
        // data.__ob__ = this; // 给数据加一个标识，如果数据上有__ob__则说明这个属性被观测过了
        if(Array.isArray(data)){
            // 重写数组中的方法  7个变异方法
            data.__proto__ = newArrayProto // 需要保留数组原有的特性，比能切可以重写部分方法
            this.observeArray(data) // 如果数组中放的是对象 可以监控到对象的变化
        }else{
            this.walk(data)
        }
    }

    walk(data){ // 循环对象对属性依次劫持
        // 重新定义 属性 
        Object.keys(data).forEach(key=>defineReactive(data,key,data[key]))
    }
    observeArray(data){
        data.forEach(item=>observe(item))
    }
}

export function defineReactive(target,key,value){ // 闭包 属性劫持
    observe(value)   //对所有的对象都继续进行属性劫持
    Object.defineProperty(target,key,{
        get(){ // 取值执行get
            return value
        },  
        set(newVal){ // 修改执行set
            if(newVal === value) return
            value = newVal
        }
    })
}

export function observe(data){

    // 对这个对象进行劫持
    if(typeof data !=='object' || data == null){
        return 
    }
    if(data.__ob__ instanceof Observer){ // 说明这个对象被代理过了
        return data.__ob__
    }
    // 如果一个对象被劫持，那就不需要再劫持了，要判断一个对象是否被劫持过，可以添加一个实例，用实例来判断是否被劫持过
    return new Observer(data)
}