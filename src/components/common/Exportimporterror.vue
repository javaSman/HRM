<template>
    <a-modal :title="Title" :width="width" :visible="ExportShow" @cancel="handleCancel">
        <a-spin :spinning='spinning'>
            <div class='content'>
                <div class='errorBoxTop'>
                    <div class='errorBoxTopL'>
                        <img src='@/assets/Import/closeR.png' style='width: 30px;height: 30px;margin-right: 10px'
                            alt=''>
                        <div>批量导入失败，共 <span style='color: red;font-size: 18px'>{{ errorL }}</span> 条错误数据</div>
                    </div>

                    <div class='errorBoxTopR'>
                        <a-icon type='exclamation-circle' style='margin-right: 10px' />
                        <div>Excel数据有误，请修改后重新导入</div>
                    </div>
                </div>
                <div style='display: flex;justify-content: flex-end;margin-bottom: 10px'>
                    <a-button type="primary" @click="showModal">
                        导出错误信息
                    </a-button>
                </div>


                <a-table ref='table' size='middle' :scroll='{ y: 350, x: true }' bordered rowKey='id' :columns='columns'
                    :dataSource='dataSource' :pagination='false'>


                    <div slot='errorMsg' slot-scope='text,record'>

                        <div style='margin-bottom: 5px;padding: 0px 5px;text-align: left;display:block'
                            v-for='(item, index) in text' :key='index'> {{ index + 1 }}、{{ item }}</div>

                    </div>
                </a-table>
            </div>
        </a-spin>
        <template slot="footer">
            <a-button key="back" @click="handleCancel">
                取消
            </a-button>

        </template>
    </a-modal>
</template>

<script>
import { downFile } from '@/api/manage'
import { mapState } from 'vuex'


export default {
    name: 'ExportImporterror',
    data() {
        return {
            // 可以在这里定义组件的数据
            visible: false,
            width: "60%",
            Title: '导入错误',
            spinning: false,
            columns: [
                {
                    width: 150,
                    title: '错误所在行数',
                    align: 'center',
                    dataIndex: 'excelLine',
                    // fixed: 'left'
                },

                {
                    width: 200,
                    title: 'ID',
                    align: 'center',
                    dataIndex: 'id'
                },
                {
                    width: 250,
                    title: '名称',
                    align: 'center',
                    dataIndex: 'name',
                },

                {
                    title: '错误原因',
                    align: 'center',
                    dataIndex: 'errorMsgString',
                    scopedSlots: { customRender: 'errorMsg' }
                }
            ],
            dataSource: [],
            errorL: 0,


        }
    },

    mounted() {

    },
    computed: {
        ...mapState({
            // 后台菜单
            permissionMenuList: state => state.user.permissionList,
            // 全局附件预览
            ExportShow: state => state.Export.ExportShow,
            ExportList: state => state.Export.ExportList,
        })
    },
    watch: {
        ExportList: {
            handler(val) {
                if (val) {
                    this.errorL = val.length
                    this.dataSource = JSON.parse(JSON.stringify(val))
                    this.dataSource.forEach((item, index) => {
                        item['errorMsgString'] = JSON.parse(JSON.stringify(item.errorMsg))
                        let errorMsgString = ''
                        item.errorMsg.forEach((it, index) => {
                            errorMsgString = errorMsgString + (index + 1) + '.' + it + '\n'
                        })
                        item.errorMsg = errorMsgString
                    })
                }
            },
            deep: true
        },
    },
    methods: {
        handleCancel() {
            let obj = {
                show: false,
                list: [],
                name: ''
            }
            this.$store.commit('ExportOn', obj)
        },

        // 可以在这里定义组件的方法
        // 组件挂载后执行的逻辑
        showModal() {
            let filteredData = this.dataSource
            let ExportName = this.$store.state.Export.ExportName || ''
            downFile("/excel/errorMsgExport", filteredData,'post').then((data) => {
                if (!data) {
                    this.$message.warning('文件下载失败')
                    return
                }
                if (typeof window.navigator.msSaveBlob !== 'undefined') {
                    window.navigator.msSaveBlob(new Blob([data], { type: 'application/vnd.ms-excel' }), ExportName + '错误列表.xls')
                } else {
                    let url = window.URL.createObjectURL(new Blob([data], { type: 'application/vnd.ms-excel' }))
                    let link = document.createElement('a')
                    link.style.display = 'none'
                    link.href = url
                    link.setAttribute('download', ExportName + '错误列表.xls')
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link) //下载完成移除元素
                    window.URL.revokeObjectURL(url) //释放掉blob对象
                }
            })
        },
    },

};
</script>

<style scoped>
.content {
    width: 100%;
    height: 500px;
    color: #000000;
    padding: 0px 20px;
    font-weight: bold;
}

.errorBoxTop {
    display: flex;
    justify-content: space-between;
    align-items: center;
    /*padding-left: 15px;*/
    /*padding-top: 20px;*/
    padding: 20px 15px 10px 15px;
}

.errorBoxTopL {
    width: 50%;
    display: flex;
    align-items: center;
}

.errorBoxTopR {
    width: 50%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
}
</style>
