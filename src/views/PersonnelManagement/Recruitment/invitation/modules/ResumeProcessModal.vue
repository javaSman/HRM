<template>
  <j-modal
    class="recruitment-flow-modal rpm-modal"
    :title="title"
    :width="getWidth()"
    :visible="visible"
    switchFullscreen
    :bodyStyle="bodyStyle"
    @cancel="close"
  >
    <div class="rpm-body">
      <!-- 左：批量人员列表（仅批量操作） -->
      <div v-if="mode !== 'detail'" class="rpm-col rpm-people">
        <div class="col-title">人员列表</div>
        <div class="people-scroll">
          <div
            v-for="item in people"
            :key="item.id"
            :class="['person-card', activeId === item.id ? 'active' : '']"
            @click="selectPerson(item)"
          >
            <div :class="['avatar', item.xb === '女' ? 'female' : 'male']">
              {{ (item.xm || '?').charAt(0) }}
            </div>
            <span class="p-name">{{ formatValue(item.xm) }}</span>
            <span class="p-meta">{{ item.nl ? item.nl + '岁' : '-' }}</span>
            <a-icon class="p-sex" :type="item.xb === '女' ? 'woman' : 'man'" />
          </div>
        </div>
      </div>

      <!-- 中：个人信息（只读） -->
      <div class="rpm-col rpm-personal">
        <div class="col-title">
          个人信息
          <a-tag class="state-tag" :color="dqztColor(activeRecord.dqzt)">{{ activeRecord.mslc || '初试' }} : {{ formatValue(activeRecord.dqzt) }}</a-tag>
        </div>
        <div class="personal-box">
          <div class="field field-full">
            <span class="field-label">简历标题</span>
            <div class="field-value">{{ formatValue(activeRecord.jlbt) }}</div>
          </div>
          <div class="field">
            <span class="field-label">姓名</span>
            <div class="field-value">{{ formatValue(activeRecord.xm) }}</div>
          </div>
          <div class="field">
            <span class="field-label">性别</span>
            <div class="field-value">{{ formatValue(activeRecord.xb) }}</div>
          </div>
          <div class="field">
            <span class="field-label">年龄</span>
            <div class="field-value">
              {{
                activeRecord.nl === undefined || activeRecord.nl === null || activeRecord.nl === ''
                  ? '-'
                  : activeRecord.nl
              }}
            </div>
          </div>
          <div class="field">
            <span class="field-label">学历</span>
            <div class="field-value">{{ formatValue(activeRecord.xl) }}</div>
          </div>
          <div class="field">
            <span class="field-label">专业</span>
            <div class="field-value">{{ formatValue(activeRecord.zy) }}</div>
          </div>
          <div class="field">
            <span class="field-label">期望薪资(k)</span>
            <div class="field-value">
              {{
                activeRecord.qwxz === undefined || activeRecord.qwxz === null || activeRecord.qwxz === ''
                  ? '-'
                  : activeRecord.qwxz
              }}
            </div>
          </div>
          <div class="field">
            <span class="field-label">手机号</span>
            <div class="field-value">{{ formatValue(activeRecord.sjh) }}</div>
          </div>
          <div class="field">
            <span class="field-label">邮箱</span>
            <div class="field-value">{{ formatValue(activeRecord.yx) }}</div>
          </div>
          <div class="field field-full">
            <span class="field-label">简历附件</span>
            <div class="field-value">
              <div v-if="activeRecord.jlFujian" style="width: 315px;">
                <j-upload  v-model="activeRecord.jlFujian" disabled />
              </div>
              <span v-else>-</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右：邀约信息（非批量淘汰时展示） -->
      <div v-if="showInvite" class="rpm-col rpm-invite">
        <div class="col-title">
          邀约信息
          <span v-if="mode !== 'detail'" class="unify-tip">以下信息将统一应用于全部候选人</span>
        </div>
        <!-- 详情：与个人信息一致的只读展示 -->
        <div v-if="readonly" class="detail-grid">
          <div class="field">
            <span class="field-label">面试人</span>
            <div class="field-value">{{ formatValue(form.msr) }}</div>
          </div>
          <div class="field">
            <span class="field-label">面试形式</span>
            <div class="field-value">{{ formatValue(form.msxs) }}</div>
          </div>
          <div class="field">
            <span class="field-label">面试时间</span>
            <div class="field-value">{{ formatValue(form.mssj) }}</div>
          </div>
          <div class="field">
            <span class="field-label">最晚确认时间</span>
            <div class="field-value">{{ formatValue(form.zwmssj) }}</div>
          </div>
          <div class="field field-full" v-if="form.msxs == '线下'">
            <span class="field-label">面试地点</span>
            <div class="field-value">{{ formatValue(form.msdd) }}</div>
          </div>
          <div class="field field-full" v-if="form.msxs == '线下'">
            <span class="field-label">需要携带材料</span>
            <div class="field-value">{{ formatValue(materialText(form.xyxdcl)) }}</div>
          </div>
          <div class="field">
            <span class="field-label">邀约人</span>
            <div class="field-value">{{ formatValue(form.yyr) }}</div>
          </div>
          <div class="field">
            <span class="field-label">邀约时间</span>
            <div class="field-value">{{ formatValue(form.yysj) }}</div>
          </div>
          <div class="field field-full">
            <span class="field-label">备注</span>
            <div class="field-value" style="height: 120px; line-height: 20px; overflow: auto">
              {{ formatValue(form.remark) }}
            </div>
          </div>
        </div>
        <!-- 批量邀约：可编辑表单 -->
        <a-form-model v-else layout="vertical" class="rpm-form">
          <div class="form-grid">
            <div class="field">
              <a-form-model-item label="面试人" required>
                <j-select-employee
                  v-model="form.msr"
                  placeholder="请选择面试人"
                  value-field="name"
                  button-text="添加"
                  button-icon="plus"
                  button-type="default"
                  @change="handleInterviewerChange"
                />
              </a-form-model-item>
            </div>
            <div class="field">
              <a-form-model-item label="面试形式" required>
                <a-select v-model="form.msxs" allowClear placeholder="请选择" @change="handleInterviewTypeChange">
                  <a-select-option value="线下">线下</a-select-option>
                  <a-select-option value="电话">电话</a-select-option>
                  <a-select-option value="视频">视频</a-select-option>
                </a-select>
              </a-form-model-item>
            </div>
            <div class="field">
              <a-form-model-item label="面试时间" required>
                <j-date
                  v-model="form.mssj"
                  :show-time="true"
                  date-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择面试时间"
                  style="width: 100%"
                />
              </a-form-model-item>
            </div>
            <div class="field">
              <a-form-model-item label="最晚确认时间" required>
                <j-date
                  v-model="form.zwmssj"
                  :show-time="true"
                  date-format="YYYY-MM-DD HH:mm:ss"
                  placeholder="请选择最晚确认时间"
                  style="width: 100%"
                />
              </a-form-model-item>
            </div>
            <div v-if="form.msxs === '线下'" class="field field-full">
              <a-form-model-item label="面试地点" required>
                <a-input v-model.trim="form.msdd" placeholder="请输入面试地点" />
              </a-form-model-item>
            </div>
            <div class="field field-full" v-if="form.msxs === '线下'">
              <a-form-model-item label="需要携带材料">
                <a-select v-model="form.xyxdcl" allowClear placeholder="请选择">
                  <a-select-option value="id">身份证</a-select-option>
                  <a-select-option value="resume_copy">简历复印件</a-select-option>
                  <a-select-option value="both">身份证 + 简历复印件</a-select-option>
                </a-select>
              </a-form-model-item>
            </div>
            <div class="field field-full">
              <a-form-model-item label="备注">
                <a-textarea
                  v-model.trim="form.remark"
                  :autoSize="{ minRows: 4, maxRows: 7 }"
                  placeholder="请输入备注信息"
                />
              </a-form-model-item>
            </div>
          </div>
        </a-form-model>
      </div>

      <!-- 右：淘汰信息（不通过详情 / 批量淘汰） -->
      <div v-if="showEliminate" class="rpm-col rpm-eliminate">
        <div class="col-title">
          淘汰信息
          <span v-if="mode !== 'detail'" class="unify-tip">以下信息将统一应用于全部候选人</span>
        </div>
        <!-- 详情：与个人信息一致的只读展示 -->
        <div v-if="readonly" class="detail-grid">
          <div class="field">
            <span class="field-label">淘汰时间</span>
            <div class="field-value">{{ formatValue(form.ttsj) }}</div>
          </div>
          <div class="field">
            <span class="field-label">淘汰操作人</span>
            <div class="field-value">{{ formatValue(form.ttczr) }}</div>
          </div>
          <div class="field field-full">
            <span class="field-label">淘汰原因</span>
            <div class="field-value">{{ formatValue(form.ttyy) }}</div>
          </div>
        </div>
        <!-- 批量淘汰：可编辑表单 -->
        <a-form-model v-else layout="vertical" class="rpm-form">
          <a-form-model-item label="淘汰原因" required>
            <a-textarea v-model.trim="form.ttyy" :autoSize="{ minRows: 6, maxRows: 10 }" placeholder="请输入淘汰原因" />
          </a-form-model-item>
        </a-form-model>
      </div>
    </div>

    <template slot="footer">
      <a-button @click="close">{{ mode === 'detail' ? '关闭' : '取消' }}</a-button>
      <a-button v-if="mode !== 'detail'" type="primary" class="rpm-submit" @click="handleSubmit">提交</a-button>
    </template>
  </j-modal>
</template>

<script>
import { httpAction, getFileAccessHttpUrl } from '@/api/manage'

function getFileName(path) {
  if (!path) {
    return ''
  }
  const normalizedPath = String(path).replace(/\\/g, '/')
  return normalizedPath.substring(normalizedPath.lastIndexOf('/') + 1) || '简历附件'
}

function createEmptyForm() {
  return {
    msr: '',
    msxs: undefined,
    mssj: '',
    zwmssj: '',
    msdd: '',
    xyxdcl: undefined,
    remark: '',
    ttyy: '',
    ttsj: '',
    ttczr: ''
  }
}
import Vue from 'vue'

export default {
  name: 'ResumeProcessModal',
  data() {
    return {
      visible: false,
      // detail / batchInvite / batchEliminate
      mode: 'detail',
      people: [],
      activeId: '',
      record: {},
      form: createEmptyForm(),
      bodyStyle: { maxHeight: 'calc(100vh - 120px)', overflowY: 'auto', padding: '16px 20px' },
      confirmLoading: false,
      url:{
        invite: '/zpManage/hrmMsgl/invite',
        eliminate: '/zpManage/hrmMsgl/eliminate'
      }
    }
  },
  computed: {
    title() {
      if (this.mode === 'batchInvite') {
        return '批量邀约'
      }
      if (this.mode === 'batchEliminate') {
        return '批量淘汰'
      }
      return '详情'
    },
    readonly() {
      return this.mode === 'detail'
    },
    activeRecord() {
      if (this.mode === 'detail') {
        return this.record
      }
      return this.people.find((item) => item.id === this.activeId) || this.people[0] || {}
    },
    showInvite() {
      return this.mode !== 'batchEliminate'
    },
    showEliminate() {
      return this.mode === 'batchEliminate' || (this.mode === 'detail' && this.record.dqzt === '不通过')
    },

  },
  methods: {
    getWidth() {
      if (this.mode === 'detail' && this.record.dqzt === '不通过') {
        return 1200
      }
      
      return this.mode === 'detail' ? 800 : 1300
    },
    // 单条详情（只读）
    detail(record) {
      this.mode = 'detail'
      this.people = []
      this.activeId = ''
      this.record = Object.assign({}, record)
      this.form = Object.assign(createEmptyForm(), record)
      this.visible = true
    },
    // 批量邀约
    batchInvite(rows) {
      this.openBatch('batchInvite', rows)
    },
    // 批量淘汰
    batchEliminate(rows) {
      this.openBatch('batchEliminate', rows)
    },
    openBatch(mode, rows) {
      const list = Array.isArray(rows) ? rows : []
      if (!list.length) {
        this.$message.warning('请先勾选简历')
        return
      }
      this.mode = mode
      this.people = list.slice()
      // 默认读取第一条；批量内容为固定对象，仅初始化一次
      this.activeId = list[0].id
      this.record = {}
      this.form = createEmptyForm()
      this.visible = true
    },
    selectPerson(item) {
      // 仅切换中间个人信息，不重置右侧批量内容
      this.activeId = item.id
    },
    handleInterviewerChange(value, rows) {
      this.form.msr =
        (rows || [])
          .map((item) => item.name)
          .filter(Boolean)
          .join(',') ||
        value ||
        ''
    },
    handleInterviewTypeChange(value) {
      if (value !== '线下') {
        this.form['msdd'] = ''
      }
    },
    handleSubmit() {

      if (this.mode === 'batchInvite' && !this.validateInvite()) {
        return
      }
      if (this.mode === 'batchEliminate' && !this.validateEliminate()) {
        return
      }

      let url = this.mode === 'batchInvite' ? this.url.invite : this.url.eliminate

      const payload = this.buildPayload()
      this.confirmLoading = true
      httpAction(url, payload, 'post')
        .then((res) => {
          if (res.success) {
            this.$message.success(res.message || '批量操作成功')
            this.$emit('ok')
            this.close()
          } else {
            this.$message.warning(res.message || '批量操作失败')
          }
        })
        .catch(() => {
          this.$message.error('批量操作失败，请稍后重试')
        })
        .finally(() => {
          this.confirmLoading = false
        })
    },
    validateInvite() {
      if (!this.form.msr) {
        this.$message.warning('请选择面试人')
        return false
      }
      if (!this.form.msxs) {
        this.$message.warning('请选择面试形式')
        return false
      }
      if (this.form.msxs === '线下' && !this.form.msdd) {
        this.$message.warning('请输入面试地点')
        return false
      }
      if (!this.form.mssj) {
        this.$message.warning('请选择面试时间')
        return false
      }
      if (!this.form.zwmssj) {
        this.$message.warning('请选择最晚确认时间')
        return false
      }
      return true
    },
    validateEliminate() {
      if (!this.form.ttyy) {
        this.$message.warning('请输入淘汰原因')
        return false
      }
      return true
    },
    // 将固定批量内容覆盖到每一条勾选数据
    buildPayload() {
      let userInfo = Vue.ls.get('perInfo')
      if (this.mode === 'batchInvite') {
        const shared = {
          msr: this.form.msr,
          msxs: this.form.msxs,
          mssj: this.form.mssj,
          zwmssj: this.form.zwmssj,
          msdd: this.form.msdd,
          xyxdcl: this.form.xyxdcl,
          remark: this.form.remark,
          dqzt: '已邀约',
          yyr: userInfo.name  || '',
          yysj: this.getNowText(),
          dqzt: '待确认'
        }
        return this.people.map((item) => Object.assign({ id: item.id }, shared))
      }
      const shared = {
        ttyy: this.form.ttyy,
        dqzt: '不通过',
        ttczr: userInfo.name  || '',
        ttsj: this.getNowText()
      }
      return this.people.map((item) => Object.assign({ id: item.id }, shared))
    },
    getNowText() {
      const date = new Date()
      const pad = (value) => (value < 10 ? `0${value}` : String(value))
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:00`
    },
    dqztColor(text) {
      const map = {
        待邀约: 'blue',
        已邀约: 'cyan',
        已确认面试: 'green',
        不通过: 'red',
        放弃面试: 'red',
        暂停邀约: 'orange'
      }
      return map[text] || ''
    },
    formatValue(value) {
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ? '-' : value
    },
    materialText(value) {
      const map = { id: '身份证', resume_copy: '简历复印件', both: '身份证 + 简历复印件' }
      return map[value]
    },
    lookPdf(text) {
      if (!text) {
        this.$message.warning('未知的文件')
        return
      }
      const urls = text.indexOf(',') > -1 ? text.split(',').map((item) => getFileAccessHttpUrl(item)) : [getFileAccessHttpUrl(text)]
      window.open(urls[0], '_blank')
    },
    getFileName,
    close() {
      this.visible = false
    }
  }
}
</script>

<style scoped lang="less">
.rpm-body {
  display: flex;
  gap: 16px;
  min-height: 420px;
}

.rpm-col {
  min-width: 0;
  border: 1px solid #eef1f6;
  border-radius: 10px;
  background: #fff;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid #f0f2f5;
  color: #262626;
  font-size: 15px;
  font-weight: 700;

  .state-tag {
    margin-right: 0;
  }
}

/* 左侧人员列表 */
.rpm-people {
  flex: 0 0 240px;
}

.people-scroll {
  max-height: calc(100vh - 240px);
  padding: 10px;
  overflow-y: auto;
}

.person-card {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 10px;
  border: 1px solid #eef0f4;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #9cc0ff;
    background: #f5f9ff;
  }

  &.active {
    border-color: #2d78ff;
    background: #eef4ff;
    box-shadow: 0 0 0 1px #2d78ff inset;
  }

  .avatar {
    flex: 0 0 36px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    color: #fff;
    font-size: 15px;
    line-height: 36px;
    text-align: center;
  }

  .avatar.male {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  }

  .avatar.female {
    background: linear-gradient(135deg, #ff7eb3 0%, #ff5c8a 100%);
  }

  .p-name {
    color: #262626;
    font-size: 13px;
    font-weight: 600;
  }

  .p-meta {
    color: #8c8c8c;
    font-size: 12px;
  }

  .p-sex {
    margin-left: auto;
    color: #b8c0cc;
  }
}

/* 中间 / 右侧自适应 */
.rpm-personal,
.rpm-invite,
.rpm-eliminate {
  flex: 1 1 0;
}

.personal-box {
  padding: 14px;
}

.field {
  margin-bottom: 12px;
}

.field-label {
  display: block;
  margin-bottom: 6px;
  color: #5a6472;
  font-size: 13px;
}

.field-value {
  min-height: 36px;
  padding: 7px 11px;
  border: 1px solid #e5e9f0;
  border-radius: 6px;
  background: #fafbfc;
  color: #262626;
  font-size: 13px;
  line-height: 20px;
  word-break: break-all;
}

.personal-box {
  display: flex;
  flex-wrap: wrap;
  gap: 0 14px;

  .field {
    flex: 1 1 calc(50% - 14px);
  }

  .field-full {
    flex: 1 1 100%;
  }
}

.detail-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0 14px;
  padding: 14px;

  .field {
    flex: 1 1 calc(50% - 14px);
  }

  .field-full {
    flex: 1 1 100%;
  }
}

.file-link {
  color: #2d78ff;
}

/* 右侧表单 */
.rpm-form {
  padding: 14px 14px 0;

  .form-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0 14px;

    .field {
      flex: 1 1 calc(50% - 14px);
    }

    .field-full {
      flex: 1 1 100%;
    }
  }

  /deep/ .ant-form-item {
    margin-bottom: 12px;
  }
}

.unify-tip {
  margin-left: auto;
  padding: 3px 10px;
  border: 1px solid #9fd0e6;
  border-radius: 4px;
  background: #e3f4fb;
  color: #2b7a96;
  font-size: 12px;
  font-weight: 400;
}

.rpm-submit {
  border: 0;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  box-shadow: 0 2px 10px rgba(45, 120, 255, 0.2);
}
</style>

