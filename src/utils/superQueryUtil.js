
/**
 * 高级查询字段类型
 * @type {{or: string, and: string}}
 */
const QueryType={
  and:'and',
  or:'or'
}
/**
 * 字段的字段类型
 * @type {{String: string, Int: string, DateTime: string, Date: string}}
 */
const FieldType={
  String:"String",
  Int:"int",
  DateTime:"datetime",
  Date:"date"
}
/**
 * 字段的查询规则
 * @type {{大于等于: string, 小于: string, 不等于: string, 以xx开始: string, 等于: string, 小于等于: string, 大于: string, 包含: string, 以xx结尾: string}}
 */
const FieldRule={
  等于:"eq",
  不等于:"ne",
  大于:"gt",
  大于等于:"ge",
  小于:"lt",
  小于等于:"le",
  包含:"like",
  以xx开始:"right_like",
  以xx结尾:"left_like",
  在xx中:'in'
}

/**
 * 返回多个 一种查询类型的 的查询项
 * @param field   字段驼峰命名
 * @param value  字段值
 * @param type  字段类型 SuperQuer.FieldType
 * @param rule 字段规则 SuperQuery.FieldRule
 * @returns {{val, field, rule, type}}
 */
function queryItem(field,value,type,rule){
  return {"rule":rule,"type":type,"val":value,"field":field};
}

/**
 * 返回多个 一种查询类型的 的查询项
 * @param field   字段驼峰命名
 * @param values  字段值 数组
 * @param type: 字段类型 SuperQuer.FieldType
 * @param rule: 字段规则 SuperQuery.FieldRule
 * @returns {*[]}
 */
function queryItems(field,values,type,rule){
  let arr= [];
  values.forEach(value=>{
    let one = queryItem(field,value,type,rule);
    arr.push(one);
  })
  return arr;
}

/**
 * 得到一个简单的高级查询项
 * @param queryType
 * @param arr
 * @returns {{superQueryMatchType, superQueryParams: string}}
 */
function getSuperQueryObj(queryType,...arr){
  let paramsArr=[];
  arr.forEach(oneObj=>{
    // 如果是一个数组
    if (Array.isArray(oneObj)) {
      paramsArr = paramsArr.concat(oneObj)
    } else {
      // 是个对象
      paramsArr.push(oneObj);
    }
  })
  let paramsStr = JSON.stringify(paramsArr);
  let obj={
    superQueryParams:paramsStr,
    superQueryMatchType:queryType
  }
  // let superQueryParams = `superQueryParams=${paramsStr}&superQueryMatchType=${queryType}`;
  return  obj;
}

/**
 * 简单高级查询
 * SuperQuery  构造高级查询的对象
 *  1、导入    import {SuperQuery} from '@/utils/superQueryUtil'
 *  2、使用示例：（查询某个字段时间 大于等于某个时间 并且满足 字段小于另一个时间的查询）
 let str = SuperQuery.getSuperQuery(
 SuperQuery.QueryType.and,   //  查询类型 下发所有都满足and  下发任何一条满足 OR
 SuperQuery.queryItem("字段名","字段值",SuperQuery.FieldType.DateTime,SuperQuery.FieldRule.大于等于),  // 构造查询项1  可构造n个查询项
 SuperQuery.queryItem("字段名","字段值",SuperQuery.FieldType.DateTime,SuperQuery.FieldRule.小于), // 构造查询项2
 )
 * 3、调用接口的请求地址拼接上 生成的 str
 * @param queryType:SuperQuery.queryType
 * @param arr:SuperQuery.queryItem 或者 SuperQuery.queryItems 构造
 * @returns {string}
 */
function getSuperQuery(queryType,...arr){
  let superQueryObj = getSuperQueryObj(queryType,...arr)
  let superQueryParams = `superQueryParams=${superQueryObj.superQueryParams}&superQueryMatchType=${superQueryObj.superQueryMatchType}`;
  return  encodeURI(superQueryParams);
}


/**
 *  嵌套 复杂高级查询使用
 *  1、导入    import {SuperQuery} from '@/utils/superQueryUtil'
 *  2、使用示例：
 * let str = SuperQuery.getSuperQueryList(
 *   SuperQuery.QueryType.and,
 *   SuperQuery.getSuperQueryObj(
 *     SuperQuery.QueryType.or,   //  查询类型 下发所有都满足and  下发任何一条满足 OR
 *     SuperQuery.queryItem("createBy","kfadmin",SuperQuery.FieldType.String,SuperQuery.FieldRule.等于),  // 构造查询项1  可构造n个查询项
 *     SuperQuery.queryItem("createBy","zhangsan",SuperQuery.FieldType.String,SuperQuery.FieldRule.等于), // 构造查询项2
 *   ),
 *   SuperQuery.getSuperQueryObj(
 *     SuperQuery.QueryType.and,   //  查询类型 下发所有都满足and  下发任何一条满足 OR
 *     SuperQuery.queryItem("createTime","2023-12-25 00:00:00",SuperQuery.FieldType.DateTime,SuperQuery.FieldRule.大于等于),  // 构造查询项1  可构造n个查询项
 *     SuperQuery.queryItem("createTime","2023-12-26 00:00:00",SuperQuery.FieldType.DateTime,SuperQuery.FieldRule.小于), // 构造查询项2
 *   ),
 * )
 * 3、调用接口的请求地址拼接上 生成的 str
 * @param queryType
 * @param arr
 * @returns {string}
 */
function getSuperQueryList(queryType,...arr){
  let paramsStr = JSON.stringify(arr);
  let superQueryParams = `superQueryList=${paramsStr}&superQueryListType=${queryType}`;
  return  encodeURI(superQueryParams);
}

/**
 * 简单高级查询：SuperQuery.getSuperQuery  // 参照上方示例
 * 复杂嵌套的高级查询：SuperQuery.getSuperQueryList  // 参照上方示例
 * @type {{getSuperQuery: (function(*, ...[*]): string), queryItem: (function(*, *, *, *): {val: *, field: *, rule: *, type: *}), getSuperQueryObj: (function(*, ...[*]): {superQueryMatchType, superQueryParams: string}), FieldRule: {大于等于: string, 小于: string, 不等于: string, 以xx开始: string, 等于: string, 小于等于: string, 大于: string, 包含: string, 以xx结尾: string}, queryItems: (function(*, *, *, *): *[]), QueryType: {or: string, and: string}, FieldType: {String: string, Int: string, DateTime: string, Date: string}, getSuperQueryList: (function(*, ...[*]): string)}}
 */
export const SuperQuery={
  FieldType,
  FieldRule,
  QueryType,
  queryItem,
  queryItems,
  getSuperQuery,
  getSuperQueryObj,
  getSuperQueryList
}
