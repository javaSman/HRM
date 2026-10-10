<template>
  <a-modal :title="title" :visible="visible" :width="['residentAdd', 'residentEdit'].includes(mode) ? 780 : 550"
    :confirmLoading="confirmLoading" :maskClosable="false" :destroyOnClose="true" :okText="okText" cancelText="取消"
    centered :bodyStyle="{ maxHeight: '70vh', overflow: 'auto', padding: '20px 24px' }" @ok="handleOk"
    @cancel="handleCancel">
    <a-spin :spinning="loading" tip="加载中...">
      <a-form-model ref="form" :model="form" :rules="rules" layout="vertical">
        <!-- 宿舍选择（handleCheckin / residentAdd） -->
        <template v-if="mode !== 'residentEdit'">
          <div v-if="form.dormType_dictText" class="sqgl-sec-tips" style="color: red;line-height: 2;"> 申请提示：该员工申请宿舍类型为 <b
              style="font-weight: bold;">{{ form.dormType_dictText || '—' }}</b>!</div>
          <div class="sqgl-sec-title">选择房间</div>
          <!-- handleCheckin 模式：区域、楼栋、宿舍、领取物品 2×2 网格 -->
          <template v-if="mode === 'handleCheckin'">
            <a-row :gutter="14" style="margin-bottom: 14px;">
              <a-col :span="12">
                <a-form-model-item label="区域" prop="areaId">
                  <a-select v-model="form.areaId" placeholder="请选择" allowClear @change="onAreaChange">
                    <a-select-option v-for="a in areaOptions" :key="a.id" :value="a.id">{{ a.name }}</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="楼栋" prop="buildingId">
                  <a-select v-model="form.buildingId" :disabled="!form.areaId" placeholder="请选择" allowClear
                    @change="onBuildingChange">
                    <a-select-option v-for="b in buildingOptions" :key="b.id" :value="b.id">{{ b.name
                      }}</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="宿舍" prop="roomId">
                  <a-select v-model="form.roomId" :disabled="!form.buildingId" placeholder="请选择" allowClear
                    @change="onRoomChange">
                    <a-select-option v-for="r in availableRooms" :key="r.id" :value="r.id">
                      {{ r.name }}（空{{ r.beds - r.occupied }}，{{ r.roomType_dictText || '—' }}）
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="领取物品">
                  <JSelectMultiple v-model="form.items" dictCode="hrm_sqgl_apply_items" placeholder="请选择" />
                </a-form-model-item>
              </a-col>
            </a-row>
            <!-- 目标宿舍信息提示 -->
            <div class="room-info-hint" v-if="targetRoom" style="margin-bottom: 14px;">
              目标宿舍 <b style="color: #2563eb;">{{ form.buildingName }}{{ form.roomName }}</b> <span
                style="margin: 0 4px;color:#3785ff">｜</span> 剩余床位 <b style="color: #10b981;">{{ targetRoom.beds -
                targetRoom.occupied }}</b> 个 <span style="margin: 0 4px;color:#3785ff">｜</span>
              房间类型 {{ targetRoom.roomType_dictText || targetRoom.roomType || '—' }}
              <template v-if="targetRoom.gender">
                <span style="margin: 0 4px;color:#2563eb">｜</span>
                <b style="color: #2563eb;">{{ targetRoom.gender }}宿舍</b>
              </template>
            </div>
          </template>
          <!-- residentAdd 模式：区域、楼栋、宿舍三列级联 -->
          <template v-else>
            <a-row :gutter="14">
              <a-col :span="8">
                <a-form-model-item label="区域" prop="areaId">
                  <a-select v-model="form.areaId" placeholder="请选择" allowClear @change="onAreaChange">
                    <a-select-option v-for="a in areaOptions" :key="a.id" :value="a.id">{{ a.name }}</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="楼栋" prop="buildingId">
                  <a-select v-model="form.buildingId" :disabled="!form.areaId" placeholder="请选择" allowClear
                    @change="onBuildingChange">
                    <a-select-option v-for="b in buildingOptions" :key="b.id" :value="b.id">{{ b.name
                      }}</a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
              <a-col :span="8">
                <a-form-model-item label="宿舍" prop="roomId">
                  <a-select v-model="form.roomId" :disabled="!form.buildingId" placeholder="请选择" allowClear
                    @change="onRoomChange">
                    <a-select-option v-for="r in availableRooms" :key="r.id" :value="r.id">
                      {{ r.name }}（空{{ r.beds - r.occupied }}，{{ r.roomType_dictText || '—' }}）
                    </a-select-option>
                  </a-select>
                </a-form-model-item>
              </a-col>
            </a-row>
            <!-- 目标宿舍信息提示 -->
            <div class="room-info-hint" v-if="targetRoom" style="margin-bottom: 14px;">
              宿舍 <b style="color: #2563eb;">{{ form.buildingName }}{{ form.roomName }}</b> <span
                style="margin: 0 4px;color:#3785ff">｜</span>
              房型 {{ targetRoom.roomType_dictText || targetRoom.roomType || '—' }}
              <template v-if="targetRoom.gender">
                <span style="margin: 0 4px;color:#2563eb">｜</span>
                <b style="color: #2563eb;">{{ targetRoom.gender }}宿舍</b>
              </template>
              <span style="margin: 0 4px;color:#3785ff">｜</span>
              剩余床位 <b style="color: #10b981;">{{ targetRoom.beds - targetRoom.occupied }}</b> 个
            </div>
          </template>
        </template>

        <!-- 入住登记（residentAdd） -->
        <template v-if="mode === 'residentAdd'">
          <div class="sqgl-sec-title">入住登记</div>
          <a-row :gutter="14" type="flex">
            <a-col :span="8">
              <a-form-model-item label="人员类型">
                <j-dict-select-tag v-model="form.personType" dictCode="hrm_sqgl_apply_person_type" placeholder="请选择"
                  style="width: 100%" @change="onPersonTypeChange" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="姓名" prop="empName">
                <j-select-employee v-if="form.personType === '0'|| form.personType === '1'" v-model="form.empName" placeholder="请选择员工"
                  value-field="name" :multiple="false" :buttonShow="false" @change="handleEmployeeChange" />
                <a-input v-else v-model.trim="form.empName" placeholder="请输入姓名" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="性别" prop="sex">
                <a-radio-group v-model="form.sex">
                  <a-radio value="男">男</a-radio>
                  <a-radio value="女">女</a-radio>
                </a-radio-group>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="身份证号" prop="idCard">
                <a-input v-model.trim="form.idCard" placeholder="请输入身份证号" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="手机号码">
                <a-input v-model.trim="form.phone" placeholder="请输入手机号码" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="所属公司">
                <a-select v-model="form.company" placeholder="请选择所属公司" allowClear show-search
                  option-filter-prop="children" :filter-option="filterCompanyOption">
                  <a-select-option v-for="item in companyList" :key="item.id" :value="item.name">{{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="部门" prop="dept">
                <a-cascader
                  v-model="deptCascaderValue"
                  :options="deptOptions"
                  :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                  changeOnSelect
                  allowClear
                  show-search
                  placeholder="请选择部门"
                  style="width: 100%"
                  @change="onDeptCascaderChange"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="入住日期" prop="checkinDate">
                <a-date-picker v-model="form.checkinDate" valueFormat="YYYY-MM-DD" style="width: 100%"
                  placeholder="请选择" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="预计离开日期">
                <a-date-picker v-model="form.expectedLeaveDate" valueFormat="YYYY-MM-DD" style="width: 100%"
                  placeholder="请选择" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="是否办理网络信息">
                <a-switch v-model="gridInfoBool" />
                <span :style="'margin-left:8px;font-size:12px;color:' + (gridInfoBool ? '#10b981' : '#94a3b8')">{{
                  gridInfoBool ? '已办理' : '未办理' }}</span>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="领取物品">
                <JSelectMultiple v-model="form.items" dictCode="hrm_sqgl_apply_items" placeholder="请选择" />
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-form-model-item label="备注">
            <a-textarea v-model.trim="form.remark" :rows="2" placeholder="请输入备注（选填）" />
          </a-form-model-item>
        </template>

        <!-- 人员信息（residentEdit）—— 含所有编辑字段，无入住信息标题 -->
        <template v-if="mode === 'residentEdit'">
          <div class="sqgl-sec-title">人员信息</div>
          <a-row :gutter="14" type="flex">
            <a-col :span="8">
              <a-form-model-item label="宿舍类型" prop="dormType">
                <a-select v-model="form.dormType" :disabled="dormTypeDisabled" placeholder="请选择">
                  <a-select-option v-for="o in dormTypeOptions" :key="o.value" :value="o.value" :disabled="o.disabled">
                    {{ o.label }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="人员类型" prop="personType">
                <a-select v-model="form.personType" :disabled="personTypeDisabled" placeholder="请选择"
                  @change="onPersonTypeChange">
                  <a-select-option v-for="o in personTypeOptions" :key="o.value" :value="o.value"
                    :disabled="o.disabled">
                    {{ o.label }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="身份证号">
                <a-input v-model.trim="form.idCard" placeholder="请输入身份证号" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="性别" prop="sex">
                <a-radio-group v-model="form.sex">
                  <a-radio value="男">男</a-radio>
                  <a-radio value="女">女</a-radio>
                </a-radio-group>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="手机号码">
                <a-input v-model.trim="form.phone" placeholder="请输入手机号码" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="所属公司">
                <a-select v-model="form.company" placeholder="请选择所属公司" allowClear show-search
                  option-filter-prop="children" :filter-option="filterCompanyOption">
                  <a-select-option v-for="item in companyList" :key="item.id" :value="item.name">{{ item.name }}
                  </a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="部门" prop="dept">
                <a-cascader
                  v-model="deptCascaderValue"
                  :options="deptOptions"
                  :fieldNames="{ label: 'name', value: 'id', children: 'children' }"
                  changeOnSelect
                  allowClear
                  show-search
                  placeholder="请选择部门"
                  style="width: 100%"
                  @change="onDeptCascaderChange"
                />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="入住日期" prop="checkinDate">
                <a-date-picker v-model="form.checkinDate" valueFormat="YYYY-MM-DD" style="width: 100%"
                  placeholder="请选择" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="预计离开时间">
                <a-date-picker v-model="form.expectedLeaveDate" valueFormat="YYYY-MM-DD" style="width: 100%"
                  placeholder="请选择" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="领取物品">
                <JSelectMultiple v-model="form.items" dictCode="hrm_sqgl_apply_items" placeholder="请选择" />
              </a-form-model-item>
            </a-col>
            <a-col :span="8">
              <a-form-model-item label="是否办理网络信息">
                <a-switch v-model="gridInfoBool" />
                <span :style="'margin-left:8px;font-size:12px;color:' + (gridInfoBool ? '#10b981' : '#94a3b8')">{{
                  gridInfoBool ? '已办理' : '未办理' }}</span>
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-form-model-item label="备注">
            <a-textarea v-model.trim="form.remark" :rows="2" placeholder="请输入备注（选填）" />
          </a-form-model-item>
        </template>

        <!-- 入住信息（handleCheckin only） -->
        <template v-if="mode === 'handleCheckin'">
          <div class="sqgl-sec-title">入住信息</div>
          <div class="person-chips" style="margin-bottom: 14px;">
            <span class="person-chip">
              <span class="chip-avatar">{{ (form.empName || '?').charAt(0) }}</span>
              <span>{{ form.empName || '—' }}{{ form.empNo ? '-' + form.empNo : '' }}{{ form.sex ? '-' + form.sex : '' }}</span>
            </span>
            <!-- <span v-if="form.dormType == 1 && form.spouseName" class="person-chip">
            <span class="chip-avatar">{{ (form.spouseName || '?').charAt(0) }}</span>
            <span>{{ form.spouseName || '—' }} - {{ form.spouseNo || '—' }} </span>
          </span> -->
          </div>
          <a-row :gutter="14">
            <a-col :span="24">
              <a-form-model-item label="入住日期" prop="checkinDate">
                <a-date-picker v-model="form.checkinDate" valueFormat="YYYY-MM-DD" style="width: 100%"
                  placeholder="请选择" />
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-form-model-item label="备注" style="margin-top: 8px;">
            <a-textarea v-model.trim="form.remark" :rows="2" placeholder="请输入备注（选填）" />
          </a-form-model-item>
        </template>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import moment from 'moment'
import { getAction, postAction, putAction } from '@/api/manage'
import { initDictOptions } from '@/components/dict/JDictSelectUtil'

export default {
  name: 'DormHandleCheckinModal',
  data() {
    return {
      visible: false,
      loading: false,
      confirmLoading: false,
      mode: 'handleCheckin',
      form: this.defaultForm(),
      areaOptions: [],
      buildingOptions: [],
      floorOptions: [],
      roomOptions: [],
      targetRoom: null,
      dormTypeDict: [],
      personTypeDict: [],
      companyList: [],
      deptOptions: [],
      deptCascaderValue: [],
      deptTreePromise: null,
    }
  },
  computed: {
    title() {
      return { handleCheckin: '办理入住', residentAdd: '办理客房入住', residentEdit: '编辑住宿记录' }[this.mode] || '办理入住'
    },
    okText() {
      return this.mode === 'residentEdit' ? '保存' : '确认'
    },
    availableRooms() {
      // 只显示空房和部分入住房间（有剩余床位）
      return this.roomOptions.filter((r) => r.beds > r.occupied)
    },
    gridInfoBool: {
      get() {
        return this.form.gridInfo === '1'
      },
      set(val) {
        this.form.gridInfo = val ? '1' : '0'
      },
    },
    dormTypeDisabled() {
      // 人员类型为正式员工时，宿舍类型抹灰不可编辑
      return this.mode === 'residentEdit' && this.form.personType === '0'
    },
    dormTypeOptions() {
      const opts = this.dormTypeDict.map((item) => ({ value: item.value, label: item.text }))
      if (this.mode !== 'residentEdit') return opts
      return opts.map((o) =>
        Object.assign({}, o, { disabled: this.form.personType !== '0' && o.value === '0' })
      )
    },
    personTypeDisabled() {
      // 正式工时人员类型不可编辑
      return this.mode === 'residentEdit' && this.form.personType === '0'
    },
    personTypeOptions() {
      return this.personTypeDict.map((item) => ({
        value: item.value,
        label: item.text,
        disabled: this.form.personType !== '0' && item.value === '0',
      }))
    },
    rules() {
      const r = {
        checkinDate: [{ required: true, message: '请选择入住日期', trigger: 'change' }],
      }
      if (this.mode !== 'residentEdit') {
        r.areaId = [{ required: true, message: '请选择区域', trigger: 'change' }]
        r.buildingId = [{ required: true, message: '请选择楼栋', trigger: 'change' }]
        r.roomId = [{ required: true, message: '请选择宿舍', trigger: 'change' }]
      }
      if (this.mode === 'residentEdit') {
        r.personType = [{ required: true, message: '请选择人员类型', trigger: 'change' }]
        r.empName = [{ required: true, message: '请输入姓名', trigger: 'blur' }]
      }
      if (this.mode === 'residentAdd') {
        r.empName = [{ required: true, message: '请输入姓名', trigger: 'blur' }]
        // 正式员工：身份证号必填且校验
        if (this.form.personType === '0') {
          r.idCard = [
            { required: true, message: '请输入身份证号', trigger: 'blur' },
            { pattern: /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/, message: '身份证号格式不正确', trigger: 'blur' },
          ]
        }
      }
      return r
    },
  },
  created() {
    this.loadAreas()
    this.loadDicts()
    this.getCompanyList()
    this.deptTreePromise = this.loadDeptTree()
  },
  methods: {
    getDictLabel(dict, value) {
      if (!Array.isArray(value)) return ''
      const it = dict.find((item) => item.value === value[0])
      return it?it.text:''
    },
    defaultForm() {
      return {
        id: '',
        status: '',
        empNo: '',
        empName: '',
        idCard: '',
        phone: '',
        company: '',
        dept: '',
        deptPath: '',
        areaId: undefined,
        areaName: '',
        buildingId: undefined,
        buildingName: '',
        floorId: undefined,
        roomId: undefined,
        roomName: '',
        dormType: undefined,
        personType: undefined,
        checkinDate: moment().format('YYYY-MM-DD'),
        expectedLeaveDate: undefined,
        items: '',
        gridInfo: '0',
        remark: '',
        spouseName: '',
        spousePhone: '',
        spouseIdcard: '',
        spouseNo: '',
        dormType_dictText: '',
        sex:''
      }
    },
    open(mode, record) {
      this.mode = mode
      this.visible = true
      this.form = this.defaultForm()
      this.buildingOptions = []
      this.floorOptions = []
      this.roomOptions = []
      this.targetRoom = null
      this.deptCascaderValue = []
      if (mode === 'handleCheckin' && record) {
        // 回显申请信息
        Object.assign(this.form, {
          ...record,
          checkinDate: record.checkinDate || moment().format('YYYY-MM-DD'),
        })
        // 默认选中区域
        this.onAreaChange(record.areaId)
        // 部门级联回显
        if (record.dept) {
          this.deptTreePromise.then(() => this.syncDeptCascaderValue(record.dept))
        }
      } else if (mode === 'residentEdit' && record) {
        this.loading = true
        getAction('/sqgl/approval/resident/queryById', { id: record.id })
          .then((res) => {
            if (res.success) {
              const d = res.result || {}
              Object.assign(this.form, {
                ...d,
                checkinDate: d.checkinDate ? moment(d.checkinDate).format('YYYY-MM-DD') : '',
                expectedLeaveDate: d.expectedLeaveDate ? moment(d.expectedLeaveDate).format('YYYY-MM-DD') : undefined,
                items: d.items || '',
              })
              // 部门级联回显
              if (this.form.dept) {
                this.deptTreePromise.then(() => this.syncDeptCascaderValue(this.form.dept))
              }
            } else {
              this.$message.warning(res.message)
            }
          })
          .finally(() => {
            this.loading = false
          })
      }
      this.$nextTick(() => {
        if (this.$refs.form) this.$refs.form.clearValidate()
      })
    },
    // ============ 宿舍级联 ============
    loadAreas() {
      getAction('/sqgl/hrmSqglArea/listWithStats').then((res) => {
        if (res.success) this.areaOptions = res.result || []
      })
    },
    async loadDicts() {
      const [dormRes, personRes] = await Promise.all([
        initDictOptions('hrm_sqgl_apply_dorm_type'),
        initDictOptions('hrm_sqgl_apply_person_type'),
      ])
      this.dormTypeDict = dormRes.success ? dormRes.result || [] : []
      this.personTypeDict = personRes.success ? personRes.result || [] : []
    },
    // ============ 公司列表 ============
    getCompanyList() {
      getAction('/org/hrmOrg/loadTreeRoot?pid=0').then((res) => {
        if (res.success) {
          this.companyList = (res.result && res.result[0] && res.result[0].children) || []
        }
      })
    },
    filterCompanyOption(input, option) {
      return option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
    },
    onAreaChange(val) {
      this.form.areaId = val
      this.form.buildingId = undefined
      this.form.floorId = undefined
      this.form.roomId = undefined
      this.form.areaName = this.optionName(this.areaOptions, val)
      this.form.buildingName = ''
      this.form.roomName = ''
      this.buildingOptions = []
      this.floorOptions = []
      this.roomOptions = []
      this.targetRoom = null
      if (!val) return
      getAction('/sqgl/hrmSqglBuilding/listByArea', { areaId: val }).then((res) => {
        if (res.success) this.buildingOptions = res.result || []
      })
    },
    onBuildingChange(val) {
      this.form.buildingId = val
      this.form.buildingName = this.optionName(this.buildingOptions, val)
      this.targetRoom = null

      // handleCheckin 模式：直接加载宿舍，不需要楼层
      if (this.mode === 'handleCheckin' || this.mode === 'residentAdd') {
        this.form.roomId = undefined
        this.form.roomName = ''
        this.roomOptions = []
        if (!val) return
        // 通过楼栋加载所有宿舍（无需楼层）
        getAction('/sqgl/hrmSqglRoom/listAvailableByBuilding', { buildingId: val }).then((res) => {
          if (res.success) {
            this.roomOptions = (res.result || []).map(t=>({
              ...t,
              buildingName: this.form.buildingName,
            }))
          }
        })
      } else {
        // 其他模式：需要楼层
        this.form.floorId = undefined
        this.form.roomId = undefined
        this.form.roomName = ''
        this.floorOptions = []
        this.roomOptions = []
        if (!val) return
        getAction('/sqgl/hrmSqglFloor/listByBuilding', { buildingIds: val }).then((res) => {
          if (res.success) this.floorOptions = res.result || []
        })
      }
    },
    onFloorChange(val) {
      this.form.floorId = val
      this.form.roomId = undefined
      this.form.roomName = ''
      this.roomOptions = []
      this.targetRoom = null
      if (!val) return
      getAction('/sqgl/hrmSqglRoom/listByFloor', { floorIds: val }).then((res) => {
        if (res.success) this.roomOptions = res.result || []
      })
    },
    onRoomChange(val) {
      this.form.roomId = val
      this.form.roomName = this.optionName(this.roomOptions, val)
      this.targetRoom = this.roomOptions.find((r) => r.id === val) || null
      // 选择宿舍时保存宿舍类型 dormType=roomType
      if (this.targetRoom && this.targetRoom.roomType !== undefined && this.targetRoom.roomType !== null && this.targetRoom.roomType !== '') {
        this.form.dormType = String(this.targetRoom.roomType)
      }
    },
    optionName(list, id) {
      const o = list.find((i) => i.id === id)
      return o ? o.name : ''
    },
    onPersonTypeChange() {
      // 切换人员类型时清除已填的员工信息并重置校验
      if (this.mode === 'residentAdd') {
        this.form.empName = ''
        this.form.empNo = ''
        this.form.idCard = ''
        this.form.phone = ''
        this.form.company = ''
        this.form.dept = ''
        this.form.deptPath = ''
        this.deptCascaderValue = []
        if (this.$refs.form) {
          this.$refs.form.clearValidate(['empName', 'idCard'])
        }
      }
    },
    // ============ 部门级联选择 ============
    loadDeptTree() {
      return getAction('/org/hrmOrg/loadTreeRoot', { pid: 0 }).then((res) => {
        if (res.success) {
          const roots = res.result || []
          // 取根节点的 children 作为部门树（与 getCompanyList 逻辑一致）
          this.deptOptions = roots.length && roots[0].children ? roots[0].children : roots
        }
      })
    },
    onDeptCascaderChange(value, selectedOptions) {
      const path = Array.isArray(value) ? value.map((v) => String(v)) : []
      this.form.dept = path.length ? path[path.length - 1] : ''
      this.form.deptPath = selectedOptions && selectedOptions.length
        ? selectedOptions.map((o) => o.name || o.label || '').join('/')
        : ''
    },
    syncDeptCascaderValue(deptId) {
      const path = this.findDeptPath(this.deptOptions, String(deptId))
      this.deptCascaderValue = path
    },
    findDeptPath(list, targetId, parentPath) {
      const path = parentPath || []
      for (let i = 0; i < (list || []).length; i++) {
        const item = list[i]
        const nextPath = path.concat(String(item.id))
        if (String(item.id) === targetId) {
          return nextPath
        }
        if (item.children && item.children.length) {
          const matched = this.findDeptPath(item.children, targetId, nextPath)
          if (matched.length) {
            return matched
          }
        }
      }
      return []
    },
    handleEmployeeChange(value, rows) {
      const row = rows && rows.length ? rows[0] : {}
      const empNo = row.no || ''
      if (!value) {
        this.resetEmployeeInfo()
        return
      }
      this.loading = true
      getAction('/sqgl/hrmSqglApply/checkApplicant', { empNo, applyType: '0' })
        .then((res) => {
          if (!res.success) {
            this.$message.warning(res.message || '校验失败')
            this.resetEmployeeInfo()
            return
          }
          const d = res.result || {}
          if (d.canApply === false) {
            this.$message.warning(d.message || '当前员工不可办理入住')
            this.resetEmployeeInfo()
            return
          }
          this.form.empNo = d.empNo || empNo
          this.form.empName = d.empName || row.name || ''
          this.form.sex = row.gender || ''
          this.form.idCard = row.idCard || ''
          this.form.phone = row.phoneNumber || ''
          this.form.company = row.companyId_dictText || ''
          this.form.dept = row.dept || ''
          this.form.deptPath = this.normalizeDeptPath(row.mainDeptPath)
          // 部门级联回显
          if (this.form.dept) {
            this.deptTreePromise.then(() => this.syncDeptCascaderValue(this.form.dept))
          }
          this.$nextTick(() => {
            if (this.$refs.form) this.$refs.form.validateField('idCard')
          })
        })
        .finally(() => {
          this.loading = false
        })
    },
    resetEmployeeInfo() {
      this.form.empNo = ''
      this.form.empName = ''
      this.form.idCard = ''
      this.form.phone = ''
      this.form.company = ''
      this.form.dept = ''
      this.form.deptPath = ''
      this.deptCascaderValue = []
    },
    normalizeDeptPath(path) {
      if (!path) return ''
      return path.endsWith('/') ? path.slice(0, -1) : path
    },
    // ============ 提交 ============
    handleOk() {
      this.$refs.form.validate((valid) => {
        if (!valid) return
        this.confirmLoading = true
        if (this.mode === 'handleCheckin') {
          this.submitHandleCheckin()
        } else if (this.mode === 'residentAdd') {
          this.submitResidentAdd()
        } else {
          this.submitResidentEdit()
        }
      })
    },
    submitHandleCheckin() {
      // const payload = {
      //   id: this.form.id,
      //   areaId: this.form.areaId,
      //   areaName: this.form.areaName,
      //   buildingId: this.form.buildingId,
      //   buildingName: this.form.buildingName,
      //   roomId: this.form.roomId,
      //   roomName: this.form.roomName,
      //   checkinDate: this.form.checkinDate,
      //   expectedLeaveDate: this.form.expectedLeaveDate,
      //   items: this.form.items,
      //   remark: this.form.remark,
      // }
      putAction('/sqgl/approval/handleCheckin', this.form)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '办理成功！')
            this.$emit('ok')
            this.visible = false
          } else {
            this.$message.warning(res.message || '办理失败')
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    submitResidentAdd() {
      const payload = Object.assign({}, this.form, {
        internalEmployee: this.form.personType === '0' ? '1' :'0', // 正式员工就是设置为0
      })
      delete payload.id
      postAction('/sqgl/approval/resident/add', payload)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '办理成功！')
            this.$emit('ok')
            this.visible = false
          } else {
            this.$message.warning(res.message || '办理失败')
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    submitResidentEdit() {
      const payload = {
        ...this.form
      }
      putAction('/sqgl/approval/resident/edit', payload)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '保存成功！')
            this.$emit('ok')
            this.visible = false
          } else {
            this.$message.warning(res.message || '保存失败')
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    handleCancel() {
      this.visible = false
    },
  },
}
</script>

<style lang="less" scoped>
@sqgl-primary: #2563eb;
@sqgl-primary-rgb: 37, 99, 235;
@sqgl-border: #e2e8f0;
@sqgl-muted-foreground: #64748b;
@sqgl-foreground: #1a2a3d;
@sqgl-gradient-blue: linear-gradient(135deg, #2d78ff 0%, #4a9eff 100%);

/deep/ .ant-modal-body {
  padding-top: 14px !important;
}

/deep/ .ant-form-item {
  margin-bottom: 12px;
}

.sqgl-sec-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(@sqgl-primary-rgb, 0.7);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px;

  &::before {
    content: '';
    width: 3px;
    height: 12px;
    background: @sqgl-gradient-blue;
    border-radius: 2px;
  }
}

.sqgl-readonly-grid {
  background: linear-gradient(135deg, rgba(@sqgl-primary-rgb, 0.04), rgba(@sqgl-primary-rgb, 0.012));
  border: 1px solid rgba(@sqgl-primary-rgb, 0.1);
  border-radius: 8px;
  padding: 8px 16px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 6px 16px;

  .row {
    display: flex;
    gap: 8px;
    padding: 4px 0;
    font-size: 13px;

    .k {
      color: @sqgl-muted-foreground;
      flex-shrink: 0;
      font-weight: 500;
    }

    .v {
      color: @sqgl-foreground;
      font-weight: 500;
      word-break: break-all;
    }
  }
}

// 宿舍信息提示
.room-info-hint {
  padding: 8px 14px;
  background: rgba(@sqgl-primary-rgb, 0.04);
  border: 1px solid rgba(@sqgl-primary-rgb, 0.12);
  border-radius: 8px;
  font-size: 13px;
  color: @sqgl-foreground;
  line-height: 1.6;

  &.error {
    background: rgba(239, 68, 68, 0.04);
    border-color: rgba(239, 68, 68, 0.2);
    color: #dc2626;
  }
}

// 入住人标签
.person-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.person-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px 6px 6px;
  border-radius: 8px;
  background: rgba(@sqgl-primary-rgb, 0.06);
  border: 1px solid rgba(@sqgl-primary-rgb, 0.12);
  font-size: 13px;
  color: @sqgl-foreground;

  .chip-avatar {
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: @sqgl-gradient-blue;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 11px;
    font-weight: 600;
    flex-shrink: 0;
  }
}

.sqgl-target-room {
  margin-top: 8px;
  padding: 10px 14px;
  background: rgba(@sqgl-primary-rgb, 0.04);
  border: 1px dashed rgba(@sqgl-primary-rgb, 0.25);
  border-radius: 8px;
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px 12px;

  .tr-item {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .k {
      font-size: 11px;
      color: @sqgl-muted-foreground;
      font-weight: 500;
    }

    .v {
      font-size: 13px;
      color: @sqgl-foreground;
      font-weight: 600;
    }
  }
}

.sqgl-status-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 3px 10px;
  border-radius: 5px;
  font-size: 12px;
  font-weight: 500;

  .dot {
    width: 6px;
    height: 6px;
    border-radius: 999px;
    background: currentColor;
  }

  &.handled {
    background: rgba(16, 185, 129, 0.1);
    color: #059669;
  }

  &.checkout {
    background: rgba(100, 116, 139, 0.12);
    color: #475569;
  }
}
</style>
</style>
