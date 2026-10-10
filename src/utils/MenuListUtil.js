import { postAction } from '@api/manage'
/**
 *
 * @param templateCode
 * @param type  0树 1是列表
 */
export function queryTreeTableList(templateCode,type,typeCode,params={},pid='0'){
  if (typeCode==null){
    typeCode = templateCode;
  }
  let url = `sysMenu/sysTag/queryTreeTableList?templateCode=${templateCode}&type=${type}&typeCode=${typeCode}&id=${pid}`;
  return new Promise((resolve, reject)=>{
    postAction(url,params).then((res) => {
      if (res.success && res.result) {
        resolve(res.result)
      }else {
        reject(res);
      }
    })
  })

}

/**
 * 获取树状 不包括关联表
 * @param code
 * @param pid
 * @returns {Promise<unknown>}
 */
export function queryTreeList(code,pid='0') {
  let url = `sysMenu/sysTag/queryTreeList?templateCode=${code}&id=${pid}`;
  return new Promise((resolve, reject)=>{
    postAction(url).then((res) => {
      if (res.success && res.result) {
        resolve(res.result)
      }else {
        reject(res);
      }
    })
  })
}

/**
 * 获取树状 不包括关联表(无需登录获取)
 * @param code
 * @param pid
 * @returns {Promise<unknown>}
 */
export function queryTreeListNotToken(code,pid='0') {
  let url = `sysMenu/sysTag/notToken/queryTreeList?templateCode=${code}&id=${pid}`;
  return new Promise((resolve, reject)=>{
    postAction(url).then((res) => {
      if (res.success && res.result) {
        resolve(res.result)
      }else {
        reject(res);
      }
    })
  })
}