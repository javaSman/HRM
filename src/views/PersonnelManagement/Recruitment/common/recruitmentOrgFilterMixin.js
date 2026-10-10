import { getAction } from '@/api/manage'

/**
 * 招聘列表公司—部门联动逻辑。
 * companyId、deptArr 只维护界面状态，列表和岗位查询统一读取 queryParam.deptId。
 * 各页面通过 orgTreeUrl 选项声明自己的组织树接口，避免跨业务复用错误地址。
 */
export const recruitmentOrgFilterMixin = {
  data() {
    return {
      companyId: '',
      companyList: [],
      deptArr: [],
      orgLoading: false
    }
  },
  computed: {
    deptList() {
      const company = this.getSelectedCompany()
      return company && Array.isArray(company.children) ? company.children : []
    }
  },
  created() {
    this.loadOrgTree()
  },
  methods: {
    loadOrgTree() {
      this.orgLoading = true
      // 接口一次返回完整组织树：根节点 children 是公司，公司 children 是部门级联树。
      return getAction(this.$options.orgTreeUrl, { pid: 0 }).then(res => {
        if (!res || !res.success || !Array.isArray(res.result)) {
          throw new Error(res && res.message ? res.message : '组织架构接口返回异常')
        }
        if (!res.result.length) {
          this.companyList = []
          return
        }
        if (!Array.isArray(res.result[0].children)) {
          throw new Error('组织架构接口缺少公司节点')
        }
        this.companyList = res.result[0].children
      }).catch(() => {
        this.companyList = []
        this.companyId = ''
        this.deptArr = []
        this.queryParam.deptId = ''
        this.queryParam.deptPath = ''
        this.queryParam.postId = ''
        this.$message.error('组织架构加载失败，请稍后重试')
      }).finally(() => {
        this.orgLoading = false
      })
    },
    getSelectedCompany() {
      return this.companyList.find(item => String(item.id) === String(this.companyId || '')) || null
    },
    handleCompanyChange(value) {
      this.companyId = value || ''
      this.deptArr = []
      this.queryParam.postId = ''
      const company = this.getSelectedCompany()
      this.queryParam.deptId = company ? company.id : ''
      this.queryParam.deptPath = company ? (company.name || '') : ''
    },
    filterDeptOption(inputValue, path) {
      const keyword = String(inputValue || '').toLowerCase()
      return (path || []).some(option => String(option.name || '').toLowerCase().indexOf(keyword) > -1)
    },
    handleQueryDeptChange(value, selectedOptions) {
      const company = this.getSelectedCompany()
      const path = Array.isArray(value) ? value : []
      const options = Array.isArray(selectedOptions) ? selectedOptions : []
      // value 决定最终部门 ID，selectedOptions 只用于拼接“公司/部门”名称路径。
      const pathLabels = [company && company.name].concat(options.map(item => item.name)).filter(Boolean)
      this.queryParam.deptId = path.length ? path[path.length - 1] : (company ? company.id : '')
      this.queryParam.deptPath = pathLabels.join('/')
      this.queryParam.postId = ''
    }
  }
}
