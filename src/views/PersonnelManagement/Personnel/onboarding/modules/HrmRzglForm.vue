<template>
  <a-spin :spinning="confirmLoading">
    <j-form-container :disabled="formDisabled">
      <a-form-model
        ref="form"
        slot="detail"
        layout="vertical"
        :model="model"
        :rules="validatorRules"
        class="hrm-rzgl-form"
      >
        <section class="form-section">
          <div class="form-section-title">基本信息</div>
          <a-row :gutter="16">
            <a-row :gutter="16">
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="姓名" prop="xm"
                  ><a-input v-model.trim="model.xm" placeholder="请输入姓名"
                /></a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="工号" prop="gh"
                  ><a-input v-model.trim="model.gh" disabled placeholder="确认到岗后自动生成" @blur="handleGhBlur"
                /></a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="手机号" prop="sjh"
                  ><a-input v-model.trim="model.sjh" placeholder="请输入手机号" maxlength="11" @blur="handleSjhBlur"
                /></a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="身份证号" prop="sfzh"
                  ><a-input
                    v-model.trim="model.sfzh"
                    placeholder="请输入身份证号"
                    maxlength="18"
                    @blur="handleSfzhBlur"
                /></a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="邮箱"
                  ><a-input v-model.trim="model.yx" placeholder="请输入邮箱"
                /></a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="薪资(k)"
                  ><a-input-number v-model="model.xz" :min="0" style="width: 100%" placeholder="请输入薪资"
                /></a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="薪资类型" prop="xzlx"
                  ><j-dict-select-tag type="list" v-model="model.xzlx" dictCode="xzlx" placeholder="请选择"
                /></a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="员工类型"
                  ><j-dict-select-tag
                    type="list"
                    v-model="model.yglx"
                    dictCode="yglx"
                    placeholder="请选择"
                    @change="handleEmployeeTypeChange"
                /></a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="所属部门" prop="dept">
                  <a-cascader
                    v-model="deptPath"
                    :options="deptOptions"
                    :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                    :disabled="formDisabled || orgLoading"
                    changeOnSelect
                    :show-search="{ filter: filterDeptOption }"
                    placeholder="请选择"
                    @change="handleDeptChange"
                  />
                </a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="岗位名称" prop="postId">
                  <a-select
                    v-model="model.postId"
                    showSearch
                    optionFilterProp="children"
                    :disabled="!model.dept"
                    :loading="postLoading"
                    placeholder="请选择"
                    @change="handlePostChange"
                  >
                    <a-select-option v-for="item in postOptions" :key="item.value" :value="item.value">{{
                      item.label
                    }}</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="职级名称" prop="postRank">
                  <a-select
                    v-model="model.postRank"
                    allowClear
                    showSearch
                    optionFilterProp="children"
                    :disabled="!model.postId"
                    placeholder="请选择"
                  >
                    <a-select-option v-for="item in levelOptions" :key="item.value" :value="item.value">{{
                      item.label
                    }}</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="预计入职时间" prop="yjrzsj"
                  ><j-date
                    v-model="model.yjrzsj"
                    date-format="YYYY-MM-DD"
                    placeholder="请选择预计入职时间"
                    style="width: 100%"
                /></a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="入职方式">
                  <a-select v-model="model.rzfs" allowClear placeholder="请选择">
                    <a-select-option value="招聘">招聘</a-select-option
                    ><a-select-option value="直推">直推</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="合同归属" prop="htgs">
                  <a-select v-model="model.htgs" showSearch optionFilterProp="children" placeholder="请选择">
                    <a-select-option v-for="item in companyList" :key="item.id" :value="item.name">{{
                      item.name
                    }}</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="合同类型" prop="htlx"
                  ><j-dict-select-tag type="list" v-model="model.htlx" dictCode="htlx" placeholder="请选择"
                /></a-form-model-item>
              </a-col>
            </a-row>
            <a-row :gutter="16">
              <a-col :xs="24" :sm="8">
                <a-form-model-item label="备注"
                  ><a-textarea v-model.trim="model.bz" :autoSize="{ minRows: 3, maxRows: 6 }" placeholder="请输入备注"
                /></a-form-model-item>
              </a-col>
              <!-- <a-col :xs="24" :sm="8">
                <a-form-model-item label="入职状态" prop="rzzt">
                  <a-select v-model="model.rzzt" placeholder="请选择">
                    <a-select-option value="待入职">待入职</a-select-option>
                    <a-select-option value="已入职">已入职</a-select-option>
                    <a-select-option value="放弃入职">放弃入职</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col> -->
            </a-row>
          </a-row>
        </section>
        <!-- <section class="form-section other-section">
          <div class="form-section-title">其他信息</div>
          <a-form-model-item label="备注"
            ><a-textarea v-model.trim="model.bz" :autoSize="{ minRows: 3, maxRows: 6 }" placeholder="请输入备注"
          /></a-form-model-item>
        </section> -->
        <section v-if="model.id" class="form-section status-section">
          <div class="form-section-title">状态信息</div>
          <a-descriptions bordered size="small" :column="3">
            <a-descriptions-item label="入职状态">{{ model.rzzt || '-' }}</a-descriptions-item>
            <a-descriptions-item label="资料状态">{{ model.zlzt || '-' }}</a-descriptions-item>
            <a-descriptions-item label="实际入职时间">{{ model.sjrzsj || '-' }}</a-descriptions-item>
            <a-descriptions-item label="新预计入职时间">{{ latestAdjustRecord.xyjrzsj || '-' }}</a-descriptions-item>
            <a-descriptions-item label="调整原因">{{ latestAdjustRecord.tzyy || '-' }}</a-descriptions-item>
            <template v-if="model.rzzt === '放弃入职'">
              <a-descriptions-item label="放弃时间">{{ model.fqsj || '-' }}</a-descriptions-item>
              <a-descriptions-item label="放弃原因">{{ model.fqyy || '-' }}</a-descriptions-item>
            </template>
          </a-descriptions>
        </section>
      </a-form-model>
    </j-form-container>
    <section v-if="model.id" class="hrm-rzgl-form form-section">
      <div class="form-section-title">入职时间调整记录</div>
      <a-table
        bordered
        size="middle"
        rowKey="id"
        :columns="rzsjtzColumns"
        :dataSource="rzsjtz"
        :pagination="false"
        :locale="{ emptyText: '暂无调整记录' }"
      />
    </section>
  </a-spin>
</template>

<script>
import { getAction, httpAction, postAction } from '@/api/manage'

function defaultModel() {
  return {
    gh: '',
    xm: '',
    sjh: '',
    sfzh: '',
    yx: '',
    xz: undefined,
    xzlx: undefined,
    yglx: undefined,
    gs: undefined,
    companyId: '',
    dept: '',
    deptPath: '',
    postId: '',
    postRank: '',
    yjrzsj: '',
    rzfs: undefined,
    htgs: undefined,
    htlx: undefined,
    bz: '',
    rzzt: '待入职',
    zlzt: '待补充',
  }
}

function findPathById(list, id, parentPath, parentNamePath) {
  const path = parentPath || []
  const namePath = parentNamePath || []
  for (let i = 0; i < (list || []).length; i++) {
    const item = list[i]
    const nextPath = path.concat(String(item.id))
    const nextNamePath = namePath.concat(item.name || '')
    if (String(item.id) === String(id)) return { path: nextPath, namePath: nextNamePath, item }
    const child = findPathById(item.children || [], id, nextPath, nextNamePath)
    if (child) return child
  }
  return null
}

function withoutLegacyOrgFields(model) {
  const payload = Object.assign({}, model)
  delete payload.ssbm
  delete payload.gwmc
  delete payload.zjmc
  return payload
}

export default {
  name: 'HrmRzglForm',
  props: {
    disabled: { type: Boolean, default: false },
  },
  data() {
    return {
      model: defaultModel(),
      confirmLoading: false,
      orgLoading: false,
      postLoading: false,
      companyList: [],
      deptOptions: [],
      deptPath: [],
      postRows: [],
      postOptions: [],
      levelOptions: [],
      rzsjtz: [],
      rzsjtzColumns: [
        {
          title: '调整前时间',
          dataIndex: 'tzqsj',
          align: 'center',
          width: 150,
        },
        {
          title: '调整后时间',
          dataIndex: 'xyjrzsj',
          align: 'center',
          width: 150,
        },
        {
          title: '调整原因',
          dataIndex: 'tzyy',
          align: 'center',
          width: 200,
          ellipsis: true,
          customRender: (text) => {
            return (
              <a-tooltip style="width: 190px;text-overflow:ellipsis;overflow:hidden;white-space: nowrap;display:block">
                <template slot="title">{text}</template>
                <span style="text-align:center">{text}</span>
              </a-tooltip>
            )
          },
        },
        {
          title: '操作人',
          dataIndex: 'createBy',
          align: 'center',
          width: 120,
        },
        {
          title: '操作时间',
          dataIndex: 'createTime',
          align: 'center',
          width: 180,
        },
      ],
      validatorRules: {
        xm: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        // gh: [{ required: true, message: '请输入工号', trigger: 'blur' }],
        sjh: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的11位手机号', trigger: 'blur' },
        ],
        sfzh: [
          { required: true, message: '请输入身份证号', trigger: 'blur' },
          {
            pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/,
            message: '请输入正确的18位身份证号',
            trigger: 'blur',
          },
        ],
        xzlx: [{ required: true, message: '请选择薪资类型', trigger: 'change' }],
        dept: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
        postId: [{ required: true, message: '请选择岗位名称', trigger: 'change' }],
        // 预计入职时间已改为非必填
        yjrzsj: [],
        htgs: [{ required: true, message: '请选择合同归属', trigger: 'change' }],
        htlx: [{ required: true, message: '请选择合同类型', trigger: 'change' }],
        rzzt: [{ required: true, message: '请选择入职状态', trigger: 'change' }],
      },
      url: {
        add: '/ryManage/hrmRzgl/add',
        edit: '/ryManage/hrmRzgl/edit',
        queryById: '/ryManage/hrmRzgl/queryById',
        queryDetail: '/ryManage/hrmRzgl/queryDetl',
      },
    }
  },
  computed: {
    formDisabled() {
      return this.disabled
    },
    latestAdjustRecord() {
      return this.rzsjtz.length ? this.rzsjtz[this.rzsjtz.length - 1] : {}
    },
  },
  created() {
    this.loadOrgTree()
  },
  methods: {
    getPopupContainer(node) {
      return node.parentNode
    },
    handleEmployeeTypeChange(value) {
      // 当选择"劳务工"时，自动设置合同类型为"劳务合同"
      if (value === '劳务工') {
        this.model.htlx = '劳务合同'
      }
    },
    loadOrgTree() {
      if (this.companyList.length) return Promise.resolve(this.companyList)
      this.orgLoading = true
      return getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 })
        .then((res) => {
          const roots = res && res.success && Array.isArray(res.result) ? res.result : []
          this.companyList = roots.length && Array.isArray(roots[0].children) ? roots[0].children : []
          this.deptOptions = this.companyList
          return this.companyList
        })
        .catch(() => {
          this.companyList = []
          this.deptOptions = []
          this.$message.error('组织架构加载失败，请稍后重试')
          return []
        })
        .finally(() => {
          this.orgLoading = false
        })
    },
    add() {
      this.model = defaultModel()
      this.rzsjtz = []
      this.resetLinkedOptions()
      this.clearValidate()
    },
    edit(record) {
      this.confirmLoading = true
      this.rzsjtz = []
      const detailRequest =
        record && record.id
          ? getAction(this.url.queryById, { id: record.id })
          : Promise.resolve({ success: true, result: record || {} })
      const adjustRecordsRequest = this.loadAdjustRecords(record && record.sjh)
      Promise.all([this.loadOrgTree(), detailRequest, adjustRecordsRequest])
        .then((results) => {
          const detailRes = results[1]
          if (!detailRes || !detailRes.success) throw new Error((detailRes && detailRes.message) || '入职信息加载失败')
          this.model = withoutLegacyOrgFields(Object.assign(defaultModel(), detailRes.result || {}))
          return this.restoreLinkedOptions()
        })
        .catch((error) => {
          this.$message.error(error.message || '入职信息加载失败')
        })
        .finally(() => {
          this.confirmLoading = false
          this.clearValidate()
        })
    },
    loadAdjustRecords(phone) {
      const employeePhone = String(phone || '').trim()
      if (!employeePhone) {
        this.$message.warning('当前入职记录缺少手机号，无法加载入职时间调整记录')
        return Promise.resolve([])
      }
      return postAction(`${this.url.queryDetail}?phone=${encodeURIComponent(employeePhone)}`)
        .then((res) => {
          if (!res || !res.success) {
            throw new Error((res && res.message) || '入职时间调整记录加载失败')
          }
          if (!res.result || !Array.isArray(res.result.rzsjtz)) {
            throw new Error('入职时间调整记录数据格式异常')
          }
          this.rzsjtz = res.result.rzsjtz
          return this.rzsjtz
        })
        .catch((error) => {
          this.rzsjtz = []
          this.$message.warning(error.message || '入职时间调整记录加载失败')
          return []
        })
    },
    resetLinkedOptions() {
      this.deptOptions = this.companyList
      this.deptPath = []
      this.postRows = []
      this.postOptions = []
      this.levelOptions = []
    },
    clearValidate(fields) {
      this.$nextTick(() => {
        if (!this.$refs.form) return
        if (fields) this.$refs.form.clearValidate(fields)
        else this.$refs.form.clearValidate()
      })
    },
    restoreLinkedOptions() {
      this.resetLinkedOptions()
      const matchedDept = findPathById(this.deptOptions, this.model.dept)
      const company =
        matchedDept && matchedDept.path.length > 1
          ? this.companyList.find((item) => String(item.id) === matchedDept.path[0])
          : null
      if (!matchedDept || !company) {
        this.model.companyId = ''
        this.model.gs = undefined
        this.model.dept = ''
        this.model.deptPath = ''
        return Promise.resolve()
      }
      this.deptPath = matchedDept.path
      this.model.companyId = matchedDept.path[0]
      this.model.gs = company.name || ''
      this.model.deptPath = matchedDept.namePath.filter(Boolean).join('/')
      return this.loadPostOptions(this.model.dept, true)
    },
    filterDeptOption(inputValue, path) {
      const keyword = String(inputValue || '').toLowerCase()
      return (path || []).some(
        (option) =>
          String(option.name || '')
            .toLowerCase()
            .indexOf(keyword) > -1
      )
    },
    handleDeptChange(value, selectedOptions) {
      const path = Array.isArray(value) ? value.map((item) => String(item)) : []
      const options = Array.isArray(selectedOptions) ? selectedOptions : []
      const company = options[0]
      const hasSelectedDept = path.length && company
      this.deptPath = hasSelectedDept ? path : []
      this.model.companyId = hasSelectedDept ? path[0] : ''
      this.model.gs = hasSelectedDept ? company.name || '' : undefined
      this.model.dept = hasSelectedDept ? path[path.length - 1] : ''
      this.model.deptPath = hasSelectedDept
        ? options
            .map((item) => item.name)
            .filter(Boolean)
            .join('/')
        : ''
      this.model.postId = ''
      this.model.postRank = ''
      this.model.htgs = this.model.gs
      this.loadPostOptions(this.model.dept)
      this.clearValidate(['dept'])
    },
    loadPostOptions(deptId, restoring) {
      const currentPostId = this.model.postId
      this.postRows = []
      this.postOptions = []
      this.levelOptions = []
      if (!deptId) {
        this.model.postId = ''
        this.model.postRank = ''
        return Promise.resolve()
      }
      this.postLoading = true
      return getAction('/hrJobSequence/hrJobSequence/getChildSequences', {
        deptId,
        column: 'createTime',
        order: 'desc',
        pageNo: 1,
        pageSize: 99999,
      })
        .then((res) => {
          const rows = Array.isArray(res) ? res : (res && res.result) || []
          this.postRows = rows
          this.postOptions = rows.map((item) => ({ label: item.postName, value: item.id }))
          if (restoring) {
            const post = rows.find((item) => String(item.id) === String(currentPostId))
            this.levelOptions = ((post && post.hrJobLevels) || []).map((item) => ({
              label: item.levelName,
              value: item.id,
            }))
          }
        })
        .catch(() => {
          this.model.postId = ''
          this.model.postRank = ''
          this.$message.error('岗位职级加载失败，请稍后重试')
        })
        .finally(() => {
          this.postLoading = false
        })
    },
    handlePostChange(postId) {
      const post = this.postRows.find((item) => String(item.id) === String(postId))
      this.levelOptions = ((post && post.hrJobLevels) || []).map((item) => ({ label: item.levelName, value: item.id }))
      this.model.postRank = ''
      this.clearValidate(['postId'])
    },
    // 通用唯一性校验方法
    checkFieldUniqueness(fieldName, value, minLength) {
      const val = String(value || '').trim()
      if (!val || (minLength && val.length < minLength)) return

      getAction('/unique/common/checkUniqueMsg', {
        tableName: 'hr_employee_information',
        columnName: fieldName,
        value: val,
      })
        .then((res) => {
          this.$nextTick(() => {
            if (!this.$refs.form) return
            let obj = {
              no: 'gh',
              phone_number: 'sjh',
              id_card: 'sfzh',
            }
            const field = this.$refs.form.fields.find((f) => f.prop === obj[fieldName])
            if (!field) return
            if (res.success && res.result && res.result.includes('重复')) {
              this.model[obj[fieldName]] = ''
              field.validateState = 'error'
              field.validateMessage = res.message
            } else {
              field.validateState = 'success'
              field.validateMessage = ''
            }
          })
        })
        .catch((err) => {
          console.error(`${obj[fieldName]}唯一性校验失败:`, err)
        })
    },
    // 工号失去焦点时检查唯一性
    handleGhBlur() {
      this.checkFieldUniqueness('no', this.model.gh)
    },
    // 手机号失去焦点时检查唯一性
    handleSjhBlur() {
      this.checkFieldUniqueness('phone_number', this.model.sjh, 11)
    },
    // 身份证号失去焦点时检查唯一性
    handleSfzhBlur() {
      this.checkFieldUniqueness('id_card', this.model.sfzh, 18)
    },
    submitForm() {
      this.$refs.form.validate((valid) => {
        if (!valid) {
          this.$message.warning('请填写所有必填项')
          return
        }
        this.confirmLoading = true
        const httpurl = this.model.id ? this.url.edit : this.url.add
        const method = this.model.id ? 'put' : 'post'
        httpAction(httpurl, withoutLegacyOrgFields(this.model), method)
          .then((res) => {
            if (res && res.success) {
              this.$message.success(res.message || '入职信息保存成功')
              //  访客申请
              if (!this.model.id) {
                const userInfo = this.$store.state.user.info || {}
                postAction('/fkzx/hrmFkzxSq/add', {
                  xm: this.model.xm,
                  lxfs: this.model.sjh,
                  cph: '',
                  sfzh: this.model.sfzh,
                  ssgshgr: '',
                  yjlfsj: this.model.yjrzsj + ' 09:00',
                  jdr: userInfo.realname,
                  jdrlxfs: userInfo.phone || '',
                  lfsrxx: '入职',
                  scfj: '',
                  lflx: '3',
                  zt: '0',
                  lfqy: '',
                  lfsy: '2',
                  splc: {},
                  lfrs: '1',
                })
              }
              this.$emit('ok')
            } else {
              this.$message.warning((res && res.message) || '入职信息保存失败')
            }
          })
          .catch(() => {
            this.$message.error('入职信息保存失败，请稍后重试')
          })
          .finally(() => {
            this.confirmLoading = false
          })
      })
    },
  },
}
</script>

<style scoped lang="less">
@import './hrmRzglForm.less';
</style>
