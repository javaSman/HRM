<template>
  <a-spin :spinning='confirmLoading'>
    <j-form-container :disabled='formDisabled'>
<!--      {{ model }}-->
      <a-form-model ref='form' :model='model' :rules='validatorRules' slot='detail'>

        <div class='ZtTjClass'>
          <a-row>
            <a-col :span='12'>
              <a-form-model-item label='编码' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='code'>
                <a-input v-model='model.code' placeholder='请输入编码'></a-input>
              </a-form-model-item>
            </a-col>
            <a-col :span='12'>
              <a-form-model-item label="分类" :labelCol="labelCol" :wrapperCol="wrapperCol" prop="menuId">
                <sys-input-menu-tag :value.sync="model.menuId" template-code="tjInfoCode"></sys-input-menu-tag>
              </a-form-model-item>
            </a-col>

          </a-row>
          <a-row>
            <div style='display: flex;justify-content: space-between;align-items: center;margin-bottom: 10px'>
              <div>统计列表:</div>
              <a-button @click='addTjVoList' type='primary' size='small' style='margin-right: 5px'>新增</a-button>
            </div>
            <a-table
              ref='table'
              size='middle'
              :scroll='{x:true}'
              :bordered='true'
              rowKey='id'
              :columns='columnstjVoList'
              :dataSource='model.tjVoList'
              :pagination='false'
              :defaultExpandAllRows="true"
              class='j-table-force-nowrap'>
              <template  slot="keySlot"   slot-scope="text, tjRecord, index">
                <a-input  v-model="tjRecord.key"  placeholder="输入键值" />
              </template>
              <template  slot="tableSlot"   slot-scope="text, tjRecord, index">
                <a-select  v-model="tjRecord.table" @change='changeTableRecord(tjRecord,tjRecord.table)' :allowClear="true" show-search placeholder="请选择表">
                  <a-select-option  v-for='(item,it) in tableList'   :value="item.value"  >{{item.text+"("+item.value+")"}}</a-select-option>
                </a-select>
              </template>
              <template  slot="filterSqlSlot"   slot-scope="text, tjRecord, index">
                <TableSuperQuery :table="tjRecord.table" v-model="tjRecord.filterSql"></TableSuperQuery>
              </template>

              <div slot='expandedRowRender' slot-scope='tjRecord,index' style='margin: 10px;'>

                <div style='display: flex;justify-content: space-between;align-items: center;margin-bottom: 10px'>
                  <div>计算列表:</div>
                  <a-button @click='addOperateList(index)' type='primary' size='small' style='margin-right: 5px'>新增</a-button>
                </div>
                <a-table
                  ref='table'
                  size='middle'
                  :scroll='{x:true}'
                  :bordered='true'
                  rowKey='id'
                  :columns='columnsoperateList'
                  :dataSource='tjRecord.operateList'
                  :pagination='false'
                  class='j-table-force-nowrap'>

                  <template  slot="operateTypeSlot"   slot-scope="text, operateRecord, index">
                    <a-select  v-model="operateRecord.operateType" :allowClear="true" placeholder="请选择计算类型">
                      <a-select-option  v-for='(item,it) in operateTypeList'   :value="item.value">{{item.text+"("+item.value+")"}}</a-select-option>
                    </a-select>
                  </template>

                  <template  slot="operateRenameSlot"   slot-scope="text, operateRecord, index">
                    <a-input  v-model="operateRecord.rename"  placeholder="重命名(字段重命名)" />
                  </template>

                  <template  slot="operateNameSlot"   slot-scope="text, operateRecord, index" >
                    <a-select  v-model="operateRecord.operateName" :allowClear="true" show-search placeholder="请选择计算字段">
                      <a-select-option  v-for='(item,it) in getTableInfo(tjRecord.table,operateRecord.operateType)'   :value="item.value">{{item.text+"("+item.value+")"}}</a-select-option>
                    </a-select>
                    <!--                    <a-input  v-model="model.tjVoList[index].operateList.operateName"  />-->
                  </template>



                  <template slot='action' slot-scope='text, record, it'>
                    <div class='editable-row-operations'>
                      <a-button @click='deleteOperateList(index,it)' type='primary' size='small'>删除</a-button>
                    </div>
                  </template>
                </a-table>


                <div style='display: flex;justify-content: space-between;align-items: center;margin-bottom: 10px'>
                  <div>分组列表:</div>
                  <a-button @click='addGroupList(index)' type='primary' size='small' style='margin-right: 5px'>新增</a-button>
                </div>
                <a-table
                  ref='table'
                  size='middle'
                  :scroll='{x:true}'
                  :bordered='true'
                  rowKey='id'
                  :columns='columnsgroupList'
                  :dataSource='tjRecord.groupList'
                  :pagination='false'
                  class='j-table-force-nowrap'>

                  <template  slot="forMatStrSlot"   slot-scope="text, groupRecord, index">
                    <a-select  v-model="groupRecord.groupName" :allowClear="true" show-search  placeholder="请选择字段分组">
                      <a-select-option  v-for='(item,it) in getTableInfo(tjRecord.table)'   :value="item.value">{{item.text+"("+item.value+")"}}</a-select-option>
                    </a-select>
                    <!--                    <a-input  v-model="model.tjVoList[index].groupList.forMatStr"  />-->
                  </template>

                  <template  slot="groupRenameSlot"   slot-scope="text, groupRecord, index">
                    <a-input  v-model="groupRecord.rename"  placeholder="重命名(字段重命名)" />
                  </template>


                  <template  slot="groupFormatSlot"   slot-scope="text, groupRecord, index">
                    <a-select  v-model="groupRecord.groupFormat" :allowClear="true" placeholder="若选择的字段为日期类型，可指定格式还类型">
                      <a-select-option  v-for='(item,it) in groupFormatList'   :value="item.value">{{item.text+"("+item.value+")"}}</a-select-option>
                    </a-select>
                  </template>

                  <template  slot="groupNameSlot"   slot-scope="text, groupRecord, index">
                    <a-input  v-model="groupRecord.forMatStr"  placeholder="格式化参数" />
                  </template>

                  <template slot='action' slot-scope='text, record, it'>
                    <div class='editable-row-operations'>
                      <a-button @click='deleteGroupList(index,it)' type='primary' size='small'>删除</a-button>
                    </div>
                  </template>
                </a-table>


              </div>
              <!-- 操作  -->
              <template slot='action' slot-scope='text, record, index'>
                <div class='editable-row-operations'>
                  <a-button @click='deleteTjVoList(index)' type='primary' size='small'>删除</a-button>
                </div>
              </template>
            </a-table>
          </a-row>


          <a-row style='margin-top: 20px'>
            <div style='display: flex;justify-content: space-between;align-items: center;margin-bottom: 10px'>
              <div>参数列表:</div>
              <a-button @click='addParamList' type='primary' size='small' style='margin-right: 5px'>新增</a-button>
            </div>
            <a-table
              ref='table'
              size='middle'
              :scroll='{x:true}'
              :bordered='true'
              rowKey='id'
              :columns='columnsparamList'
              :dataSource='model.paramList'
              :pagination='false'
              class='j-table-force-nowrap'>
              <template v-for="(item, num) in columnsparamList" :slot="item.dataIndex+'Slot'"   slot-scope="text, paramRecord, index">
                <a-input v-model="paramRecord[item.dataIndex]"  />
              </template>


              <template slot='action' slot-scope='text, record, index'>
                <div class='editable-row-operations'>
                  <a-button @click='deleteParamList(index)' type='primary' size='small'>删除</a-button>
                </div>
              </template>
            </a-table>
          </a-row>

          <a-row>
            <a-col :span='12'>
              <a-form-model-item label='备注' :labelCol='labelCol' :wrapperCol='wrapperCol' prop='name'>
                <a-input v-model='model.name' placeholder='备注'></a-input>
              </a-form-model-item>
            </a-col>
          </a-row>

        </div>
      </a-form-model>
    </j-form-container>
  </a-spin>
</template>

<script>

  import { httpAction, getAction } from '@/api/manage'
  import TableSuperQuery from '@comp/common/superQuery/TableSuperQuery'
  import sysInputMenuTag from '@comp/common/SysInputMenuTag'
  import { validateDuplicateValue } from '@/utils/util'

  export default {
    name: 'ZtTjInfoForm',
    components: {TableSuperQuery,sysInputMenuTag},
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
        dataSource: [],
        columnsgroupList:[
          {
            title: '字段名称',
            width: 250,
            dataIndex: 'forMatStr',
            scopedSlots: {customRender: 'forMatStrSlot'},
          },
          // 分组重命名
          {
            title: '重命名',
            dataIndex: 'rename',
            scopedSlots: {customRender: 'groupRenameSlot'},
          },
          {
            title: '格式化类型',
            width: 200,
            dataIndex: 'groupFormat',
            scopedSlots: {customRender: 'groupFormatSlot'},
          },
          {
            title: '格式化参数',
            width: 200,
            dataIndex: 'groupName',
            scopedSlots: {customRender: 'groupNameSlot'},
          },
          {
            title: '操作',
            key: 'operation',
            align: 'center',
            width: 130,
            scopedSlots: {customRender: 'action'},
          },
        ],

        columnsoperateList:[
          {
            title: '操作类型',
            dataIndex: 'operateType',
            scopedSlots: {customRender: 'operateTypeSlot'},
          },
          {
            title: '字段名称',
            dataIndex: 'operateName',
            scopedSlots: {customRender: 'operateNameSlot'},
          },
          {
            title: '重命名',
            dataIndex: 'rename',
            scopedSlots: {customRender: 'operateRenameSlot'},
          },
          {
            title: '操作',
            key: 'operation',
            align: 'center',
            width: 130,
            scopedSlots: {customRender: 'action'},
          },
        ],

        columnsparamList:[
          {
            title: '键',
            dataIndex: 'key',
            scopedSlots: {customRender: 'keySlot'},
          },

          {
            title: '参数值',
            dataIndex: 'value',
            scopedSlots: {customRender: 'valueSlot'},
          },
          {
            title: '备注',
            dataIndex: 'name',
            scopedSlots: {customRender: 'nameSlot'},
          },
          {
            title: '操作',
            key: 'operation',
            align: 'center',
            width: 130,
            scopedSlots: {customRender: 'action'},
          },
        ],



        columnstjVoList: [
          {
            width: 100,
            title: '键',
            dataIndex: 'key',
            scopedSlots: {customRender: 'keySlot'},
          },
          {
            width: 200,
            title: '表名',
            dataIndex: 'table',
            scopedSlots: {customRender: 'tableSlot'},
          },
          {
            width: 150,
            title: '筛选条件',
            dataIndex: 'filterSql',
            scopedSlots: {customRender: 'filterSqlSlot'},
          },
          {
            title: '操作',
            key: 'operation',
            align: 'center',
            width: 130,
            scopedSlots: {customRender: 'action'},
          },
        ],
        oneData: {},

        analysisParameter: [],

        isEdit: false,


        model: {
          menuId:null,
          code: null,
          name: null,
          tjVoList: [
            {
              key: null,
              table: null,
              filterSql: null,
              groupList: [],
              operateList: []
            }
          ],
          paramList: []
        },
        labelCol: {
          xs: { span: 24 },
          sm: { span: 2 }
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 22 }
        },
        confirmLoading: false,
        validatorRules: {},
        groupFormatList:[],
        operateTypeList:[],
        tableMapInfo:{},
        tableList:[],
        url: {
          add: '/commonTj/ztTjInfo/add',
          edit: '/commonTj/ztTjInfo/edit',
          queryById: '/commonTj/ztTjInfo/queryById'
        }
      }
    },
    computed: {
      formDisabled() {
        return this.disabled
      }
    },
    created() {
      //备份model原始值
      this.modelDefault = JSON.parse(JSON.stringify(this.model));
    },
    mounted() {
      this.getOperateInfo()
    },
    methods: {

      changeTableRecord(tjRecord,tableName){
        tjRecord.operateList=[];
        tjRecord.groupList=[];
        this.changeTable(tableName);
      },

      changeTable(tableName){
        let that = this;
        if (!tableName){
          return
        }
        getAction(`/commonTj/getTableInfo?tableName=${tableName}`).then(res => {
          if (res.success) {
            that.tableMapInfo[tableName] = res.result;
          } else {
            that.$message.warning(res.message)
          }
        })
      },

      getTableInfo(tableName,type){
        let arr = this.tableMapInfo[tableName] || [];
        if (!type){
          return  arr;
        }
        if (type==="COUNT"){
          return [];
        }
        return arr.filter(item => item.isNum);
      },

  getOperateInfo(){
    getAction('/commonTj/getOperateInfo').then(res => {

      if (res.success) {
       const {groupFormatList,operateTypeList,tableList,}=res.result
        this.groupFormatList=groupFormatList
        this.operateTypeList=operateTypeList
        this.tableList=tableList
      } else {
        this.$message.warning(res.message)
      }
    })
  },



      addParamList() {
        let json = {
          key: null,
          name: null,
          value: null
        }
        this.model.paramList.push(json)
      },
      deleteParamList(itemIndex) {
        this.model.paramList.splice(itemIndex, 1)
      },
      addTjVoList() {
        let json = {
          // 键名
          key: null,
          // 表名
          table: null,
          // 筛选条件
          filterSql: null,
          // 分组条件
          groupList: [
            {
              forMatStr: null,
              groupFormat: null,
              groupName: null,
              rename:null,
            }
          ],
          // 操作条件（计数 求和等）
          operateList: [
            {
              operateName: null,
              operateType: null,
              rename:null,
            }
          ]
        }
        this.model.tjVoList.push(json)
      },
      deleteTjVoList(itemIndex) {
        this.model.tjVoList.splice(itemIndex, 1)
      },


      addGroupList(pIndex) {
        let json =
          {
            forMatStr: null,
            groupFormat: null,
            groupName: null,
            rename:null,
          }

        this.model.tjVoList[pIndex].groupList.push(json)
      },
      deleteGroupList(pIndex, itIndex) {
        this.model.tjVoList[pIndex].groupList.splice(itIndex, 1)
      },

      addOperateList(pIndex) {
        let json =
          {
            operateName: null,
            operateType: null,
            rename:null,
          }

        this.model.tjVoList[pIndex].operateList.push(json)
      },

      deleteOperateList(pIndex, itIndex) {
        this.model.tjVoList[pIndex].operateList.splice(itIndex, 1)
      },


      add() {
        this.edit(this.modelDefault)
      },
      edit(record) {
        this.model =  JSON.parse(JSON.stringify(record));

        let tjVoList =  this.model.tjVoList;
        if (tjVoList!=null){
          for (let i = 0; i < tjVoList.length; i++) {
            this.changeTable(tjVoList[i].table);
          }
        }

        this.visible = true
      },
      submitForm() {
        const that = this
        // 触发表单验证
        this.$refs.form.validate(valid => {
          if (valid) {
            that.confirmLoading = true
            let httpurl = ''
            let method = ''
            if (!this.model.id) {
              httpurl += this.url.add
              method = 'post'
            } else {
              httpurl += this.url.edit
              method = 'put'
            }

            httpAction(httpurl, this.model, method).then((res) => {
              if (res.success) {
                that.$message.success(res.message)
                that.$emit('ok')
              } else {
                that.$message.warning(res.message)
              }
            }).finally(() => {
              that.confirmLoading = false
            })
          }

        })
      }
    }
  }
</script>

<style scoped>
  .ZtTjClass {
    height: 600px;
    overflow: hidden;
    overflow-y: auto;
  }
</style>