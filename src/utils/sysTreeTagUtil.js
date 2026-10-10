// import { getAction, deleteAction, putAction, postAction, httpAction } from '@/api/manage'
import { getSystemTreeList } from "@api/api"

import JDate from '@/components/jeecg/JDate';
import ATextarea from 'ant-design-vue/es/input/TextArea'
import AInputNumber from 'ant-design-vue/es/input-number/index'
import JUpload from '@/components/jeecg/JUpload'
import ASwitch from 'ant-design-vue/es/switch'
import JSelectUserByDep from '@/components/jeecgbiz/JSelectUserByDep'
import commePopup from '@comp/ChoiceSelector/commePopup'
import layerFieldList from "@comp/ChoiceSelector/layerFieldList";

import JSelectDepart from '@comp/jeecgbiz/JSelectDepart'
import JSelectRole from '@comp/jeecgbiz/JSelectRole'

import ColorPicker from "@comp/ChoiceSelector/ColorPicker";
import JImageUpload from '@comp/jeecg/JImageUpload';
import { getAction } from '@api/manage'

// SysTreeTag 组件的节点类型
export const nodeType ={
  'leaf':{
    name:"节点类型",
    value:"0",
    filter:false
  },
  'menu':{
    name:"菜单类型",
    value:"1",
    filter:false
  },
  'button':{
    name:"按钮类型",
    value:"2",
    filter:true
  }
}
//  DynamicFields 组件新增某些固定类型类型 列表
export const fixedFieldList=[
  {
    zName:"按钮编码前缀与开关",
    data:[
      {
        zName:'按钮编码前缀',
        yName:"prefix",
        type:'1',
        component:"",
        componentPara:"",
        editable:true,
        hasTargetId:false,
      },
      {
        zName:'是否打开',
        yName:"open",
        type:'5',
        component:"",
        componentPara:"",
        editable:true,
        hasTargetId:false,
      },
    ]
  },

]


// 成果目录的菜单code
export const menuZtLayerCode ="menu_zt_layer";
// 角色用户菜单code
export const menuSysRoleAndUserCode ="menu_sys_role";
// 系统变量表分类菜单
export const menuSysVariableCode ="sys_Variable";

// 素材场景分类
export const marketSceneCode ="market_scene";
//echarts 的分类菜单
export const echartsCode ="echarts_code";

/**
 * 组件类型
 * */
export const componentMappings = {
  "0": { name:"自定义组件选择", component:commePopup },
  "1": { name:"文本", component:ATextarea },
  "2": { name:"时间", component:JDate },
  "3": { name:"数字", component:AInputNumber },
  "4": { name:"文件上传", component:JUpload },
  "5": { name:"开关(是/否)", component:ASwitch },
  "6": { name:"用户选择", component:JSelectUserByDep },
  "7": { name:"图层列表", component:layerFieldList },
  "8": { name:"颜色选择", component:ColorPicker },
  "9": { name:"图片上传", component:JImageUpload },
  "10": { name:"组件选择器", component:() => import('@comp/ChoiceSelector/componentTypeSelect') },
  "11":{ name:"菜单选择器", component:() => import('@views/resultMenu/InputRouteMenu') },
  "JSelectDepart":{name:"部门选择器",component:JSelectDepart},
  "JSelectRole":{name:"角色选择器",component:JSelectRole},
  "JCodeEditor":{name:"代码输入框",component:() => import('@/components/jeecg/JCodeEditor')},
  "SelectTable":{name:"表名选择器",component:() => import('@comp/common/editComponent/SelectTable')},
  // 1.系统表：参数规则 {"code":"","tableName":"sys_tag","showName":"name","storageName":"id","where":"template_code='menu_sys_role'","placeholder":"选择分类菜单","type":"list"}
  // 2.普通字典规则： {"code":"superQuery_yh","type":"radioButton"}  type调整样式
  "ztDictSelectTag":{
    name:"字典选择器(有参数)",
    param:'{"code-字典编码":"1","tableName-表名":"SelectTable","showName-显示的字段名称":"1","storageName-存储的字段名称":"1","where-查询条件":"1","placeholder-下拉选提示标题":"1","type-样式-{\\"mode\\":\\"default\\",\\"list\\":[{\\"name\\":\\"单选按钮\\",\\"value\\":\\"radioButton\\"},{\\"name\\":\\"下拉选\\",\\"value\\":\\"list\\"}]}":"selectArr"}',
    component:() => import('@comp/common/ZtDictSelectTag')
  },
  // 1.{"dictValues":"1,2,3"}
  "selectArr":{
    name:"字符串数组(有参数)",
    param:'{"mode-类型-{\\"mode\\":\\"default\\",\\"list\\":[{\\"name\\":\\"单选\\",\\"value\\":\\"default\\"},{\\"name\\":\\"多选\\",\\"value\\":\\"multiple\\"},{\\"name\\":\\"多选可追加\\",\\"value\\":\\"tags\\"}]}":"selectArr","list-字典列表":[{"name-名称":"1","value-值":"1"}]}',
    component:() => import('@comp/common/editComponent/SelectArr')
  },
};

// 引用位置有SysTreeTag
export function getComponentByType(type) {
  return componentMappings[type];
}
// commePopup 组件导入的动态组件位置
export const commePopupMappings = {
  resultMenuList: () => import('@views/resultMenu/resultMenuList'),  // { "field":"id","isRadio":true }
  listJsonEdit:() => import('@comp/ChoiceSelector/listJsonEdit'),
  ObjJsonEdit:() => import('@comp/ChoiceSelector/objJsonEdit'),
  layerFieldList:() => import('@comp/ChoiceSelector/layerFieldList'),
  YzLayerFieldList:() => import('@comp/ChoiceSelector/YzLayerFieldList'),
};

/**
 * 下拉选择 json 编辑组件
 * @type {{listJsonEdit: {name: string, Component: (function(): Promise<{readonly default?: {data(): {columns: [], isEdit: boolean, oneData: {}, analysisParameter: [], dataSource: []}, watch: {parameter: {handler(*, *): void, immediate: boolean}, dataSource: {handler(*, *): void, deep: boolean}}, created(): void, methods: {initParameter(): void, createColumns(): void, edit(): void, handleChangeIndex(*, *, *): void, initDataSource(*): void, getComponent(*): *, addRow(): void, saveRowIndex(*): void, handleDelete(*): void}, name: string, props: {parameter: {type: Object | ObjectConstructor, required: boolean}, type: {default: boolean, type: Boolean | BooleanConstructor, required: boolean}, value: {validator: function(*): boolean}}}}>)}, ObjJsonEdit: {name: string, Component: (function(): Promise<{readonly default?: {components: {listJsonEdit: {data(): {columns: [], isEdit: boolean, oneData: {}, analysisParameter: [], dataSource: []}, watch: {parameter: {handler(*, *): void, immediate: boolean}, dataSource: {handler(*, *): void, deep: boolean}}, created(): void, methods: {initParameter(): void, createColumns(): void, edit(): void, handleChangeIndex(*, *, *): void, initDataSource(*): void, getComponent(*): *, addRow(): void, saveRowIndex(*): void, handleDelete(*): void}, name: string, props: {parameter: {type: Object | ObjectConstructor, required: boolean}, type: {default: boolean, type: Boolean | BooleanConstructor, required: boolean}, value: {validator: function(*): boolean}}}}, data(): {ObjValue: {}, wIndex: number, isFirstChange: boolean}, watch: {ObjValue: {handler(*, *): void, immediate: boolean}, parameter: {handler(*, *), immediate: boolean}, value: {handler(*, *): void, immediate: boolean}}, created(): void, methods: {checkType(*): (string|*), handleSubmit(): string, initObjValue(): void, getMyComponentByType(*): *}, name: string, props: {parameter: {type: Object | ObjectConstructor, required: boolean}, isJsonString: {default: boolean, type: Boolean | BooleanConstructor, required: boolean}, value: {validator: function(*): boolean}}}}>)}}}
 */
export const jsonComponentMap = {
  listJsonEdit:{
    Component:() => import('@comp/ChoiceSelector/JsonParamEdit'),
    name:"list编辑组件"
  },
  // ATextarea
  ObjJsonEdit:{
     Component:() => import('@comp/ChoiceSelector/JsonParamEdit'),
    // Component:ATextarea,
    name:"obj编辑组件"
  }
};


// commePopup 组件导入的动态组件位置
export const treeTagCardPopupMappings = {
  SysTreeTagFrom:() => import('@comp/common/SysTreeTagFrom')
};
// commePopup 组件传递参数的方法
const comParaClass  = (()=>{
  let comParam ={};
  return {
    getParam:()=>{
      console.log("getParam",comParam)
      return comParam;
    },
    setParam:(value)=>{
      comParam = value;
      console.log("setParam",comParam)
    }
  }
})();
export const getCommParam  =comParaClass.getParam;
export const setCommParam  =comParaClass.setParam;



/**
 *
 * @param tree  list 的树结构
 * @param key  根据什么做map的key值
 * @returns {Map<any, any>}
 */
export function flattenTreeToMap(tree,key='templateId') {
  let map = new Map();
  function traverse(nodeList) {
    console.log("===nodeList===",nodeList)
    if (!nodeList){
      return;
    }
    nodeList.forEach(node=>{
      if (node.hasChild!='1'){
        map.set(node[key],node);
      }
      if (node.children) {
        traverse(node.children);
      }
    })

  }
  traverse(tree);
  return map;
}

/**
 * 获取系统配置 结构转化成List
 * @returns {Promise<unknown>}
 */
export function getTreeSystem(){
  return new Promise((resolve, reject) => {
    getSystemTreeList().then(res=>{
      if (res.success){
        resolve(res.result);
      }else {
        reject(res)
      }
    })
  })
}

/**
 * 获取系统配置 结构转化成map
 * @returns {Promise<unknown>}
 */
export function getTreeSystemToMap(key='childCode'){
  return new Promise((resolve, reject) => {
    getSystemTreeList().then(res=>{
      if (res.success){
        let map  = flattenTreeToMap(res.result,key)
        resolve(map);
      }else {
        reject(res)
      }
    })
  })
}



/**

 *  请求示例
 *        let str = SuperQuery.getSuperQuery(
 *         SuperQuery.QueryType.and,   //  查询类型 下发所有都满足and  下发任何一条满足 OR
 *         SuperQuery.queryItem("hasChild","0",SuperQuery.FieldType.String,SuperQuery.FieldRule.等于),  // 构造查询项1  可构造n个查询项  字段名 是驼峰命名的不是_
 *       )
 *       queryWrapperTreeList({
 *           code:"bxlcCode",
 *           superQueryStr:"?"+str,
 *           fieldMap:'{"isSelect":true}',
 *           type:"or",
 *       }).then(res=>{
 *         console.log("======111=>",res)
 *       })
 *
 *  参数解释：
 *  config{
 *   code:"",
 *   superQueryStr:"",
 *   fieldMap:'{"isSelect":true}',
 *   type:"or",
 *  }
 * @param config.code  树结构code
 * @param config.superQueryStr   高级查询str(可不传)
 * @param config.fieldMap   ({"isSelect":true})
 * @param config.type       or 或者 and
 * @returns {Promise<unknown>}
 */
export function queryWrapperTreeList(config){
  return new Promise((resolve, reject) => {
    if (!config.code){
      reject("code 必填")
      return;
    }
    if (!config.superQueryStr){
      config.superQueryStr = "";
    }
    if(config.type!=='or'){
      config.type='and';
    }
    getAction(`/sys/sysTreeTag/queryWrapperTreeList${config.superQueryStr}`,{templateCode:config.code,"fieldJson":config.fieldMap,"jsonType":config.type}).then(res=>{
      resolve(res);
    }).catch((err)=>{
      reject(err);
    })
  });
}




/**
 * 根据目标id 获取系统配置的一项
 * @param id
 * @returns {Promise<unknown>}
 */
export function getTreeItemByTargetId(id){
  let code = "pcSystem";
  let url=`sys/sysTreeTag/queryByTargetIdAndtemplateCode?templateCode=${code}&targetId=${id}`;
  return new Promise((resolve, reject) => {
    getAction(url).then(res=>{
      if (res.success && res.result!=null){
        resolve(res.result)
      }else {
        reject(res)
      }
    })
  });

}

/**
 * 数组顺序的移动  返回新数组 不改变原数组
 * @param arr  数组
 * @param a 要移动的元素下标
 * @param b 移动的位置
 * @returns {*[]}
 * @constructor
 */
export function copyArrMove(arr, a, b) {
  let arr_temp = [].concat(arr);
  arr_temp.splice(b, 0, arr_temp.splice(a, 1)[0]);
  return arr_temp;
}

/**
 * 数组顺序的移动
 * @param arr  数组
 * @param a 要移动的元素下标
 * @param b 移动的位置
 * @returns {*[]}
 * @constructor
 */
export function arrMove(arr, a, b) {
  let arr_temp = arr;
  arr_temp.splice(b, 0, arr_temp.splice(a, 1)[0]);
  return arr_temp;
}

/**
 * 得到传入的值的类型
 * @param obj
 * @returns {string}
 */
export function getValueType(obj) {
  if (obj === undefined || obj === null) {
    return 'undefined';
  } else if (typeof obj === 'boolean') {
    // 布尔类型
    return 'boolean';
  }
  if (Array.isArray(obj)){
    return 'array'
  }
  if (typeof obj.toString === 'function' && obj.toString() !== '') {
    // 字符串类型
    return typeof obj;
  }
  // 其他类型
  return typeof obj;
}