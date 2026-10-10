/**
 * @author xue
 */
import Vue from 'vue'

/* 调用示例
<a-modal v-drag-modal :visible="previewVisible" :footer="null" @cancel="handleCancel">
  <img alt="example" style="width: 100%" :src="previewImage" />
</a-modal> */

// v-drag-modal: 弹窗拖拽
Vue.directive('dragModal', (el, binding, vnode, oldVnode) => {
  Vue.nextTick(() => {
    let { visible, destroyOnClose } = vnode.componentInstance

    // 添加状态变量来标记是否已经碰撞过屏幕边缘  碰撞次数
    let collisionNum = 0;

    if (!visible) return
    const isThemeModal = el.classList.contains('grid-theme')
    const dialogHeaderEl = isThemeModal ? el.querySelector('.ant-tabs-bar') : el.querySelector('.ant-modal-header')
    const dragDom = isThemeModal ? el.querySelector('.ant-modal') : el.querySelector('.ant-modal')
    // dialogHeaderEl.style.cursor = 'move';
    dialogHeaderEl.style.cssText += ';cursor:move;'
    // dragDom.style.cssText += ';top:0px;'

    // 获取原有属性 ie dom元素.currentStyle 火狐谷歌 window.getComputedStyle(dom元素, null);
    const sty = (function () {
      if (window.document.currentStyle) {
        return (dom, attr) => dom.currentStyle[attr]
      } else {
        return (dom, attr) => getComputedStyle(dom, false)[attr]
      }
    })()
    dialogHeaderEl.onmousedown = (e) => {

      // 禁止选中文字，防止拖拽时弹框粘鼠标
      document.onselectstart = function () {
        return false;
      }
      // 鼠标按下，计算当前元素距离可视区的距离
      const disX = e.clientX - dialogHeaderEl.offsetLeft
      const disY = e.clientY - dialogHeaderEl.offsetTop

      const screenWidth = document.body.clientWidth // body当前宽度
      const screenHeight = document.documentElement.clientHeight // 可见区域高度(应为body高度，可某些环境下无法获取)
      const dragDomWidth = dragDom.offsetWidth // 对话框宽度
      const dragDomheight = dragDom.offsetHeight // 对话框高度

      const minDragDomLeft = dragDom.offsetLeft
      const maxDragDomLeft = screenWidth - dragDom.offsetLeft - dragDomWidth - (isThemeModal ? 10 : 0)

      const minDragDomTop = dragDom.offsetTop
      const maxDragDomTop = screenHeight - dragDom.offsetTop - dragDomheight - (isThemeModal ? 10 : 0)

      /**
       * 判断当前元素是否碰撞屏幕
       */
      function IsCollision(left,top){
        if (-(left) > minDragDomLeft || left > maxDragDomLeft || -(top) > minDragDomTop || top > maxDragDomTop) {
          return true;
        }
        return false;
      }
      // 获取到的值带px 正则匹配替换
      let styL = sty(dragDom, 'left')
      let styT = sty(dragDom, 'top')

      // 注意在ie中 第一次获取到的值为组件自带50% 移动之后赋值为px
      if (styL.includes('%')) {
        // eslint-disable-next-line no-useless-escape
        styL = +document.body.clientWidth * (+styL.replace(/\%/g, '') / 100)
        // eslint-disable-next-line no-useless-escape
        styT = +document.body.clientHeight * (+styT.replace(/\%/g, '') / 100)
      } else {
        styL = +styL.replace(/\px/g, '')
        styT = +styT.replace(/\px/g, '')
      };
      // dialogHeaderEl 此处直接使用el 防止鼠标移动太快脱离范围，导致无法拖动
      el.onmousemove = function (e) {

        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX
        let top = e.clientY - disY

        // 如果是true 可以随意拖动位置 可以超出屏幕
        if (collisionNum>=30){
          dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`
          return;
        }


        // 边界处理
        if (-(left) > minDragDomLeft) {
          left = -(minDragDomLeft)
          collisionNum++
        } else if (left > maxDragDomLeft) {
          left = maxDragDomLeft
          collisionNum++
        }

        if (-(top) > minDragDomTop) {
          top = -(minDragDomTop)
          collisionNum++
        } else if (top > maxDragDomTop) {
          top = maxDragDomTop
          collisionNum++
        }
        console.log("移动中","碰撞次数："+collisionNum);


        // 移动当前元素
        dragDom.style.cssText += `;left:${left + styL}px;top:${top + styT}px;`
      }

      el.onmouseup = function (e) {
        el.onmousemove = null
        dialogHeaderEl.onmouseup = null
        // 通过事件委托，计算移动的距离
        let left = e.clientX - disX
        let top = e.clientY - disY
        let bool =IsCollision(left,top);
        console.log("移动结束：是否碰撞",bool);
        // 不是碰撞就重置碰撞次数
        if (!bool){
          collisionNum=0;
        }

      }

      document.onmouseup = function (e) {
        el.onmousemove = null
        dialogHeaderEl.onmouseup = null
        // 在抬起鼠标之后，取消禁用选择文字
        document.onselectstart = function () {
          return true;
        }
      }
    }
  })
})