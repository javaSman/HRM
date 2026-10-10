<template>
	<a-card :bordered="false">
		<!-- 查询区域 -->
		<div class="table-page-search-wrapper">
			<a-form layout="inline" @keyup.enter.native="searchQuerys">
				<a-row :gutter="24">
					<!-- <a-col :xl="6" :lg="7" :md="8" :sm="24">
						<a-form-item label="部门">
              
              <j-select-depart v-model="queryParam.bm"  ></j-select-depart>
              
							<j-popup placeholder="请选择部门" v-model="queryParam.bm" code="yzzw_depart"
								org-fields="depart_name,org_code" dest-fields="bm,sys_org_code"
								:field="getPopupField('bm,sys_org_code')" />
						</a-form-item>
					</a-col> -->
					<a-col :xl="6" :lg="7" :md="8" :sm="24">
						<a-form-item label="姓名">
							<a-input placeholder="请输入姓名" v-model="queryParam.xm"></a-input>
						</a-form-item>
					</a-col>
					<template v-if="toggleSearchStatus">
						<a-col :xl="6" :lg="7" :md="8" :sm="24">
							<a-form-item label="个人身份">
								<a-input placeholder="请输入个人身份" v-model="queryParam.sjlclb"></a-input>
							</a-form-item>
						</a-col>
					</template>
					<a-col :xl="6" :lg="7" :md="8" :sm="24">
						<span style="float: left;overflow: hidden;" class="table-page-search-submitButtons">
							<a-button type="primary" @click="searchQuerys" icon="search">查询</a-button>
							<a-button type="primary" @click="searchResets" icon="reload" style="margin-left: 8px">重置
							</a-button>
							<a @click="handleToggleSearch" style="margin-left: 8px">
								{{ toggleSearchStatus ? '收起' : '展开' }}
								<a-icon :type="toggleSearchStatus ? 'up' : 'down'" />
							</a>
						</span>
					</a-col>
				</a-row>
			</a-form>
		</div>
		<!-- 查询区域-END -->

		<!-- 操作按钮区域 -->
		<div class="table-operator">
			<a-button @click="handleAdd" type="primary" icon="plus">新增</a-button>
			<a-button type="primary" icon="download" @click="handleExportXls('机关单位和年假')">导出</a-button>
			<a-upload name="file" :showUploadList="false" :multiple="false" :headers="tokenHeader"
				:action="importExcelUrl" @change="handleImportExcel">
				<a-button type="primary" icon="import">导入</a-button>
			</a-upload>
			<!-- 高级查询区域 -->
			<j-super-query :fieldList="superFieldList" ref="superQueryModal" @handleSuperQuery="handleSuperQuery">
			</j-super-query>
			<a-dropdown v-if="selectedRowKeys.length > 0">
				<a-menu slot="overlay">
					<a-menu-item key="1" @click="batchDel">
						<a-icon type="delete" />删除
					</a-menu-item>
				</a-menu>
				<a-button style="margin-left: 8px"> 批量操作
					<a-icon type="down" />
				</a-button>
			</a-dropdown>

			<a-button @click="addlist_show = true" :disabled="selectedRowKeys.length != 1" type="primary"
				icon="redo">转移</a-button>
			<a-button @click="addlist_FZshow = true" :disabled="selectedRowKeys.length != 1" type="primary"
				icon="user-add">负责部门</a-button>


			<a-modal title="转移部门" :visible="addlist_show" @ok="addlist__up" @cancel="addlist__out">
				<a-form-model :model="addlist" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
					<a-form-item label="转移部门">
						<j-select-depart v-model="addlist.state" :multi="false" :trigger-change="true"
							placeholder="请选择转移部门">
						</j-select-depart>
					</a-form-item>
				</a-form-model>
			</a-modal>

			<a-modal title="负责部门" :visible="addlist_FZshow" @ok="addlist__Fzup" @cancel="addlist__out">
				<a-form-model :model="addlist" :label-col="{ span: 5 }" :wrapper-col="{ span: 12 }">
					<a-form-item label="负责部门">
						<j-select-depart v-model="addlist.state" :multi="false" :trigger-change="true"
							placeholder="请选择负责部门">
						</j-select-depart>
					</a-form-item>
				</a-form-model>
			</a-modal>
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
				:rowSelection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
				class="j-table-force-nowrap" @change="handleTableChange">

				<template slot="htmlSlot" slot-scope="text">
					<div v-html="text"></div>
				</template>
				<template slot="imgSlot" slot-scope="text">
					<span v-if="!text" style="font-size: 12px;font-style: italic;">无图片</span>
					<img v-else :src="getImgView(text)" height="25px" alt=""
						style="max-width:80px;font-size: 12px;font-style: italic;" />
				</template>
				<template slot="fileSlot" slot-scope="text">
					<span v-if="!text" style="font-size: 12px;font-style: italic;">无文件</span>
					<a-button v-else :ghost="true" type="primary" icon="download" size="small"
						@click="downloadFile(text)">
						下载
					</a-button>
				</template>

				<span slot="action" slot-scope="text, record">
					<a @click="handleEdit(record)">编辑</a>

					<a-divider type="vertical" />
					<a-dropdown>
						<a class="ant-dropdown-link">更多
							<a-icon type="down" />
						</a>
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

		<yzzw-jgdw-and-nj-modal ref="modalForm" @ok="modalFormOk"></yzzw-jgdw-and-nj-modal>
	</a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import {
	mixinDevice
} from '@/utils/mixin'

import {
	getAction,
	putAction,
	httpAction,
	getFileAccessHttpUrl
} from '@/api/manage'


import {
	JeecgListMixin
} from '@/mixins/JeecgListMixin'
import YzzwJgdwAndNjModal from './vue/modules/YzzwJgdwAndNjModal'

// import store from '@/store/'

// let loca_index=window.location.href.lastIndexOf('/')
// let locatiocn_code=window.location.href.substring(loca_index+1)
// let 	=store.state.bm_code || locatiocn_code
// let listArr = `rygl/hrmJgdwAndNj/submitApprovalList?bm=${bmcode}`;
export default {
	name: 'YzzwJgdwAndNjList',
	mixins: [JeecgListMixin, mixinDevice],
	components: {
		YzzwJgdwAndNjModal
	},
	props: {
		tagId: {
			type: String,
			required: true,
		},
	},
	data() {
		return {
			addlist_show: false,

			addlist_FZshow: false,

			addlist: {
				state: '0',
			},

			description: '机关单位和年假管理页面',
			// 表头
			columns: [
				{
					title: '序号',
					align: "center",
					sorter: true,
					dataIndex: 'xh'
				},
				{
					title: '部门',
					align: "center",
					dataIndex: 'bm_dictText'
				},
				{
					title: '所属组别',
					align: "center",
					dataIndex: 'sszb_dictText'
				},
				{
					title: '负责部门',
					align: "center",
					dataIndex: 'fzbm_dictText'
				},
				{
					title: '姓名',
					align: "center",
					dataIndex: 'xm'
				},
				{
					title: '性别',
					align: "center",
					dataIndex: 'xb'
				},
				{
					title: '职务',
					align: "center",
					dataIndex: 'zj_dictText'
				},
				// {
				// 	title: '请假流程',
				// 	align: "center",
				// 	dataIndex: 'zw'
				// },
				{
					title: '个人身份',
					align: "center",

					dataIndex: 'sjlclb'
				},
				{
					title: '出生年月',
					align: "center",

					dataIndex: 'csny',
					customRender: function (text) {
						return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
					}
				},
				{
					title: '进入单位时间',
					align: "center",

					dataIndex: 'jrdwsj',
					customRender: function (text) {
						return !text ? "" : (text.length > 10 ? text.substr(0, 10) : text)
					}
				},
				{
					title: '工作年限',
					align: "center",
					dataIndex: 'gznx',
					// customRender: function(text, r, index) {
					// 	let t2 =0
					// 	if (r.jrdwsj) {
					// 		let d = new Date(r.jrdwsj) //生日
					// 		let t = d.getTime() // 转换为时间戳
					// 		var t1 = Date.parse(new Date()); //获取当前时间戳 
					// 		t2 = t1 - t; //计算时间戳之差 
					// 		t2 = t2 / 1000 / (60 * 60 * 24 * 30 * 12) //将差值转换为年 
					// 		t2 = Math.floor(t2) //向下取整 
					// 	}
					// 	return text=t2>0?t2:'0'
					// }
				},
				{
					title: '年度应休年假天数',
					align: "center",
					dataIndex: 'ndyxnjts'
				},
				{
					title: '本年度已休年假次数',
					align: "center",
					dataIndex: 'bndyxnjcs'
				},
				{
					title: '已休年假天数',
					align: "center",
					dataIndex: 'yxnjts'
				},
				{
					title: '剩余年假天数',
					align: "center",
					dataIndex: 'synjts',
					customRender: function (text, r, index) {
						let color = <span style='color:#55aaff'>{text}</span>
						if (text <= 0) {
							color = <span style='color:#ff4548'>{text}</span>
						}
						return color
					}
				},
				{
					title: '去年请假累计天数',
					align: "center",
					dataIndex: 'qnqjljts'
				},
				{
					title: '当年请病假累计天数',
					align: "center",
					dataIndex: 'qnqbjljts'
				},
				{
					title: '当年请事假累计天数',
					align: "center",
					dataIndex: 'dnqsjljts'
				},
				{
					title: '操作',
					dataIndex: 'action',
					align: "center",
					fixed: "right",
					width: 147,
					scopedSlots: {
						customRender: 'action'
					}
				}
			],
			url: {
				list: '/rygl/hrmJgdwAndNj/list',
				delete: "/rygl/hrmJgdwAndNj/delete",
				deleteBatch: "/rygl/hrmJgdwAndNj/deleteBatch",
				exportXlsUrl: "/rygl/hrmJgdwAndNj/exportXls",
				importExcelUrl: "/rygl/hrmJgdwAndNj/importExcel",
			},
			dictOptions: {},
			superFieldList: [],
			disableMixinCreated: true,
			seID: '',
		}
	},
	created() {
		this.getSuperFieldList();
		// this.url.list=`rygl/hrmJgdwAndNj/submitApprovalList?sysOrgCode=${this.tagId}`
		// this.isorter.order='asc'
		// this.isorter.column='xh'
		// this.loadData(1) // 初始获取表单
	},

	computed: {
		importExcelUrl: function () {
			return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`;
		},
	},
	watch: {
		tagId: {
			handler(newValue) {
				this.seID = newValue
				// if (newValue == '64543192129742eabf3827c17aa6df7b') {
				if (false) {
					this.isorter.order = 'asc'
					this.isorter.column = 'xh'
				} else {
					this.isorter.order = 'desc'
					this.isorter.column = ''
				}
				this.queryParam['bm'] = newValue
				this.loadData(1);
				// this.searchReset()
			},
			immediate: true
		},
	},
	methods: {
		searchResets() {
			this.queryParam = {}
			this.queryParam['bm'] = this.seID
			this.loadData(1);
		},
		searchQuerys() {
			this.queryParam['bm'] = ''
			this.loadData(1);
			// this.searchQuery()
		},
		/* 取消转移申请 */
		addlist__out() {
			this.addlist_show = false
			this.addlist_FZshow = false
			this.addlist.state = '0'
		},
		// 提交转移申请
		addlist__up() {
			let code = this.addlist.state
			let i = JSON.parse(JSON.stringify(this.selectionRows[0]))
			httpAction(`rygl/hrmJgdwAndNj/transfer?departId=${code}&name=${i.xm}`, '', 'post').then((res) => {
				if (res.success) {
					this.$message.success(res.message);
					this.onClearSelected()
					this.addlist__out()
					this.loadData() // 初始获取表单
				} else {
					this.$message.warning(res.message);
				}
			}).finally(() => { })
		},
		addlist__Fzup() {
			let code = this.addlist.state
			let i = JSON.parse(JSON.stringify(this.selectionRows[0]))
			httpAction(`/rygl/hrmJgdwAndNj/setDepartmentHead?departId=${code}&name=${i.xm}`, '', 'post').then((res) => {
				if (res.success) {
					this.$message.success(res.message);
					this.onClearSelected()
					this.addlist__out()
					this.loadData() // 初始获取表单
				} else {
					this.$message.warning(res.message);
				}
			}).finally(() => { })
		},

		initDictConfig() { },
		getSuperFieldList() {
			let fieldList = [];
			fieldList.push({
				type: 'string',
				value: 'xh',
				text: '序号',
				dictCode: ''
			})
			fieldList.push({
				type: 'popup',
				value: 'bm',
				text: '部门',
				popup: {
					code: 'yzzw_depart',
					field: 'depart_name',
					orgFields: 'depart_name',
					destFields: 'bm'
				}
			})
			fieldList.push({
				type: 'string',
				value: 'xm',
				text: '姓名',
				dictCode: ''
			})
			fieldList.push({
				type: 'string',
				value: 'xb',
				text: '性别',
				dictCode: ''
			})
			fieldList.push({
				type: 'string',
				value: 'zj',
				text: '职务',
				dictCode: ''
			})
			fieldList.push({
				type: 'string',
				value: 'sjlclb',
				text: '个人身份',
				dictCode: ''
			})
			// fieldList.push({
			// 	type: 'string',
			// 	value: 'zw',
			// 	text: '请假流程',
			// 	dictCode: 'yzzw_grsf'
			// })
			fieldList.push({
				type: 'date',
				value: 'csny',
				text: '出生年月'
			})
			fieldList.push({
				type: 'date',
				value: 'jrdwsj',
				text: '进入单位时间'
			})
			fieldList.push({
				type: 'int',
				value: 'gznx',
				text: '工作年限',
				dictCode: ''
			})
			fieldList.push({
				type: 'int',
				value: 'ndyxnjts',
				text: '年度应休年假天数',
				dictCode: ''
			})
			fieldList.push({
				type: 'int',
				value: 'bndyxnjcs',
				text: '本年度已休年假次数',
				dictCode: ''
			})
			fieldList.push({
				type: 'int',
				value: 'yxnjts',
				text: '已休年假天数',
				dictCode: ''
			})
			fieldList.push({
				type: 'int',
				value: 'synjts',
				text: '剩余年假天数',
				dictCode: ''
			})
			fieldList.push({
				type: 'int',
				value: 'qnqjljts',
				text: '去年请假累计天数',
				dictCode: ''
			})
			fieldList.push({
				type: 'int',
				value: 'qnqbjljts',
				text: '当年请病假累计天数',
				dictCode: ''
			})
			fieldList.push({
				type: 'int',
				value: 'dnqsjljts',
				text: '当年请事假累计天数',
				dictCode: ''
			})
			this.superFieldList = fieldList
		}
	}
}
</script>
<style scoped>
@import '~@assets/less/common.less';
</style>
