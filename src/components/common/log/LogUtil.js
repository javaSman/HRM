import { getAction } from '@api/manage';
// 获取字典的
import {ajaxGetDictItems } from '@api/api'

/**
 * 根据表名 和数据id 查询数据变化日志
 * @param tableName
 * @param id
 * @param type
 * @returns {Promise<unknown>}
 */
export function getDataLog(tableName,id,type='json'){
  let url=`sys/dataLog/queryDataVerList?dataTable=${tableName}&dataId=${id}&type=${type}`;
  return new Promise((resolve, reject) => {
    getAction(url).then(res=>{
      if (res.success){
        resolve(res.result || [])
      }else {
        reject(res)
      }
    })
  });
}

/**
 * 根据表名和id  查询数据变化情况
 * @param tableName
 * @param id
 */
export function getDataChangLog(tableName,id){
  return new Promise((resolve, reject) => {
    getDataLog(tableName,id).then(dataArr=>{
      // 如果只有一条以下的数据证明数据无变化
      if (dataArr.length<=1){
        resolve([]);
        return;
      }
      dataArr = dataArr.sort((a,b) =>  a.dataVersion-b.dataVersion );
      dataArr.forEach(item => item['dataContent']= JSON.parse(item['dataContent']))


      let changeArr=[];
      for (let i = 0; i < dataArr.length-1; i++) {
        let preItem =dataArr[i];  // 前一个 （ 假设：版本1）
        let afterItem =dataArr[i+1]; // 后一个（ 假设：版本2）
        let preContent =preItem.dataContent;
        let afterContent =afterItem.dataContent;

        let changeData={};
        for (let key in preContent) {
          changeData[key]={
            yValue:preContent[key],
            cValue:afterContent[key],
            isChange:preContent[key]!==afterContent[key]
          }
        }

         let item ={
           createBy:preItem.createBy,
           createTime:preItem.createTime,
           changeData:changeData
         }
        changeArr.push(item);
      }

      resolve(changeArr);
    }).catch(e=>{
      reject(e)
    })
  });

}

/**
 * 筛选数据 加无改变的字段过滤 全部无改变数据也过滤
 * @param tableName
 * @param id
 */
export function screenDataChangLog(tableName,id){
  return new Promise((resolve, reject) => {
    getDataChangLog(tableName,id).then(changeArr=>{
      // changeData
      let arr = [];
      for (let i = 0; i < changeArr.length; i++) {
        let item = changeArr[i];
        let data = item.changeData;
        for (let key in data) {
          if (data[key].isChange){
            continue;
          }
          delete data[key];
        }
        // 如果对象还存在属性
        if (Object.keys(data).length > 0) {
          arr.push(item);
        }
      }

      resolve(arr)
    }).catch(e=>{
      reject(e)
    })
  });
}

/**
 * 根据字典值获取 {
 *   0：aa
 *   1:bb
 * }格式字典
 * @param code
 */
export function getDictObjByCode(code){
  return new Promise((resolve, reject) => {
    ajaxGetDictItems(code).then(res=>{
      let tempObj = {};
      if (res.success && res.result){
        let arr = res.result;

        for (let index in arr) {
          let item = arr[index];
          tempObj[item.value] = item.text;
        }
      }
      resolve(tempObj);
    })
  })
}