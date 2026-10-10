<template>
  <a-drawer :visible="visible" :width="800" placement="right" :closable="false" title="" @close="close">
    <div class="wrapper">
      <!-- 自定义渐变头部 -->
      <div class="rld-header">
        <span class="rld-title">{{ drawerTitle }}</span>
        <a-icon class="rld-close" type="close" @click="close" />
      </div>

      <!-- 中间内容（滚动） -->
      <div class="rld-body">
        <!-- 状态 tabs（数字默认0，暂不过滤） -->
        <a-tabs v-model="activeTab" class="state-tabs" @change="handleTabChange">
          <a-tab-pane v-for="item in tabOptions" :key="item.value">
            <span slot="tab">{{ item.label }} ({{ item.count }})</span>
          </a-tab-pane>
        </a-tabs>

        <!-- 简历卡片列表 -->
        <div class="resume-cards">
          <a-spin :spinning="loading">
            <div v-if="dataSource.length" class="card-grid">
              <div v-for="item in dataSource" :key="item.id" class="resume-card">
                <div class="card-main">
                  <div class="avatar" :class="genderClass(item.xb)">{{ avatarText(item.xm) }}</div>
                  <div class="card-info">
                    <div class="info-line1">
                      <span class="name">{{ formatText(item.xm) }}</span>
                      <a-icon class="gender-icon" :type="item.xb === '女' ? 'woman' : 'man'" />
                      <span class="age" v-if="item.nl !== undefined && item.nl !== null && item.nl !== ''"
                        >{{ item.nl }}岁</span
                      >
                    </div>
                    <div class="info-line2">
                      <span>{{ formatText(item.xl) }}</span>
                      <span class="sep">|</span>
                      <span>{{ formatText(item.zy) }}</span>
                      <span class="sep">|</span>
                      <span class="salary">期望薪资:{{ formatText(item.qwxz) }}k</span>
                    </div>
                  </div>
                  <a-tag class="state-tag" :color="stateColor(item.dqzt)">{{ formatText(item.dqzt) }}</a-tag>
                </div>
                <div class="card-footer">
                  <a-icon type="eye" />
                  <a class="preview-link" @click="lookPdf(item.jlFujian)">简历预览</a>
                </div>
              </div>
            </div>
            <a-empty v-else-if="!loading" style="padding: 40px 0">
              <span slot="description">暂无简历</span>
            </a-empty>
          </a-spin>
        </div>
      </div>

      <!-- 底部统计（固定） -->
      <div class="rld-footer">
        <a-pagination
          size="small"
          :current="ipagination.current"
          :pageSize="ipagination.pageSize"
          :total="ipagination.total"
          :pageSizeOptions="ipagination.pageSizeOptions"
          showSizeChanger
          @change="handlePageChange"
          @showSizeChange="handleSizeChange"
        />
        <span class="footer-total"
          >共 <b>{{ ipagination.total }}</b> 份简历</span
        >
      </div>
    </div>
  </a-drawer>
</template>

<script>
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
import { getFileAccessHttpUrl } from '@/api/manage'

export default {
  name: 'ResumeListDrawer',
  mixins: [JeecgListMixin],
  data() {
    return {
      disableMixinCreated: true,
      visible: false,
      record: null,
      activeTab: 'all',
      tabOptions: [
        { code: 'jlsl',label: '全部', value: 'all', count: 0 },
        { code: 'dyy',label: '待邀约', value: '待邀约', count: 0 },
        { code: 'yyy',label: '已邀约', value: '已邀约', count: 0 },
        { code: 'yqrms',label: '已确认面试', value: '已确认面试', count: 0 },
        { code: 'ytt',label: '不通过', value: '不通过', count: 0 },
        { code: 'ztyy',label: '暂停邀约', value: '暂停邀约', count: 0 },
      ],
      url: {
        list: '/zpManage/hrmMsgl/list',
      },
      queryParam: {
        zpjhid: '',
        gljlId: '',
        dqzt: '',
      },
      columns: [],
    }
  },
  computed: {
    drawerTitle() {
      return (this.record && this.record.postName ? this.record.postName : '简历') + '-简历'
    },
  },
  created() {
    this.ipagination.pageSize = 10
    this.ipagination.pageSizeOptions = ['10', '20', '50']
  },
  methods: {
    open(record) {
      this.record = record || null
      this.visible = true
      this.activeTab = 'all'

      this.tabOptions.forEach((item) => {
          item.count = record[item.code] || 0
      })

      this.queryParam.zpjhid = record && record.zpjhid ? record.zpjhid : ''
      this.queryParam.gljlId = record && record.id ? record.id : ''
      this.queryParam.dqzt = ''
      this.$nextTick(() => {
        this.loadData(1)
      })
    },
    close() {
      this.visible = false
    },
    handleTabChange() {
      // 按邀约状态过滤
      this.queryParam.dqzt = this.activeTab === 'all' ? '' : this.activeTab
      this.loadData(1)
    },
    handlePageChange(page, pageSize) {
      this.ipagination.current = page
      this.ipagination.pageSize = pageSize
      this.loadData(page)
    },
    handleSizeChange(current, size) {
      this.ipagination.current = 1
      this.ipagination.pageSize = size
      this.loadData(1)
    },
    formatText(value) {
      return value === undefined || value === null || (typeof value === 'string' && value.trim() === '') ? '-' : value
    },
    avatarText(name) {
      return name ? String(name).charAt(0) : '?'
    },
    genderClass(gender) {
      return gender === '女' ? 'female' : 'male'
    },
    stateColor(state) {
      const map = {
        待邀约: 'orange',
        已邀约: 'blue',
        已确认面试: 'green',
        不通过: 'red',
        暂停邀约: 'default',
      }
      return map[state] || 'default'
    },
  },
}
</script>

<style scoped lang="less">
.wrapper {
  display: flex;
  flex-direction: column;
  margin: -24px;
  height: 100vh;
}

/* ===== 自定义渐变头部 ===== */
.rld-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-shrink: 0;
  padding: 16px 20px;
  background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
}

.rld-title {
  font-size: 16px;
  color: #ffffff;
}

.rld-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #ffffff;
  background: rgba(255, 255, 255, 0.2);
  transition: all 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
    color: #ffffff;
  }
}

/* ===== 中间内容（滚动） ===== */
.rld-body {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(45, 120, 255, 0.12);
    border-radius: 2px;
  }
}

.state-tabs {
  /deep/ .ant-tabs-bar {
    margin-bottom: 12px;
  }
}

.resume-cards {
  flex: 1;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.resume-card {
  min-width: 0;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  background: #fff;
  transition: box-shadow 0.2s ease;

  &:hover {
    box-shadow: 0 4px 14px rgba(31, 45, 61, 0.08);
  }
}

.card-main {
  display: flex;
  align-items: flex-start;
  padding: 12px;
}

.avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  margin-right: 8px;
  border-radius: 50%;
  text-align: center;
  line-height: 40px;
  font-size: 17px;
  font-weight: 600;
  color: #fff;

  &.male {
    background: linear-gradient(135deg, #2d78ff 0%, #00b4d8 100%);
  }
  &.female {
    background: linear-gradient(135deg, #ff6aa9 0%, #ff85c0 100%);
  }
}

.card-info {
  flex: 1;
  min-width: 0;
}

.info-line1 {
  display: flex;
  align-items: center;
  margin-bottom: 5px;

  .name {
    font-size: 14px;
    font-weight: 600;
    color: #262626;
    margin-right: 4px;
  }
  .gender-icon {
    margin-right: 3px;
    color: #8c8c8c;
  }
  .age {
    font-size: 12px;
    color: #8c8c8c;
  }
}

.info-line2 {
  font-size: 12px;
  color: #595959;

  .sep {
    margin: 0 5px;
    color: #d9d9d9;
  }
  .salary {
    color: #f5222d;
  }
}

.state-tag {
  flex-shrink: 0;
  margin: 0 0 0 6px;
}

.card-footer {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-top: 1px solid #f3f4f6;
  color: #2d78ff;
  font-size: 12px;

  .preview-link {
    margin-left: 6px;
  }
}

/* ===== 底部固定栏 ===== */
.rld-footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  border-top: 1px solid #e2e8f0;
}

.footer-total {
  color: #595959;
  font-size: 14px;

  b {
    color: #2d78ff;
    margin: 0 2px;
  }
}
</style>

