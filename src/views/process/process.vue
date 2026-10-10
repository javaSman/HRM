<template>
  <a-card :bordered="false" style="height: calc(100vh - 120px - 24px); overflow: auto;">
    <div class="all">
      <div class="left">
        <h1>流程管理</h1>
        <a-button style="margin: 10px 0" @click="handleAdd(1)" type="primary">添加业务及流程</a-button>
        <!-- <a-input-search style="margin-bottom: 8px" placeholder="搜索部门" @change="onChange" /> -->
        <div class="bm" v-if="gData.length > 0">
          <a-tree
            :replaceFields="{ title: 'title', key: 'key', children: 'children' }"
            :expandedKeys="expandedKeys"
            :auto-expand-parent="autoExpandParent"
            :tree-data="gData"
            @expand="onExpand"
            @select="getTab"
          >
            <template #title="{ key: treeKey, title, level }">
              <a-dropdown :trigger="['contextmenu']">
                <span title="鼠标右键可进行操作">{{ title }}</span>
                <template #overlay>
                  <a-menu @click="({ key: menuKey }) => onContextMenuClick(treeKey, menuKey)">
                    <a-menu-item v-if="level != 3" key="1">新增下级</a-menu-item>
                    <a-menu-item key="2">编辑</a-menu-item>
                    <!-- <a-menu-item key="2">授权</a-menu-item> -->
                    <a-menu-item key="3">删除</a-menu-item>
                  </a-menu>
                </template>
              </a-dropdown>
            </template>
          </a-tree>
        </div>
      </div>
      <div class="resize" title="收缩侧边栏">⋮</div>
      <div class="right">
        <div class="top"></div>
        <div class="bottom">
          <list
            :bmid="bmids"
            :tree-data="gData"
            @reload-process-tree="getBMAll"></list>
        </div>
      </div>
    </div>
    <ProcessModal :treeData="gData" ref="ProcessModal" @ok="getBMAll" />
  </a-card>
</template>

<script>
import '@/assets/less/TableExpand.less'
import { mixinDevice } from '@/utils/mixin'
import List from './CustomProcessConfigurationList.vue'
import ProcessModal from './modules/ProcessModal.vue'
import { getAction, putAction, postAction, deleteAction, getFileAccessHttpUrl } from '@/api/manage'
import { JeecgListMixin } from '@/mixins/JeecgListMixin'
const APPROVAL_PROCESS_TYPE = '审批流程'

const getParentKey = (value, tree) => {
  let parentKey
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i]
    if (node.children) {
      node.children.some((item) => {})

      if (node.children.some((item) => item.title.indexOf(value) > -1)) {
        parentKey = node.key
      } else if (getParentKey(value, node.children)) {
        parentKey = getParentKey(value, node.children)
      }
    }
  }
  return parentKey
}

export default {
  name: 'peopleAll',
  mixins: [JeecgListMixin, mixinDevice],
  components: {
    List,
    ProcessModal,
  },
  data() {
    return {
      visible: false,

      description: '',
      // 表头
      columns: [],
      dictOptions: {},
      superFieldList: [],
      disableMixinCreated: true,

      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      gData: [],
      dataList: [],
      labelCol: {
        xs: {
          span: 24,
        },
        sm: {
          span: 5,
        },
      },
      wrapperCol: {
        xs: {
          span: 24,
        },
        sm: {
          span: 16,
        },
      },

      treeShow: false,
      treeTitle: '新增',
      newTree: {
        title: '',
        id: '',
        Pid: '',
      },
      bmids: '',
      selectedTreeKey: '',
      url: {
        list: '/process/customProcess/list',
        delete: '/process/customProcess/delete',
      },
      kfAdmin: '',
    }
  },
  created() {
    this.kfAdmin = this.$store.getters.userInfo.username
    this.getBMAll()
  },
  mounted() {
    this.dragControllerDiv() //左右侧滑动
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG['domianURL']}/${this.url.importExcelUrl}`
    },
  },
  methods: {
    dragControllerDiv() {
      var resize = document.getElementsByClassName('resize')
      var left = document.getElementsByClassName('left')
      var mid = document.getElementsByClassName('right')
      var box = document.getElementsByClassName('all')
      for (let i = 0; i < resize.length; i++) {
        // 鼠标按下事件
        resize[i].onmousedown = function (e) {
          //颜色改变提醒
          resize[i].style.background = '#55aaff'
          var startX = e.clientX
          resize[i].left = resize[i].offsetLeft
          // 鼠标拖动事件
          document.onmousemove = function (e) {
            var endX = e.clientX
            var moveLen = resize[i].left + (endX - startX) // （endx-startx）=移动的距离。resize[i].left+移动的距离=左边区域最后的宽度
            var maxT = box[i].clientWidth - resize[i].offsetWidth // 容器宽度 - 左边区域的宽度 = 右边区域的宽度

            if (moveLen < 32) moveLen = 32 // 左边区域的最小宽度为32px
            if (moveLen > maxT - 150) moveLen = maxT - 150 //右边区域最小宽度为150px

            resize[i].style.left = moveLen // 设置左侧区域的宽度

            for (let j = 0; j < left.length; j++) {
              if (moveLen > 1200) {
                moveLen = 1200
              }
              if (moveLen < 120) {
                moveLen = 120
              }
              left[j].style.width = moveLen + 'px'
              mid[j].style.width = box[i].clientWidth - moveLen - 10 + 'px'
            }
          }
          // 鼠标松开事件
          document.onmouseup = function (evt) {
            //颜色恢复
            resize[i].style.background = '#d6d6d6'
            document.onmousemove = null
            document.onmouseup = null
            resize[i].releaseCapture && resize[i].releaseCapture() //当你不在需要继续获得鼠标消息就要应该调用ReleaseCapture()释放掉
          }
          resize[i].setCapture && resize[i].setCapture() //该函数在属于当前线程的指定窗口里设置鼠标捕获
          return false
        }
      }
    },

    handleAdd(num) {
      if (num == 1) {
        this.$refs.ProcessModal.add()
        this.$refs.ProcessModal.title = '新增'
      }
    },
    getTab(ids, e) {
      const selectedId = Array.isArray(ids) && ids.length ? ids[0] : ''
      this.selectedTreeKey = selectedId
      const selectedProcess = this.findProcessById(selectedId)
      this.bmids = selectedProcess && selectedProcess.fzlc === APPROVAL_PROCESS_TYPE ? selectedProcess.id : ''
    },
    generateList(data, parentId = '') {
      for (let i = 0; i < data.length; i++) {
        const node = data[i]
        this.dataList.push({
          id: node.key,
          lcmc: node.title,
          name: node.title,
          fzlc: node.fzlc,
          pid: node.pid || parentId || '',
          lztj: node.lztj,
        })
        if (node.children) {
          this.generateList(node.children, node.key)
        }
      }
    },
    findProcessById(id) {
      if (!id) {
        return null
      }
      return this.dataList.find((item) => String(item.id) === String(id)) || null
    },
    getBMAll() {
      getAction('/process/customProcess/treeList?pageSize=100000').then((res) => {
        if (res.success) {
          this.gData = res.result
          this.dataList = []
          this.generateList(res.result)
          const selectedProcess = this.findProcessById(this.selectedTreeKey)
          this.bmids = selectedProcess && selectedProcess.fzlc === APPROVAL_PROCESS_TYPE ? selectedProcess.id : ''
          this.$forceUpdate()
        }
      })
    },
    onContextMenuClick(treeKey, menuKey) {
      this.newTree.title = ''
      switch (menuKey) {
        case '1':
          this.$refs.ProcessModal.add(treeKey)
          this.$refs.ProcessModal.title = '新增下级'
          break
        case '2':
          let item = ''
          this.dataList.forEach((i) => {
            if (treeKey == i.id) {
              item = i
            }
          })
          this.$refs.ProcessModal.edit(item)
          this.$refs.ProcessModal.title = '编辑'
          // this.visible=true
          // setTimeout(()=>{
          //   this.$refs.departAuth.show(treeKey);
          // },300)
          break
        case '3':
          let that = this
          this.dataList.map((item) => {
            if (item.id == treeKey) {
              this.$confirm({
                title: '提示',
                content: `是否对"${item.name}"进行删除`,
                okText: '是',
                okType: 'danger',
                cancelText: '否',
                onOk() {
                  deleteAction(that.url.delete, {
                    id: treeKey,
                  }).then((res) => {
                    if (res.success) {
                      that.$message.success(res.message)
                      that.getBMAll()
                    } else {
                      that.$message.warning(res.message)
                    }
                  })
                },
              })
            }
          })
          break
      }
      if (menuKey == 3) return
      // this.treeShow = true
    },
    TreeOk() {
      if (this.treeTitle == '新增') {
        this.TreeOk('', this.newTree, 'post')
      } else {
        this.TreeOk('', this.newTree, 'put')
      }
    },
    TreeOkurl(url, id, method) {
      getFileAccessHttpUrl(url, id, method).then((res) => {
        if (res.success) {
        }
      })
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys
      this.autoExpandParent = false
    },
    onChange(e) {
      const value = e.target.value
      const expandedKeys = this.dataList
        .map((item) => {
          if (item.name.indexOf(value) > -1) {
            return getParentKey(item.name, this.gData)
          }
          return null
        })
        .filter((item, i, self) => item && self.indexOf(item) === i)
      console.log(expandedKeys)
      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true,
      })
    },
  },
}
</script>
<style scoped>
@import '~@assets/less/common.less';

.all {
  width: 100%;
  height: 78vh;
  display: flex;
}

.all > div {
  height: 95%;
}

.left {
  width: 15%;
  min-width: 80px;
  padding: 10px 0px 10px 10px;
  border-right: 2px solid #ececec;
}
.resize {
  cursor: col-resize;
  float: left;
  position: relative;
  background-color: #d6d6d6;
  border-radius: 5px;
  width: 10px;
  height: 50px;
  background-size: cover;
  background-position: center;
  /*z-index: 99999;*/
  font-size: 32px;
  color: white;
}
.right {
  min-width: 600px;
  width: 85%;
  margin-left: 20px;
}

.bm {
  width: 100%;
  height: 95%;
  overflow: auto;
}

.top {
  width: 100%;
  height: 0%;
}

.bottom {
  width: 100%;
  height: 100%;
}
</style>
