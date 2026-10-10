<template>
  <div class="h5-page">
    <div class="phone-frame">
      <!-- 提交成功UI -->
      <div v-if="submitSuccess" class="success-container">
        <div class="success-content">
          <div class="success-icon">
            <a-icon type="check-circle" />
          </div>
          <h2 class="success-title">提交成功</h2>
          <p class="success-message">您的来访登记已成功提交</p>
          <p class="success-hint">请等待审核，感谢您的配合</p>
          <div class="success-actions">
            <button class="success-btn secondary" @click="handleRegisterAgain">再次登记</button>
          </div>
        </div>
      </div>

      <!-- ============ 身份选择中间页 ============ -->
      <div v-else-if="currentView === 'identity'" class="identity-view">
        <div class="identity-hero">
          <div class="hero-icon"><a-icon type="solution" /></div>
          <h1>访客登记</h1>
          <p>请选择您的身份</p>
        </div>

        <div class="identity-cards">
          <div class="identity-card" @click="goToRegister('visitor')">
            <div class="card-icon"><a-icon type="user" /></div>
            <div class="card-body">
              <div class="card-title">外来人员登记</div>
              <div class="card-desc">适用于商务拜访、面试、快递外卖等临时访客。</div>
            </div>
            <a-icon type="right" class="card-arrow" />
          </div>

          <div class="identity-card" @click="goToRegister('temp')">
            <div class="card-icon"><a-icon type="safety-certificate" /></div>
            <div class="card-body">
              <div class="card-title">劳动派遣登记</div>
              <div class="card-desc">适用于短期施工人员、临时劳务人员。</div>
            </div>
            <a-icon type="right" class="card-arrow" />
          </div>
        </div>

        <div class="identity-footer">
          <a-icon type="hand-left" style="margin-right: 4px" />
          <span>请点击上方按钮开始登记</span>
        </div>
      </div>

      <!-- ============ 外来人员登记表 ============ -->
      <div v-else-if="currentView === 'visitor'" class="reg-view">
        <div class="page-header">
          <button v-if="!registerType" class="header-back" @click="goBackIdentity"><a-icon type="left" /><span>返回</span></button>
          <h1>外来人员登记</h1>
        </div>

        <div class="main-content">
          <a-form-model
            ref="visitorForm"
            :model="visitorModel"
            :rules="visitorRules"
            layout="vertical"
            class="visitor-form"
          >
            <div class="section-header"><h2>来访人员登记表</h2></div>

            <div class="form-card">
              <a-form-model-item label="真实姓名" prop="xm" class="form-item-custom">
                <a-input v-model="visitorModel.xm" placeholder="请输入" />
              </a-form-model-item>

              <a-form-model-item label="身份证" prop="sfzh" class="form-item-custom">
                <a-input v-model="visitorModel.sfzh" placeholder="请输入18位身份证号" :maxLength="18" />
              </a-form-model-item>

              <a-form-model-item label="联系电话" prop="lxfs" class="form-item-custom">
                <a-input v-model="visitorModel.lxfs" placeholder="请输入11位手机号码" :maxLength="11" />
              </a-form-model-item>

              <a-form-model-item label="车牌号" class="form-item-custom">
                <a-input v-model="visitorModel.cph" placeholder="请输入" />
              </a-form-model-item>

              <a-form-model-item label="所属公司或个人" prop="ssgshgr" class="form-item-custom">
                <a-input v-model="visitorModel.ssgshgr" placeholder="请输入" />
              </a-form-model-item>

              <a-form-model-item label="来访区域" prop="lfqy" class="form-item-custom">
                <j-dict-select-tag
                  type="list"
                  v-model="visitorModel.lfqy"
                  dictCode="hrm_fkzx_sq_lfqy"
                  placeholder="请选择来访区域"
                />
              </a-form-model-item>

              <a-form-model-item label="来访事由" prop="lfsy" class="form-item-custom">
                <j-dict-select-tag
                  type="list"
                  v-model="visitorModel.lfsy"
                  dictCode="hrm_fkzx_sq_lfsy"
                  placeholder="请选择来访事由"
                />
              </a-form-model-item>

              <a-form-model-item label="来访时间" prop="yjlfsj" class="form-item-custom">
                <input type="datetime-local" v-model="visitorModel.yjlfsj" class="native-datetime-input" step="900" />
              </a-form-model-item>

              <a-form-model-item label="来访事由详细" prop="lfsrxx" class="form-item-custom">
                <a-textarea v-model="visitorModel.lfsrxx" placeholder="请输入" :autosize="{ minRows: 3 }" />
              </a-form-model-item>
            </div>

            <!-- 同行人 -->
            <div class="companion-section">
              <div class="section-header"><h2>同行人</h2></div>
              <div class="form-card">
                <div v-if="visitorModel.txrList.length === 0" class="companion-empty">
                  <a-icon type="user-delete" />
                  <span>暂无同行人</span>
                </div>
                <div v-for="(item, index) in visitorModel.txrList" :key="index" class="companion-item">
                  <span class="item-index">{{ index + 1 }}</span>
                  <div class="item-body">
                    <a-form-model-item label="姓名" class="companion-field">
                      <a-input v-model="item.xm" placeholder="请输入姓名" :maxLength="20" />
                    </a-form-model-item>
                    <a-form-model-item label="身份证" class="companion-field">
                      <a-input v-model="item.sfzh" placeholder="请输入18位身份证号" :maxLength="18" />
                    </a-form-model-item>
                  </div>
                  <button class="item-delete" @click="removeCompanion(index)">
                    <a-icon type="delete" />
                  </button>
                </div>
                <div class="companion-actions">
                  <button class="companion-add-btn" type="button" @click="addCompanion">
                    <a-icon type="plus" /><span>添加同行人</span>
                  </button>
                  <span class="companion-hint">无同行人不添加</span>
                </div>
              </div>
            </div>

            <!-- 接待人信息 -->
            <div class="companion-section">
              <div class="section-header"><h2>接待人信息</h2></div>
              <div class="form-card">
                <a-form-model-item label="接待人姓名" prop="jdr" class="form-item-custom">
                  <a-input v-model="visitorModel.jdr" placeholder="请输入" />
                </a-form-model-item>
                <a-form-model-item label="接待人手机号码" prop="jdrlxfs" class="form-item-custom">
                  <a-input v-model="visitorModel.jdrlxfs" placeholder="请输入" :maxLength="11" />
                </a-form-model-item>
                <div class="form-tip">请输入接待人在企微绑定的手机号，否则无法提交申请。</div>
              </div>
            </div>

            <!-- 上传附件 -->
            <div class="upload-section">
              <div class="section-header"><h2>上传附件</h2></div>
              <div class="upload-grid">
                <j-upload-list v-model="visitorModel.scfj" text="选择文件" bizPath="visitor" :returnUrl="true" />
              </div>
            </div>
          </a-form-model>
        </div>

        <div class="submit-bar">
          <button class="submit-btn" type="button" @click="handleSubmit('visitor')" :loading="submitting">
            提交申请
          </button>
        </div>
      </div>

      <!-- ============ 劳动派遣登记表 ============ -->
      <div v-else-if="currentView === 'temp'" class="reg-view">
        <div class="page-header">
          <button v-if="!registerType" class="header-back" @click="goBackIdentity"><a-icon type="left" /><span>返回</span></button>
          <h1>劳动派遣登记</h1>
        </div>

        <div class="main-content">
          <a-form-model ref="tempForm" :model="tempModel" :rules="tempRules" layout="vertical" class="visitor-form">
            <div class="section-header"><h2>劳动派遣登记表</h2></div>

            <div class="form-card">
              <a-form-model-item label="真实姓名" prop="xm" class="form-item-custom">
                <a-input v-model="tempModel.xm" placeholder="请输入" />
              </a-form-model-item>

              <a-form-model-item label="身份证" prop="sfzh" class="form-item-custom">
                <a-input v-model="tempModel.sfzh" placeholder="请输入18位身份证号" :maxLength="18" />
              </a-form-model-item>

              <a-form-model-item label="联系电话" prop="lxfs" class="form-item-custom">
                <a-input v-model="tempModel.lxfs" placeholder="请输入11位手机号码" :maxLength="11" />
              </a-form-model-item>

              <a-form-model-item label="派遣公司" prop="pqgs" class="form-item-custom">
                <j-dict-select-tag
                  type="list"
                  v-model="tempModel.pqgs"
                  dictCode="hrm_fkzx_sq_pqgs"
                  placeholder="请选择派遣公司"
                />
              </a-form-model-item>

              <a-form-model-item label="来访时间" prop="yjlfsj" class="form-item-custom">
                <input type="datetime-local" v-model="tempModel.yjlfsj" class="native-datetime-input" step="900" />
              </a-form-model-item>
            </div>

            <!-- 接待人信息 -->
            <div class="companion-section">
              <div class="section-header"><h2>接待人信息</h2></div>
              <div class="form-card">
                <a-form-model-item label="接待人姓名" prop="jdr" class="form-item-custom">
                  <a-input v-model="tempModel.jdr" placeholder="请输入" />
                </a-form-model-item>
                <a-form-model-item label="接待人手机号码" prop="jdrlxfs" class="form-item-custom">
                  <a-input v-model="tempModel.jdrlxfs" placeholder="请输入" :maxLength="11" />
                </a-form-model-item>
                <div class="form-tip">请输入接待人在企微绑定的手机号，否则无法提交申请。</div>
              </div>
            </div>

            <!-- 上传附件 -->
            <div class="upload-section">
              <div class="section-header"><h2>上传附件</h2></div>
              <div class="upload-grid">
                <j-upload-list v-model="tempModel.scfj" text="选择文件" bizPath="visitor" :returnUrl="true" />
              </div>
            </div>
          </a-form-model>
        </div>

        <div class="submit-bar">
          <button class="submit-btn" type="button" @click="handleSubmit('temp')" :loading="submitting">提交申请</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { httpAction, getAction } from '@/api/manage'
import JUploadList from '@/components/jeecg/JUploadList.vue'

// 手机号校验器
var validatePhone = function (rule, value, callback) {
  if (!value) {
    callback(new Error('请输入手机号'))
    return
  }
  var phoneReg = /^1[3-9]\d{9}$/
  if (!phoneReg.test(value)) {
    callback(new Error('请输入正确的手机号'))
    return
  }
  callback()
}

// 身份证号校验器
var validateIdCard = function (rule, value, callback) {
  if (!value) {
    callback(new Error('请输入身份证号'))
    return
  }
  var idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
  if (!idCardReg.test(value)) {
    callback(new Error('请输入正确的身份证号'))
    return
  }
  callback()
}

export default {
  name: 'SelfRegisterH5',
  components: {
    JUploadList,
  },
  data() {
    return {
      currentView: 'identity', // identity | visitor | temp
      submitSuccess: false,
      submitting: false,
      receiverNo: '', // 接待人工号（queryByPhoneNumbers 接口返回）
      registerType: null, // 从URL参数获取的类型：visitor | temp
      // 外来人员登记 model
      visitorModel: {
        xm: '',
        sfzh: '',
        lxfs: '',
        cph: '',
        ssgshgr: '',
        lfqy: undefined,
        lflx: '1',
        lfsy: undefined,
        yjlfsj: '',
        lfsrxx: '',
        jdr: '',
        jdrlxfs: '',
        scfj: '',
        txrList: [],
        zt: 0,
        splc: {},
      },
      visitorRules: {
        xm: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, message: '姓名至少2个字符', trigger: 'blur' },
        ],
        sfzh: [{ required: true, validator: validateIdCard, trigger: 'blur' }],
        lxfs: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        ssgshgr: [{ required: true, message: '请输入所属公司或个人', trigger: 'blur' }],
        lfqy: [{ required: true, message: '请选择来访区域', trigger: 'change' }],
        lflx: [{ required: true, message: '请选择来访类型', trigger: 'change' }],
        lfsy: [{ required: true, message: '请选择来访事由', trigger: 'change' }],
        yjlfsj: [{ required: true, message: '请选择来访时间', trigger: 'change' }],
        lfsrxx: [{ required: true, message: '请输入来访事由详细', trigger: 'blur' }],
        jdr: [{ required: true, message: '请输入接待人姓名', trigger: 'blur' }],
        jdrlxfs: [{ required: true, validator: validatePhone, trigger: 'blur' }],
      },
      // 劳动派遣登记 model
      tempModel: {
        xm: '',
        sfzh: '',
        lxfs: '',
        pqgs: undefined,
        yjlfsj: '',
        jdr: '',
        jdrlxfs: '',
        scfj: '',
        zt: 0,
        splc: {},
      },
      tempRules: {
        xm: [
          { required: true, message: '请输入真实姓名', trigger: 'blur' },
          { min: 2, message: '姓名至少2个字符', trigger: 'blur' },
        ],
        sfzh: [{ required: true, validator: validateIdCard, trigger: 'blur' }],
        lxfs: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        pqgs: [{ required: true, message: '请选择派遣公司', trigger: 'change' }],
        yjlfsj: [{ required: true, message: '请选择来访时间', trigger: 'change' }],
        jdr: [{ required: true, message: '请输入接待人姓名', trigger: 'blur' }],
        jdrlxfs: [{ required: true, validator: validatePhone, trigger: 'blur' }],
      },
      url: {
        add: '/fkzx/hrmFkzxSq/add',
        queryByPhoneNumbers: '/hrm/hrEmployeeInformation/queryByPhoneNumbers',
      },
    }
  },
  created() {
    this.initFromUrl()
    this.initVisitTime()
  },
  methods: {
    // 从URL参数初始化，支持扫码直接进入对应表单
    initFromUrl() {
      var urlParams = new URLSearchParams(window.location.search)
      var type = urlParams.get('type')
      if (type === 'visitor' || type === 'temp') {
        this.registerType = type
        this.currentView = type
      }
    },
    initVisitTime() {
      var now = new Date()
      var year = now.getFullYear()
      var month = String(now.getMonth() + 1).padStart(2, '0')
      var day = String(now.getDate()).padStart(2, '0')
      var hours = String(now.getHours()).padStart(2, '0')
      var minutes = String(now.getMinutes()).padStart(2, '0')
      var val = year + '-' + month + '-' + day + 'T' + hours + ':' + minutes
      this.visitorModel.yjlfsj = val
      this.tempModel.yjlfsj = val
    },
    goToRegister(type) {
      this.currentView = type
    },
    goBackIdentity() {
      this.currentView = 'identity'
    },
    addCompanion() {
      this.visitorModel.txrList.push({ xm: '', sfzh: '' })
    },
    removeCompanion(index) {
      this.visitorModel.txrList.splice(index, 1)
    },
    handleRegisterAgain() {
      this.submitSuccess = false
      // 如果是从二维码扫码进来的，重置后停留在当前表单
      if (this.registerType) {
        this.currentView = this.registerType
        if (this.registerType === 'visitor') {
          this.resetVisitorModel()
        } else if (this.registerType === 'temp') {
          this.resetTempModel()
        }
        this.initVisitTime()
        this.$nextTick(function () {
          if (this.registerType === 'visitor' && this.$refs.visitorForm) {
            this.$refs.visitorForm.clearValidate()
          } else if (this.registerType === 'temp' && this.$refs.tempForm) {
            this.$refs.tempForm.clearValidate()
          }
        })
      } else {
        // 原有逻辑：回到身份选择页
        this.currentView = 'identity'
        this.resetVisitorModel()
        this.resetTempModel()
        this.initVisitTime()
        this.$nextTick(function () {
          if (this.$refs.visitorForm) this.$refs.visitorForm.clearValidate()
          if (this.$refs.tempForm) this.$refs.tempForm.clearValidate()
        })
      }
    },
    resetVisitorModel() {
      this.visitorModel = {
        xm: '',
        sfzh: '',
        lxfs: '',
        cph: '',
        ssgshgr: '',
        lfqy: undefined,
        lflx: '1',
        lfsy: undefined,
        yjlfsj: '',
        lfsrxx: '',
        jdr: '',
        jdrlxfs: '',
        scfj: '',
        txrList: [],
        zt: 0,
        splc: {},
      }
    },
    resetTempModel() {
      this.tempModel = {
        xm: '',
        sfzh: '',
        lxfs: '',
        pqgs: undefined,
        yjlfsj: '',
        jdr: '',
        jdrlxfs: '',
        scfj: '',
        zt: 0,
        splc: {},
      }
    },
    handleSubmit(type) {
      var that = this
      var formRef = type === 'temp' ? 'tempForm' : 'visitorForm'
      var model = type === 'temp' ? that.tempModel : that.visitorModel

      // 外来人员：验证同行人
      if (type === 'visitor') {
        var idCardReg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
        for (var i = 0; i < model.txrList.length; i++) {
          var item = model.txrList[i]
          if (!item.xm || !item.xm.trim()) {
            that.$message.warning('请输入第' + (i + 1) + '位同行人姓名')
            return
          }
          if (item.sfzh && !idCardReg.test(item.sfzh)) {
            that.$message.warning('第' + (i + 1) + '位同行人身份证号格式不正确')
            return
          }
        }
      }

      that.$refs[formRef].validate(function (valid) {
        if (valid) {
          that.submitting = true
          that.checkReceiverByPhone(type).then(function (ok) {
            if (ok) {
              that.submitForm(type)
            } else {
              that.submitting = false
            }
          })
        } else {
          that.$message.warning('请填写完整信息')
        }
      })
    },
    // 提交前通过接待人手机号查询员工信息
    checkReceiverByPhone(type) {
      var that = this
      var model = type === 'temp' ? that.tempModel : that.visitorModel
      var phone = model.jdrlxfs
      return getAction(that.url.queryByPhoneNumbers, {
        phoneNumbers: phone,
      })
        .then(function (res) {
          var list = []
          if (res.success && res.result) {
            list = Array.isArray(res.result) ? res.result : res.result.records || []
          }
          if (list.length === 0) {
            that.$message.warning('未查询到接待人信息，请确认手机号是否有误')
            return false
          }
          var realName = list[0].name || ''
          // 名字对不上，自动改成手机号对应的姓名
          if (realName && model.jdr !== realName) {
            model.jdr = realName
            that.$message.info('接待人姓名已自动更新为：' + realName)
          }
          // 缓存接口查到的工号，供提交使用
          that.receiverNo = list[0].no
          return true
        })
        .catch(function () {
          that.$message.error('查询接待人信息失败，请稍后重试')
          return false
        })
    },
    submitForm(type) {
      var that = this
      that.submitting = true
      var model = type === 'temp' ? that.tempModel : that.visitorModel

      // 来访人数
      var lfrs = type === 'visitor' ? model.txrList.length + 1 : 1

      // 转换日期时间格式
      var yjlfsjFormatted = model.yjlfsj ? model.yjlfsj.replace('T', ' ') : ''
      var submitData = Object.assign({}, model, {
        lfrs: lfrs,
        yjlfsj: yjlfsjFormatted,
        no: that.receiverNo
      })

      // 审批人自动取接待人
      submitData.splc = { spr: model.jdr }

      // 劳动派遣：lflx=4, ywlx=4
      if (type === 'temp') {
        submitData.lflx = '4'
        submitData.ywlx = '4'
      }

      httpAction(that.url.add, submitData, 'post')
        .then(function (res) {
          if (res.success) {
            that.$message.success(res.message || '提交成功')
            that.submitSuccess = true
          } else {
            that.$message.warning(res.message || '提交失败')
          }
        })
        .catch(function () {
          that.$message.error('提交失败，请稍后重试')
        })
        .finally(function () {
          that.submitting = false
        })
    },
  },
}
</script>

<style lang="less" scoped>
@import '../visitor-theme.less';

.h5-page {
  background: @v-background;
  min-height: 100vh;
}

.phone-frame {
  max-width: 420px;
  margin: 0 auto;
  background: @v-background;
  min-height: 100vh;
  position: relative;
  box-shadow: 0 0 40px rgba(45, 120, 255, 0.08);
  overflow-x: hidden;
}

/* ========== 身份选择页 ========== */
.identity-view {
  padding: 0 0 60px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.identity-hero {
  text-align: center;
  padding: 44px 24px 28px;

  .hero-icon {
    width: 64px;
    height: 64px;
    margin: 0 auto 18px;
    border-radius: 18px;
    background: linear-gradient(135deg, @v-primary, #4f7dff);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 24px rgba(37, 99, 235, 0.25);

    .anticon {
      font-size: 32px;
      color: #fff;
    }
  }

  h1 {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: 0.04em;
    background: linear-gradient(135deg, @v-primary, #4f7dff);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    margin: 0 0 8px;
  }

  p {
    font-size: 13px;
    color: @v-muted-foreground;
    letter-spacing: 0.02em;
    margin: 0;
  }
}

.identity-cards {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px 18px 0;
}

.identity-card {
  position: relative;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 22px 20px;
  background: #fff;
  border: 1px solid @v-border;
  border-radius: 14px;
  cursor: pointer;
  overflow: hidden;
  box-shadow: @v-shadow-card;
  transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 4px;
    height: 100%;
    background: linear-gradient(180deg, @v-primary, #4f7dff);
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98) translateY(1px);
    box-shadow: 0 6px 20px rgba(37, 99, 235, 0.16);
    border-color: rgba(@v-primary-rgb, 0.4);
  }

  .card-icon {
    width: 58px;
    height: 58px;
    flex-shrink: 0;
    border-radius: 14px;
    background: @v-accent;
    display: flex;
    align-items: center;
    justify-content: center;

    .anticon {
      font-size: 26px;
      color: @v-primary;
    }
  }

  .card-body {
    flex: 1;
    min-width: 0;
  }

  .card-title {
    font-size: 17px;
    font-weight: 600;
    color: @v-foreground;
    margin-bottom: 6px;
    letter-spacing: 0.02em;
  }

  .card-desc {
    font-size: 12.5px;
    color: @v-muted-foreground;
    line-height: 1.5;
  }

  .card-arrow {
    color: @v-muted-foreground;
    font-size: 14px;
    flex-shrink: 0;
  }
}

.identity-footer {
  text-align: center;
  padding: 26px 24px 8px;
  font-size: 12px;
  color: @v-muted-foreground;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

/* ========== 登记页通用 ========== */
.page-header {
  background: #fff;
  padding: 14px 20px 16px;
  border-bottom: 1px solid @v-border;
  position: sticky;
  top: 0;
  z-index: 9;
  text-align: center;

  h1 {
    font-size: 17px;
    font-weight: 600;
    color: @v-foreground;
    letter-spacing: 0.02em;
    margin: 0;
  }

  .header-back {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    align-items: center;
    gap: 3px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: @v-primary;
    font-size: 14px;
    font-family: inherit;
    padding: 4px;
  }
}

.main-content {
  padding: 16px 16px 100px;
}

.visitor-form {
  /deep/ .ant-form-explain {
    font-size: 11px;
    margin-top: 4px;
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 4px 12px;
  position: relative;

  &::before {
    content: '';
    width: 3px;
    height: 14px;
    background: linear-gradient(135deg, @v-primary, #4f7dff);
    border-radius: 2px;
  }

  h2 {
    font-size: 14px;
    font-weight: 600;
    color: @v-foreground;
    letter-spacing: 0.04em;
    margin: 0;
  }
}

.form-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: @v-shadow-card;
  border: 1px solid @v-border;
  overflow: hidden;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 3px;
    background: linear-gradient(135deg, @v-primary, #4f7dff);
    opacity: 0.85;
  }
}

.form-item-custom {
  margin-bottom: 0;
  padding: 14px 16px;
  border-bottom: 1px solid @v-border;

  /deep/ .ant-form-item-label {
    padding-bottom: 6px;

    label {
      font-size: 14px;
      font-weight: 500;
      color: @v-foreground;

      &.ant-form-item-required::before {
        color: @v-destructive;
        font-size: 14px;
      }
    }
  }

  /deep/ .ant-form-item-control-wrapper {
    .ant-input,
    .ant-input-affix-wrapper,
    .ant-select-selection {
      border: none;
      padding: 0;
      background: transparent;
      font-size: 14px;

      &:focus {
        box-shadow: none;
      }

      &::placeholder {
        color: #cbd5e1;
        font-size: 13px;
      }
    }

    .ant-input {
      height: 22px;
    }

    .ant-select-selection {
      height: 22px;
      line-height: 22px;
    }

    .ant-select-selection__rendered {
      line-height: 22px;
    }

    .ant-textarea {
      border: none;
      padding: 0;
      background: transparent;
      font-size: 14px;
      resize: none;

      &:focus {
        box-shadow: none;
      }

      &::placeholder {
        color: #cbd5e1;
        font-size: 13px;
      }
    }

    .native-datetime-input {
      width: 100%;
      height: 40px;
      padding: 8px 12px;
      border: 1px solid @v-border;
      border-radius: 8px;
      background: #fff;
      font-size: 14px;
      font-family: inherit;
      color: @v-foreground;
      outline: none;
      transition: all 0.2s ease;

      &:focus {
        border-color: @v-primary;
        box-shadow: 0 0 0 2px rgba(@v-primary-rgb, 0.1);
      }

      &::placeholder {
        color: #cbd5e1;
        font-size: 13px;
      }

      &::-webkit-datetime-edit {
        padding: 0;
      }

      &::-webkit-datetime-edit-fields-wrapper {
        padding: 0;
      }

      &::-webkit-calendar-picker-indicator {
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 18px;
        height: 18px;
        opacity: 0.6;
        cursor: pointer;
      }
    }
  }

  &:last-child {
    border-bottom: none;
  }
}

.companion-section {
  margin-top: 16px;
}

.companion-empty {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  color: @v-muted-foreground;
  font-size: 13px;
  border-bottom: 1px solid @v-border;
}

.companion-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 14px 16px;
  border-bottom: 1px solid @v-border;
  transition: background 0.2s ease;

  .item-index {
    width: 22px;
    height: 22px;
    background: @v-primary;
    color: #fff;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 12px;
  }

  .item-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-width: 0;
  }

  .item-delete {
    width: 28px;
    height: 28px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    border: none;
    cursor: pointer;
    color: @v-destructive;
    flex-shrink: 0;
    margin-top: 12px;
    border-radius: 6px;
    transition: background 0.2s ease;

    &:active {
      background: rgba(239, 68, 68, 0.1);
    }
  }
}

.companion-field {
  margin-bottom: 0;

  /deep/ .ant-form-item-label {
    padding-bottom: 4px;

    label {
      font-size: 14px;
      font-weight: 500;
      color: @v-foreground;
    }
  }

  /deep/ .ant-form-item-control-wrapper {
    .ant-input {
      width: 100%;
      height: 38px;
      padding: 0 10px;
      border: 1px solid @v-border;
      border-radius: 8px;
      font-size: 14px;
      color: @v-foreground;
      outline: none;
      background: #fff;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;

      &:focus {
        border-color: @v-primary;
        box-shadow: 0 0 0 2px rgba(@v-primary-rgb, 0.1);
      }

      &::placeholder {
        color: #cbd5e1;
        font-size: 13px;
      }
    }
  }
}

.companion-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-top: 1px solid @v-border;
}

.companion-add-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: @v-primary;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  padding: 6px 10px;
  border-radius: 6px;
  transition: background 0.2s ease;

  &:active {
    background: @v-secondary;
  }
}

.companion-hint {
  font-size: 11px;
  color: @v-muted-foreground;
}

.form-tip {
  padding: 0 16px 12px;
  font-size: 11px;
  color: @v-muted-foreground;
  line-height: 1.5;
}

.upload-section {
  margin-top: 16px;
}

.upload-grid {
  background: #fff;
  border-radius: 10px;
  box-shadow: @v-shadow-card;
  border: 1px solid @v-border;
  padding: 16px;
}

.submit-bar {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 420px;
  padding: 12px 16px 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fff 30%);
  z-index: 8;
}

.submit-btn {
  width: 100%;
  height: 44px;
  background: linear-gradient(135deg, @v-primary, #4f7dff);
  color: #fff;
  border: none;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(37, 99, 235, 0.3);
  transition: all 0.2s ease;
  font-family: inherit;

  &:active {
    transform: scale(0.98);
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

/* 成功UI */
.success-container {
  padding: 60px 20px 40px;
  min-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.success-content {
  text-align: center;
  width: 100%;
  max-width: 320px;
}

.success-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  background: linear-gradient(135deg, #10b981, #059669);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(16, 185, 129, 0.3);

  .anticon {
    font-size: 40px;
    color: #fff;
  }
}

.success-title {
  font-size: 24px;
  font-weight: 600;
  color: @v-foreground;
  margin: 0 0 12px;
}

.success-message {
  font-size: 15px;
  color: @v-foreground;
  margin: 0 0 8px;
  font-weight: 500;
}

.success-hint {
  font-size: 13px;
  color: @v-muted-foreground;
  margin: 0 0 32px;
  line-height: 1.5;
}

.success-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.success-btn {
  width: 100%;
  height: 44px;
  border-radius: 22px;
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.05em;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
  border: none;

  &.secondary {
    background: #fff;
    color: @v-primary;
    border: 1.5px solid @v-primary;
    box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);

    &:active {
      transform: scale(0.98);
      background: @v-secondary;
    }
  }
}
</style>

