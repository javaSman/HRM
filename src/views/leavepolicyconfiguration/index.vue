<template>
    <a-card :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
            <a-form layout="inline" @keyup.enter.native="searchQuery">
                <a-row :gutter="24"> </a-row>
            </a-form>
        </div>
        <!-- 查询区域-END -->

        <!-- 操作按钮区域 -->
        <div class="table-operator">
            <a-button @click="handleAdd" class="rule-btn-primary" type="primary" icon="plus">新增</a-button>
            <a-button type="primary" class="rule-btn-primary" icon="download"
                @click="handleExportXls('请假规则配置')">导出</a-button>
            <a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
                :action="importExcelUrlNew" @change="handleImportExcelNew">
                <a-button class="rule-btn-primary" type="primary" icon="import">导入</a-button>
            </a-upload>
            <!-- 高级查询区域 -->
            <j-super-query btnClass="rule-btn-primary" :fieldList="superFieldList" ref="superQueryModal"
                @handleSuperQuery="handleSuperQuery"></j-super-query>
            <a-dropdown v-if="selectedRowKeys.length > 0">
                <a-menu slot="overlay">
                    <a-menu-item key="1" @click="batchDel"><a-icon type="delete" />删除</a-menu-item>
                </a-menu>
                <a-button class="rule-btn-reset" style="margin-left: 8px"> 批量操作 <a-icon type="down" /></a-button>
            </a-dropdown>
        </div>

        <!-- table区域-begin -->
        <div>
            <div class="ant-alert ant-alert-info" style="margin-bottom: 16px">
                <i class="anticon anticon-info-circle ant-alert-icon"></i> 已选择
                <a style="font-weight: 600">{{ selectedRowKeys.length }}</a>项
                <a style="margin-left: 24px" @click="onClearSelected">清空</a>
            </div>
            <div class="rule-table-wrap">
                <a-table ref="table" size="middle" :scroll="{ x: true }" bordered rowKey="id" :columns="columns"
                    :dataSource="dataSource" :pagination="ipagination" :loading="loading"
                    :rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
                    class="j-table-force-nowrap" @change="handleTableChange">
                    <template slot="htmlSlot" slot-scope="text">
                        <div v-html="text"></div>
                    </template>
                    <template slot="imgSlot" slot-scope="text, record">
                        <span v-if="!text" style="font-size: 12px; font-style: italic">无图片</span>
                        <img v-else :src="getImgView(text)" :preview="record.id" height="25px" alt=""
                            style="max-width: 80px; font-size: 12px; font-style: italic" />
                    </template>
                    <template slot="fileSlot" slot-scope="text">
                        <span v-if="!text" style="font-size: 12px; font-style: italic">无文件</span>
                        <a-button v-else :ghost="true" type="primary" icon="download" size="small"
                            @click="downloadFile(text)">
                            下载
                        </a-button>
                    </template>

                    <span slot="action" slot-scope="text, record">
                        <a @click="handleEdit(record)">编辑</a>
                        <a-divider type="vertical" />
                        <a @click="handleDetail(record)">详情</a>
                        <a-divider type="vertical" />
                        <a-popconfirm title="确定删除吗?" @confirm="() => handleDelete(record.id)">
                            <a>删除</a>
                        </a-popconfirm>
                    </span>
                </a-table>
            </div>
        </div>

        <leave-policyconfi-guration-rule-modal ref="modalForm"
            @ok="modalFormOk"></leave-policyconfi-guration-rule-modal>
    </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import LeavePolicyconfiGurationRuleModal from './modules/LeavePolicyconfiGurationRuleModal'

export default {
    name: 'LeavePolicyconfiGurationRuleList',
    mixins: [JeecgListMixin, mixinDevice],
    components: {
        LeavePolicyconfiGurationRuleModal,
    },
    data() {
        return {
            description: '请假规则配置管理页面',
            // 枚举选项（与表单保持一致；value 直接用中文）
            durationUnitOptions: [
                { value: '天', label: '天' },
                { value: '小时', label: '小时' },
            ],
            countDateTypesOptions: [
                { value: '工作日', label: '工作日' },
                { value: '休息日', label: '休息日' },
                { value: '法定节假日', label: '法定节假日' },
            ],
            validityStartTypeOptions: [
                { value: '结婚证登记日期', label: '结婚证登记日期' },
                { value: '出生证明出生日期', label: '出生证明出生日期' },
            ],
            validityUnitOptions: [
                { value: '天', label: '天' },
                { value: '月', label: '月' },
                { value: '年', label: '年' },
            ],
            attachmentRequireOptions: [
                { value: '是', label: '是' },
                { value: '否', label: '否' },
                { value: '后补', label: '后补' },
            ],
            supplementStartNodeOptions: [
                { value: '请假开始时间', label: '请假开始时间' },
                { value: '请假结束时间', label: '请假结束时间' },
                { value: '审批通过时间', label: '审批通过时间' },
            ],
            // 表头
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
                    title: '假勤类型',
                    align: "center",
                    dataIndex: 'jqType'
                },
                {
                    title: '请假基准时长',
                    align: "center",
                    dataIndex: 'jzsc'
                },
                {
                    title: '时长单位',
                    align: "center",
                    dataIndex: 'scdw'
                },
                {
                    title: '假期额度',
                    align: "center",
                    dataIndex: 'jqedts'
                },
                {
                    title: '是否允许分次请假',
                    align: "center",
                    dataIndex: 'isyxfcqj'
                },
                {
                    title: '计入天数的日期类型（多选）',
                    align: "center",
                    dataIndex: 'jrtsrqType'
                },
                {
                    title: '有效期起点',
                    align: "center",
                    dataIndex: 'yxqqd'
                },
                {
                    title: '有效期时长',
                    align: "center",
                    dataIndex: 'yxqsc'
                },
                {
                    title: '有效期时长单位',
                    align: "center",
                    dataIndex: 'yxqscdw'
                },
                {
                    title: '时长计算是否关联考勤规则',
                    align: "center",
                    dataIndex: 'isGlkqgzjs'
                },
                {
                    title: '请假节点是否依据考勤规则',
                    align: "center",
                    dataIndex: 'isQjjdyjkqgz'
                },
                {
                    title: '底薪时间是否计算',
                    align: "center",
                    dataIndex: 'isDxsjjs'
                },
                {
                    title: '考勤汇总时长计算',
                    align: "center",
                    dataIndex: 'isKqhzscjs'
                },
                {
                    title: '附件提交要求',
                    align: "center",
                    dataIndex: 'fjtjyq'
                },
                {
                    title: '附件补充期限/天',
                    align: "center",
                    dataIndex: 'fjbcqx'
                },
                {
                    title: '后补期限起算节点',
                    align: "center",
                    dataIndex: 'hbqxqsjd'
                },
                {
                    title: '附件要求提示',
                    align: "center",
                    dataIndex: 'fjyqts'
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    align: "center",
                    fixed: "right",
                    width: 147,
                    scopedSlots: { customRender: 'action' }
                }
            ],
            url: {
                list: "/hr_jqgl_gzpz/hrJqglGzpz/list",
                delete: "/hr_jqgl_gzpz/hrJqglGzpz/delete",
                deleteBatch: "/hr_jqgl_gzpz/hrJqglGzpz/deleteBatch",
                exportXlsUrl: "/hr_jqgl_gzpz/hrJqglGzpz/exportXls",
                importExcelUrl: "hr_jqgl_gzpz/hrJqglGzpz/importExcel",
                importExcelUrlNewName: 'HrJqglGzpz',
            },
            dictOptions: {},
            superFieldList: [],
        }
    },
    created() {
        this.getSuperFieldList()
    },
    computed: {
        importExcelUrl: function () {
            return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
        },
    },
    methods: {
        initDictConfig() { },
        // 是/否渲染（兼容数字 1/0 与字符串 '1'/'0'）
        renderYesNo(text) {
            // value 已是中文（是/否），直接展示
            return text || '-'
        },
        // 枚举值 → 中文文案
        renderOption(options, value) {
            const item = options.find((o) => o.value === value)
            return item ? item.label : value || '-'
        },
        getSuperFieldList() {
            let fieldList = []
            fieldList.push({ type: 'string', value: 'jqType', text: '假勤类型', dictCode: 'xj_type' })
            fieldList.push({ type: 'BigDecimal', value: 'jzsc', text: '请假基准时长', dictCode: '' })
            fieldList.push({ type: 'string', value: 'scdw', text: '时长单位', dictCode: '' })
            fieldList.push({ type: 'int', value: 'jqedts', text: '假期额度', dictCode: '' })
            fieldList.push({ type: 'string', value: 'isyxfcqj', text: '是否允许分次请假', dictCode: '' })
            fieldList.push({ type: 'string', value: 'jrtsrqType', text: '计入天数的日期类型', dictCode: '' })
            fieldList.push({ type: 'string', value: 'yxqqd', text: '有效期起点', dictCode: '' })
            fieldList.push({ type: 'string', value: 'yxqsc', text: '有效期时长', dictCode: '' })
            fieldList.push({ type: 'string', value: 'yxqscdw', text: '有效期时长单位', dictCode: '' })
            fieldList.push({ type: 'string', value: 'isGlkqgzjs', text: '时长计算是否关联考勤规则', dictCode: '' })
            fieldList.push({ type: 'string', value: 'isQjjdyjkqgz', text: '请假节点是否依据考勤规则', dictCode: '' })
            fieldList.push({ type: 'string', value: 'isDxsjjs', text: '底薪时间是否计算', dictCode: '' })
            fieldList.push({ type: 'string', value: 'isKqhzscjs', text: '考勤汇总时长计算', dictCode: '' })
            fieldList.push({ type: 'string', value: 'fjtjyq', text: '附件提交要求', dictCode: '' })
            fieldList.push({ type: 'int', value: 'fjbcqx', text: '附件补充期限/天', dictCode: '' })
            fieldList.push({ type: 'string', value: 'hbqxqsjd', text: '后补期限起算节点', dictCode: '' })
            fieldList.push({ type: 'string', value: 'fjyqts', text: '附件要求提示', dictCode: '' })
            this.superFieldList = fieldList
        },
    },
}
</script>
<style scoped lang="less">
// ---------- 按钮 ----------
.rule-btn-primary {
    height: 34px;
    border: 0;
    border-radius: 8px;
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
    box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
    font-size: 12px;
    font-weight: 600;

    &:hover,
    &:focus {
        background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
        opacity: 0.92;
    }
}

.rule-btn-reset {
    height: 34px;
    border-radius: 8px;
    color: #64748b;
    border-color: #e2e8f0;
    background: #ffffff;
    font-size: 12px;
    font-weight: 600;

    &:hover {
        color: #1a2a3d;
        border-color: rgba(37, 99, 235, 0.35);
    }
}

.rule-table-wrap {
    flex: 1;
    min-height: 0;
    padding: 12px 24px 18px;
    overflow-y: auto;

    /deep/ .ant-spin-nested-loading,
    /deep/ .ant-spin-container {
        min-height: 100%;
    }

    /deep/ .ant-table {
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid #e2e8f0;
    }

    /deep/ .ant-table-thead>tr>th {
        background: rgba(37, 99, 235, 0.03);
        color: #1a2a3d;
        font-weight: 600;
        font-size: 12px;
        border-bottom: 2px solid rgba(37, 99, 235, 0.08);
    }

    /deep/ .ant-table-tbody>tr:hover>td {
        background: rgba(37, 99, 235, 0.02);
    }

    /deep/ .ant-table-pagination.ant-pagination {
        margin: 16px 0 0;
    }
}

@import '~@assets/less/common.less';
</style>
