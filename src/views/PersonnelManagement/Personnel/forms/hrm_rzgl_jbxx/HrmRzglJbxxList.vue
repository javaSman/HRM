<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
    <div class="table-page-search-wrapper">
      <a-form layout="inline" @keyup.enter.native="searchQuery">
        <a-row :gutter="24">
        </a-row>
      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
      <a-button type="primary" icon="download" @click="handleExportXls('入职管理_基础信息')">导出</a-button>
      <!-- 前端 代码生成位置 做个标记
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <a-button type="primary" icon="download" @click="handleExportXlsNew('HrmRzglJbxx','入职管理_基础信息')">导出</a-button>
      -->
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrlNew" @change="handleImportExcelNew">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <!-- 高级查询区域 -->
      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table
        ref="table"
        size="middle"
        :scroll="{x:true}"
        bordered
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
        class="j-table-force-nowrap"
        @change="handleTableChange">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="imgSlot" slot-scope="text,record">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" :preview="record.id" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button
            v-else
            :ghost="true"
            type="primary"
            icon="download"
            size="small"
            @click="downloadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a @click="handleEdit(record)">编辑</a>

          <a-divider type="vertical" />
          <a-dropdown>
            <a class="ant-dropdown-link">更多 <a-icon type="down" /></a>
            <a-menu slot="overlay">
              <a-menu-item>
                <a @click="handleDetail(record)">详情</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <hrm-rzgl-jbxx-modal ref="modalForm" @ok="modalFormOk"></hrm-rzgl-jbxx-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import HrmRzglJbxxModal from './modules/HrmRzglJbxxModal'
  import {filterMultiDictText} from '@/components/dict/JDictSelectUtil'

  export default {
    name: 'HrmRzglJbxxList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      HrmRzglJbxxModal
    },
    data () {
      return {
        description: '入职管理_基础信息管理页面',
        // 表头
        columns: [
          {
            title: '#',
            dataIndex: '',
            key:'rowIndex',
            width:60,
            align:"center",
            customRender:function (t,r,index) {
              return parseInt(index)+1;
            }
          },
          {
            title:'创建日期',
            align:"center",
            dataIndex: 'createTime'
          },
          {
            title:'员工姓名',
            align:"center",
            dataIndex: 'name'
          },
          {
            title:'性别',
            align:"center",
            dataIndex: 'gender'
          },
          {
            title:'出生日期',
            align:"center",
            dataIndex: 'birthDate',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },
          {
            title:'民族',
            align:"center",
            dataIndex: 'mz'
          },
          {
            title:'籍贯',
            align:"center",
            dataIndex: 'jg'
          },
          {
            title:'证件类型',
            align:"center",
            dataIndex: 'idType'
          },
          {
            title:'身份证号码',
            align:"center",
            dataIndex: 'idCard'
          },
          {
            title:'户籍性质',
            align:"center",
            dataIndex: 'hjxz'
          },
          {
            title:'户籍地址',
            align:"center",
            dataIndex: 'hjdz'
          },
          {
            title:'员工照片',
            align:"center",
            dataIndex: 'photo'
          },
          {
            title:'政治面貌',
            align:"center",
            dataIndex: 'zzmm'
          },
          {
            title:'婚姻状况',
            align:"center",
            dataIndex: 'hyzk'
          },
          {
            title:'健康状况',
            align:"center",
            dataIndex: 'jkzk'
          },
          {
            title:'以往病史',
            align:"center",
            dataIndex: 'ywbs'
          },
          {
            title:'兴趣爱好',
            align:"center",
            dataIndex: 'xqah'
          },
          {
            title:'联系方式',
            align:"center",
            dataIndex: 'phoneNumber'
          },
          {
            title:'邮箱',
            align:"center",
            dataIndex: 'email'
          },
          {
            title:'联系地址',
            align:"center",
            dataIndex: 'address'
          },
          {
            title:'居住地',
            align:"center",
            dataIndex: 'jzd'
          },
          {
            title:'暂住地址',
            align:"center",
            dataIndex: 'zzdz'
          },
          {
            title:'住宿方式',
            align:"center",
            dataIndex: 'zsfs'
          },
          {
            title:'宿舍信息',
            align:"center",
            dataIndex: 'dormitory'
          },
          {
            title:'员工卡号',
            align:"center",
            dataIndex: 'card'
          },
          {
            title:'员工工号',
            align:"center",
            dataIndex: 'no'
          },
          {
            title:'员工类型',
            align:"center",
            dataIndex: 'employeeType'
          },
          {
            title:'所属公司 ID',
            align:"center",
            dataIndex: 'companyId'
          },
          {
            title:'所属部门 ID',
            align:"center",
            dataIndex: 'dept'
          },
          {
            title:'主部门',
            align:"center",
            dataIndex: 'mainDept'
          },
          {
            title:'所属岗位 ID',
            align:"center",
            dataIndex: 'postId'
          },
          {
            title:'岗位职级 ID',
            align:"center",
            dataIndex: 'postRank'
          },
          {
            title:'岗位信息 ID',
            align:"center",
            dataIndex: 'positionInfoId'
          },
          {
            title:'岗位备注',
            align:"center",
            dataIndex: 'gwbz'
          },
          {
            title:'入职方式',
            align:"center",
            dataIndex: 'rzfs'
          },
          {
            title:'招聘计划',
            align:"center",
            dataIndex: 'sourceTag'
          },
          {
            title:'入职状态',
            align:"center",
            dataIndex: 'status'
          },
          {
            title:'试用期',
            align:"center",
            dataIndex: 'syq'
          },
          {
            title:'入职日期',
            align:"center",
            dataIndex: 'entryDate',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },
          {
            title:'实际到岗日期',
            align:"center",
            dataIndex: 'actualDate',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },
          {
            title:'报道日期',
            align:"center",
            dataIndex: 'bdrq'
          },
          {
            title:'转正类型',
            align:"center",
            dataIndex: 'becomeType'
          },
          {
            title:'计划转正日期',
            align:"center",
            dataIndex: 'sjzzrq',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },
          {
            title:'正式离职日期',
            align:"center",
            dataIndex: 'formalResignDate',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },
          {
            title:'工作年限',
            align:"center",
            dataIndex: 'workYears'
          },
          {
            title:'入职负责人',
            align:"center",
            dataIndex: 'entryDirector'
          },
          {
            title:'导师姓名',
            align:"center",
            dataIndex: 'mentor'
          },
          {
            title:'资料状态',
            align:"center",
            dataIndex: 'profileStatus'
          },
          {
            title:'个人信息 ID',
            align:"center",
            dataIndex: 'informationId'
          },
          {
            title:'工作厂区 / 位置',
            align:"center",
            dataIndex: 'workLocation'
          },
          {
            title:'是否存在竞业限制协议',
            align:"center",
            dataIndex: 'sfczjyxzxy'
          },
          {
            title:'合同归属',
            align:"center",
            dataIndex: 'constractBelong'
          },
          {
            title:'合同类型',
            align:"center",
            dataIndex: 'constractType'
          },
          {
            title:'合同开始日期	',
            align:"center",
            dataIndex: 'contractStartDate',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },
          {
            title:'合同到期日期',
            align:"center",
            dataIndex: 'contractExpDate',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },
          {
            title:'薪资(k)',
            align:"center",
            dataIndex: 'salary'
          },
          {
            title:'薪资类型',
            align:"center",
            dataIndex: 'salaryType'
          },
          {
            title:'银行卡号',
            align:"center",
            dataIndex: 'gzkyhkh'
          },
          {
            title:'工资卡银行',
            align:"center",
            dataIndex: 'gzkyh'
          },
          {
            title:'工资卡开户行',
            align:"center",
            dataIndex: 'gzkkhh'
          },
          {
            title:'社保状态',
            align:"center",
            dataIndex: 'socialSecurityStatus'
          },
          {
            title:'社保情况',
            align:"center",
            dataIndex: 'sbqk'
          },
          {
            title:'社保电脑号',
            align:"center",
            dataIndex: 'sbdnh'
          },
          {
            title:'社保停缴状态',
            align:"center",
            dataIndex: 'stopSocialSecurityStatus'
          },
          {
            title:'首次社保缴纳日期',
            align:"center",
            dataIndex: 'sbStartDate',
            customRender:function (text) {
              return !text?"":(text.length>10?text.substr(0,10):text)
            }
          },
          {
            title:'公积金状态',
            align:"center",
            dataIndex: 'accumulationFundStatus'
          },
          {
            title:'公积金情况',
            align:"center",
            dataIndex: 'gjjqk'
          },
          {
            title:'公积金电脑号',
            align:"center",
            dataIndex: 'gjjdhh'
          },
          {
            title:'公积金停缴状态',
            align:"center",
            dataIndex: 'stopAccumulationFundStatus'
          },
          {
            title:'公积金银行卡号',
            align:"center",
            dataIndex: 'gjjyhkh'
          },
          {
            title:'公积金银行',
            align:"center",
            dataIndex: 'gjjyh'
          },
          {
            title:'公积金开户银行',
            align:"center",
            dataIndex: 'gjjkhyh'
          },
          {
            title:'毕业院校',
            align:"center",
            dataIndex: 'byyx'
          },
          {
            title:'学历',
            align:"center",
            dataIndex: 'xl'
          },
          {
            title:'专业',
            align:"center",
            dataIndex: 'zy'
          },
          {
            title:'学位',
            align:"center",
            dataIndex: 'xw'
          },
          {
            title:'主表',
            align:"center",
            dataIndex: 'hrmRzglId'
          },
          {
            title: '操作',
            dataIndex: 'action',
            align:"center",
            fixed:"right",
            width:147,
            scopedSlots: { customRender: 'action' }
          }
        ],
        url: {
          list: "/ryManage/hrmRzglJbxx/list",
          delete: "/ryManage/hrmRzglJbxx/delete",
          deleteBatch: "/ryManage/hrmRzglJbxx/deleteBatch",
          exportXlsUrl: "/ryManage/hrmRzglJbxx/exportXls",
          importExcelUrl: "ryManage/hrmRzglJbxx/importExcel",
          importExcelUrlNewName: 'HrmRzglJbxx',
          
        },
        dictOptions:{},
        superFieldList:[],
      }
    },
    created() {
    this.getSuperFieldList();
    },
    computed: {
      importExcelUrl: function(){
        return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
      },
    },
    methods: {
      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'datetime',value:'createTime',text:'创建日期'})
        fieldList.push({type:'string',value:'name',text:'员工姓名',dictCode:''})
        fieldList.push({type:'string',value:'gender',text:'性别',dictCode:''})
        fieldList.push({type:'date',value:'birthDate',text:'出生日期'})
        fieldList.push({type:'string',value:'mz',text:'民族',dictCode:''})
        fieldList.push({type:'string',value:'jg',text:'籍贯',dictCode:''})
        fieldList.push({type:'string',value:'idType',text:'证件类型',dictCode:''})
        fieldList.push({type:'string',value:'idCard',text:'身份证号码',dictCode:''})
        fieldList.push({type:'string',value:'hjxz',text:'户籍性质',dictCode:''})
        fieldList.push({type:'string',value:'hjdz',text:'户籍地址',dictCode:''})
        fieldList.push({type:'Text',value:'photo',text:'员工照片',dictCode:''})
        fieldList.push({type:'string',value:'zzmm',text:'政治面貌',dictCode:''})
        fieldList.push({type:'string',value:'hyzk',text:'婚姻状况',dictCode:''})
        fieldList.push({type:'string',value:'jkzk',text:'健康状况',dictCode:''})
        fieldList.push({type:'Text',value:'ywbs',text:'以往病史',dictCode:''})
        fieldList.push({type:'string',value:'xqah',text:'兴趣爱好',dictCode:''})
        fieldList.push({type:'string',value:'phoneNumber',text:'联系方式',dictCode:''})
        fieldList.push({type:'string',value:'email',text:'邮箱',dictCode:''})
        fieldList.push({type:'string',value:'address',text:'联系地址',dictCode:''})
        fieldList.push({type:'string',value:'jzd',text:'居住地',dictCode:''})
        fieldList.push({type:'string',value:'zzdz',text:'暂住地址',dictCode:''})
        fieldList.push({type:'string',value:'zsfs',text:'住宿方式',dictCode:''})
        fieldList.push({type:'string',value:'dormitory',text:'宿舍信息',dictCode:''})
        fieldList.push({type:'string',value:'card',text:'员工卡号',dictCode:''})
        fieldList.push({type:'string',value:'no',text:'员工工号',dictCode:''})
        fieldList.push({type:'string',value:'employeeType',text:'员工类型',dictCode:''})
        fieldList.push({type:'string',value:'companyId',text:'所属公司 ID',dictCode:"hrm_org,name,id"})
        fieldList.push({type:'string',value:'dept',text:'所属部门 ID',dictCode:"hrm_org,name,id"})
        fieldList.push({type:'string',value:'mainDept',text:'主部门',dictCode:"hrm_org,name,id"})
        fieldList.push({type:'string',value:'postId',text:'所属岗位 ID',dictCode:"hr_job_sequence,post_name,id"})
        fieldList.push({type:'string',value:'postRank',text:'岗位职级 ID',dictCode:"hr_job_level,level_name,id"})
        fieldList.push({type:'string',value:'positionInfoId',text:'岗位信息 ID',dictCode:''})
        fieldList.push({type:'string',value:'gwbz',text:'岗位备注',dictCode:''})
        fieldList.push({type:'string',value:'rzfs',text:'入职方式',dictCode:''})
        fieldList.push({type:'string',value:'sourceTag',text:'招聘计划',dictCode:''})
        fieldList.push({type:'string',value:'status',text:'入职状态',dictCode:''})
        fieldList.push({type:'string',value:'syq',text:'试用期',dictCode:''})
        fieldList.push({type:'date',value:'entryDate',text:'入职日期'})
        fieldList.push({type:'date',value:'actualDate',text:'实际到岗日期'})
        fieldList.push({type:'datetime',value:'bdrq',text:'报道日期'})
        fieldList.push({type:'string',value:'becomeType',text:'转正类型',dictCode:''})
        fieldList.push({type:'date',value:'sjzzrq',text:'计划转正日期'})
        fieldList.push({type:'date',value:'formalResignDate',text:'正式离职日期'})
        fieldList.push({type:'int',value:'workYears',text:'工作年限',dictCode:''})
        fieldList.push({type:'string',value:'entryDirector',text:'入职负责人',dictCode:''})
        fieldList.push({type:'string',value:'mentor',text:'导师姓名',dictCode:''})
        fieldList.push({type:'string',value:'profileStatus',text:'资料状态',dictCode:''})
        fieldList.push({type:'string',value:'informationId',text:'个人信息 ID',dictCode:''})
        fieldList.push({type:'string',value:'workLocation',text:'工作厂区 / 位置',dictCode:''})
        fieldList.push({type:'string',value:'sfczjyxzxy',text:'是否存在竞业限制协议',dictCode:''})
        fieldList.push({type:'string',value:'constractBelong',text:'合同归属',dictCode:''})
        fieldList.push({type:'string',value:'constractType',text:'合同类型',dictCode:''})
        fieldList.push({type:'date',value:'contractStartDate',text:'合同开始日期	'})
        fieldList.push({type:'date',value:'contractExpDate',text:'合同到期日期'})
        fieldList.push({type:'int',value:'salary',text:'薪资(k)',dictCode:''})
        fieldList.push({type:'string',value:'salaryType',text:'薪资类型',dictCode:''})
        fieldList.push({type:'string',value:'gzkyhkh',text:'银行卡号',dictCode:''})
        fieldList.push({type:'string',value:'gzkyh',text:'工资卡银行',dictCode:''})
        fieldList.push({type:'string',value:'gzkkhh',text:'工资卡开户行',dictCode:''})
        fieldList.push({type:'string',value:'socialSecurityStatus',text:'社保状态',dictCode:''})
        fieldList.push({type:'string',value:'sbqk',text:'社保情况',dictCode:''})
        fieldList.push({type:'string',value:'sbdnh',text:'社保电脑号',dictCode:''})
        fieldList.push({type:'string',value:'stopSocialSecurityStatus',text:'社保停缴状态',dictCode:''})
        fieldList.push({type:'date',value:'sbStartDate',text:'首次社保缴纳日期'})
        fieldList.push({type:'string',value:'accumulationFundStatus',text:'公积金状态',dictCode:''})
        fieldList.push({type:'string',value:'gjjqk',text:'公积金情况',dictCode:''})
        fieldList.push({type:'string',value:'gjjdhh',text:'公积金电脑号',dictCode:''})
        fieldList.push({type:'string',value:'stopAccumulationFundStatus',text:'公积金停缴状态',dictCode:''})
        fieldList.push({type:'string',value:'gjjyhkh',text:'公积金银行卡号',dictCode:''})
        fieldList.push({type:'string',value:'gjjyh',text:'公积金银行',dictCode:''})
        fieldList.push({type:'string',value:'gjjkhyh',text:'公积金开户银行',dictCode:''})
        fieldList.push({type:'string',value:'byyx',text:'毕业院校',dictCode:''})
        fieldList.push({type:'string',value:'xl',text:'学历',dictCode:''})
        fieldList.push({type:'string',value:'zy',text:'专业',dictCode:''})
        fieldList.push({type:'string',value:'xw',text:'学位',dictCode:''})
        fieldList.push({type:'string',value:'hrmRzglId',text:'主表',dictCode:''})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>
