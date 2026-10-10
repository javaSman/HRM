####1._util包:存放自定义函数 详细见代码注释
####2.AvatarList:显示头像群并支持tip，用法参考src\views\Home.vue（如下图）
![输入图片说明](https://static.oschina.net/uploads/img/201904/12181253_O0Xi.png "在这里输入图片标题")
####3.chart包:存放各种图表相关的组件,条形图柱形图折线图等等 具体用法参考首页
####4.countDown包:一个倒计时组件，用法参考home页,简单描述,该组件有3个属性,
target(时间/毫秒数)必填，
format(function,该方法接收一个毫秒数的参数,用于格式化显示当前倒计时时间)非必填,
onEnd倒计时结束触发函数
![输入图片说明](https://static.oschina.net/uploads/img/201904/12182046_mwqJ.png "在这里输入图片标题")
####5.dict包：数据字典专用，用法参考文件夹下readme文件
####6.Ellipsis包：字符串截取组件,可以指定字符串的显示长度,并将全部内容显示到tip中,简单使用参考src\views\system\PermissionList.vue
####7.jeecg包：该包下自定义了很多列表/表单中用到的组件 参考包下readme文件
####8.jeecgbiz包：该包下定义了一些业务相关的组件，比如选择用户弹框,根据部门选择用户等等
####9.layouts+page包：系统页面布局相关组件，比如登陆进去之后页面顶部显示什么，底部显示什么，菜单点击触发多个tab的布局等等 一般情况不需要修改
####10.menun包：菜单组件，俩个，一个折叠菜单一个正常显示的菜单
####11.NumberInfo:数字信息显示组件 如下图
![输入图片说明](https://static.oschina.net/uploads/img/201904/12185858_uvJ5.png "在这里输入图片标题")
####12.online包：该包下封装了online表单的相关组件,用于展示表单各种控件,验证表单等等,相关用法参考readme
####13.setting包：该包下封装了首页风格切换等功能如下图
![输入图片说明](https://static.oschina.net/uploads/img/201904/12190520_jySG.png "在这里输入图片标题")
####14.table包：一个二次封装的table组件,用于展示列表，参考readme
####15.tools包：
Breadcrumb.vue：面包屑二次封装,支持路由跳转
DetailList.vue：详情展示用法参考src\views\profile\advanced\Advanced.vue(效果如下图)
![输入图片说明](https://static.oschina.net/uploads/img/201904/12193954_Uar6.png "在这里输入图片标题")
````
个人认为该页面代码有两点值得学习：
1.vue provide/inject的使用
2.该页面css定义方式,只定义一个顶层class,其余样式都定义在其下,这样只要顶层class不和别的页面冲突,整个页面的样式都是唯一生效的
````
FooterToolBar.vue:fixed定位的底部，通过是否定义内部控件的属性slot="extra"决定是左浮动或是右浮动
HeaderNotice.vue:首页通知(如下图)
![输入图片说明](https://static.oschina.net/uploads/img/201904/12195340_fPe0.png "在这里输入图片标题")
HeaderInfo.vue:上下文字布局（如下图）
![输入图片说明](https://static.oschina.net/uploads/img/201904/12195638_dG5o.png "在这里输入图片标题")
Logo.vue:首页左上侧的log图
![输入图片说明](https://static.oschina.net/uploads/img/201904/12200908_ihv3.png "在这里输入图片标题")
UserMenu.vue:首页右上侧的内容
![输入图片说明](https://static.oschina.net/uploads/img/201904/12201226_laQK.png "在这里输入图片标题")
####16.trend包 趋势显示组件（如下图）
![输入图片说明](https://static.oschina.net/uploads/img/201904/12201600_Wo8K.png "在这里输入图片标题")
![cron表达式](https://oscimg.oschina.net/oscnet/661f9ac09016395f9f49286143af3241623.jpg)
![cron控件添加清除按钮](https://oscimg.oschina.net/oscnet/15096e49f2e29bd829e304d56770025d03c.jpg)

####17.common包：通用业务组件
##### ColumnConfigSidebar.vue - 表格字段配置侧边栏

**功能说明：**
用于表格列的个性化配置，支持显示/隐藏列、拖拽排序。配置数据持久化保存到后端，不同用户独立配置。

**使用效果：**
点击"字段配置"按钮，右侧弹出侧边栏，可勾选显示/隐藏列，拖拽调整顺序。

**使用步骤：**

###### 1. 引入组件和Mixin
```javascript
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'

export default {
  mixins: [columnConfigMixin],
  components: { ColumnConfigSidebar },
  // ...
}
```

###### 2. 在data中设置columnCode
```javascript
data() {
  return {
    columnCode: 'YourComponentCode', // 组件唯一标识，用于区分不同页面的配置
    // 原始列定义（不含操作列）
    originalColumns: [
      { title: '姓名', dataIndex: 'name', width: 100 },
      { title: '年龄', dataIndex: 'age', width: 80 },
      // ...
    ],
  }
}
```

###### 3. 在computed中定义相关计算属性
```javascript
computed: {
  // 字段标题映射
  fieldTitleMap() {
    const map = {}
    this.originalColumns.forEach(col => {
      if (col.dataIndex && col.title) {
        map[col.dataIndex] = col.title
      }
    })
    return map
  },
  // 最终显示的列（应用配置后）
  columns() {
    const fixedColumns = [
      { title: '操作', dataIndex: 'action', align: 'center', fixed: 'right', width: 200, scopedSlots: { customRender: 'action' } }
    ]
    return this.applyColumnConfig(this.originalColumns, { fixedColumns })
  },
  // 配置数据（供侧边栏使用）
  columnConfigNew() {
    return this.getColumnConfigData()
  },
}
```

###### 4. 在template中添加按钮和组件
```html
<!-- 字段配置按钮 -->
<a-button class="pm-btn-config" icon="setting" @click="toggleColumnConfig">字段配置</a-button>

<!-- 字段配置侧边栏 -->
<column-config-sidebar
  :visible="columnConfigVisible"
  :allColumns="columnConfigNew"
  :fieldTitleMap="fieldTitleMap"
  @close="columnConfigVisible = false"
  @confirm="handleColumnConfigConfirm"
/>
```

**完整示例：**

```vue
<template>
  <div>
    <!-- 操作按钮区域 -->
    <div class="table-operator">
      <a-button type="primary" icon="plus" @click="handleAdd">新增</a-button>
      <a-button class="pm-btn-config" icon="setting" @click="toggleColumnConfig">字段配置</a-button>
    </div>

    <!-- 表格 -->
    <a-table :columns="columns" :dataSource="dataSource" />

    <!-- 字段配置侧边栏 -->
    <column-config-sidebar
      :visible="columnConfigVisible"
      :allColumns="columnConfigNew"
      :fieldTitleMap="fieldTitleMap"
      @close="columnConfigVisible = false"
      @confirm="handleColumnConfigConfirm"
    />
  </div>
</template>

<script>
import ColumnConfigSidebar from '@comp/common/ColumnConfigSidebar.vue'
import { columnConfigMixin } from '@/mixins/columnConfigMixin'

export default {
  name: 'ExampleList',
  mixins: [columnConfigMixin],
  components: { ColumnConfigSidebar },
  data() {
    return {
      columnCode: 'ExampleList',
      originalColumns: [
        { title: '姓名', dataIndex: 'name', width: 100 },
        { title: '年龄', dataIndex: 'age', width: 80 },
        { title: '性别', dataIndex: 'gender', width: 80 },
      ],
      dataSource: [],
    }
  },
  computed: {
    fieldTitleMap() {
      const map = {}
      this.originalColumns.forEach(col => {
        if (col.dataIndex && col.title) {
          map[col.dataIndex] = col.title
        }
      })
      return map
    },
    columns() {
      const fixedColumns = [
        { title: '操作', dataIndex: 'action', align: 'center', fixed: 'right', width: 200, scopedSlots: { customRender: 'action' } }
      ]
      return this.applyColumnConfig(this.originalColumns, { fixedColumns })
    },
    columnConfigNew() {
      return this.getColumnConfigData()
    },
  },
}
</script>
```

**注意事项：**
1. `columnCode` 必须唯一，用于区分不同页面的配置
2. `originalColumns` 不应包含操作列，操作列通过 `fixedColumns` 传入
3. 配置数据会自动保存到后端，刷新页面后配置仍然生效
4. 支持搜索字段、全选/全不选、拖拽排序功能

**API接口：**
- 获取配置：`GET /hr_field_config/hrFieldConfig/queryBySysUserId?sysUserId={userId}&fieldCompent={columnCode}`
- 保存配置：`POST /hr_field_config/hrFieldConfig/editBatch`