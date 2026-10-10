import Vue from 'vue'
import { listCustomForm } from "@/api/form";

export const flowableMixin = {
  components: {
  },
  data(){
    return {
      customformList: [],
      formQueryParams:{
        pageNum: 1,
        pageSize: 1000,
      },
    }
  },
  created() {
    this.ListCustomForForm();
  },
  computed:{
    /*所有的流程表单，组件化注册，无需维护，从后端获取*/
    allFormComponent:function(){
      return this.customformList;
    }
  },
  methods:{
    /* 挂载自定义业务表单列表 */
    ListCustomForForm() {
      // 流程页和表单列表在 created 阶段会并行加载，复用同一个 Promise，避免组件尚未注册就开始渲染。
      if (this._customFormPromise) {
        return this._customFormPromise
      }
      this._customFormPromise = listCustomForm(this.formQueryParams).then(res => {
        const records = res && res.result && Array.isArray(res.result.records) ? res.result.records : []
        this.customformList = records
          .filter(item => item && item.routeName)
          .map(item => ({
            text: item.flowName,
            routeName: item.routeName,
            component: () => import(`@/views/${item.routeName}.vue`),
            businessTable: 'test_demo'
          }))
        return this.customformList
      }).catch(error => {
        this._customFormPromise = null
        throw error
      })
      return this._customFormPromise
    },
    getFormComponent(routeName){
      return _.find(this.allFormComponent,{routeName:routeName})||{};
    },
   
    handleTableChange(pagination, filters, sorter) {
      //分页、排序、筛选变化时触发
      //TODO 筛选
      if (Object.keys(sorter).length > 0) {
        this.isorter.column = sorter.field;
        this.isorter.order = "ascend" == sorter.order ? "asc" : "desc"
      }
      this.ipagination = pagination;
      // this.loadData();
    },
  }

}
