<!--
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-11-20 14:44:42
 * @LastEditors: 匹诺曹 1164698177@qq.com
 * @LastEditTime: 2025-11-27 14:39:59
 * @FilePath: \ztsisnew\ant-design-vue-jeecg\src\views\content-management\audit-center\pending-review\index.vue
 * @Description: 注册审核中心 - 待审核
-->
<template>
  <a-card :bordered="false">
    <a-row>
      <a-col :span="24">
        <div class="titlePanel">
          <div class="logoCel">
            <img src="../../../../assets/contentManagement/logo.png" alt="">
          </div>
          <h3 class="fz20 fw700 name">注册审核中心 - 待审核</h3>
        </div>
        <div class="staticPanel">
          <div class="staticItem">
            <div class="imgBox">
              <img src="../../../../assets/contentManagement/icon_01.png" alt="">
            </div>
            <div class="ml20 textBox">
              <p class="fz16 fw700 text_t">累计申请总次数</p>
              <p class="fz12 fuzzyCor text_b">
                <span>{{ registerUserCodeObj.total }}</span>
                <span>次</span>
              </p>
            </div>
          </div>
          <div class="staticItem" v-for="(item, index) in registerUserCodeObj.groupTotal" :key="index">
            <div class="imgBox">
              <img :src="getStatusIcon(index)" alt="">
            </div>
            <div class="ml20 textBox">
              <p class="fz16 fw700 text_t">{{ item.state }}</p>
              <p class="fz12 fuzzyCor text_b">
                <span>{{ item.count }}</span>
                <span>项</span>
              </p>
            </div>
          </div>
          <div class="staticItem">
            <div class="imgBox">
              <img src="../../../../assets/contentManagement/icon_05.png" alt="">
            </div>
            <div class="ml20 textBox">
              <p class="fz16 fw700 text_t">今日申请总数量</p>
              <p class="fz12 fuzzyCor text_b">
                <span>{{ registerUserCodeObj.nowTotal }}</span>
                <span>项</span>
              </p>
            </div>
          </div>
        </div>
      </a-col>
    </a-row>

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
      <a-button type="primary" icon="download" @click="handleExportXls('用户注册申请表')">导出</a-button>
      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl"
        @change="handleImportExcel">
        <a-button type="primary" icon="import">导入</a-button>
      </a-upload>
      <!-- 高级查询区域 -->
      <j-super-query :fieldList="superFieldList" ref="superQueryModal"
        @handleSuperQuery="handleSuperQuery"></j-super-query>
      <a-dropdown v-if="selectedRowKeys.length > 0">
        <a-menu slot="overlay">
          <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
        </a-menu>
        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
      </a-dropdown>
    </div>

    <!-- table区域-begin -->
    <div>
      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">
        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{
          selectedRowKeys.length }}</a>项
        <a style="margin-left: 24px" @click="onClearSelected">清空</a>
      </div>

      <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
        :dataSource="dataSource" :pagination="ipagination" :loading="loading"
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }" class="j-table-force-nowrap"
        @change="handleTableChange">

        <template slot="htmlSlot" slot-scope="text">
          <div v-html="text"></div>
        </template>
        <template slot="state" slot-scope="text, record">
          <div>
            <a-tag color="blue" v-if="record.state === '0'">{{ record.state_dictText }}</a-tag>
          </div>
        </template>
        <template slot="imgSlot" slot-scope="text,record">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
          <img v-else :src="getImgView(text)" :preview="record.id" height="25px" alt=""
            style="max-width:80px;font-size: 12px;font-style: italic;" />
        </template>
        <template slot="fileSlot" slot-scope="text">
          <span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
          <a-button v-else :ghost="true" type="primary" icon="download" size="small" @click="downloadFile(text)">
            下载
          </a-button>
        </template>

        <span slot="action" slot-scope="text, record">
          <a style="color: #E99D42" @click="handleAudit(record)">审核</a>
          <a class="ml10" @click="handleEdit(record)">编辑</a>

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

    <zt-user-registration-modal ref="modalForm" @ok="modalFormOk"></zt-user-registration-modal>

    <!-- 审核弹窗 -->
    <audit-modal v-if="auditModalShow" :formId="formId" @fromAuditModalFun="fromAuditModalFun"></audit-modal>
  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ZtUserRegistrationModal from './modules/ZtUserRegistrationModal'
// import { filterMultiDictText } from '@/components/dict/JDictSelectUtil'
import AuditModal from '@/views/contentManagement/auditCenter/pendingReview/modules/AuditModal'
import { httpAction } from '@/api/manage'
import dayjs from 'dayjs'
import { SuperQuery } from '@/utils/superQueryUtil'

const getDefaultGroupTotal = () => ([
  { state: '0', count: 0 },
  { state: '1', count: 0 },
  { state: '2', count: 0 }
])

export default {
  name: 'ZtUserRegistrationList',
  mixins: [JeecgListMixin, mixinDevice],
  data () {
    return {
      disableMixinCreated: true,
      auditModalShow: false,
      formId: '',
      registerUserCodeObj: {
        groupTotal: [],
        nowTotal: 0,
        total: 0
      },
      description: '用户注册申请表管理页面',
      columns: [
        {
          title: '#',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: "center",
          customRender: function (t, r, index) {
            return parseInt(index) + 1;
          }
        },
        {
          title: '申请时间',
          align: "center",
          dataIndex: 'createTime'
        },
        {
          title: '姓名',
          align: "center",
          dataIndex: 'name'
        },
        {
          title: '手机号',
          align: "center",
          dataIndex: 'phone'
        },
        {
          title: '审核状态',
          align: "center",
          dataIndex: 'state',
          scopedSlots: { customRender: 'state' }
        },
        {
          title: '企业名称',
          align: "center",
          dataIndex: 'qyName'
        },
        {
          title: '行业',
          align: "center",
          dataIndex: 'hy'
        },
        {
          title: '职位',
          align: "center",
          dataIndex: 'zw'
        },
        {
          title: '操作',
          dataIndex: 'action',
          align: "center",
          fixed: "right",
          width: 200,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: "/marketModule/ztUserRegistration/list",
        delete: "/marketModule/ztUserRegistration/delete",
        deleteBatch: "/marketModule/ztUserRegistration/deleteBatch",
        exportXlsUrl: "/marketModule/ztUserRegistration/exportXls",
        importExcelUrl: "marketModule/ztUserRegistration/importExcel",
      },
      dictOptions: {},
      superFieldList: [],
    }
  },
  created () {
    this.url.list = this.url.list + '?' + SuperQuery.getSuperQuery(
      SuperQuery.QueryType.and,
      SuperQuery.queryItem("state", "0", SuperQuery.FieldType.String, SuperQuery.FieldRule.等于)
    )

    this.loadData(1)
    this.initDictConfig && this.initDictConfig()

    this.getSuperFieldList()
    this.getStaticData()
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
    },
  },
  methods: {
    initDictConfig () {
    },
    getSuperFieldList () {
      let fieldList = [];
      fieldList.push({ type: 'string', value: 'state', text: '状态', dictCode: 'zcState' })
      fieldList.push({ type: 'string', value: 'name', text: '姓名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'qyName', text: '企业名称', dictCode: '' })
      fieldList.push({ type: 'string', value: 'hy', text: '行业', dictCode: '' })
      fieldList.push({ type: 'string', value: 'zw', text: '职位', dictCode: '' })
      fieldList.push({ type: 'string', value: 'phone', text: '手机号码', dictCode: '' })
      this.superFieldList = fieldList
    },

    /**
     * 审核
     */
    handleAudit (record) {
      this.formId = record.id
      this.auditModalShow = true
    },

    fromAuditModalFun (flag) {
      if (flag) {
        this.loadData()
      }
      this.auditModalShow = false
    },

    /**
     * 获取统计数据
     */
    getStaticData () {
      this.registerUserCodeObj.groupTotal = []
      this.registerUserCodeObj.nowTotal = 0
      this.registerUserCodeObj.total = 0
      const params = {
        registerUserCode: {
          date: dayjs().format('YYYY-MM-DD')
        }
      }
      httpAction('/commonTj/ztTjInfo/getTjListByCodes', params, 'post').then(res => {
        const { code, result, message } = res
        if (code === 200) {
          this.registerUserCodeObj.groupTotal = result.registerUserCode.groupTotal || []
          this.registerUserCodeObj.nowTotal = result.registerUserCode.nowTotal || 0
          this.registerUserCodeObj.total = result.registerUserCode.total || 0
        } else {
          this.$message.warning(message)
        }
      })
    },
    normalizeGroupTotal (groupTotal = []) {
      const defaults = getDefaultGroupTotal()
      if (!Array.isArray(groupTotal) || groupTotal.length === 0) {
        return defaults
      }
      return defaults.map(item => {
        const target = groupTotal.find(it => `${it.state}` === `${item.state}`)
        return {
          ...item,
          count: target && target.count ? target.count : 0
        }
      })
    },
    getStatusIcon (index) {
      const iconMap = ['02', '03', '04']
      const iconKey = iconMap[index] || '02'
      try {
        return require(`@/assets/contentManagement/icon_${iconKey}.png`)
      } catch (e) {
        return require('@/assets/contentManagement/icon_02.png')
      }
    }
  },
  components: {
    ZtUserRegistrationModal,
    AuditModal
  }
}
</script>
<style scoped lang="less">
@import '~@assets/less/common.less';

.titlePanel {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-bottom: 1px solid #F2F3F5;
}

.staticPanel {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 20px;
  justify-content: center;
  align-items: center;
  border-bottom: 1px solid #F2F3F5;
  margin-bottom: 20px;

  .staticItem {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px 0;

    .imgBox {
      width: 60px;
      height: 60px;
      border-radius: 50%;

      >img {
        display: block;
        width: 100%;
      }
    }

    .textBox {
      height: 60px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;

      >p {
        margin: 0;
        padding: 0;
      }

      .text_b {

        span:first-child {
          font-size: 24px;
          color: black;
        }

        span:last-child {
          margin-left: 30px;
        }
      }
    }
  }
}
</style>