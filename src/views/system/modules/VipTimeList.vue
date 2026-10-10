<template>
    <a-drawer :title="title" :width="width" placement="right" :closable="false" @close="close" destroyOnClose
        :visible="visible">
        <a-table :columns="columns" :dataSource="dataSource" :pagination="ipagination">
            <span slot="action" slot-scope="text, record">
                <a @click="handleEdit(record)">编辑</a>
                <a-divider type="vertical" />
            </span>
        </a-table>

        <VipTimeModal ref="modalForm" @ok="modalFormOk"></VipTimeModal>
    </a-drawer>
</template>

<script>
import { getAction, postAction } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import VipTimeModal from './VipTimeModal.vue'

export default {
    name: 'VipTimeList',
    mixins: [JeecgListMixin],
    components: {
        VipTimeModal
    },
    data() {
        return {
            title: '时效列表',
            width: '30%',
            visible: false,
            disableSubmit: false,
            disableMixinCreated: true,
            url: {
                list: '/market/userAppConfig/list'
            },
            columns: [
                {
                    title: "购买内容",
                    align: "center",
                    width: 100,
                    dataIndex: "scVersion_dictText",
                },
                {
                    title: "创建时间",
                    align: "center",
                    width: 150,
                    dataIndex: "createTime"
                },
                {
                    title: "失效时间",
                    align: "center",
                    width: 150,
                    dataIndex: "sxTime"
                },
                {
                    title: '操作',
                    dataIndex: 'action',
                    scopedSlots: { customRender: 'action' },
                    align: "center",
                    flex: "right",
                    width: 100
                }
            ]
        }
    },
    methods: {
        getList(record) {
            this.dataSource = []
            this.queryParam = {
                userId: record.id
            }
            this.loadData()
        },
        open(record) {
            console.log('checkVipTime', record);
            this.visible = true
            this.getList(record);
        },
        close() {
            this.$emit('close')
            this.visible = false
        },
        submitCallback() {
            this.$emit('ok')
            this.visible = false
        },
        handleOk() {
            this.$refs.realForm.submitForm()
        },
        handleCancel() {
            this.close()
        },
    },
}
</script>

<style lang="less" scoped>
/** Button按钮间距 */
.ant-btn {
    margin-left: 30px;
    margin-bottom: 30px;
    float: right;
}

.drawer-footer {
    position: absolute;
    bottom: -8px;
    width: 100%;
    border-top: 1px solid #e8e8e8;
    padding: 10px 16px;
    text-align: right;
    left: 0;
    background: #fff;
    border-radius: 0 0 2px 2px;
}
</style>