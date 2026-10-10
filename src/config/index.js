/** init domain config */
import Vue from 'vue'
//设置全局API_BASE_URL
Vue.prototype.API_BASE_URL = window._CONFIG.VUE_APP_API_BASE_URL?window._CONFIG.VUE_APP_API_BASE_URL:process.env.VUE_APP_API_BASE_URL
window._CONFIG['domianURL'] = Vue.prototype.API_BASE_URL
Vue.prototype.API_BLMAP_BASE_URL = process.env.VUE_APP_BLMAP_BASE_URL
Vue.prototype.API_MARKET_MAP_BASE_URL = process.env.VUE_APP_MARKET_MAP_BASE_URL

//单点登录地址
window._CONFIG['casPrefixUrl'] = window._CONFIG.VUE_APP_CAS_BASE_URL?window._CONFIG.VUE_APP_CAS_BASE_URL:process.env.VUE_APP_CAS_BASE_URL
window._CONFIG['onlinePreviewDomainURL'] =  window._CONFIG.VUE_APP_ONLINE_BASE_URL?window._CONFIG.VUE_APP_ONLINE_BASE_URL:process.env.VUE_APP_ONLINE_BASE_URL
window._CONFIG['fileViewUrl'] =  window._CONFIG.VUE_APP_ONLINE_BASE_URL?window._CONFIG.VUE_APP_ONLINE_BASE_URL:process.env.VUE_APP_ONLINE_BASE_URL
window._CONFIG['staticDomainURL'] = Vue.prototype.API_BASE_URL + '/sys/common/static'
window._CONFIG['pdfDomainURL'] = Vue.prototype.API_BASE_URL+ '/sys/common/pdf/pdfPreviewIframe'

//平台名称
window._CONFIG['sys_title'] = process.env.VUE_APP_TITLE
// 下面是地图
window._CONFIG['blmap_base'] = Vue.prototype.API_BLMAP_BASE_URL
window._CONFIG['market_map_base'] = Vue.prototype.API_MARKET_MAP_BASE_URL

