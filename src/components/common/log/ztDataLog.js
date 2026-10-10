import ZtDataLogDrawer from "@comp/common/log/ZtDataLogDrawer";
const DataLog = {} ;
DataLog.install = function (Vue){
// 使用Vue构造器，创建“子类”
  const DataLogConstructor = Vue.extend(ZtDataLogDrawer);
  const instance = new DataLogConstructor();

  // 挂载到元素上;$el访问元素并插入到body中
  instance.$mount(document.createElement('div'))
  document.body.appendChild(instance.$el);

  // Vue原型上添加显示方法，以便全局调用
  Vue.prototype.$DataLog = (options = {}) => {
    instance.showDrawer(options);
  }
}

export default DataLog;