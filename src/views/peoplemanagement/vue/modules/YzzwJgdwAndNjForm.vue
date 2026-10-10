<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model ref="form" :model="model" :rules="validatorRules" slot="detail">
        <a-row>
          <a-col :span="24">
            <a-descriptions bordered title="基础信息" size="small">
              <a-descriptions-item label="序号">
                <a-input-number v-model="model.xh" :min="0" placeholder="请输入序号" style="width: 100%" />
              </a-descriptions-item>
              <a-descriptions-item label="部门">
                <j-select-depart v-model="model.bm"></j-select-depart>
              </a-descriptions-item>
              <a-descriptions-item label="所属组别">
                <j-select-depart v-model="model.sszb"></j-select-depart>
              </a-descriptions-item>
              <a-descriptions-item label="姓名">
                <a-input v-model="model.xm" placeholder="请输入姓名"></a-input>
              </a-descriptions-item>
              <a-descriptions-item label="性别">
                <j-dict-select-tag v-model="model.xb" dictCode="wgxc_xb" placeholder="请选择性别"/>
              </a-descriptions-item>
              <a-descriptions-item label="职务">
                <j-dict-select-tag type="list" v-model="model.zj" dictCode="zj" placeholder="请选择职务" />
              </a-descriptions-item>
 
              <a-descriptions-item label="出生年月">
                <j-date placeholder="请选择出生年月" dateFormat='YYYY-MM-DD' v-model="model.csny" style="width: 100%" />
              </a-descriptions-item>
              <a-descriptions-item label="进入单位时间">
                <j-date placeholder="请选择进入单位时间" dateFormat='YYYY-MM-DD' v-model="model.jrdwsj" style="width: 100%" @change="changeDate" />
              </a-descriptions-item>
              <a-descriptions-item label="个人身份">
                <a-input v-model="model.sjlclb" placeholder="请输入个人身份"></a-input>
              </a-descriptions-item>
              <a-descriptions-item label="工作年限">
                {{model.gznx}}
              </a-descriptions-item>

              <a-descriptions-item label="年度应休年假天数">
                <!-- <a-input-number @blur='Son=true' @focus='Son=false' v-model="model.ndyxnjts" placeholder="请输入年度应休年假天数"
                  style="width: 100%" /> -->
                {{model.ndyxnjts}}

              </a-descriptions-item>
              <a-descriptions-item label="本年度已休年假次数">
                {{model.bndyxnjcs}}
              </a-descriptions-item>
              <a-descriptions-item label="已休年假天数">
                {{model.yxnjts}}
              </a-descriptions-item>
              <a-descriptions-item label="去年请假累计天数">
                {{model.qnqjljts}}
              </a-descriptions-item>
              <a-descriptions-item label="剩余年假天数">
                {{model.synjts}}
              </a-descriptions-item>
              <a-descriptions-item label="请选择请假流程">
               <a-select v-model='model.qtqjlc' style="width: 100%" placeholder="选择流程" @change='pros($event,"lct")'>
                 <a-select-option v-for="(item,index) in ALLlist.process" :key="item.id" >
                   <a-tooltip placement="topLeft">
                     <template slot="title">
                       {{item.lcmc}}
                     </template>
                     {{item.lcmc}}
                   </a-tooltip>
                 </a-select-option>
               </a-select>
              </a-descriptions-item>
              <a-descriptions-item label="请选择年假流程">
               <a-select v-model='model.zw' style="width: 100%" placeholder="选择流程" @change='pros($event,"Njlct")'>
                 <a-select-option v-for="(item,index) in ALLlist.processNJ" :key="item.id" >
                   <a-tooltip placement="topLeft">
                     <template slot="title">
                       {{item.lcmc}}
                     </template>
                     {{item.lcmc}}
                   </a-tooltip>
                 </a-select-option>
               </a-select>
              </a-descriptions-item>
              <a-descriptions-item label="请选择销假流程">
               <a-select v-model='model.xjlc' style="width: 100%" placeholder="选择流程" @change='pros($event,"lctXJ")'>
                 <a-select-option v-for="(item,index) in ALLlist.processXJ" :key="item.id" >
                   <a-tooltip placement="topLeft">
                     <template slot="title">
                       {{item.lcmc}}
                     </template>
                     {{item.lcmc}}
                   </a-tooltip>
                 </a-select-option>
               </a-select>
              </a-descriptions-item>
              </j-search-select-tag>

              <a-descriptions-item label="当年请病假累计天数">
                {{model.qnqbjljts}}
              </a-descriptions-item>
              <a-descriptions-item label="当年请事假累计天数">
                {{model.dnqsjljts}}
              </a-descriptions-item>


            </a-descriptions>

          </a-col>
          <!-- <a-col :span="24" v-if='model.qtqjlc'>
            <h3>请假流程</h3>
            <div class='box'>
              <div v-for="(i,index) in ALLlist.lct">
                <span v-if='index==0'>{{i}}</span>
                <div class='boxs' v-else>
                  <span>
                    <a-icon class="caret" type="caret-right" />
                  </span>
                  <div>
                    <a-icon class="user" type="user" />
                    <b>{{i}}</b>
                  </div>
                </div>
              </div>
            </div>
          </a-col> -->
          <a-col :span="24" v-if='model.zw'>
            <h3>年假流程</h3>
            <div class='box'>
              <div v-for="(i,index) in ALLlist.Njlct">
                <span v-if='index==0'>{{i}}</span>
                <div class='boxs' v-else>
                  <span>
                    <a-icon class="caret" type="caret-right" />
                  </span>
                  <div>
                    <a-icon class="user" type="user" />
                    <b>{{i}}</b>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
          <a-col :span="24" v-if='model.xjlc'>
            <h3>销假流程</h3>
            <div class='box'>
              <div v-for="(i,index) in ALLlist.lctXJ">
                <span v-if='index==0'>{{i}}</span>
                <div class='boxs' v-else>
                  <span>
                    <a-icon class="caret" type="caret-right" />
                  </span>
                  <div>
                    <a-icon class="user" type="user" />
                    <b>{{i}}</b>
                  </div>
                </div>
              </div>
            </div>
          </a-col>
        </a-row>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>
  import {
    httpAction,
    getAction
  } from '@/api/manage'
  import {
    validateDuplicateValue
  } from '@/utils/util'

  export default {
    name: 'YzzwJgdwAndNjForm',
    components: {},
    props: {
      //表单禁用
      disabled: {
        type: Boolean,
        default: false,
        required: false
      }
    },
    data() {
      return {
        model: {
          gznx: 0,
          bndyxnjcs: 0,
          yxnjts: 0,
          synjts: 0,
          qnqjljts: 0,
          qnqbjljts: 0,
          dnqsjljts: 0,
          ndyxnjts: 0,
        },
        Son: true,
        labelCol: {
          xs: {
            span: 24
          },
          sm: {
            span: 8
          },
        },
        wrapperCol: {
          xs: {
            span: 24
          },
          sm: {
            span: 15
          },
        },
        confirmLoading: false,
        validatorRules: {},
        url: {
          add: "/rygl/hrmJgdwAndNj/add",
          edit: "/rygl/hrmJgdwAndNj/edit",
          queryById: "/rygl/hrmJgdwAndNj/queryById"
        },
        ALLlist:{
          process:[],
          processNJ:[],
          processXJ:[],
          lct: [],
          lctXJ: [],
          Njlct: [],
        }
      }
    },
    watch: {
      model: {
        handler: function(val, oldval) {
          
        },
        deep: true //对象内部的属性监听，也叫深度监听  
      }
    },
    computed: {
      formDisabled() {
        return this.disabled
      },
    },
    created() {
      //备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model));
    },
    methods: {
      changeDate(){
        this.getGznx()
      },
      getGznx(){
        let url = ''
        let params = ''
        if(this.model.id){
          url = '/rygl/hrmJgdwAndNj/computeJgdwNjDataByXm'
          params= this.model
        }else{
          url = '/rygl/hrmJgdwAndNj/computeJgdwNjBy?jrdwsj='+this.model.jrdwsj
        }
        httpAction(url, params, 'post').then((res) => {
          if (res.success) {
            if(!res.result.id){
              this.model['gznx'] = res.result.gznx
              this.model['ndyxnjts'] = res.result.ndyxnjts
              this.model['synjts'] = res.result.ndyxnjts
            }else{
              this.model = res.result
            }
          }
        })
      },
      changLC(txt) {
        let arr = []
        if (txt == '办事员') {
          arr = ['办事员', '组长', '单位正职', '分管领导', '分管领导人事领导', '分管组织人事部门']
        } else if (txt == '组长') {
          arr = ['组长', '单位正职', '分管领导', '分管领导人事领导', '抄送组织人事部门']
        } else if (txt == '副职') {
          arr = ['副职', '单位正职', '分管领导', '分管领导人事领导', '镇长', '抄送组织人事部门']
        } else if (txt == '正职') {
          arr = ['单位正职', '分管领导', '分管领导人事领导', '镇长', '抄送组织人事部门']
        } else if (txt == '科级干部') {
          arr = ['科级干部', '分管领导人事领导', '党委书记', '抄送组织人事部门']
        } else if (txt == '工会') {
          arr = ['办事员', '刘育琦', '单位正职', '分管领导', '分管领导人事领导', '分管组织人事部门']
        } else if (txt == '妇联') {
          arr = ['办事员', '吴珺珺', '单位正职', '分管领导', '分管领导人事领导', '分管组织人事部门']
        } else {
          arr = ['办事员', '王捷', '马一鸣']
        }

        return arr
      },

      add() {
        this.edit(this.modelDefault);
      },
      edit(record) {
        this.model = Object.assign({}, record);
        this.visible = true;
        this.getQJlist()
        if(this.model.id && this.model.zw){
          this.pros(this.model.zw,'Njlct')
        }
        if(this.model.id && this.model.xjlc){
          this.pros(this.model.xjlc,'lctXJ')
        }
        if(this.model.id && this.model.qtqjlc){
          this.pros(this.model.qtqjlc,'lctXJ')
        }
        
      },
      getQJlist(){
        httpAction('/process/customProcess/list?pageSize=10000&ssmk=请假流程', '', 'get').then((res) => {
          if (res.success) {
            this.ALLlist.processNJ = res.result.records
          }
        })
        httpAction('/process/customProcess/list?pageSize=10000&ssmk=其他假期', '', 'get').then((res) => {
          if (res.success) {
            this.ALLlist.process = res.result.records
          }
        })
        httpAction('/process/customProcess/list?pageSize=10000&ssmk=销假流程', '', 'get').then((res) => {
          if (res.success) {
            this.ALLlist.processXJ = res.result.records
          }
        })
      },
      pros(id,txt){
        httpAction(`/process/customProcessConfiguration/getNodeList?customProcessId=${id}&pageSize=10000`, '', 'get').then((res) => {
          if (res.success) {
            this.ALLlist[txt]=[]
            this.ALLlist.processNJ.forEach(i=>{
              if(i.id==id){
                this.ALLlist[txt].push(i.lcmc)
              }
            })
            res.result.forEach(i=>{
              this.ALLlist[txt].push(i.nodeName)
            })
            this.$forceUpdate()
          }
        })
      },
      
      submitForm() {
        const that = this;
        // 触发表单验证
        this.$refs.form.validate(valid => {
          if (valid) {
            that.confirmLoading = true;
            let httpurl = '';
            let method = '';
            if (!this.model.id) {
              httpurl += this.url.add;
              method = 'post';
            } else {
              httpurl += this.url.edit;
              method = 'put';
            }
            httpAction(httpurl, this.model, method).then((res) => {
              if (res.success) {
                that.$message.success(res.message);
                that.$emit('ok');
              } else {
                that.$message.warning(res.message);
              }
            }).finally(() => {
              that.confirmLoading = false;
            })
          }

        })
      },
      popupCallback(value, row) {
        this.model = Object.assign(this.model, row);
      },
    }
  }
</script>

<style scoped>
  h3 {
    margin-top: 30px;
    font-weight: bold;
  }

  .box {
    border: 1px solid #d9d9d9;
    display: flex;
    padding: 20px;
    width: auto;
    overflow: auto;
    border-radius: 5px;
    align-items: center;
    justify-content: center;
  }

  .box>div>span {
    display: inline-block;
    width: 80px;
    line-height: 80px;
    height: 80px;
    border-radius: 50%;
    background: #1c82ff;
    color: #fff;
    font-weight: bold;
    font-size: 14px;
    text-align: center;
  }

  .boxs {
    display: flex;
    margin-left: 5px;
    align-items: center;
  }

  .boxs>span {
    position: relative;
    width: 40px;
    height: 2px;
    background: #1c82ff;

  }

  .boxs>div {
    height: 40px;
    background: #1c82ff;
    border-radius: 5px;
    margin-left: 5px;
    border: 2px solid #1c82ff;
    display: flex;
    align-items: center;

  }

  .boxs>div b {
    margin-left: 10px;
    background: #fff;
    display: inline-block;
    height: 100%;
    padding: 5px;
    border-radius: 0px 5px 5px 0;
    line-height: 25px;
  }

  .user {
    font-size: 25px;
    color: #fff;
    margin-left: 10px;
  }

  .caret {
    font-size: 20px;
    position: absolute;
    right: -9px;
    top: -9px;
    color: #1c82ff;
  }
</style>