# API 接口层

> HTTP 请求封装与接口定义

## 概述

API 层负责前端与后端服务的所有 HTTP 通信，基于 Axios 进行封装。

## 核心文件

| 文件 | 说明 |
|------|------|
| `api.js` | 核心请求封装，包含请求/响应拦截器 |
| `manage.js` | 业务管理相关接口 |
| `login.js` | 登录认证相关接口 |
| `GroupRequest.js` | 批量请求处理 |

## 请求配置

```js
// 基础配置
baseURL: process.env.VUE_APP_API_BASE_URL
timeout: 30000
```

## 使用示例

```js
import { getAction, postAction } from '@/api/manage'

// GET 请求
getAction('/user/list', { page: 1, size: 10 })

// POST 请求
postAction('/user/save', { name: '张三', age: 25 })
```

## 请求拦截器

- 自动添加 Token 认证头
- 处理请求参数序列化
- 统一错误处理

## 响应拦截器

- 统一响应格式处理
- Token 过期自动跳转登录
- 错误信息统一提示

## 相关链接

- [Axios 文档](https://axios-http.com/)
- [JeecgBoot 接口规范](http://www.jeecg.com/)
