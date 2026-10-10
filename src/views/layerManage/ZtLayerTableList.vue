<template>
  <a-card :bordered='false'>
    <!-- 查询区域 -->
    <div class='table-page-search-wrapper'>
      <a-form layout='inline' @keyup.enter.native='searchQuery'>
        <a-row :gutter='24' style='display: flex;align-items: end'>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='图层名称'>
              <a-input placeholder='请输入图层名称' v-model='layerName'></a-input>
            </a-form-item>
          </a-col>
          <a-col :xl='10' :lg='11' :md='12' :sm='24'>
            <a-form-item label='图层日期'>
              <j-date placeholder='请选择开始日期' class='query-group-cust' v-model='queryParam.layerData_begin'></j-date>
              <span class='query-group-split-cust'></span>
              <j-date placeholder='请选择结束日期' class='query-group-cust' v-model='queryParam.layerData_end'></j-date>
            </a-form-item>
          </a-col>
          <a-col :xl='6' :lg='7' :md='8' :sm='24'>
            <a-form-item label='服务类型'>
              <j-dict-select-tag placeholder='请选择服务类型' v-model='queryParam.serviceType' dictCode='service_type' />
            </a-form-item>
          </a-col>
        </a-row>

        <a-row style='display: flex;padding-top: 10px;' >
          <a-col :xl='12' :lg='7' :md='8' :sm='24'>
            <span style="margin: 10px 0 ;" class='table-page-search-submitButtons'>
              <a-button type='primary' @click='searchQuery' icon='search'>查询</a-button>
              <a-button type='primary' @click='searchReset' icon='reload' style='margin-left: 8px'>重置</a-button>

              <a-button style='margin-left: 8px' type="primary" icon="download" @click="handleExportXls(modulesName)">导出</a-button>
              <a-button style='margin-left: 8px' type="primary" icon="download" @click="handleExportXlsNew('zt_layer',modulesName)">新导出</a-button>

              <a-upload style='margin-left: 8px' name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
                :action="importExcelUrl" @change="handleImportExcel">
                <a-button type="primary" icon="import">导入</a-button>
              </a-upload>
              <a-upload style='margin-left: 8px' name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
                :action="importExcelUrlNew" @change="handleImportExcelNew">
                <a-button type="primary" icon="import">新导入</a-button>
              </a-upload>

            </span>
            <span class='table-page-search-submitButtons'>
              <!-- 操作按钮区域 -->
              <a-button @click='handleAdd'  type='primary' icon='plus'>新增</a-button>

              <j-super-query :fieldList='superFieldList' ref='superQueryModal' @handleSuperQuery='handleSuperQuery'
                style='margin-left: 10px'></j-super-query>

              <a-dropdown v-if='selectedRowKeys.length > 0'>
                <a-menu slot='overlay'>
                  <a-menu-item key='1' @click='batchDel'><a-icon type='delete' />删除</a-menu-item>
                </a-menu>
                <a-button style='margin-left: 8px'> 批量操作 <a-icon type='down' /></a-button>
              </a-dropdown>

              <label style='margin-left: 10px;font-weight: 600;'>
                级联查询：
                <a-switch v-model='flag' @change='switchChange' checked-children='开' un-checked-children='关'
                  style='margin-left: 5px;margin-bottom: 3px' />
              </label>
            </span>

          </a-col>

          <a-col :xl='12' :lg='7' :md='8' :sm='24'>
            <div style='padding-bottom: 10px'>
              <div class='labelName'> 图层层级规则:</div>
              <div>
                1. 底层<span class='Tip'>(1~999):</span>一般是类似于影像地图，且全覆盖的一般位于这个区间
                <br />
                2. 中层<span class='Tip'>(1000~1999):</span> 一般是面状不透明、分布块状数据的较为合适
                <br />
                3. 顶层<span class='Tip'>(2000~2999):</span> 类似于注记、行政区界限、线状、不会被遮挡的,设置在这个区间较为合适
                <br />
                4. 设置在 <span style='font-weight: bold'>同一区间</span> 的图层，后打开的图层会自动位于 <span
                  style='font-weight: bold'>同一区间</span> 下图层的最上面
              </div>
            </div>
          </a-col>
        </a-row>

      </a-form>
    </div>
    <!-- 查询区域-END -->

    <!-- table区域-begin -->
    <div>
      <div class='ant-alert ant-alert-info' style='margin-bottom: 16px;'>
        <i class='anticon anticon-info-circle ant-alert-icon'></i> 已选择 <a style='font-weight: 600'>{{
    selectedRowKeys.length }}</a>项
        <a style='margin-left: 24px' @click='onClearSelected'>清空</a>
      </div>

      <a-table ref='table' size='middle' :scroll='{ x: true }' bordered rowKey='id' :columns='columns'
        :dataSource='dataSource' :pagination='ipagination' :loading='loading'
        :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: mySelectChange, type: isRadio ? 'radio' : 'checkbox' }"
        class='j-table-force-nowrap' @change='handleTableChange'>

        <template slot='htmlSlot' slot-scope='text'>
          <div v-html='text'></div>
        </template>
        <template slot='imgSlot' slot-scope='text,record'>
          <!--          <span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>-->
          <!--          <img v-else :src="getImgView(text)" :preview="record.id" height="25px" alt="" style="max-width:80px;font-size: 12px;font-style: italic;"/>-->
          <img :src="record.resourceUrl + '/info/thumbnail'" :preview='record.id' height='25px' alt=''
            style='max-width:80px;font-size: 12px;font-style: italic;' />
        </template>
        <template slot='fileSlot' slot-scope='text'>
          <span v-if='!text' style='font-size: 12px;font-style: italic;'>无文件</span>
          <a-button v-else :ghost='true' type='primary' icon='download' size='small' @click='downloadFile(text)'>
            下载
          </a-button>
        </template>

        <span slot='action' slot-scope='text, record'>
          <a @click='handleEdit(record)'>编辑</a>
          <a-divider type='vertical' />
          <a @click='view(record)'>查看</a>
          <a-divider type='vertical' />

          <a-dropdown>
            <a class='ant-dropdown-link'>更多 <a-icon type='down' /></a>
            <a-menu slot='overlay'>
              <a-menu-item>
                <a @click='handleDetail(record)'>详情</a>
              </a-menu-item>
              <a-menu-item>
                <a-popconfirm title='确定删除吗?' @confirm='() => handleDelete(record.id)'>
                  <a>删除</a>
                </a-popconfirm>
              </a-menu-item>
            </a-menu>
          </a-dropdown>
        </span>

      </a-table>
    </div>

    <zt-layer-modal ref='modalForm' @ok='modalFormOk' :menu-id='menuId'></zt-layer-modal>


    <a-drawer title='关联打开模块' placement='right' width='50%' :closable='false' :visible='drawerVisible' @close='onClose'>
      <tree-tag-card v-if='drawerVisible' :target-id='treeId' :target-name='treeName'
        :code-list-obj='codeList'></tree-tag-card>
    </a-drawer>


  </a-card>
</template>

<script>

import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import ZtLayerModal from './modules/ZtLayerModal'
import TreeTagCard from '@comp/common/TreeTagCard'
import { filterMultiDictText } from '@/components/dict/JDictSelectUtil'
import { getVariableByCode } from '@/utils/util'
export default {
  name: 'ZtLayerTableList',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    ZtLayerModal,
    TreeTagCard
  },
  watch: {
    // 深度监听 demo
    menuId: {
      handler(val) {
        this.queryParam.menuId = val
        this.queryParam.flag = this.flag
        this.loadData()
      },
      immediate: true
    },
    keyId: {
      handler(val) {
        if (val != null && val != '') {
          this.selectedRowKeys =val.split(',')
        }
        // this.loadData();
      },
      immediate: true
    },
    layerName: {
      handler(val) {
        this.queryParam.name = `*${val}*`
      },
      immediate: true
    }

  },


  // menu_Id
  props: {
    menuId: {
      type: String,
      required: true
    },
    keyId: {
      type: String,
      required: false
    },
    isRadio: {
      type: Boolean,
      default: false,
      required: false
    }
  },
  //

  data() {
    return {
      modulesName:'成果目录',
      flag: true,
      layerName: '',
      // 与哪些模块相关
      codeList: [],
      description: '图层属性表管理页面',
      // 表头
      columns: [
        {
          title: '序号',
          dataIndex: '',
          key: 'rowIndex',
          width: 60,
          align: 'center',
          customRender: function (t, r, index) {
            return parseInt(index) + 1
          }
        },
        {
          title: '菜单目录',
          align: 'center',
          dataIndex: 'menuId_dictText'
        },
        {
          title: '图层日期',
          align: 'center',
          dataIndex: 'layerData',
          customRender: function (text) {
            return !text ? '' : (text.length > 10 ? text.substr(0, 10) : text)
          }
        },
        {
          title: '图片',
          align: 'center',
          dataIndex: 'img',
          scopedSlots: { customRender: 'imgSlot' }
        },
        {
          title: '图层名称',
          align: 'center',
          dataIndex: 'name'
        },
        {
          title: '属性名',
          align: 'center',
          dataIndex: 'propertyName'
        },
        {
          title: '资源url',
          align: 'center',
          dataIndex: 'resourceUrl'
        },
        {
          title: '服务类型',
          align: 'center',
          dataIndex: 'serviceType_dictText'
        },
        {
          title: '星源',
          align: 'center',
          dataIndex: 'starSource'
        },
        {
          title: '分辨率',
          align: 'center',
          dataIndex: 'resolutionRate'
        },
        {
          title: '区域覆盖率(%)',
          align: 'center',
          dataIndex: 'coverageRate'
        },
        {
          title: '原始位置',
          align: 'center',
          dataIndex: 'originalPosition'
        },
        // {
        //   title:'拓展参数',
        //   align:"center",
        //   dataIndex: 'exten'
        // },
        {
          title: '备注',
          align: 'center',
          dataIndex: 'remarks'
        },
        // {
        //   title:'菜单id',
        //   align:"center",
        //   dataIndex: 'menuId'
        // },
        {
          title: '操作',
          dataIndex: 'action',
          align: 'center',
          fixed: 'right',
          width: 147,
          scopedSlots: { customRender: 'action' }
        }
      ],
      url: {
        list: '/layerManage/ztLayer/list',
        delete: '/layerManage/ztLayer/delete',
        deleteBatch: '/layerManage/ztLayer/deleteBatch',
        exportXlsUrl: '/layerManage/ztLayer/exportXls',
        importExcelUrl: 'layerManage/ztLayer/importExcel',
        importExcelUrlNewName: 'zt_layer'

      },
      dictOptions: {},
      superFieldList: [],

      // 抽屉相关
      drawerVisible: false,
      treeId: '',
      treeName: ''
    }
  },
  created() {
    this.getSuperFieldList()
    // 系统变量中控制 resultMenuCode
    let data = getVariableByCode('resultMenuCode')
    this.codeList = data.codeList
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },

  },
  methods: {
    initDictConfig() {
    },
    view(record) {
      this.treeId = record.id
      this.treeName = record.name
      this.drawerVisible = true
    },
    onClose() {
      this.drawerVisible = false
    },

    mySelectChange(selectedRowKeys, selectionRows) {
      this.onSelectChange(selectedRowKeys, selectionRows)
      this.$emit('getKey', selectionRows)

      // if (selectedRowKeys.length == 1) {
      //   let layerItem = selectionRows[0]
      //   this.$emit('getKey', layerItem)
      // } else {
      //   this.$emit('getKey', '')
      // }

    },

    switchChange() {
      this.queryParam.flag = this.flag
      this.loadData()
    },

    getSuperFieldList() {
      let fieldList = []
      fieldList.push({ type: 'string', value: 'name', text: '图层名称', dictCode: '' })
      fieldList.push({ type: 'date', value: 'layerData', text: '图层日期' })
      fieldList.push({ type: 'string', value: 'propertyName', text: '属性名', dictCode: '' })
      fieldList.push({ type: 'string', value: 'resourceUrl', text: '资源url', dictCode: '' })
      fieldList.push({ type: 'string', value: 'serviceType', text: '服务类型', dictCode: 'service_type' })
      fieldList.push({ type: 'string', value: 'originalPosition', text: '原始位置', dictCode: '' })
      fieldList.push({ type: 'string', value: 'starSource', text: '星源', dictCode: '' })
      fieldList.push({ type: 'string', value: 'resolutionRate', text: '分辨率', dictCode: '' })
      fieldList.push({ type: 'double', value: 'coverageRate', text: '区域覆盖率', dictCode: '' })
      fieldList.push({ type: 'string', value: 'exten', text: '拓展参数', dictCode: '' })
      fieldList.push({ type: 'string', value: 'remarks', text: '备注', dictCode: '' })
      fieldList.push({ type: 'string', value: 'menuId', text: '菜单id', dictCode: '' })
      this.superFieldList = fieldList
    }
  }
}
</script>
<style scoped>
@import '~@assets/less/common.less';

/deep/ .table-page-search-wrapper .ant-form-inline .ant-form-item {
  margin-bottom: 0px !important;
}

.notice {
  font-weight: bold;
  color: #ffc53d;
  font-size: 18px;

}

.labelName {
  color: #1890FF;
  font-weight: bold;
  margin-top: 10px;
  /*margin: 10px 0px;*/
}

.Tip {
  font-weight: bold;
}
</style>