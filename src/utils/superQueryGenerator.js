/**
 * 条件映射
 * @type {{and: string, or: string}}
 */
const queryTypeMap = {
  'and': 'SuperQuery.QueryType.and',
  'or': 'SuperQuery.QueryType.or'
};

/**
 * 字段类型映射
 * @type {{String: string, Int: string, DateTime: string, Date: string}}
 */
const fieldTypeMap = {
  'string': 'SuperQuery.FieldType.String',
  'int': 'SuperQuery.FieldType.Int',
  'bigdecimal': 'SuperQuery.FieldType.Int',
  'datetime': 'SuperQuery.FieldType.DateTime',
  'date': 'SuperQuery.FieldType.Date'
};

// 步骤2.3：映射查询规则（rule → SuperQuery.FieldRule）
const fieldRuleMap = {
  'eq': 'SuperQuery.FieldRule.等于',
  'ne': 'SuperQuery.FieldRule.不等于',
  'gt': 'SuperQuery.FieldRule.大于',
  'ge': 'SuperQuery.FieldRule.大于等于',
  'lt': 'SuperQuery.FieldRule.小于',
  'le': 'SuperQuery.FieldRule.小于等于',
  'like': 'SuperQuery.FieldRule.包含',
  'right_like': 'SuperQuery.FieldRule.以xx开始',
  'left_like': 'SuperQuery.FieldRule.以xx结尾',
  'in': 'SuperQuery.FieldRule.在xx中'
};

/**
 * 根据高级查询字符串 规则 返回对应的前端代码构造（代码生成）
 * @param str
 */
function getSuperQueryCode(str){
  const decodedStr = decodeURI(str);
  // 步骤1.1：拆分字符串为 key=value 键值对（按 & 分割）
  const [superQueryParamsStr, superQueryMatchTypeStr] = decodedStr.split('&');
// 步骤1.2：提取 superQueryParams 的 JSON 内容（去掉前缀 "superQueryParams="）
  const paramsJsonStr = superQueryParamsStr.replace('superQueryParams=', '');
  const queryItems = JSON.parse(paramsJsonStr); // 解析为数组：[{"rule":"ge","type":"Date","val":"${date}","field":"createTime"}]

  // 步骤1.3：提取 superQueryMatchType 的值（去掉前缀 "superQueryMatchType="）
  const matchType = superQueryMatchTypeStr.replace('superQueryMatchType=', ''); // 结果："and"

  let mappedQueryType = queryTypeMap[matchType];

  let queryItemCode ="";

  let length = queryItems.length;
  for (let i = 0; i < length; i++) {
    let item = queryItems[i];
    // 字段规则 SuperQuery.FieldRule.等于
    let fieldRule = fieldRuleMap[item.rule];
    // 字段类型 SuperQuery.FieldType.DateTime
    console.log("类型",item)
    let fieldType = fieldTypeMap[item.type.toLowerCase()];
    // 字段值
    let fieldValue = item.val;
    // 字段名
    let fileldName = item.field;
    queryItemCode += `SuperQuery.queryItem("${fileldName}","${fieldValue}",${fieldType},${fieldRule})${(i<length-1)? ",":""}\n`
  }

  // 步骤3.2：拼接完整的 getSuperQuery 调用代码
  return `SuperQuery.getSuperQuery(
  ${mappedQueryType},
  ${queryItemCode}
  )`;
}

/**
 * superQueryList=%5B%7B%22superQueryParams%22:%22%5B%7B%5C%22rule%5C%22:%5C%22eq%5C%22,%5C%22type%5C%22:%5C%22String%5C%22,%5C%22val%5C%22:%5C%221%5C%22,%5C%22field%5C%22:%5C%22createBy%5C%22%7D%5D%22,%22superQueryMatchType%22:%22and%22%7D,%7B%22superQueryParams%22:%22%5B%7B%5C%22rule%5C%22:%5C%22eq%5C%22,%5C%22type%5C%22:%5C%22String%5C%22,%5C%22val%5C%22:%5C%2211%5C%22,%5C%22field%5C%22:%5C%22lx%5C%22%7D%5D%22,%22superQueryMatchType%22:%22and%22%7D%5D&superQueryListType=and
 * 负责的高级查询的代码生成
 * @param str
 */
function getSuperQueryListCode(str){
  const decodedStr = decodeURI(str);
  // 步骤1.1：拆分字符串为 key=value 键值对（按 & 分割）
  const [superQueryParamsStr, superQueryMatchTypeStr] = decodedStr.split('&');

  const paramsJsonStr = superQueryParamsStr.replace('superQueryList=', '');
  const matchType = superQueryMatchTypeStr.replace('superQueryListType=', ''); // 结果："and"
  let mappedQueryType = queryTypeMap[matchType];

  const queryItems = JSON.parse(paramsJsonStr);

  let queryItemCode ="";

  let length = queryItems.length;

  for (let i = 0; i < queryItems.length; i++) {
    const item = queryItems[i];
    let superQueryStr = encodeURI( `superQueryParams=${item.superQueryParams}&superQueryMatchType=${item.superQueryMatchType}`)
    superQueryStr = getSuperQueryCode(superQueryStr);

    queryItemCode +=`${superQueryStr}${(i<length-1) ? ",":""}\n`
  }

  // 步骤3.2：拼接完整的 getSuperQuery 调用代码
  return `SuperQuery.getSuperQueryList(
        ${mappedQueryType},
        ${queryItemCode}\n);`;
}

/**
 * 高级查询的代码生成 根据配置的字符串
 * @param str
 * @returns {string}
 */
export function convertToSuperQueryCode(str){
  if (!str){
    return ''
  }
  // 负责大高级查询
  if (str.includes('superQueryListType')) {
     return getSuperQueryListCode(str)
  }else if (str.includes('superQueryParams=')){
    return  getSuperQueryCode(str);
  }
  return "";
}
