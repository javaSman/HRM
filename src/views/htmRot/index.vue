<template>
  <div class="htm-rot-page">
    <!-- 顶部：标题 + 全部展开/收起 -->
    <div class="nav-header">
      <div class="title-wrap">
        
      </div>
      <div class="header-actions">
        <a-button type="primary" icon="down" @click="setAllOpen(true)">全部展开</a-button>
        <a-button icon="up" class="ml-8" @click="setAllOpen(false)">全部收起</a-button>
      </div>
    </div>

    <!-- 模块卡片（op：true 展开 / false 收起） -->
     <div class="module-container">
    <a-card
      v-for="(m, mi) in modules"
      :key="mi"
      class="module-card"
      :class="{ 'is-open': m.op }"
    >
      <div class="module-head" @click="toggle(m)">
        <span class="bar"></span>
        <span class="m-name">{{ m.name }}</span>
        <!-- <span class="m-count">{{ countOfModule(m) }}</span> -->
        <a-icon type="down" class="caret" />
      </div>

      <div v-show="m.op" class="module-body">
        <div v-for="(g, gi) in m.arr" :key="gi" class="group">
          <div class="group-title">{{ g.name }} · {{ g.items.length }}个</div>
          <div class="cards">
            <div
              v-for="(item, ci) in g.items"
              :key="ci"
              class="entry-card"
              @click="go(item)"
            >
              <!-- img 优先级最高，其次 icon，都为空时显示默认图标 -->
              <span class="ico" :style="{ background: iconBg(item.color) }">
                <img v-if="item.img" :src="item.img" class="ico-img" alt="">
                <a-icon v-else-if="item.icon" :type="item.icon" />
                <a-icon v-else type="file" />
              </span>
              <span class="name" :title="item.name">{{ item.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </a-card>
    </div>
  </div>
</template>

<script>
// 数据结构：
// 模块 { name, op, arr }  -> 分组 { name, items }  -> 卡片 { name, color, icon, img, url }
// 卡片字段说明：
//   color 图标底色    icon ant-design 内置图标 type（如 'form'）
//   img   图片地址，优先级高于 icon（本地资源可用 require('@/assets/xxx.png')）
//   url   跳转路由 path（以后端菜单配置为准），为空时提示建设中
export default {
  name: 'HtmRotIndex',
  data () {
    return {
      modules: [
        {
          name: '招聘管理',
          op: false,
          arr: [
            {
              name: '用人需求',
              items: [
                { name: '用人申请', color: '#1890FF', icon: '', img: '', url: 'PersonnelManagement-Recruitment-yongren' },
                { name: '招聘计划', color: '#13C2C2', icon: '', img: '', url: 'PersonnelManagement-Recruitment-plan' }
              ]
            },
            {
              name: '简历管理',
              items: [
                { name: '简历管理', color: '#52C41A', icon: '', img: '', url: 'PersonnelManagement-Recruitment-resume' }
              ]
            },
            {
              name: '面试管理',
              items: [
                { name: '面试管理', color: '#FA8C16', icon: '', img: '', url: 'PersonnelManagement-Recruitment-interview' }
              ]
            },
            {
              name: 'Offer 管理',
              items: [
                { name: 'Offer 管理', color: '#722ED1', icon: '', img: '', url: 'PersonnelManagement-Recruitment-offer' }
              ]
            },
            {
              name: '人才资源池',
              items: [
                { name: '高校资源管理', color: '#2F54EB', icon: '', img: '', url: 'PersonnelManagement-Recruitment-school' },
                { name: '黑名单管理', color: '#EB2F96', icon: '', img: '', url: 'PersonnelManagement-Recruitment-blackList' }
              ]
            }
          ]
        },
        {
          name: '员工生命周期管理',
          op: false,
          arr: [
            {
              name: '入职管理',
              items: [
                { name: '入职手续办理', color: '#FAAD14', icon: '', img: '', url: 'PersonnelManagement-Personnel-onboarding' },
                { name: '员工档案建档', color: '#1890FF', icon: '', img: '', url: 'peoplemanagement-employeeInfo' }
              ]
            },
            {
              name: '试用期管理',
              items: [
                { name: '试用过程跟踪', color: '#13C2C2', icon: '', img: '', url: 'PersonnelManagement-Personnel-probationPeriod' },
                { name: '转正申请与审批', color: '#52C41A', icon: '', img: '', url: 'PersonnelManagement-Personnel-passProbation' }
              ]
            },
            {
              name: '在职事务管理',
              items: [
                { name: '员工档案维护', color: '#FA8C16', icon: '', img: '', url: 'peoplemanagement-employeeInfo' },
                { name: '岗位调动管理', color: '#722ED1', icon: '', img: '', url: 'PersonnelManagement-Personnel-mobilize-HrmTdglList' },
                { name: '薪酬调整申请', color: '#2F54EB', icon: '', img: '', url: 'PersonnelManagement-Personnel-salaryAdjustment' },
                { name: '员工访谈管理', color: '', icon: '', img: '', url: '' },
                { name: '访谈配置', color: '#FAAD14', icon: '', img: '', url: 'PersonnelManagement-Personnel-interviewConfig' },
                { name: '访谈问题跟进', color: '#1890FF', icon: '', img: '', url: 'PersonnelManagement-Personnel-interviewFollow' }
              ]
            },
            {
              name: '灵活用工',
              items: [
                { name: '临时工用工申请', color: '#13C2C2', icon: '', img: '', url: 'temporaryWorker-apply' },
                { name: '临时工审批', color: '#52C41A', icon: '', img: '', url: 'temporaryWorker-approva' }, 
                { name: '临时工档案管理', color: '#FA8C16', icon: '', img: '', url: 'temporaryWorker-file' }
              ]
            },
            {
              name: '离职管理',
              items: [
                { name: '离职申请与审批', color: '#722ED1', icon: '', img: '', url: 'PersonnelManagement-Personnel-offboarding' },
                { name: '离职手续办结', color: '', icon: '', img: '', url: '' }
              ]
            }
          ]
        },
        {
          name: '行政共享服务中心',
          op: false,
          arr: [
            {
              name: '宿舍服务',
              items: [
                { name: '舍区基础管理', color: '#EB2F96', icon: '', img: '', url: 'dormAdmin-DormBoardList' },
                { name: '宿舍入住申请', color: '#FAAD14', icon: '', img: '', url: 'dormAdmin-DormitoryList' },
                { name: '宿舍审核与调度', color: '#1890FF', icon: '', img: '', url: 'dormAdmin-DormInpsectList' },  
                { name: '住宿人员信息管理', color: '#13C2C2', icon: '', img: '', url: 'dormAdmin-DormMateList' },
                { name: '宿舍门禁管理', color: '#52C41A', icon: '', img: '', url: 'dormAdmin-DormGuardList'} 
              ]
            },
            {
              name: '访客服务',
              items: [
                { name: '访客预约登记（访客中心）', color: '#FA8C16', icon: '', img: '', url: 'visitor-VisitorApply' },
                { name: '访客审批（审批中心）', color: '#722ED1', icon: '', img: '', url: 'visitor-VisitorApproval' },
                { name: '接待过程管理（我的接待）', color: '#2F54EB', icon: '', img: '', url: 'visitor-VisitorReceive' },
                { name: '放行条管理', color: '#EB2F96', icon: '', img: '', url: 'visitor-PassApply' }
              ]
            }
          ]
        }
      ]
    }
  },
  computed: {
    moduleCount () {
      return this.modules.length
    },
    groupCount () {
      return this.modules.reduce((n, m) => n + m.arr.length, 0)
    },
    itemCount () {
      return this.modules.reduce((n, m) => n + this.countOfModule(m), 0)
    }
  },
  methods: {
    // 单个模块展开/收起
    toggle (m) {
      this.$set(m, 'op', !m.op)
    },
    // 全部展开 / 全部收起
    setAllOpen (open) {
      this.modules.forEach(m => this.$set(m, 'op', open))
    },
    countOfModule (m) {
      return m.arr.reduce((n, g) => n + g.items.length, 0)
    },
    // 图标底色：以卡片 color 为起点，向白色混合生成渐变亮色
    iconBg (color) {
      const c = color || '#ccc'
      return `linear-gradient(135deg, ${c}, ${this.lighten(c, 0.28)})`
    },
    lighten (hex, weight) {
      let h = (hex || '').replace('#', '')
      if (h.length === 3) {
        h = h.split('').map(v => v + v).join('')
      }
      const num = parseInt(h, 16)
      if (isNaN(num)) return hex
      const r = (num >> 16) & 255
      const g = (num >> 8) & 255
      const b = num & 255
      const mix = v => Math.round(v + (255 - v) * weight)
      return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
    },
    // 卡片跳转
    go (item) {
      if (!item.url) {
        this.$message.info(`「${item.name}」功能建设中，敬请期待`)
        return
      }
      this.$router.push({ name: item.url })
    }
  }
}
</script>

<style scoped lang="less">
.htm-rot-page {
  // 字体阶梯：12 / 14 / 16 / 18
  --fs-xs: 12px;
  --fs-sm: 14px;
  --fs-md: 16px;
  --fs-lg: 18px;

  --primary: #1890ff;
  --line: #ebedf0;
  --t1: #1f2329;
  --t2: #4e5969;
  --t3: #86909c;
  --t-desc: #5f6b7a;

      height: 87vh;
  padding: 10px;

    overflow: hidden;
    background: #fcfcff;
}

/* ===== 顶部 ===== */
.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom:8px;
}
.title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}
.title-bar {
  width: 4px;
  height: 22px;
  border-radius: 2px;
  background: var(--primary);
}
.page-title {
  margin: 0;
  font-size: var(--fs-lg);
  font-weight: 600;
  line-height: 1.3;
  color: var(--t1);
}
.page-sub {
  margin: 2px 0 0;
  font-size: var(--fs-xs);
  color: var(--t3);
}
.ml-8 {
  margin-left: 8px;
}
.module-container{
height: calc(100% - 48px);
  padding: 10px;

    overflow: auto;
}
/* ===== 模块卡片 ===== */
.module-card {

  margin-bottom: 16px;
  border-radius: 12px;
  box-shadow: 0 1px 4px rgba(31, 35, 41, 0.04);
    

  ::v-deep .ant-card-body {
    padding: 0;
  }
}
.module-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 15px 20px;
  cursor: pointer;
  user-select: none;
}
.module-card.is-open .module-head {
  border-bottom: 1px solid var(--line);
}
.module-head .bar {
  width: 4px;
  height: 16px;
  border-radius: 2px;
  background: var(--primary);
  flex: none;
}
.module-head .m-name {
  font-size: var(--fs-md);
  font-weight: 600;
  color: var(--t1);
  transition: color 0.15s;
}
.module-head .m-count {
  font-size: var(--fs-xs);
  color: var(--t3);
}
.module-head .caret {
  margin-left: auto;
  color: var(--t3);
  transition: transform 0.2s ease, color 0.15s;
}
/* 展开时箭头朝下，收起时旋转 90° 朝右 */
.module-card:not(.is-open) .caret {
  transform: rotate(-90deg);
}
.module-head:hover .m-name,
.module-head:hover .caret {
  color: var(--primary);
}

.module-body {
  padding: 18px 20px 20px;
}

/* ===== 分组 ===== */
.group + .group {
  margin-top: 18px;
}
.group-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: var(--fs-sm);
  color: var(--t-desc);
}
.group-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--line);
}
.cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
  margin-top: 10px;
}

/* ===== 入口卡片 ===== */
.entry-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid #f0f1f3;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: all 0.18s ease;
}
.entry-card::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background: var(--primary);
  border-radius: 0 3px 3px 0;
  transform: scaleY(0);
  transition: transform 0.18s ease;
}
.entry-card:hover {
  border-color: rgba(24, 144, 255, 0.35);
  box-shadow: 0 8px 20px -6px rgba(24, 144, 255, 0.18);
  transform: translateY(-2px);
}
.entry-card:hover::before {
  transform: scaleY(1);
}
.ico {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 19px;
}
.ico-img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
.name {
  min-width: 0;
  font-size: var(--fs-sm);
  color: var(--t1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* ===== 响应式 ===== */
@media (max-width: 768px) {
  .htm-rot-page {
    padding: 12px;
  }
  .cards {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
  }
  .module-head {
    padding: 14px 16px;
  }
  .module-body {
    padding: 14px 16px 16px;
  }
}
@media (max-width: 520px) {
  .cards {
    grid-template-columns: 1fr;
  }
  .header-actions {
    width: 100%;

    .ant-btn {
      flex: 1;
    }
  }
  .page-title {
    font-size: var(--fs-md);
  }
}
</style>
