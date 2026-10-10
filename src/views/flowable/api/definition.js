import {axios as request} from '@/utils/request'

// 查询流程定义列表
export function listDefinition(query) {
  return request({
    url: '/flowable/definition/list',
    method: 'get',
    params: query,
    timeout: 30000 // 设置该请求的超时时间为15秒
  })
}

// 部署流程实例,流程定义id
export function definitionStartByDefId(procDefId,data) {
  return request({
    url: '/flowable/definition/startByProcDefId/' + procDefId,
    method: 'post',
    data: data
  })
}


// 部署流程实例，流程定义key
export function definitionStartByDefKey(procDefKey,data) {
  return request({
    url: '/flowable/definition/startByProcDefKey/' + procDefKey,
    method: 'post',
    data: data
  })
}
// 部署流程实例,业务数据dataid

export function definitionStartByDataId(dataId,selectFlowId,serviceName,data) {
  return request({
    url: '/flowable/definition/startByDataId/' + dataId + '/' + selectFlowId + '/' + serviceName,
    method: 'post',
    data: data
  })
}

// 查询当前节点是否是属于退回或驳回的第一个发起人节点,业务数据dataid

export function isFirstInitiator(dataId,data) {
  return request({
    url: '/flowable/task/isFirstInitiator/' + dataId,
    method: 'post',
    data: data
  })
}

// 删除自定义业务任务关联表与流程历史表
//以便可以重新发起流程,业务数据dataid

export function deleteActivityAndJoin(dataId,data) {
  return request({
    url: '/flowable/task/deleteActivityAndJoin/' + dataId,
    method: 'post',
    data: data
  })
}

// 部署流程实例,online数据dataid

export function definitionStartByOnlineDataId(dataId,onlineId,deployId,data) {
  return request({
    url: '/flowable/definition/startByOnlineDataId/' + dataId + '/' + onlineId + '/' + deployId,
    method: 'post',
    data: data
  })
}

// 获取流程变量
export function getProcessVariables(taskId) {
  return request({
    url: '/flowable/task/processVariables/' + taskId,
    method: 'get'
  })
}

// 激活/挂起流程
export function updateState(params) {
  return request({
    url: '/flowable/definition/updateState',
    method: 'put',
    params: params
  })
}

// 指定流程办理人员列表
export function userList(query) {
  return request({
    url: '/flowable/definition/userList',
    method: 'get',
    params: query
  })
}

// 指定流程办理组列表
export function roleList(query) {
  return request({
    url: '/flowable/definition/roleList',
    method: 'get',
    params: query
  })
}
// 指定流程分类列表
export function categoryList(query) {
  return request({
    url: '/flowable/definition/categoryList',
    method: 'get',
    params: query
  })
}

// 读取xml文件
export function readXml(deployId) {
  return request({
    url: '/flowable/definition/readXml/' + deployId,
    method: 'get'
  })
}
// 读取xml文件
export function readXmlByDataId(dataId) {
  return request({
    url: '/flowable/definition/readXmlByDataId/' + dataId,
    method: 'get'
  })
}

// 读取xml文件
export function readXmlByName(processDefinitionName) {
  return request({
    url: '/flowable/definition/readXmlByName/' + processDefinitionName,
    method: 'get'
  })
}

// 读取image文件
export function readImage(deployId) {
  return request({
    url: '/flowable/definition/readImage/' + deployId,
    method: 'get'
  })
}

// 读取image文件
export function getFlowViewer(procInsId) {
  return request({
    url: '/flowable/task/flowViewer/' + procInsId,
    method: 'get'
  })
}
// 读取image文件
export function getFlowViewerByDataId(dataId) {
  return request({
    url: '/flowable/task/flowViewerByDataId/' + dataId,
    method: 'get'
  })
}

// 读取image文件
export function getFlowViewerByName(processDefinitionName) {
  return request({
    url: '/flowable/task/flowViewerByName/' + processDefinitionName,
    method: 'get'
  })
}

// 读取xml文件
export function saveXml(data) {
  return request({
    url: '/flowable/definition/save',
    method: 'post',
    data: data
  })
}

// 删除流程定义
export function delDeployment(query) {
  return request({
    url: '/flowable/definition/delete',
    method: 'delete',
    params: query
  })
}

// 删除流程定义
export function listallnode(processName) {
  return request({
    url: '/flowable/definition/listallnode/',
    method: 'post',
    params: processName
  })
}

// 查询流程发布列表
export function listPublish(query)
{
  return request({
    url: '/flowable/definition/publishList',
    method: 'get',
    params: query
  })
 
}

// 激活/挂起流程
export function changeState(params) {
  return request({
    url: '/flowable/definition/changeState',
    method: 'put',
    params: params
  })
}

//根据当前服务名查询关联流程信息
export function getProcesss(query)
{
  return request({
    url: '/flowable/definition/getProcesss',
    method: 'get',
    params: query
  })
 
}

// 复活流程

export function reviveProcess(data)
{
  return request({
    url: '/flowable/definition/reviveProcess',
    method: 'post',
    data: data
  })
}  

// 复制流程
export function copyProcess(data) 
{
  return request({
    url: '/flowable/definition/copyProcess',
    method: 'post',
    data: data
  })
}
