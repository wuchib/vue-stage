(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  // 重写数组中的部分方法

  let oldArrayProto = Array.prototype; //获取数组的原型

  let newArrayProto = Object.create(oldArrayProto);

  let methods = ["push", "pop", "shift", "unshift", "reverse", "sort", "splice"];

  methods.forEach((method) => {
    newArrayProto[method] = function (...args) {
      // 这里重写了数组的方法
      const result = oldArrayProto[method].call(this, ...args); // 内部调用原来的方法，函数的劫持，切片编程

      // 我们需要对新增的数据再次进行劫持
      let inserted;
      let ob = this.__ob__;
      switch (method) {
        case "push":
        case "unshift":
          inserted = args;
          break;
        case "splice":
          inserted = args.slice(2);
      }

      if (inserted) {  
        // 新增的内容
        // 对新增的内容再次进行观测
        ob.observeArray(inserted);
      }

      return result;
    };
  });

  class Observer{
      constructor(data){
          //  object.defineProperty只能劫持已经存在的属性 (vue里面会为此单独写一些api $set $delete)
          Object.defineProperty(data,'__ob__',{    // 将__ob__变成不可枚举 （循环时无法获取到）
              value:this,
              enumerable:false
          });
          // data.__ob__ = this; // 给数据加一个标识，如果数据上有__ob__则说明这个属性被观测过了
          if(Array.isArray(data)){
              // 重写数组中的方法  7个变异方法
              data.__proto__ = newArrayProto; // 需要保留数组原有的特性，比能切可以重写部分方法
              this.observeArray(data); // 如果数组中放的是对象 可以监控到对象的变化
          }else {
              this.walk(data);
          }
      }

      walk(data){ // 循环对象对属性依次劫持
          // 重新定义 属性 
          Object.keys(data).forEach(key=>defineReactive(data,key,data[key]));
      }
      observeArray(data){
          data.forEach(item=>observe(item));
      }
  }

  function defineReactive(target,key,value){ // 闭包 属性劫持
      observe(value);   //对所有的对象都继续进行属性劫持
      Object.defineProperty(target,key,{
          get(){ // 取值执行get
              return value
          },  
          set(newVal){ // 修改执行set
              if(newVal === value) return
              value = newVal;
          }
      });
  }

  function observe(data){

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

  function initState(vm){
      const opts = vm.$options;
      if(opts.data){
          initData(vm);
      }
  }

  function proxy(vm,target,key){
      Object.defineProperty(vm,key,{
          get(){
              return vm[target][key]
          },
          set(newVal){
              vm[target][key] = newVal;
          }
      });
  } 

  function initData(vm){
      let data = vm.$options.data; // 可能是函数可能是对象
      data = typeof data === 'function' ? data.call(vm) : data;
      vm._data = data;
      //  对数据进行劫持 vue2 里采用了 defineProperty
      observe(data);

      // 将vm._data 用vm来代理就可以了
      for(let key in data){
          proxy(vm,'_data',key);
      }
  }

  function initMixin(Vue){
      Vue.prototype._init = function (options){
          // vue  vm.$options 获取用户的配置
          const vm = this;  //保留this
          vm.$options = options; //将选项挂载在vue实例上的$options

          // 初始化状态
          initState(vm);

      };
  }

  function Vue(options){ // options 用户的选项 
      this._init(options);
  }

  initMixin(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
