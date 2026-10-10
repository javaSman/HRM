# Vuex 状态管理

> 全局状态存储与管理

## 概述

使用 Vuex 进行全局状态管理，实现跨组件数据共享和状态持久化。

## 目录结构

```
store/
├── index.js          # Store 入口
├── getters.js        # 全局 getters
├── mutation-types.js # Mutation 常量定义
└── modules/          # 模块化状态
    ├── user.js       # 用户状态
    ├── permission.js # 权限状态
    └── app.js        # 应用状态
```

## 核心状态

| 模块 | 状态 | 说明 |
|------|------|------|
| user | token, userInfo, name | 用户登录信息 |
| permission | menuList, permissions | 权限与菜单 |
| app | sidebar, device, theme | 应用配置 |

## 使用示例

```js
// 获取状态
this.$store.getters.userInfo
this.$store.state.user.name

// 提交 mutation
this.$store.commit('SET_TOKEN', token)

// 派发 action
this.$store.dispatch('GetUserInfo')
```

## 状态持久化

使用 `vue-ls` 实现关键状态持久化存储。

## 相关链接

- [Vuex 文档](https://vuex.vuejs.org/zh/)
