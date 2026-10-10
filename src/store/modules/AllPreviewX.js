import { getFileAccessHttpUrl } from '@/api/manage'
import { message } from 'ant-design-vue'
const AllPreviewX = {
  state: {
    pdfIsShow: false,
    pdfList: [],
  },
  mutations: {
    pdfIsOn(state, i) {
      state.pdfIsShow = i.show
      state.pdfList = i.list
    },
  },
  actions: {
    // 全局查看文件
    openPdf({ commit }, text) {
      console.log('=====全局预览文件=====', text)
      let list = []
      if (!text) {
        message.warning('未知的文件')
        return
      }
      if (text.includes(',')) {
        list = text.split(',').map((s) => getFileAccessHttpUrl(s))
      } else {
        list.push(getFileAccessHttpUrl(text))
      }
      commit('pdfIsOn', {
        show: true,
        list,
      })
    },
  },
}
export default AllPreviewX
