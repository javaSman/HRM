<template>
  <a-card :bordered="false">
    <!-- 查询区域 -->
<!--    <div class="table-page-search-wrapper">-->
<!--      <a-form layout="inline" @keyup.enter.native="searchQuery">-->
<!--        <a-row :gutter="24">-->
<!--        </a-row>-->
<!--      </a-form>-->
<!--    </div>-->
    <!-- 查询区域-END -->

    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
<!--      <a-button type="primary" icon="download" @click="handleExportXls('用户图层表')">导出</a-button>-->
<!--      <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader" :action="importExcelUrl" @change="handleImportExcel">-->
<!--        <a-button type="primary" icon="import">导入</a-button>-->
<!--      </a-upload>-->
<!--      &lt;!&ndash; 高级查询区域 &ndash;&gt;-->
<!--      <j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery"></j-super-query>-->
<!--      <a-dropdown v-if="selectedRowKeys.length > 0">-->
<!--        <a-menu slot="overlay">-->
<!--          <a-menu-item key="1" @click="batchDel"><a-icon type="delete"/>删除</a-menu-item>-->
<!--        </a-menu>-->
<!--        <a-button style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>-->
<!--      </a-dropdown>-->
    </div>

    <!-- table区域-begin -->
    <div>
<!--      <div class="ant-alert ant-alert-info" style="margin-bottom: 16px;">-->
<!--        <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择 <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项-->
<!--        <a style="margin-left: 24px" @click="onClearSelected">清空</a>-->
<!--      </div>-->

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
           <a @click="copyUrl(record)" :class="'copy'+record.id">复制链接</a>
          <a-divider type="vertical" />
          <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
              <a>删除</a>
          </a-popconfirm>
        </span>

      </a-table>
    </div>

    <zt-user-layer-modal :layerId="layerId" ref="modalForm" @ok="modalFormOk"></zt-user-layer-modal>
  </a-card>
</template>

<script>

  import '@/assets/less/TableExpand.less'
  import { mixinDevice } from '@/utils/mixin'
  import { JeecgListMixin } from '@/mixins/JeecgListMixin'
  import ZtUserLayerModal from './modules/ZtUserLayerModal'
  // 复制的插件
  import Clipboard from 'clipboard';

  export default {
    name: 'ZtUserLayerList',
    mixins:[JeecgListMixin, mixinDevice],
    components: {
      ZtUserLayerModal
    },
    props:{
      layerId:{
        type: String,
        required:true,
      }
    },
    watch:{
      layerId:{
        handler (newValue, oldValue) {
          this.queryParam.layerId = newValue;
          this.loadData();
        },
        immediate: true
      },
    },

    data () {
      return {
        description: '用户图层表管理页面',
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
            title:'用户id',
            align:"center",
            dataIndex: 'username_dictText'
          },
          // {
          //   title:'图层id',
          //   align:"center",
          //   dataIndex: 'layerId'
          // },
          {
            title:'结束时间',
            align:"center",
            dataIndex: 'endTime'
          },
          {
            title:'每天可用次数',
            align:"center",
            dataIndex: 'availableNum'
          },
          {
            title:'剩余次数',
            align:"center",
            dataIndex: 'residueNum'
          },
          {
            title:'是否过期',
            align:"center",
            dataIndex: 'status'
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
          list: "/layerManage/ztUserLayer/list",
          delete: "/layerManage/ztUserLayer/delete",
          deleteBatch: "/layerManage/ztUserLayer/deleteBatch",
          exportXlsUrl: "/layerManage/ztUserLayer/exportXls",
          importExcelUrl: "layerManage/ztUserLayer/importExcel",

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
      copyUrl(record){
        let id = record.id;
        let url = `${window._CONFIG['domianURL']}/proxyMapServer/${id}`;
        this.copyText(url,id);
      },

      // 拷贝文本
      copyText(text,id){
        let that = this;
        let clipboard = new Clipboard('.copy'+id, {
          text: function () {
            return text
          }
        });
        clipboard.on('success', e => {
          that.$message.success("复制成功");
          // 释放内存
          clipboard.destroy()
        });
        clipboard.on('error', e => {
          that.$message.error("复制失败");
          clipboard.destroy()
        })
      },



      initDictConfig(){
      },
      getSuperFieldList(){
        let fieldList=[];
        fieldList.push({type:'sel_user',value:'username',text:'用户账号'})
        fieldList.push({type:'string',value:'layerId',text:'图层id',dictCode:''})
        fieldList.push({type:'datetime',value:'endTime',text:'结束时间'})
        fieldList.push({type:'int',value:'availableNum',text:'每天可用次数',dictCode:''})
        fieldList.push({type:'int',value:'residueNum',text:'剩余次数',dictCode:''})
        this.superFieldList = fieldList
      }
    }
  }
</script>
<style scoped>
  @import '~@assets/less/common.less';
</style>