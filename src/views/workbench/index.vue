<template>
  <div class="wb-approval-page">
    <!-- 侧边栏 -->
    <Sidebar v-model="activeMenu" :menu-list="menuList" @change="handleMenuChange" />

    <!-- 主内容区 -->
    <div class="main-content">
      <!-- 申请中心视图 -->
      <div v-show="activeMenu === 'apply'" class="view-wrap">
        <!-- 考勤 -->
        <ApplySection v-if="computedAttendanceList.length" title="考勤">
          <ApplyCard v-for="item in computedAttendanceList" :key="item.key" :icon="item.icon"
            :icon-class="item.iconClass" :label="item.label" @click="handleCardClick(item)" />
        </ApplySection>

        <!-- 宿舍食堂 -->
        <ApplySection v-if="computedDormitoryList.length" title="宿舍食堂">
          <ApplyCard v-for="item in computedDormitoryList" :key="item.key" :icon="item.icon"
            :icon-class="item.iconClass" :label="item.label" @click="handleCardClick(item)" />
        </ApplySection>

        <!-- 人事管理 -->
        <ApplySection v-if="computedHrList.length" title="人事管理">
          <ApplyCard v-for="item in computedHrList" :key="item.key" :icon="item.icon" :icon-class="item.iconClass"
            :label="item.label" @click="handleCardClick(item)" />
        </ApplySection>

        <!-- 办公协同 -->
        <ApplySection v-if="computedOfficeList.length" title="办公协同">
          <ApplyCard v-for="item in computedOfficeList" :key="item.key" :icon="item.icon" :icon-class="item.iconClass"
            :label="item.label" @click="handleCardClick(item)" />
        </ApplySection>
      </div>

      <!-- 我的申请视图 -->
      <MyApply v-show="activeMenu === 'my'" />

      <!-- 我的审批视图 -->
      <MyApprovals v-show="activeMenu === 'audit'"/>

    </div>
  </div>
</template>

<script>
import Sidebar from './modules/applyHome/Sidebar.vue'
import ApplySection from './modules/applyHome/ApplySection.vue'
import ApplyCard from './modules/applyHome/ApplyCard.vue'
import MyApply from './modules/applyCommon/MyApply.vue'
import MyApprovals from './modules/applyApproval/MyApprovals.vue'
import { queryPermissionsByUser } from '@/api/api'

export default {
  name: 'WorkbenchApproval',
  components: {
    Sidebar,
    ApplySection,
    ApplyCard,
    MyApprovals,
    MyApply,
  },
  data() {
    return {
      activeMenu: 'apply',
      // 侧边栏菜单
      menuList: [
        { key: 'apply', label: '申请中心' },
        { key: 'my', label: '我的申请' },
        { key: 'audit', label: '我的审批' },
      ],
      // 考勤
      attendanceList: [
        { key: 'buka', label: '补卡申请', icon: 'clock-circle', iconClass: 'ic-kaoqin-1' },
        { key: 'jiaban', label: '加班申请', icon: 'hourglass', iconClass: 'ic-kaoqin-2' },
        { key: 'waichu', label: '外出申请', icon: 'export', iconClass: 'ic-kaoqin-3' },
        { key: 'qingjia', label: '请假申请', icon: 'calendar', iconClass: 'ic-kaoqin-4' },
        { key: 'yidongdaka', label: '移动打卡申请', icon: 'mobile', iconClass: 'ic-kaoqin-5' },
        { key: 'gongling', label: '工龄年限申请', icon: 'file-text', iconClass: 'ic-kaoqin-6' },
        { key: 'nianjia', label: '年假申请', icon: 'coffee', iconClass: 'ic-kaoqin-10' },
      ],
      // 宿舍食堂
      dormitoryList: [
        { key: 'ruzhu', label: '入住申请', matchTitle: '宿舍申请', icon: 'home', iconClass: 'ic-sushe-1' },
        { key: 'tiaosu', label: '调宿申请', matchTitle: '宿舍申请', icon: 'swap', iconClass: 'ic-sushe-3' },
        { key: 'tuisu', label: '退宿申请', matchTitle: '宿舍申请', icon: 'logout', iconClass: 'ic-sushe-2' },
      ],
      // 人事管理
      hrList: [
        { key: 'yongren', label: '用人申请', icon: 'team', iconClass: 'ic-renshi-2' },
        { key: 'zhuanzheng', label: '转正申请', matchTitle: '试用跟踪', icon: 'check-circle', iconClass: 'ic-renshi-6' },
        { key: 'tiaogang', label: '调岗申请', matchTitle: '调动管理', icon: 'swap', iconClass: 'ic-renshi-1' },
        { key: 'tiaoxin', label: '调薪申请', matchTitle: '调薪申请', icon: 'rise', iconClass: 'ic-renshi-7' },
        { key: 'lizhi', label: '离职申请', matchTitle: '离职管理', icon: 'logout', iconClass: 'ic-renshi-5' },
        { key: 'linshigong', label: '临时工需求', matchTitle: '临时工申请', icon: 'user', iconClass: 'ic-renshi-4' },
      ],
      // 办公协同
      officeList: [
        { key: 'fangke', label: '访客申请', matchTitle: '访客中心', icon: 'file-add', iconClass: 'ic-gongtong-2' },
        { key: 'zizhufangke', label: '自助访客登记', matchTitle: '访客中心', icon: 'schedule', iconClass: 'ic-gongtong-3' },
        { key: 'laowupaiqian', label: '劳动派遣登记', matchTitle: '访客中心', icon: 'team', iconClass: 'ic-gongtong-6' },
        { key: 'fangxingtiao', label: '放行条', icon: 'idcard', iconClass: 'ic-gongtong-4' },
        { key: 'huiyiyuyue', label: '会议预约', matchTitle: '会议室申请', icon: 'calendar', iconClass: 'ic-gongtong-5' },
      ],
      // 权限菜单 title -> path 映射
      menuPathMap: {},
    }
  },
  created() {
    this.loadPermissionMenu()
  },
  computed: {
    // 根据权限菜单动态过滤：只返回有权限的卡片，无权限的直接不显示
    computedAttendanceList() {
      return this.attendanceList.filter(item => this.getMenuPath(item))
    },
    computedDormitoryList() {
      return this.dormitoryList.filter(item => this.getMenuPath(item))
    },
    computedHrList() {
      return this.hrList.filter(item => this.getMenuPath(item))
    },
    computedOfficeList() {
      return this.officeList.filter(item => this.getMenuPath(item))
    },
  },
  methods: {
    // 递归扁平化菜单树，收集 title -> path 映射
    flattenMenu(menus, map = {}) {
      if (!menus || !menus.length) return map
      for (const m of menus) {
        const title = m.meta && m.meta.title
        if (title && m.path && !m.children) {
          map[title] = m.path
        }
        if (m.children && m.children.length) {
          this.flattenMenu(m.children, map)
        }
      }
      return map
    },
    // 加载权限菜单
    loadPermissionMenu() {
      queryPermissionsByUser()
        .then((res) => {
          if (res && res.success && res.result && res.result.menu) {
            this.menuPathMap = this.flattenMenu(res.result.menu)
          }
        })
        .catch(() => {
          // 失败时静默，保留原提示行为
        })
    },
    handleMenuChange() {
      // 菜单切换
    },
    // 根据权限菜单 title 获取对应 path，优先用 matchTitle 匹配
    getMenuPath(item) {
      const title = item.matchTitle || item.label
      return this.menuPathMap[title]
    },
    handleCardClick(item) {
      console.log('点击卡片:', item)
      const path = this.getMenuPath(item)
      if (!path) return
      // 卡片 key -> 目标页面 tab key 映射
      const tabMap = {
        // 宿舍申请页面 (DormAllotList)
        'ruzhu': '0',       // 入住申请
        'tiaosu': '1',      // 调宿申请
        'tuisu': '2',       // 退宿申请

        // 访客申请页面 (VisitorApply)
        'zizhufangke': 'selfRegister',   // 自助访客登记 -> 访客自主登记 Tab
        'laowupaiqian': 'temp',          // 劳动派遣登记 -> 劳动派遣登记 Tab
      }
      const tab = tabMap[item.key]
      // 将 tab 存入 sessionStorage，避免带 query 参数导致重复 tab
      if (tab !== undefined && tab !== null) {
        sessionStorage.setItem('wb_target_tab_' + path, tab)
      }
      this.$router.push({
        path: path
      })
    }
  },
}
</script>

<style lang="less" scoped>
.wb-approval-page {
  display: flex;
  gap: 20px;
  padding: 20px;
  width: 100%;
  height: calc(100vh - 120px);
  min-height: 600px;
  background: #f5f7fa;
  box-sizing: border-box;
  overflow: hidden;
}

.main-content {
  flex: 1;
  min-width: 0;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e8ebf0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  /* flex row 中靠 align-items:stretch 撑高，这里显式指定 height 确保子元素 height:100% 能生效 */
  height: 100%;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: linear-gradient(90deg, #2563eb, #38bdf8);
    z-index: 1;
    pointer-events: none;
  }
}

.view-wrap {
  padding: 28px 32px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    width: 5px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d0d5dd;
    border-radius: 3px;
  }
}
</style>
