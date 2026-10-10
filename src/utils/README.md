# 工具函数库

> 通用工具函数与帮助方法

## 概述

utils 目录存放项目通用的工具函数，提供常用的数据处理、格式化、验证等功能。

## 核心工具

| 文件 | 功能 |
|------|------|
| `util.js` | 通用工具函数 |
| `filter.js` | Vue 过滤器 |
| `auth.js` | 认证相关工具 |
| `request.js` | 请求工具 |
| `validate.js` | 表单验证规则 |
| `pick.js` | 对象属性拾取 |

## 常用函数

### 日期处理

```js
import { formatDate } from '@/utils/util'

formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')
```

### 数据验证

```js
import { validateEmail, validatePhone } from '@/utils/validate'

validateEmail('test@example.com') // true
```

### 文件下载

```js
import { downloadFile } from '@/utils/util'

downloadFile(url, filename)
```

## 扩展工具

- 字典数据处理
- 权限校验
- 加密解密
- 防抖节流

## 相关链接

- [Lodash 文档](https://lodash.com/)
