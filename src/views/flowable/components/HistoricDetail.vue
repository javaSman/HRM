<style lang="less">
</style>
<template>
  <div class="search">
    <!--流程流转记录-->
    <el-card class="box-card" v-if="flowRecordList">
      <div slot="header" class="clearfix">
        <span class="el-icon-notebook-1">流程审批进度</span>
      </div>
      <el-col :span="16" :offset="4">
        <div class="block">
          <el-timeline>
            <el-timeline-item v-for="(item,index ) in flowRecordList" :key="index" :icon="setIcon(item.finishTime)"
              :color="setColor(item.finishTime)">
              <p style="font-weight: 700">{{item.taskName}}</p>
              <el-card v-if="item.activityType === 'startEvent'" class="box-card" shadow="hover">
                {{ item.assigneeName }} 在 {{ item.createTime }} 发起流程
              </el-card>
              <el-card v-if="item.activityType === 'userTask'" :body-style="{ padding: '10px' }">
                <label v-if="item.assigneeName" style="font-weight: normal;margin-right: 30px;">实际办理：
                  {{item.assigneeName}}
                  <el-tag type="info" size="mini">{{item.deptName}}</el-tag>
                </label>
                <label v-if="item.candidate" style="font-weight: normal;margin-right: 30px;">候选办理：
                  {{item.candidate}}</label>
                <label style="font-weight: normal">接收时间： </label><label
                  style="color:#8a909c;font-weight: normal">{{item.createTime}}</label>
                <label v-if="item.finishTime" style="margin-left: 30px;font-weight: normal">办结时间： </label><label
                  style="color:#8a909c;font-weight: normal">{{item.finishTime}}</label>
                <label v-if="item.duration" style="margin-left: 30px;font-weight: normal">耗时： </label><label
                  style="color:#8a909c;font-weight: normal">{{item.duration}}</label>
                <p v-if="item.listFlowCommentDto" v-for="(commentitem,index ) in item.listFlowCommentDto" :key="index">
                   <el-tag type="success" v-if="commentitem.type === '1'"> {{commentitem.comment}}</el-tag>
                   <el-form  v-if= "commentitem.type === '1' && fileitem.type === '1'  && item.listcommentFileDto.length>0" v-for="(fileitem,fileindex ) in item.listcommentFileDto" :key="fileindex">
                     <el-form-item label="附件"  prop="listcommentFileDto">
                          <j-upload  v-if="fileitem.type === '1'" v-model="fileitem.fileurl" :disabled = "true"  text="上传的文件" ></j-upload>                 
                     </el-form-item>
                   </el-form>  
                   <el-tag type="warning" v-if="commentitem.type === '2'"> {{"退回: "+ commentitem.comment}}</el-tag>
                   <el-form v-if= "commentitem.type === '2' && fileitem.type === '2'  && item.listcommentFileDto.length>0" v-for="(fileitem,fileindex ) in item.listcommentFileDto" :key="fileindex">
                     <el-form-item label="附件"  prop="listcommentFileDto">
                          <j-upload v-if="fileitem.type === '2'" v-model="fileitem.fileurl" :disabled = "true"  text="退回上传的文件" ></j-upload> 
                     </el-form-item>
                   </el-form>  
                   <el-tag type="danger" v-if="commentitem.type === '3'">  {{"驳回: "+ commentitem.comment}}</el-tag>
                   <el-form v-if= "commentitem.type === '3' && fileitem.type === '3'  && item.listcommentFileDto.length>0" v-for="(fileitem,fileindex ) in item.listcommentFileDto" :key="fileindex">
                     <el-form-item label="附件"  prop="listcommentFileDto">
                        <j-upload v-if="fileitem.type === '3'"  v-model="fileitem.fileurl" :disabled = "true"  text="驳回上传的文件" ></j-upload>
                     </el-form-item>
                   </el-form>  
                   <el-tag type="success" v-if="commentitem.type === '4'">  {{commentitem.comment}}</el-tag>
                   <el-form  v-if= "commentitem.type === '4' && fileitem.type === '4'  && item.listcommentFileDto.length>0" v-for="(fileitem,fileindex ) in item.listcommentFileDto" :key="fileindex">
                     <el-form-item label="附件"  prop="listcommentFileDto">
                          <j-upload  v-if="fileitem.type === '4'" v-model="fileitem.fileurl" :disabled = "true"  text="委派上传的文件" ></j-upload>                 
                     </el-form-item>
                   </el-form>  
                   <el-tag type="success" v-if="commentitem.type === '5'">  {{commentitem.comment}}</el-tag>  
                    <el-form v-if= "commentitem.type === '5' && fileitem.type === '5' && item.listcommentFileDto.length>0" v-for="(fileitem,fileindex ) in item.listcommentFileDto" :key="fileindex">
                      <el-form-item label="附件"  prop="listcommentFileDto" >
                         <j-upload v-model="fileitem.fileurl" :disabled = "true"  text="转办上传的文件" ></j-upload>
                      </el-form-item>
                    </el-form>  
                    <el-tag type="warning" v-if="commentitem.type === '7'"> {{"撤回: "+ commentitem.comment}}</el-tag>  <!--撤回信息-->
                    <el-tag type="warning" v-if="commentitem.type === '6'"> {{commentitem.comment}}</el-tag>  <!--终止信息-->
                    <el-tag type="warning" v-if="commentitem.type === '8'"> {{commentitem.comment}}</el-tag>  <!--跳过信息-->
                    <el-tag type="success" v-if="commentitem.type === '9'"> {{commentitem.comment}}</el-tag>  <!--前加签-->
                    <el-tag type="success" v-if="commentitem.type === '10'"> {{commentitem.comment}}</el-tag>  <!--后加签-->
                    <el-tag type="success" v-if="commentitem.type === '11'"> {{commentitem.comment}}</el-tag>  <!--多实例加签-->
                    <el-tag type="success" v-if="commentitem.type === '12'"> {{commentitem.comment}}</el-tag>  <!--跳转信息-->
                 </p>
              </el-card>
              <el-card v-if="item.activityType === 'endEvent'" class="box-card" shadow="hover">
                {{ item.createTime }} 流程结束
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>
    </el-card>

    <a-card>
      <p slot="title">
        <span>流程图</span>
      </p>
      <a-row style="position:relative">
        <bpmnModeler ref="bpm" :xml="xmlData" :is-view="true"></bpmnModeler>
      </a-row>
    </a-card>
  </div>
</template>

<script>
import {flowRecordBydataid} from "@views/flowable/api/finished";
import {getFlowViewerByDataId, readXmlByDataId} from "@views/flowable/api/definition";
import bpmnModeler from "workflow-bpmn-modeler-jeecgboot";

export default {
    name: 'HistoricDetail',
  components: {
    bpmnModeler,
  },
    props: {
    /**/
        dataId: {
            type: String,
            default: '',
            required: true
        }
    },
    data() {
        return {
            taskList:[],
            flowRecordList: [], // 流程流转数据
            formData:{},
            xmlData:'',
            type: 0,
            loading: false, // 表单加载状态
            loadingImg: false,
            data: [],
            id: '',
            imgUrl: '',
            backRoute: ''
        };
    },
    created() {
        this.init();
    },
    watch: {
      dataId: function(newval, oldName) {
            this.init();
        }
    },

    methods: {
        init() {
          this.getFlowRecordList()
          this.getModelDetail()
        },
      /** xml 文件 */
      getModelDetail() {
        // 发送请求，获取xml
        readXmlByDataId(this.dataId).then(res => {
          this.xmlData = res.result
          this.getFlowViewer()
        })
      },
      // 流程进行情况
      getFlowViewer() {
        getFlowViewerByDataId(this.dataId).then(res => {
          this.taskList = res.result || []
          this.fillColor();
        })
      },
      /** 流程流转记录 */
      getFlowRecordList() {
        const params = {dataId: this.dataId}
        flowRecordBydataid(params).then(res => {
          // console.log(res)
          this.flowRecordList = res.result.flowList;
          console.log("this.flowRecordList", this.flowRecordList);
          // 流程过程中不存在初始化表单 直接读取的流程变量中存储的表单值
          if (res.result.formData) {
            this.formData = res.result.formData;
          }
        }).catch(res => {
          console.log(res)
        })
      },
      setIcon(val) {
        if (val) {
          return "el-icon-check";
        } else {
          return "el-icon-time";
        }
      },
      setColor(val) {
        if (val) {
          return "#2bc418";
        } else {
          return "#b3bdbb";
        }
      },
      fillColor() {
        const modeler = this.$refs.bpm.modeler;
        const canvas = modeler.get('canvas')
        modeler._definitions.rootElements[0].flowElements.forEach(n => {
          const completeTask = this.taskList.find(m => m.key === n.id)
          const todoTask = this.taskList.find(m => !m.completed)
          const endTask = this.taskList[this.taskList.length - 1]
          if (n.$type === 'bpmn:UserTask') {
            if (completeTask) {
              canvas.addMarker(n.id, completeTask.completed ? 'highlight' : 'highlight-todo')
              n.outgoing.forEach(nn => {
                const targetTask = this.taskList.find(m => m.key === nn.targetRef.id)
                if (targetTask) {
                  if (todoTask && completeTask.key === todoTask.key && !todoTask.completed){
                    canvas.addMarker(nn.id, todoTask.completed ? 'highlight' : 'highlight-todo')
                    canvas.addMarker(nn.targetRef.id, todoTask.completed ? 'highlight' : 'highlight-todo')
                  }else {
                    canvas.addMarker(nn.id, targetTask.completed ? 'highlight' : 'highlight-todo')
                    canvas.addMarker(nn.targetRef.id, targetTask.completed ? 'highlight' : 'highlight-todo')
                  }
                }
              })
            }
          }
          // 排他网关
          else if (n.$type === 'bpmn:ExclusiveGateway') {
            if (completeTask) {
              canvas.addMarker(n.id, completeTask.completed ? 'highlight' : 'highlight-todo')
              n.outgoing.forEach(nn => {
                const targetTask = this.taskList.find(m => m.key === nn.targetRef.id)
                if (targetTask) {

                  canvas.addMarker(nn.id, targetTask.completed ? 'highlight' : 'highlight-todo')
                  canvas.addMarker(nn.targetRef.id, targetTask.completed ? 'highlight' : 'highlight-todo')
                }

              })
            }

          }
          // 并行网关
          else if (n.$type === 'bpmn:ParallelGateway') {
            if (completeTask) {
              canvas.addMarker(n.id, completeTask.completed ? 'highlight' : 'highlight-todo')
              n.outgoing.forEach(nn => {
                debugger
                const targetTask = this.taskList.find(m => m.key === nn.targetRef.id)
                if (targetTask) {
                  canvas.addMarker(nn.id, targetTask.completed ? 'highlight' : 'highlight-todo')
                  canvas.addMarker(nn.targetRef.id, targetTask.completed ? 'highlight' : 'highlight-todo')
                }
              })
            }
          }
          else if (n.$type === 'bpmn:StartEvent') {
            n.outgoing.forEach(nn => {
              const completeTask = this.taskList.find(m => m.key === nn.targetRef.id)
              if (completeTask) {
                canvas.addMarker(nn.id, 'highlight')
                canvas.addMarker(n.id, 'highlight')
                return
              }
            })
          }
          else if (n.$type === 'bpmn:EndEvent') {
            if (endTask.key === n.id && endTask.completed) {
              canvas.addMarker(n.id, 'highlight')
              return
            }
          }
        })
      }
    }

};
</script>
<style lang="less">
   .highlight.djs-shape .djs-visual > :nth-child(1) {
     fill: green !important;
     stroke: green !important;
     fill-opacity: 0.2 !important;
   }
   .highlight.djs-shape .djs-visual > :nth-child(2) {
     fill: green !important;
   }
   .highlight.djs-shape .djs-visual > path {
     fill: green !important;
     fill-opacity: 0.2 !important;
     stroke: green !important;
   }
   .highlight.djs-connection > .djs-visual > path {
     stroke: green !important;
   }
   // .djs-connection > .djs-visual > path {
   //   stroke: orange !important;
   //   stroke-dasharray: 4px !important;
   //   fill-opacity: 0.2 !important;
   // }
   // .djs-shape .djs-visual > :nth-child(1) {
   //   fill: orange !important;
   //   stroke: orange !important;
   //   stroke-dasharray: 4px !important;
   //   fill-opacity: 0.2 !important;
   // }
   .highlight-todo.djs-connection > .djs-visual > path {
     stroke: orange !important;
     stroke-dasharray: 4px !important;
     fill-opacity: 0.2 !important;
   }
   .highlight-todo.djs-shape .djs-visual > :nth-child(1) {
     fill: orange !important;
     stroke: orange !important;
     stroke-dasharray: 4px !important;
     fill-opacity: 0.2 !important;
   }
   .overlays-div {
     font-size: 10px;
     color: red;
     width: 100px;
     top: -20px !important;
   }
</style>