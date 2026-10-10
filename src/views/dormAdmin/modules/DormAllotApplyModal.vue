<template>
  <a-modal :title="title" :width="600" :visible="visible" :confirmLoading="confirmLoading" :maskClosable="false"
    :destroyOnClose="true" :bodyStyle="{ maxHeight: '70vh', overflow: 'auto', padding: '20px 24px' }" @ok="handleOk"
    @cancel="handleCancel" okText="提交申请" cancelText="取消" centered>
    <a-spin :spinning="loading" tip="加载中...">
      <a-form-model ref="applyForm" :model="form" :rules="rules" layout="vertical">
        <!-- 入住申请 -->
        <template v-if="applyType === '0'">
          <div class="sqgl-sec-title">入住信息</div>
          <a-row :gutter="14">
            <a-col :span="12">
              <a-form-model-item label="申请人" prop="empNo">
                <a-input :value="form.empName" disabled />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="宿舍区域" prop="areaId">
                <a-select v-model="form.areaId" placeholder="请选择区域" allowClear style="width: 100%"
                  @change="onAreaChange">
                  <a-select-option v-for="a in areaOptions" :key="a.id" :value="a.id">{{ a.name }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="宿舍类型" prop="dormType">
                <j-dict-select-tag type="list" v-model="form.dormType" dictCode="hrm_sqgl_apply_dorm_type"
                  placeholder="请选择宿舍类型" style="width: 100%" />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="入住日期" prop="checkinDate">
                <a-date-picker v-model="form.checkinDate" valueFormat="YYYY-MM-DD" style="width: 100%"
                  placeholder="请选择入住日期" />
              </a-form-model-item>
            </a-col>
            <!-- <a-col :span="12">
              <a-form-model-item label="楼栋" prop="buildingId">
                <a-select
                  v-model="form.buildingId"
                  :disabled="!form.areaId"
                  placeholder="请选择楼栋"
                  allowClear
                  style="width: 100%"
                  @change="onBuildingChange"
                >
                  <a-select-option v-for="b in buildingOptions" :key="b.id" :value="b.id">{{ b.name }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="楼层" prop="floorId">
                <a-select
                  v-model="form.floorId"
                  :disabled="!form.buildingId"
                  placeholder="请选择楼层"
                  allowClear
                  style="width: 100%"
                  @change="onFloorChange"
                >
                  <a-select-option v-for="f in floorOptions" :key="f.id" :value="f.id">{{ f.name }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="宿舍" prop="roomId">
                <a-select
                  v-model="form.roomId"
                  :disabled="!form.floorId"
                  placeholder="请选择宿舍"
                  allowClear
                  style="width: 100%"
                  @change="onRoomChange"
                >
                  <a-select-option v-for="r in roomOptions" :key="r.id" :value="r.id">{{ r.name }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col> -->
          </a-row>
          <!-- 配偶信息（夫妻宿舍） -->
          <div class="sqgl-spouse-block" v-if="form.dormType === '1'">
            <div class="sqgl-sec-title">配偶信息</div>
            <a-row :gutter="14">
              <a-col :span="24">
                <a-form-model-item label="配偶姓名" prop="spouseName">
                  <j-select-employee v-model="form.spouseName" placeholder="请选择配偶" value-field="name" :multiple="false"
                    :buttonShow="false" @change="handleSpouseChange" />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="配偶联系方式">
                  <a-input v-model.trim="form.spousePhone" placeholder="请输入配偶联系方式" />
                </a-form-model-item>
              </a-col>
              <a-col :span="12">
                <a-form-model-item label="配偶身份证号">
                  <a-input v-model.trim="form.spouseIdcard" placeholder="请输入配偶身份证号" />
                </a-form-model-item>
              </a-col>
            </a-row>
          </div>
          <a-form-model-item label="入住原因" style="margin-top: 12px">
            <a-textarea v-model.trim="form.reason" :rows="3" placeholder="请说明入住原因（选填）" />
          </a-form-model-item>
          <!-- 审批流程 -->
          <div class="sqgl-sec-title" style="margin-top: 18px">审批流程</div>
          <div class="approval-timeline">
            <div v-for="(node, nIndex) in processNodeList" :key="node.id || nIndex" class="timeline-node">
              <div class="timeline-dot"></div>
              <div class="timeline-card">
                <div class="timeline-card-title">
                  {{ node.nodeName }}
                  <a-tag v-if="node.approvalRule === '1' || node.approvalRule === 1" color="orange"
                    class="node-rule-tag">会签</a-tag>
                  <a-tag v-if="node.approvalRule === '2' || node.approvalRule === 2" color="red"
                    class="node-rule-tag">或签</a-tag>
                </div>
                <div class="approver-line">
                  <template v-if="nodeObjList[nIndex] && nodeObjList[nIndex].arr.length > 0">
                    <a-tag v-for="item in nodeObjList[nIndex].arr" :key="item.id" class="approver-tag" :closable="canEditApprovers(node)"
                      @close="handleEmployeeTagClose($event, nIndex, item.id)">
                      <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                      <span class="approver-name">{{ item.name }}</span>
                    </a-tag>
                  </template>
                  <span v-else-if="isKjSprTypeNode(node) && !canEditApprovers(node)" class="kj-spr-type-text">
                    {{ node.chooseObjectsName }}
                  </span>
                  <j-select-approver v-if="isLeaderNode(node)" v-model="nodeObjList[nIndex].str"
                    :kj-spr-type="getNodeKjSprType(node)" placeholder="请选择审批人" value-field="name" button-only
                    button-text="自选审批人" :button-icon="''" :button-type="'default'"
                    @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
                  <j-select-employee v-else-if="hasSprScope(node)" v-model="nodeObjList[nIndex].str"
                    :placeholder="isCcNode(node) ? '请选择抄送人' : '请选择审批人'" value-field="name" button-only
                    :button-text="isCcNode(node) ? '添加抄送人' : '添加审批人'" :button-icon="''" :button-type="'default'"
                    @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
                </div>
              </div>
            </div>
            <div v-if="!processNodeList.length && !processNodesLoading" class="sqgl-empty-hint">
              暂无审批流程配置
            </div>
          </div>
        </template>

        <!-- 调宿申请 -->
        <template v-else-if="applyType === '1'">
          <div class="sqgl-sec-title">调宿信息</div>
          <a-row :gutter="14">
            <a-col :span="12">
              <a-form-model-item label="申请人" prop="empNo">
                <a-input :value="form.empName" disabled />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="原宿舍">
                <a-input :value="oldDormText" disabled />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="调宿后区域" prop="areaId">
                <a-select v-model="form.areaId" placeholder="请选择区域" allowClear style="width: 100%"
                  @change="onAreaChange">
                  <a-select-option v-for="a in areaOptions" :key="a.id" :value="a.id">{{ a.name }}</a-select-option>
                </a-select>
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="调宿入住日期" prop="tsDate">
                <a-date-picker v-model="form.tsDate" valueFormat="YYYY-MM-DD" style="width: 100%"
                  placeholder="请选择调宿入住日期" />
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-form-model-item label="调宿原因" prop="transferReason" style="margin-top: 12px">
            <a-textarea v-model.trim="form.transferReason" :rows="3" placeholder="请详细说明调宿原因" />
          </a-form-model-item>
          <!-- 审批流程 -->
          <div class="sqgl-sec-title" style="margin-top: 18px">审批流程</div>
          <div class="approval-timeline">
            <div v-for="(node, nIndex) in processNodeList" :key="node.id || nIndex" class="timeline-node">
              <div class="timeline-dot"></div>
              <div class="timeline-card">
                <div class="timeline-card-title">
                  {{ node.nodeName }}
                  <a-tag v-if="node.approvalRule === '1' || node.approvalRule === 1" color="orange"
                    class="node-rule-tag">会签</a-tag>
                  <a-tag v-if="node.approvalRule === '2' || node.approvalRule === 2" color="red"
                    class="node-rule-tag">或签</a-tag>
                </div>
                <div class="approver-line">
                  <template v-if="nodeObjList[nIndex] && nodeObjList[nIndex].arr.length > 0">
                    <a-tag v-for="item in nodeObjList[nIndex].arr" :key="item.id" class="approver-tag" :closable="canEditApprovers(node)"
                      @close="handleEmployeeTagClose($event, nIndex, item.id)">
                      <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                      <span class="approver-name">{{ item.name }}</span>
                    </a-tag>
                  </template>
                  <span v-else-if="isKjSprTypeNode(node) && !canEditApprovers(node)" class="kj-spr-type-text">
                    {{ node.chooseObjectsName }}
                  </span>
                  <j-select-approver v-if="isLeaderNode(node)" v-model="nodeObjList[nIndex].str"
                    :kj-spr-type="getNodeKjSprType(node)" placeholder="请选择审批人" value-field="name" button-only
                    button-text="自选审批人" :button-icon="''" :button-type="'default'"
                    @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
                  <j-select-employee v-else-if="hasSprScope(node)" v-model="nodeObjList[nIndex].str"
                    :placeholder="isCcNode(node) ? '请选择抄送人' : '请选择审批人'" value-field="name" button-only
                    :button-text="isCcNode(node) ? '添加抄送人' : '添加审批人'" :button-icon="''" :button-type="'default'"
                    @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
                </div>
              </div>
            </div>
            <div v-if="!processNodeList.length && !processNodesLoading" class="sqgl-empty-hint">
              暂无审批流程配置
            </div>
          </div>
        </template>

        <!-- 退宿申请 -->
        <template v-else-if="applyType === '2'">
          <div class="sqgl-sec-title">退宿信息</div>
          <a-row :gutter="14">
            <a-col :span="12">
              <a-form-model-item label="申请人" prop="empNo">
                <a-input :value="form.empName" disabled />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="原宿舍">
                <a-input :value="oldDormText" disabled />
              </a-form-model-item>
            </a-col>
            <a-col :span="12">
              <a-form-model-item label="预计退宿日期" prop="expectedLeaveDate">
                <a-date-picker v-model="form.expectedLeaveDate" valueFormat="YYYY-MM-DD" style="width: 100%"
                  placeholder="请选择预计退宿日期" />
              </a-form-model-item>
            </a-col>
          </a-row>
          <a-form-model-item label="卫生照片" :required="true" style="margin-top: 12px">
            <a-upload listType="picture-card" accept="image/jpeg,image/png,image/gif,image/webp"
              :fileList="photoFileList" :action="uploadAction" :headers="headers" :data="{ biz: 'temp' }"
              :multiple="true" @change="handlePhotoChange" @preview="handlePhotoPreview">
              <div v-if="photoFileList.length < 9">
                <a-icon type="camera" />
                <div class="sqgl-upload-tip">上传照片</div>
              </div>
            </a-upload>
            <div class="sqgl-hint">支持 JPG/PNG 等图片类型，可预览与删除</div>
          </a-form-model-item>
          <a-form-model-item label="退宿原因" prop="checkoutReason">
            <a-textarea v-model.trim="form.checkoutReason" :rows="3" placeholder="请详细说明退宿原因" />
          </a-form-model-item>
          <!-- 审批流程 -->
          <div class="sqgl-sec-title" style="margin-top: 18px">审批流程</div>
          <div class="approval-timeline">
            <div v-for="(node, nIndex) in processNodeList" :key="node.id || nIndex" class="timeline-node">
              <div class="timeline-dot"></div>
              <div class="timeline-card">
                <div class="timeline-card-title">
                  {{ node.nodeName }}
                  <a-tag v-if="node.approvalRule === '1' || node.approvalRule === 1" color="orange"
                    class="node-rule-tag">会签</a-tag>
                  <a-tag v-if="node.approvalRule === '2' || node.approvalRule === 2" color="red"
                    class="node-rule-tag">或签</a-tag>
                </div>
                <div class="approver-line">
                  <template v-if="nodeObjList[nIndex] && nodeObjList[nIndex].arr.length > 0">
                    <a-tag v-for="item in nodeObjList[nIndex].arr" :key="item.id" class="approver-tag" :closable="canEditApprovers(node)"
                      @close="handleEmployeeTagClose($event, nIndex, item.id)">
                      <span class="approver-avatar">{{ getAvatarText(item.name) }}</span>
                      <span class="approver-name">{{ item.name }}</span>
                    </a-tag>
                  </template>
                  <span v-else-if="isKjSprTypeNode(node) && !canEditApprovers(node)" class="kj-spr-type-text">
                    {{ node.chooseObjectsName }}
                  </span>
                  <j-select-approver v-if="isLeaderNode(node)" v-model="nodeObjList[nIndex].str"
                    :kj-spr-type="getNodeKjSprType(node)" placeholder="请选择审批人" value-field="name" button-only
                    button-text="自选审批人" :button-icon="''" :button-type="'default'"
                    @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
                  <j-select-employee v-else-if="hasSprScope(node)" v-model="nodeObjList[nIndex].str"
                    :placeholder="isCcNode(node) ? '请选择抄送人' : '请选择审批人'" value-field="name" button-only
                    :button-text="isCcNode(node) ? '添加抄送人' : '添加审批人'" :button-icon="''" :button-type="'default'"
                    @change="(value, rows) => handleSelectValue(nIndex, value, rows)" />
                </div>
              </div>
            </div>
            <div v-if="!processNodeList.length && !processNodesLoading" class="sqgl-empty-hint">
              暂无审批流程配置
            </div>
          </div>
        </template>
      </a-form-model>
    </a-spin>
  </a-modal>
</template>

<script>
import Vue from 'vue'
import { ACCESS_TOKEN } from '@/store/mutation-types'
import { getAction, postAction, getFileAccessHttpUrl } from '@/api/manage'

function defaultForm() {
  return {
    applyType: '0',
    personType: '0',
    empNo: '',
    empName: '',
    sex: '',
    idCard: '',
    phone: '',
    company: '',
    dept: '',
    deptPath: '',
    // 目标宿舍
    areaId: undefined,
    areaName: '',
    buildingId: undefined,
    buildingName: '',
    floorId: undefined,
    floorName: '',
    roomId: undefined,
    roomName: '',
    dormType: undefined,
    checkinDate: undefined,
    tsDate: undefined,
    reason: '',
    transferReason: '',
    checkoutReason: '',
    // 配偶
    spouseName: '',
    spousePhone: '',
    spouseIdcard: '',
    spouseNo: '',
    // 原宿舍（调宿/退宿）
    oldAreaId: '',
    oldAreaName: '',
    oldBuildingId: '',
    oldBuildingName: '',
    oldRoomId: '',
    oldRoomName: '',
    oldCheckinDate: '',
    // 退宿
    expectedLeaveDate: undefined,
    healthPhotos: '',
    // 审批/抄送
    approveName: '',
    approveCode: '',
    ccName: '',
    ccCode: '',
    remark: '',
  }
}

export default {
  name: 'DormAllotApplyModal',
  data() {
    return {
      title: '入住申请',
      visible: false,
      loading: false,
      confirmLoading: false,
      applyType: '0',
      form: defaultForm(),
      areaOptions: [],
      buildingOptions: [],
      floorOptions: [],
      roomOptions: [],
      uploadAction: window._CONFIG['domianURL'] + '/sys/common/upload',
      headers: {},
      photoFileList: [],
      // 流程节点列表（后端返回）
      processNodeList: [],
      // 每个节点对应的审批人/抄送人数据
      nodeObjList: [],
      processNodesLoading: false,
      url: {
        getLcjdList: '/process/customProcessConfiguration/getLcjdList'
      },
      // 各申请类型对应的 sqmkCode
      sqmkCodeMap: {
        '0': '入住申请',
        '1': '调宿申请',
        '2': '退宿申请'
      }
    }
  },
  computed: {
    oldDormText() {
      const f = this.form
      const parts = [f.oldAreaName, f.oldBuildingName, f.oldRoomName].filter(Boolean)
      console.log('ddddddd', parts)
      return parts.length ? parts.join(' / ') : '—'
    },
    // 表单校验规则：按申请类型与宿舍类型动态生成，便于手动调整
    rules() {
      const rules = {
        empNo: [{ required: true, message: '请选择申请人', trigger: 'change' }],
      }
      if (this.applyType === '0') {
        rules.dormType = [{ required: true, message: '请选择宿舍类型', trigger: 'change' }]
        rules.areaId = [{ required: true, message: '请选择宿舍区域', trigger: 'change' }]
        rules.checkinDate = [{ required: true, message: '请选择入住日期', trigger: 'change' }]
        if (this.form.dormType === '1') {
          rules.spouseName = [{ required: true, message: '请选择配偶', trigger: 'change' }]
        }
      } else if (this.applyType === '1') {
        rules.areaId = [{ required: true, message: '请选择调宿后区域', trigger: 'change' }]
        rules.tsDate = [{ required: true, message: '请选择调宿入住日期', trigger: 'change' }]
        rules.transferReason = [{ required: true, message: '请填写调宿原因', trigger: 'blur' }]
      } else {
        rules.expectedLeaveDate = [{ required: true, message: '请选择预计退宿日期', trigger: 'change' }]
        rules.checkoutReason = [{ required: true, message: '请填写退宿原因', trigger: 'blur' }]
      }
      return rules
    },
  },
  created() {
    const token = Vue.ls.get(ACCESS_TOKEN)
    this.headers = { 'X-Access-Token': token }
  },
  methods: {
    open(applyType) {
      this.applyType = applyType
      this.title = applyType === '0' ? '入住申请' : applyType === '1' ? '调宿申请' : '退宿申请'
      this.visible = true
      this.form = defaultForm()
      this.form.applyType = applyType
      this.buildingOptions = []
      this.floorOptions = []
      this.roomOptions = []
      this.photoFileList = []
      this.processNodeList = []
      this.nodeObjList = []
      this.loadAreas()
      // 打开弹窗时用当前登录用户信息初始化申请人
      const perInfo = Vue.ls.get('perInfo') || {}
      this.form.empNo = perInfo.no || ''
      this.form.empName = perInfo.name || ''
      this.form.dept = perInfo.dept || ''
      if (this.form.empNo) {
        this.loadApplicantInfo()
      }
      this.$nextTick(() => {
        if (this.$refs.applyForm) {
          this.$refs.applyForm.clearValidate()
        }
      })
    },
    // ============ 加载申请人信息 ============
    loadApplicantInfo() {
      const empNo = this.form.empNo
      if (!empNo) {
        this.resetApplicantInfo()
        return
      }
      this.loading = true
      getAction('/sqgl/hrmSqglApply/checkApplicant', { empNo, applyType: this.applyType })
        .then((res) => {
          if (!res.success) {
            this.$message.warning(res.message || '校验失败')
            this.keepOnlyApplicantName()
            return
          }
          const d = res.result || {}
          if (d.canApply === false) {
            this.$message.warning(d.message || '当前申请人不可提交该申请')
            this.keepOnlyApplicantName()
            return
          }
          const perInfo = Vue.ls.get('perInfo') || {}
          this.form.empNo = d.empNo || empNo
          this.form.empName = d.empName || perInfo.name || ''
          this.form.sex = d.sex || perInfo.gender || ''
          this.form.idCard = d.idCard || perInfo.idCard || ''
          this.form.phone = d.phone || perInfo.phoneNumber || ''
          this.form.company = d.company || perInfo.companyId_dictText || ''
          this.form.dept = d.dept || perInfo.dept || ''
          this.form.deptPath = this.normalizeDeptPath(d.deptPath || perInfo.mainDeptPath || '')
          if (this.applyType === '1' || this.applyType === '2') {
            this.form.oldAreaId = d.areaId || ''
            this.form.oldAreaName = d.areaName || ''
            this.form.oldBuildingId = d.buildingId || ''
            this.form.oldBuildingName = d.buildingName || ''
            this.form.oldRoomId = d.roomId || ''
            this.form.oldRoomName = d.roomName || ''
            this.form.oldCheckinDate = d.checkinDate || ''
            this.form.dormType = d.dormType || this.form.dormType
          }
          this.validateField('empNo')
          // 申请人部门变化后，重新加载流程节点
          this.loadProcessNodes()
        })
        .finally(() => {
          this.loading = false
        })
    },
    // 校验失败时保留申请人姓名（从本地 perInfo 取），清空其余字段
    keepOnlyApplicantName() {
      const perInfo = Vue.ls.get('perInfo') || {}
      this.form.empNo = perInfo.no || ''
      this.form.empName = perInfo.name || ''
      this.form.sex = ''
      this.form.idCard = ''
      this.form.phone = ''
      this.form.company = ''
      this.form.dept = ''
      this.form.deptPath = ''
      if (this.applyType === '1' || this.applyType === '2') {
        this.form.oldAreaId = ''
        this.form.oldAreaName = ''
        this.form.oldBuildingId = ''
        this.form.oldBuildingName = ''
        this.form.oldRoomId = ''
        this.form.oldRoomName = ''
        this.form.oldCheckinDate = ''
      }
    },
    resetApplicantInfo() {
      this.form.empNo = ''
      this.form.empName = ''
      this.form.sex = ''
      this.form.idCard = ''
      this.form.phone = ''
      this.form.company = ''
      this.form.dept = ''
      this.form.deptPath = ''
      if (this.applyType === '1' || this.applyType === '2') {
        this.form.oldAreaId = ''
        this.form.oldAreaName = ''
        this.form.oldBuildingId = ''
        this.form.oldBuildingName = ''
        this.form.oldRoomId = ''
        this.form.oldRoomName = ''
        this.form.oldCheckinDate = ''
      }
    },
    // ============ 宿舍级联 ============
    loadAreas() {
      getAction('/sqgl/hrmSqglArea/listWithStats').then((res) => {
        if (res.success) {
          this.areaOptions = res.result || []
        }
      })
    },
    onAreaChange(val) {
      this.form.areaId = val
      this.form.buildingId = undefined
      this.form.floorId = undefined
      this.form.roomId = undefined
      this.form.areaName = this.optionName(this.areaOptions, val)
      this.form.buildingName = ''
      this.form.floorName = ''
      this.form.roomName = ''
      this.buildingOptions = []
      this.floorOptions = []
      this.roomOptions = []
      if (!val) return
      getAction('/sqgl/hrmSqglBuilding/listByArea', { areaId: val }).then((res) => {
        if (res.success) this.buildingOptions = res.result || []
      })
    },
    onBuildingChange(val) {
      this.form.buildingId = val
      this.form.floorId = undefined
      this.form.roomId = undefined
      this.form.buildingName = this.optionName(this.buildingOptions, val)
      this.form.floorName = ''
      this.form.roomName = ''
      this.floorOptions = []
      this.roomOptions = []
      if (!val) return
      getAction('/sqgl/hrmSqglFloor/listByBuilding', { buildingIds: val }).then((res) => {
        if (res.success) this.floorOptions = res.result || []
      })
    },
    onFloorChange(val) {
      this.form.floorId = val
      this.form.roomId = undefined
      this.form.floorName = this.optionName(this.floorOptions, val)
      this.form.roomName = ''
      this.roomOptions = []
      if (!val) return
      getAction('/sqgl/hrmSqglRoom/listByFloor', { floorIds: val }).then((res) => {
        if (res.success) this.roomOptions = res.result || []
      })
    },
    onRoomChange(val) {
      this.form.roomId = val
      this.form.roomName = this.optionName(this.roomOptions, val)
    },
    optionName(list, id) {
      const o = list.find((i) => i.id === id)
      return o ? o.name : ''
    },
    // 去除 mainDeptPath 末尾斜杠
    normalizeDeptPath(path) {
      if (!path) return ''
      return path.endsWith('/') ? path.slice(0, -1) : path
    },
    handleSpouseChange(value, rows) {
      console.log('ddddddddddd', value, rows)
      this.form.spouseName = value || ''
      this.form.spouseIdcard = rows[0].idCard || ''
      this.form.spousePhone = rows[0].phoneNumber || ''
      this.form.spouseNo = rows[0].no || ''
      this.validateField('spouseName')
    },
    // ============ 卫生照片 ============
    handlePhotoChange(info) {
      let fileList = [...info.fileList]
      if (info.file.status === 'done') {
        const resp = info.file.response || {}
        if (resp.success) {
          fileList = fileList.map((file) => {
            if (file.response && file.response.message) {
              file.url = getFileAccessHttpUrl(file.response.message)
            }
            return file
          })
        } else {
          this.$message.error(resp.message || '图片上传失败')
          fileList = fileList.filter((f) => f.uid !== info.file.uid)
        }
      } else if (info.file.status === 'error') {
        this.$message.error('图片上传失败，请稍后重试')
        fileList = fileList.filter((f) => f.uid !== info.file.uid)
      }
      this.photoFileList = fileList
    },
    handlePhotoPreview(file) {
      this.$store.dispatch('openPdf', file.url || '')
    },
    // ============ 提交 ============
    handleOk() {
      this.$refs.applyForm.validate((valid) => {
        if (!valid) return
        // 校验每个需要选择审批人的节点
        let allValid = true
        this.processNodeList.forEach((node, idx) => {
          if (this.canEditApprovers(node) && this.nodeObjList[idx] && this.nodeObjList[idx].arr.length === 0) {
            this.$message.warning(`请选择「${node.nodeName}」的${this.isCcNode(node) ? '抄送' : '审批'}人`)
            allValid = false
          }
        })
        if (!allValid) return
        // 提交前再次校验
        this.confirmLoading = true
        getAction('/sqgl/hrmSqglApply/checkApplicant', { empNo: this.form.empNo, applyType: this.applyType })
          .then((res) => {
            if (!res.success || !res.result || res.result.canApply === false) {
              this.$message.warning((res.result && res.result.message) || res.message || '当前申请人不可提交该申请')
              this.confirmLoading = false
              return
            }
            this.submit()
          })
          .catch(() => {
            this.confirmLoading = false
          })
      })
    },
    submit() {
      const payload = this.buildPayload()
      postAction('/sqgl/hrmSqglApply/add', payload)
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '提交成功！')
            this.$emit('ok')
            this.visible = false
          } else {
            this.$message.warning(res.message || '提交失败')
          }
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    buildPayload() {
      const f = this.form
      const base = {
        applyType: this.applyType,
        empNo: f.empNo,
        empName: f.empName,
        sex: f.sex,
        idCard: f.idCard,
        phone: f.phone,
        company: f.company,
        dept: f.dept,
        deptPath: f.deptPath,
        approveName: f.approveName,
        approveCode: f.approveCode,
        ccName: f.ccName,
        ccCode: f.ccCode,
        remark: f.remark,
        personType: f.personType,
      }
      // 动态流程节点数据（新流程引擎模式）
      const processDTOList = this.buildProcessDTOList()
      if (processDTOList && processDTOList.length > 0) {
        base.customProcessConfigurationDTOList = processDTOList
      }
      if (this.applyType === '0') {
        return Object.assign(base, {
          areaId: f.areaId,
          areaName: f.areaName,
          buildingId: f.buildingId,
          buildingName: f.buildingName,
          floorId: f.floorId,
          roomId: f.roomId,
          roomName: f.roomName,
          dormType: f.dormType,
          checkinDate: f.checkinDate,
          reason: f.reason,
          spouseName: f.dormType === '1' ? f.spouseName : '',
          spousePhone: f.dormType === '1' ? f.spousePhone : '',
          spouseIdcard: f.dormType === '1' ? f.spouseIdcard : '',
          spouseNo: f.dormType === '1' ? f.spouseNo : '',
          internalEmployee: '1',
          gridInfo: '0',
        })
      } else if (this.applyType === '1') {
        return Object.assign(base, {
          oldAreaId: f.oldAreaId,
          oldAreaName: f.oldAreaName,
          oldBuildingId: f.oldBuildingId,
          oldBuildingName: f.oldBuildingName,
          oldRoomId: f.oldRoomId,
          oldRoomName: f.oldRoomName,
          oldCheckinDate: f.oldCheckinDate,
          areaId: f.areaId,
          areaName: f.areaName,
          tsDate: f.tsDate,
          transferReason: f.transferReason,
        })
      }
      // 退宿
      const photos = this.photoFileList.filter((f) => f.response && f.response.message).map((f) => f.response.message)
      return Object.assign(base, {
        areaId: f.oldAreaId,
        areaName: f.oldAreaName,
        buildingId: f.oldBuildingId,
        buildingName: f.oldBuildingName,
        roomId: f.oldRoomId,
        roomName: f.oldRoomName,
        checkinDate: f.oldCheckinDate,
        expectedLeaveDate: f.expectedLeaveDate,
        checkoutReason: f.checkoutReason,
        healthPhotos: JSON.stringify(photos),
      })
    },
    // 手动触发某个字段校验（用于自定义组件变更后清除错误）
    validateField(prop) {
      this.$nextTick(() => {
        if (this.$refs.applyForm) {
          this.$refs.applyForm.validateField(prop)
        }
      })
    },
    onApprovalChange() {
      this.validateField('approveCode')
      this.validateField('ccCode')
    },
    // ============ 动态流程节点 ============
    /** 判断节点是否为抄送节点（nodeProperties: 1=审批, 2=抄送） */
    isCcNode(node) {
      return node && Number(node.nodeProperties) === 2
    },
    /** 判断节点是否为 kjSprType 类型节点（users 为 null 时展示 chooseObjectsName） */
    isKjSprTypeNode(node) {
      if (!node) return false
      return node.users === null && node.chooseObjectsName
    },
    /** 判断节点是否显示添加审批人按钮 */
    hasSprScope(node) {
      if (!node) return false
      return Number(node.isselfSelect) === 1 || Number(node.sprScope) === 4
    },
    /**
     * 判断节点是否为空级审批节点（直属主管/直属经理/直属总监，依据 kjSprType 判断）
     */
    isLeaderNode(node) {
      if (!node) return false
      const kjSprType = this.getNodeKjSprType(node)
      return kjSprType !== null && kjSprType !== undefined && kjSprType !== ''
    },
    /**
     * 获取节点的空级审批类型 kjSprType（优先取外层，兼容内层 customProcessNodeConfiguration）
     */
    getNodeKjSprType(node) {
      if (!node) return ''
      if (node.kjSprType != null && node.kjSprType !== '') return node.kjSprType
      const inner = node.customProcessNodeConfiguration
      return inner && inner.kjSprType != null && inner.kjSprType !== '' ? inner.kjSprType : ''
    },
    /**
     * 判断节点的审批人是否可编辑（可删除接口返回人员、可自选添加）
     */
    canEditApprovers(node) {
      return this.hasSprScope(node) || this.isLeaderNode(node)
    },
    /** 从节点配置中提取默认人员列表 */
    extractDefaultPersons(node) {
      const list = []
      const addItems = (arr, idKey, nameKey) => {
        if (!Array.isArray(arr)) return
        arr.forEach(item => {
          const ids = (item[idKey] || '').toString().split(',').filter(Boolean)
          const names = (item[nameKey] || '').toString().split(',').filter(Boolean)
          ids.forEach((id, idx) => {
            list.push({
              id: id.trim(),
              name: (names[idx] || id).trim()
            })
          })
        })
      }
      addItems(node.users, 'chooseObjects', 'chooseObjectsName')
      addItems(node.roles, 'chooseObjects', 'chooseObjectsName')
      addItems(node.departments, 'chooseObjects', 'chooseObjectsName')
      // 空级审批节点（直属主管/直属经理/直属总监）：后端解析出的人员在节点外层 chooseObjects/chooseObjectsName，可能多人逗号分隔
      if (list.length === 0 && this.isLeaderNode(node)) {
        const ids = (node.chooseObjects || '').toString().split(',').map(s => s.trim()).filter(Boolean)
        const names = (node.chooseObjectsName || '').toString().split(',').map(s => s.trim())
        ids.forEach((id, idx) => {
          list.push({ id, name: names[idx] || id })
        })
      }
      // 去重
      const map = new Map()
      list.forEach(item => {
        if (!map.has(item.id)) map.set(item.id, item)
      })
      return Array.from(map.values())
    },
    /** 加载流程节点列表 */
    loadProcessNodes() {
      const dept = this.form.dept || ''
      if (!dept) {
        this.processNodeList = []
        this.nodeObjList = []
        return
      }
      const sqmkCode = this.sqmkCodeMap[this.applyType] || ''
      if (!sqmkCode) return
      this.processNodesLoading = true
      getAction(this.url.getLcjdList, {
        sqmkCode: sqmkCode,
        dept: dept,
        no: this.form.empNo || ''
      }).then(res => {
        if (res.success && Array.isArray(res.result)) {
          const list = res.result.slice().sort((a, b) => Number(a.px) - Number(b.px))
          this.processNodeList = list
          this.nodeObjList = list.map(node => {
            const defaultPersons = this.extractDefaultPersons(node)
            return {
              arr: defaultPersons,
              str: defaultPersons.map(p => p.name).join(',')
            }
          })
        } else {
          this.processNodeList = []
          this.nodeObjList = []
          this.$message.warning(res.message || '没有匹配到审批模板')
        }
      }).catch(() => {
        this.processNodeList = []
        this.nodeObjList = []
      }).finally(() => {
        this.processNodesLoading = false
      })
    },
    /** 选择审批人/抄送人（追加合并） */
    handleSelectValue(index, value, rows) {
      if (this.nodeObjList[index]) {
        const existingArr = this.nodeObjList[index].arr || []
        const map = new Map()
        existingArr.forEach(item => map.set(item.id, item))
        rows.forEach(item => {
          if (!map.has(item.id)) {
            map.set(item.id, item)
          }
        })
        const mergedArr = Array.from(map.values())
        this.nodeObjList[index].arr = mergedArr
        this.nodeObjList[index].str = mergedArr.map(p => p.name).join(',')
      }
    },
    /** 移除审批人/抄送人 tag */
    handleEmployeeTagClose(event, index, id) {
      if (event && event.preventDefault) {
        event.preventDefault()
      }
      if (this.nodeObjList[index]) {
        this.nodeObjList[index].arr = this.nodeObjList[index].arr.filter(item => item.id != id)
        this.nodeObjList[index].str = this.nodeObjList[index].arr.map(item => item.name).join(',')
      }
    },
    /** 头像文字（取最后一个字） */
    getAvatarText(name) {
      if (!name) return '?'
      const trimmed = String(name).trim()
      return trimmed.charAt(trimmed.length - 1).toUpperCase()
    },
    /** 组装流程节点数据，用于提交 */
    buildProcessDTOList() {
      if (!this.processNodeList || !this.processNodeList.length) return null
      return this.processNodeList.map((node, idx) => {
        const nodeCopy = JSON.parse(JSON.stringify(node))
        if (this.canEditApprovers(node) && this.nodeObjList[idx]) {
          const selectedPersons = this.nodeObjList[idx].arr
          if (selectedPersons && selectedPersons.length > 0) {
            nodeCopy.chooseObjects = selectedPersons.map(p => p.id).join(',')
            nodeCopy.chooseObjectsName = selectedPersons.map(p => p.name).join(',')
            nodeCopy.sprScopeName = node.nodeName || ''
          }
        }
        return nodeCopy
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

.sqgl-spouse-block {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px dashed @sqgl-border;
}

.sqgl-hint {
  margin-top: 6px;
  font-size: 12px;
  color: @sqgl-muted-foreground;
}

.sqgl-upload-tip {
  font-size: 12px;
  color: @sqgl-muted-foreground;
  margin-top: 4px;
}

/* ===== 审批流程时间轴 ===== */
.approval-timeline {
  position: relative;
  padding-left: 0;
  max-height: 360px;
  overflow-y: auto;
  padding-right: 4px;
}

.approval-timeline::-webkit-scrollbar {
  width: 6px;
}

.approval-timeline::-webkit-scrollbar-thumb {
  background: #c7d0e4;
  border-radius: 3px;
}

.approval-timeline::-webkit-scrollbar-track {
  background: transparent;
}

.timeline-node {
  position: relative;
  padding-left: 22px;
  padding-bottom: 16px;
}

.timeline-node:last-child {
  padding-bottom: 0;
}

.timeline-node:not(:last-child)::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 12px;
  bottom: -4px;
  width: 2px;
  background: #e6e8eb;
  border-radius: 1px;
}

.timeline-dot {
  position: absolute;
  left: 0;
  top: 12px;
  width: 12px;
  height: 12px;
  border: 2px solid #4a7bf7;
  background: #fff;
  border-radius: 50%;
  z-index: 1;
}

.timeline-card {
  background: #f0f4fb;
  border: 1px solid #e3e9f5;
  border-radius: 8px;
  padding: 12px 14px;
}

.timeline-card-title {
  margin-bottom: 10px;
  color: #1f2937;
  font-size: 14px;
  font-weight: 600;
  line-height: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.timeline-card-title .node-rule-tag {
  margin: 0;
  font-size: 11px;
  line-height: 18px;
  height: 18px;
  padding: 0 6px;
  font-weight: 500;
}

.approver-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 4px;
}

.approver-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  padding: 0 8px 0 4px;
  height: 28px;
  border: 1px solid #d6e0f5;
  border-radius: 14px;
  background: #fff;
  color: #1f2937;
  font-size: 13px;
  line-height: 26px;
}

.approver-tag /deep/ .anticon-close {
  color: #b3b8c2;
  margin-left: 0;
}

.approver-tag /deep/ .anticon-close:hover {
  color: #ff4d4f;
}

.approver-avatar {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #4a7bf7;
  color: #fff;
  font-size: 12px;
  font-weight: 600;
  line-height: 1;
}

.approver-name {
  color: #1f2937;
  font-size: 13px;
}

.kj-spr-type-text {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 14px;
  border: 1px solid #d6e0f5;
  border-radius: 14px;
  background: #fff;
  color: #1f2937;
  font-size: 13px;
  line-height: 26px;
}

.approver-line /deep/ .j-select-employee-button-only,
.approver-line /deep/ .j-select-approver-button-only {
  display: inline-flex;
  width: auto;
  flex: none;
}

.approver-line /deep/ .j-select-employee-button-only .ant-btn,
.approver-line /deep/ .j-select-approver-button-only .ant-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 28px;
  padding: 0 12px;
  border: 1px dashed #4a7bf7;
  border-radius: 14px;
  background: #fff;
  color: #4a7bf7;
  font-size: 13px;
  font-weight: 400;
  line-height: 1;
  box-shadow: none;
}

.approver-line /deep/ .j-select-employee-button-only .ant-btn::before,
.approver-line /deep/ .j-select-approver-button-only .ant-btn::before {
  content: '+';
  display: inline-block;
  font-size: 14px;
  font-weight: 600;
  margin-right: 2px;
  line-height: 1;
  position: relative;
}

.approver-line /deep/ .j-select-employee-button-only .ant-btn:hover,
.approver-line /deep/ .j-select-employee-button-only .ant-btn:focus,
.approver-line /deep/ .j-select-approver-button-only .ant-btn:hover,
.approver-line /deep/ .j-select-approver-button-only .ant-btn:focus {
  border-color: #2d5fe0;
  color: #2d5fe0;
  background: #f5f8ff;
}

.sqgl-empty-hint {
  text-align: center;
  color: #94a3b8;
  font-size: 12.5px;
  padding: 20px 0;
  background: #f8fafc;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
}
</style>
