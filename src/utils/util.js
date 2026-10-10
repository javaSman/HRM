import * as api from '@/api/api'
import { isURL } from '@/utils/validate'
import onlineCommons from '@jeecg/antd-online-mini'
import { mapGetAction } from '@api/manage'
import { USER_AUTH } from '@/store/mutation-types'

export function timeFix() {
  const time = new Date()
  const hour = time.getHours()
  return hour < 9 ? '早上好' : (hour <= 11 ? '上午好' : (hour <= 13 ? '中午好' : (hour < 20 ? '下午好' : '晚上好')))
}

export function welcome() {
  const arr = ['休息一会儿吧', '准备吃什么呢?', '要不要打一把 DOTA', '我猜你可能累了']
  let index = Math.floor((Math.random()*arr.length))
  return arr[index]
}

/**
 * 触发 window.resize
 */
export function triggerWindowResizeEvent() {
  let event = document.createEvent('HTMLEvents')
  event.initEvent('resize', true, true)
  event.eventType = 'message'
  window.dispatchEvent(event)
}

/**
 * 过滤对象中为空的属性
 * @param obj
 * @returns {*}
 */
export function filterObj(obj) {
  if (!(typeof obj == 'object')) {
    return;
  }

  for ( let key in obj) {
    if (obj.hasOwnProperty(key)
      && (obj[key] == null || obj[key] == undefined || obj[key] === '')) {
      delete obj[key];
    }
  }
  return obj;
}

/**
 * 时间格式化
 * @param value
 * @param fmt
 * @returns {*}
 */
export function formatDate(value, fmt) {
  let regPos = /^\d+(\.\d+)?$/;
  if(regPos.test(value)){
    //如果是数字
    let getDate = new Date(value);
    let o = {
      'M+': getDate.getMonth() + 1,
      'd+': getDate.getDate(),
      'h+': getDate.getHours(),
      'm+': getDate.getMinutes(),
      's+': getDate.getSeconds(),
      'q+': Math.floor((getDate.getMonth() + 3) / 3),
      'S': getDate.getMilliseconds()
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (getDate.getFullYear() + '').substr(4 - RegExp.$1.length))
    }
    for (let k in o) {
      if (new RegExp('(' + k + ')').test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
      }
    }
    return fmt;
  }else{
    //TODO
    value = value.trim();
    return value.substr(0,fmt.length);
  }
}
/**
 * 查找树
 * @param value
 * @param fmt
 * @returns {*}
 */
export function findTreePath(tree, targetId, options = {}) {
  const {
    idKey = 'id',
    childrenKey = 'children'
  } = options

  const path = []

  function dfs(list) {
    for (const item of list) {
      path.push(item)

      if (item[idKey] === targetId) {
        return true
      }

      const children = item[childrenKey]
      if (Array.isArray(children) && children.length > 0) {
        if (dfs(children)) {
          return true
        }
      }

      path.pop()
    }

    return false
  }

  const found = dfs(tree)

  return found ? path : []
}

// 生成首页路由
export function generateIndexRouter(data) {
let indexRouter = [{
          path: '/',
          name: 'dashboard',
          //component: () => import('@/components/layouts/BasicLayout'),
          component: resolve => require(['@/components/layouts/TabLayout'], resolve),
          meta: { title: '首页' },
          redirect: '/dashboard/analysis',
          children: [
            ...generateChildRouters(data)
          ]
        },{
          "path": "*", "redirect": "/404", "hidden": true
        }]
  return indexRouter;
}

// 生成嵌套路由（子路由）

function  generateChildRouters (data) {
  const routers = [];
  for (let item of data) {
    let component = "";
    if(item.component.indexOf("layouts")>=0){
       component = "components/"+item.component;
    }else{
       component = "views/"+item.component;
    }

    // eslint-disable-next-line
    let URL = (item.meta.url|| '').replace(/{{([^}}]+)?}}/g, (s1, s2) => eval(s2)) // URL支持{{ window.xxx }}占位符变量
    if (isURL(URL)) {
      item.meta.url = URL;
    }

    let componentPath
    if(item.component=="modules/online/cgform/OnlCgformHeadList"){
      componentPath = onlineCommons.OnlCgformHeadList
    }else if(item.component=="modules/online/cgform/OnlCgformCopyList"){
      componentPath = onlineCommons.OnlCgformCopyList
    }else if(item.component=="modules/online/cgform/auto/OnlCgformAutoList"){
      componentPath = onlineCommons.OnlCgformAutoList
    }else if(item.component=="modules/online/cgform/auto/OnlCgformTreeList"){
      componentPath = onlineCommons.OnlCgformTreeList
    }else if(item.component=="modules/online/cgform/auto/erp/OnlCgformErpList"){
      componentPath = onlineCommons.OnlCgformErpList
    }else if(item.component=="modules/online/cgform/auto/tab/OnlCgformTabList"){
      componentPath = onlineCommons.OnlCgformTabList
    }else if(item.component=="modules/online/cgform/auto/innerTable/OnlCgformInnerTableList"){
      componentPath = onlineCommons.OnlCgformInnerTableList
    }else if(item.component=="modules/online/cgreport/OnlCgreportHeadList"){
      componentPath = onlineCommons.OnlCgreportHeadList
    }else if(item.component=="modules/online/cgreport/auto/OnlCgreportAutoList"){
      componentPath = onlineCommons.OnlCgreportAutoList
    }else{
      componentPath = resolve => require(['@/' + component+'.vue'], resolve)
    }

    let menu =  {
      path: item.path,
      name: item.name,
      redirect:item.redirect,
      component: componentPath,
      //component: resolve => require(['@/' + component+'.vue'], resolve),
      hidden:item.hidden,
      meta: {
        title:item.meta.title ,
        icon: item.meta.icon,
        url:item.meta.url ,
        permissionList:item.meta.permissionList,
        keepAlive:item.meta.keepAlive,
        /*update_begin author:wuxianquan date:20190908 for:赋值 */
        internalOrExternal:item.meta.internalOrExternal,
        /*update_end author:wuxianquan date:20190908 for:赋值 */
        componentName:item.meta.componentName
      }
    }
    if(item.alwaysShow){
      menu.alwaysShow = true;
      menu.redirect = menu.path;
    }
    if (item.children && item.children.length > 0) {
      menu.children = [...generateChildRouters( item.children)];
    }
    //--update-begin----author:scott---date:20190320------for:根据后台菜单配置，判断是否路由菜单字段，动态选择是否生成路由（为了支持参数URL菜单）------
    //判断是否生成路由
    if(item.route && item.route === '0'){
      //console.log(' 不生成路由 item.route：  '+item.route);
      //console.log(' 不生成路由 item.path：  '+item.path);
    }else{
      routers.push(menu);
    }
    //--update-end----author:scott---date:20190320------for:根据后台菜单配置，判断是否路由菜单字段，动态选择是否生成路由（为了支持参数URL菜单）------
  }
  return routers
}

/**
 * 深度克隆对象、数组
 * @param obj 被克隆的对象
 * @return 克隆后的对象
 */
export function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj))
}

/**
 * 随机生成数字
 *
 * 示例：生成长度为 12 的随机数：randomNumber(12)
 * 示例：生成 3~23 之间的随机数：randomNumber(3, 23)
 *
 * @param1 最小值 | 长度
 * @param2 最大值
 * @return int 生成后的数字
 */
export function randomNumber() {
  // 生成 最小值 到 最大值 区间的随机数
  const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min)
  }
  if (arguments.length === 1) {
    let [length] = arguments
  // 生成指定长度的随机数字，首位一定不是 0
    let nums = [...Array(length).keys()].map((i) => (i > 0 ? random(0, 9) : random(1, 9)))
    return parseInt(nums.join(''))
  } else if (arguments.length >= 2) {
    let [min, max] = arguments
    return random(min, max)
  } else {
    return Number.NaN
  }
}

/**
 * 随机生成字符串
 * @param length 字符串的长度
 * @param chats 可选字符串区间（只会生成传入的字符串中的字符）
 * @return string 生成的字符串
 */
export function randomString(length, chats) {
  if (!length) length = 1
  if (!chats) chats = '0123456789qwertyuioplkjhgfdsazxcvbnm'
  let str = ''
  for (let i = 0; i < length; i++) {
    let num = randomNumber(0, chats.length - 1)
    str += chats[num]
  }
  return str
}

/**
 * 随机生成uuid
 * @return string 生成的uuid
 */
export function randomUUID() {
  let chats = '0123456789abcdef'
  return randomString(32, chats)
}

/**
 * 下划线转驼峰
 * @param string
 * @returns {*}
 */
export function underLine2CamelCase(string){
  return string.replace( /_([a-z])/g, function( all, letter ) {
    return letter.toUpperCase();
  });
}

/**
 * 判断是否显示办理按钮
 * @param bpmStatus
 * @returns {*}
 */
export function showDealBtn(bpmStatus){
  if(bpmStatus!="1"&&bpmStatus!="3"&&bpmStatus!="4"){
    return true;
  }
  return false;
}

/**
 * 增强CSS，可以在页面上输出全局css
 * @param css 要增强的css
 * @param id style标签的id，可以用来清除旧样式
 */
export function cssExpand(css, id) {
  let style = document.createElement('style')
  style.type = "text/css"
  style.innerHTML = `@charset "UTF-8"; ${css}`
  // 清除旧样式
  if (id) {
    let $style = document.getElementById(id)
    if ($style != null) $style.outerHTML = ''
    style.id = id
  }
  // 应用新样式
  document.head.appendChild(style)
}


/** 用于js增强事件，运行JS代码，可以传参 */
// options 所需参数：
//    参数名         类型            说明
//    vm             VueComponent    vue实例
//    event          Object          event对象
//    jsCode         String          待执行的js代码
//    errorMessage   String          执行出错后的提示（控制台）
export function jsExpand(options = {}) {

  // 绑定到window上的keyName
  let windowKeyName = 'J_CLICK_EVENT_OPTIONS'
  if (typeof window[windowKeyName] != 'object') {
    window[windowKeyName] = {}
  }

  // 随机生成JS增强的执行id，防止冲突
  let id = randomString(16, 'qwertyuioplkjhgfdsazxcvbnm'.toUpperCase())
  // 封装按钮点击事件
  let code = `
    (function (o_${id}) {
      try {
        (function (globalEvent, vm) {
          ${options.jsCode}
        })(o_${id}.event, o_${id}.vm)
      } catch (e) {
        o_${id}.error(e)
      }
      o_${id}.done()
    })(window['${windowKeyName}']['EVENT_${id}'])
  `
  // 创建script标签
  const script = document.createElement('script')
  // 将需要传递的参数挂载到window对象上
  window[windowKeyName]['EVENT_' + id] = {
    vm: options.vm,
    event: options.event,
    // 当执行完成时，无论如何都会调用的回调事件
    done() {
      // 执行完后删除新增的 script 标签不会撤销执行结果（已产生的结果不会被撤销）
      script.outerHTML = ''
      delete window[windowKeyName]['EVENT_' + id]
    },
    // 当js运行出错的时候调用的事件
    error(e) {
      console.group(`${options.errorMessage || '用户自定义JS增强代码运行出错'}（${new Date()}）`)
      console.error(e)
      console.groupEnd()
    }
  }
  // 将事件挂载到document中
  script.innerHTML = code
  document.body.appendChild(script)
}


/**
 * 重复值验证工具方法
 *
 * 使用示例：
 * { validator: (rule, value, callback) => validateDuplicateValue('sys_fill_rule', 'rule_code', value, this.model.id, callback) }
 *
 * @param tableName 被验证的表名
 * @param fieldName 被验证的字段名
 * @param fieldVal 被验证的值
 * @param dataId 数据ID，可空
 * @param callback
 */
export function validateDuplicateValue(tableName, fieldName, fieldVal, dataId, callback) {
  if (fieldVal) {
    let params = { tableName, fieldName, fieldVal, dataId }
    api.duplicateCheck(params).then(res => {
      res['success'] ? callback() : callback(res['message'])
    }).catch(err => {
      callback(err.message || err)
    })
  } else {
    callback()
  }
}

/**
 * 根据编码校验规则code，校验传入的值是否合法
 *
 * 使用示例：
 * { validator: (rule, value, callback) => validateCheckRule('common', value, callback) }
 *
 * @param ruleCode 编码校验规则 code
 * @param value 被验证的值
 * @param callback
 */
export function validateCheckRule(ruleCode, value, callback) {
  if (ruleCode && value) {
    value = encodeURIComponent(value)
    api.checkRuleByCode({ ruleCode, value }).then(res => {
      res['success'] ? callback() : callback(res['message'])
    }).catch(err => {
      callback(err.message || err)
    })
  } else {
    callback()
  }
}

/**
 * 如果值不存在就 push 进数组，反之不处理
 * @param array 要操作的数据
 * @param value 要添加的值
 * @param key 可空，如果比较的是对象，可能存在地址不一样但值实际上是一样的情况，可以传此字段判断对象中唯一的字段，例如 id。不传则直接比较实际值
 * @returns {boolean} 成功 push 返回 true，不处理返回 false
 */
export function pushIfNotExist(array, value, key) {
  for (let item of array) {
    if (key && (item[key] === value[key])) {
      return false
    } else if (item === value) {
      return false
    }
  }
  array.push(value)
  return true
}

/**
 * 可用于判断是否成功
 * @type {symbol}
 */
export const succeedSymbol = Symbol()
/**
 * 可用于判断是否失败
 * @type {symbol}
 */
export const failedSymbol = Symbol()

/**
 * 使 promise 无论如何都会 resolve，除非传入的参数不是一个Promise对象或返回Promise对象的方法
 * 一般用在 Promise.all 中
 *
 * @param promise 可传Promise对象或返回Promise对象的方法
 * @returns {Promise<any>}
 */
export function alwaysResolve(promise) {
  return new Promise((resolve, reject) => {
    let p = promise
    if (typeof promise === 'function') {
      p = promise()
    }
    if (p instanceof Promise) {
      p.then(data => {
        resolve({ type: succeedSymbol, data })
      }).catch(error => {
        resolve({ type: failedSymbol, error })
      })
    } else {
      reject('alwaysResolve: 传入的参数不是一个Promise对象或返回Promise对象的方法')
    }
  })
}

/**
 * 简单实现防抖方法
 *
 * 防抖(debounce)函数在第一次触发给定的函数时，不立即执行函数，而是给出一个期限值(delay)，比如100ms。
 * 如果100ms内再次执行函数，就重新开始计时，直到计时结束后再真正执行函数。
 * 这样做的好处是如果短时间内大量触发同一事件，只会执行一次函数。
 *
 * @param fn 要防抖的函数
 * @param delay 防抖的毫秒数
 * @returns {Function}
 */
export function simpleDebounce(fn, delay = 100) {
  let timer = null
  return function () {
    let args = arguments
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay)
  }
}

/**
 * 不用正则的方式替换所有值
 * @param text 被替换的字符串
 * @param checker  替换前的内容
 * @param replacer 替换后的内容
 * @returns {String} 替换后的字符串
 */
export function replaceAll(text, checker, replacer) {
  let lastText = text
  text = text.replace(checker, replacer)
  if (lastText !== text) {
    return replaceAll(text, checker, replacer)
  }
  return text
}

/**
 * 获取事件冒泡路径，兼容 IE11，Edge，Chrome，Firefox，Safari
 * 目前使用的地方：JEditableTable Span模式
 */
export function getEventPath(event) {
  let target = event.target
  let path = (event.composedPath && event.composedPath()) || event.path

  if (path != null) {
    return (path.indexOf(window) < 0) ? path.concat(window) : path
  }

  if (target === window) {
    return [window]
  }

  let getParents = (node, memo) => {
    memo = memo || []
    const parentNode = node.parentNode

    if (!parentNode) {
      return memo
    } else {
      return getParents(parentNode, memo.concat(parentNode))
    }
  }
  return [target].concat(getParents(target), window)
}

/**
 * 根据组件名获取父级
 * @param vm
 * @param name
 * @returns {Vue | null|null|Vue}
 */
export function getVmParentByName(vm, name) {
  let parent = vm.$parent
  if (parent && parent.$options) {
    if (parent.$options.name === name) {
      return parent
    } else {
      let res = getVmParentByName(parent, name)
      if (res) {
        return res
      }
    }
  }
  return null
}




/**
 * 使一个值永远不会为（null | undefined）
 *
 * @param value 要处理的值
 * @param def 默认值，如果value为（null | undefined）则返回的默认值，可不传，默认为''
 */
export function neverNull(value, def) {
  return value == null ? (neverNull(def, '')) : value
}

/**
 * 根据元素值移除数组中的一个元素
 * @param array 数组
 * @param prod 属性名
 * @param value 属性值
 * @returns {string}
 */
export function removeArrayElement(array, prod, value) {
  let index = -1
  for(let i = 0;i<array.length;i++){
    if(array[i][prod] == value){
      index = i;
      break;
    }
  }
  if(index>=0){
    array.splice(index, 1);
  }
}

/**
 * 休眠
 * @param ms 毫秒
 * @return {Promise<unknown>}
 */
export function sleep(ms) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, ms);
  });
}

/**
 * author xue
 * 根据字符串值 分割出图片类型 pdf类型数组 和其他文件类型数组路径
 * @param text
 */
export function getFileTypeArr(text) {
  let fileTypeArr={
    img:[],
    pdf:[],
    word:[],
    excel:[],
    other:[]
  }
  const imgType=['png', 'jpg', 'jpeg', 'bmp', 'gif', 'webp', 'psd', 'svg', 'tiff'];
  const pdfType = ['pdf'];
  const wordType = ['doc','docx'];
  const excelType = ['xls','xlsx'];
  if (!text){
    return fileTypeArr;
  }
  let temp=text.split(",");

  for (let item of temp){
    let index= item.lastIndexOf(".");
    // 获取后缀
    let ext = item.substr(index+1);
    if (imgType.indexOf(ext.toLowerCase()) !== -1){
      // 如果是图片类型
      fileTypeArr.img.push(item);
    }else if (pdfType.indexOf(ext.toLowerCase()) !== -1){
      // 如果 pdf 类型
      fileTypeArr.pdf.push(item);
    }else if (wordType.indexOf(ext.toLowerCase()) !== -1){
      // 如果 word类型
      fileTypeArr.word.push(item);
    }else  if (excelType.indexOf(ext.toLowerCase()) !== -1){
      // 如果 excel类型
      fileTypeArr.excel.push(item);
    }else{
      // 其他
      fileTypeArr.other.push(item);
    }
  }

  return fileTypeArr;
}

/**
 * xue
 * 日期字符串 转简体中文  2021-05-21格式
 * @param date
 * @returns {string}
 * @constructor
 */
export function CNDateString(date) {
  var cn = ["〇","一","二","三","四","五","六","七","八","九","十","十一","十二"];
  var s = [];
  var YY = date.getFullYear().toString();
  for (var i=0; i<YY.length; i++)
    if (cn[YY.charAt(i)])
      s.push(cn[YY.charAt(i)]);
    else
      s.push(YY.charAt(i));
  s.push("年 ");
  var MM = date.getMonth()+1;
  s.push(cn[MM]);
  s.push("月 ");
  var DD = date.getDate();
  if (DD<=10)
    s.push(cn[DD]);
  else if (DD<20)
    s.push("十" + cn[DD% 10]);
  else if (DD==20)
    s.push("二十");
  else
    s.push("二十" + cn[DD% 10]);
  s.push("日");
  return s.join('');
}


/**
 * 校验json 格式是否正确
 * @param jsonContent
 * @param callback
 * @returns {{msg: number, error_code: string}}
 */
export function isJSON(jsonContent,callback) {
  try {
    let obj=JSON.parse(jsonContent);
    callback();
  } catch(e) {
    callback("JSON格式错误")
  }
};

/**
 * 校验json 格式是否正确
 * @param jsonContent
 * @param callback
 * @returns {boolean}
 */
export function isJSONToBoole(jsonContent) {
  try {
    let obj=JSON.parse(jsonContent);
   return true;
  } catch(e) {
    return false;
  }
};


/**
 * 查询系统变量记录表的 所有非后端类型的变量数据，并加入localStorage中
 * 该方法在第一次在登录时被调用login.vue  getVariableList();
 */
export function getVariableList() {
  return new Promise((resolve, reject) => {
    api.getFrontTypeList().then(res=>{
      if (res.success){
        let dataArr =  res.result;
        let dataObj={};
        dataArr.forEach(item=>{
          dataObj[item.code]=item.json;
        })
        localStorage.setItem("variableList", JSON.stringify(dataObj));
        resolve();
      } else {
        reject(res);
      }
    }).catch(err => {
      reject(err);
    });
  });

};

/**
 * 根据code 从系统变量缓存中拿到系统变量表的值
 */
export function getVariableByCode(code) {
  let dataObj =  JSON.parse(localStorage.getItem("variableList"));
  if (!dataObj){
    return null;
  }
  let data = dataObj[code];
  if (data.indexOf('{')> -1 || data.indexOf('[')> -1){
    data=JSON.parse(data);
  }
  return data;
};

/**
 * 获取当前用户的权限列表
 * @returns {*[]}
 */
export function getUserHavePermission(){
  let permissionList = [];
  let authList = JSON.parse(sessionStorage.getItem(USER_AUTH) || "[]");
  for (let auth of authList) {
    if(auth.type != '2') {
      permissionList.push(auth);
    }
  }
  return permissionList;
}

/**
 * 检查当前用户是否 拥有某个权限
 * @returns {boolean}
 */
export function checkUserHavePermission(code){
  let authList = JSON.parse(sessionStorage.getItem(USER_AUTH) || "[]");
  for (let auth of authList) {
    if(auth.type != '2' && auth.action == code) {
      return true;
    }
  }
  return false;
}

/**
 * http://192.168.152.10:6080/arcgis/rest/services/GTKJ/ztgh/MapServer/0/query?f=json&where=1=1&outFields=*&returnGeometry=false
 * @param url 请求图层的地址 ：http://192.168.152.10:6080/arcgis/rest/services/GTKJ/ztgh/MapServer/0
 * @param where 查询条件 ：(字段名 like "")
 * @param returnGeometry  是否返回区块坐标
 * @param attribute  all  则是全部数据
 * return {
 *   features:"返回的数据 数组"
 *   fieldAliases： {   // "字段名和别名 对象"
 *     "YDDM": "用地代码",
 *     "YDMC": "用地名称",
 *     "BH": "编号",
 * }
 *   fields "字段名和别名 字段类型的 数组"
 * }
 */
export function getLayerQuery(url,attribute="fields",where='1=1',returnGeometry=false){
  let queryUrl = `${url}/0/query?f=json&outFields=*&where=${where}&returnGeometry=${returnGeometry}`
  return new Promise((resolve) => {
    mapGetAction(queryUrl).then(res=>{
      if (attribute != 'all'){
        resolve(res[attribute])
        return
      }
      resolve(res)
    })
  })


}