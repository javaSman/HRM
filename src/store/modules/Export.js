import Vue from 'vue'
const Export = {
  state: {
    ExportShow:false,
    ExportList:[],
    ExportName:'',
  },
  mutations: {
    ExportOn(state, i){
      state.ExportShow = i.show
      state.ExportList = i.list
      state.ExportName = i.name
    },
  },
  actions: {}
}
export default Export