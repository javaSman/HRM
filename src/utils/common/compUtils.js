// import { useGlobSetting } from '/@/hooks/setting';
import { merge, random } from 'lodash-es';
// import { isArray } from '/@/utils/is';
import Vue from "vue";
// import { getTenantId, getToken } from "/@/utils/auth";
// import { useUserStoreWithOut } from "/@/store/modules/user";
import dayjs from 'dayjs';

import { Modal } from "ant-design-vue";
// import { defHttp } from "@/utils/http/axios";
// import { useI18n } from "@/hooks/web/useI18n";
import { getAction } from '@api/manage'
import { ACCESS_TOKEN } from '@/store/mutation-types'

// const globSetting = useGlobSetting();
const baseApiUrl = window._CONFIG['staticDomainURL'];

export const getFileAccessHttpUrl = (fileUrl, prefix = 'http') => {
  let result = fileUrl;
  try {
    if (fileUrl && fileUrl.length > 0 && !fileUrl.startsWith(prefix)) {
      let isArray = fileUrl.indexOf('[') != -1;
      if (!isArray) {
        let prefix = `${baseApiUrl}/sys/common/static/`;
        if (!fileUrl.startsWith(prefix)) {
          result = `${prefix}${fileUrl}`;
        }
      }
    }
  } catch (err) {}
  return result;
};

export function useUserStoreWithOut(){
  return {};
}

export function triggerWindowResizeEvent() {
  let event = document.createEvent('HTMLEvents');
  event.initEvent('resize', true, true);
  event.eventType = 'message';
  window.dispatchEvent(event);
}

export const getRandom = (length = 1) => {
  return '-' + parseInt(String(Math.random() * 10000 + 1), length);
};

export function randomString(length, chats) {
  if (!length) length = 1;
  if (!chats) {
    chats = '0123456789qwertyuioplkjhgfdsazxcvbnm';
  }
  let str = '';
  for (let i = 0; i < length; i++) {
    let num = random(0, chats.length - 1);
    str += chats[num];
  }
  return str;
}

export const listToTree = (array, opt, startPid) => {
  const obj = {
    primaryKey: opt.primaryKey || 'key',
    parentKey: opt.parentKey || 'parentId',
    titleKey: opt.titleKey || 'title',
    startPid: opt.startPid || '',
    currentDept: opt.currentDept || 0,
    maxDept: opt.maxDept || 100,
    childKey: opt.childKey || 'children',
  };
  if (startPid) {
    obj.startPid = startPid;
  }
  return toTree(array, obj.startPid, obj.currentDept, obj);
};

export const toTree = (array, startPid, currentDept, opt) => {
  if (opt.maxDept < currentDept) {
    return [];
  }
  let child = [];
  if (array && array.length > 0) {
    child = array
      .map((item) => {
        if (typeof item[opt.parentKey] !== 'undefined' && item[opt.parentKey] === startPid) {
          const nextChild = toTree(array, item[opt.primaryKey], currentDept + 1, opt);
          if (nextChild.length > 0) {
            item['isLeaf'] = false;
            item[opt.childKey] = nextChild;
          } else {
            item['isLeaf'] = true;
          }
          item['title'] = item[opt.titleKey];
          item['label'] = item[opt.titleKey];
          item['key'] = item[opt.primaryKey];
          item['value'] = item[opt.primaryKey];
          return item;
        }
      })
      .filter((item) => {
        return item !== undefined;
      });
  }
  return child;
};

export function mapTableTotalSummary(tableData, fieldKeys) {
  let totals = { _row: '合计', _index: '合计' };
  fieldKeys.forEach((key) => {
    totals[key] = tableData.reduce((prev, next) => {
      const value = Number(next[key]);
      if (!Number.isNaN(value)) {
        prev += value;
      }
      return prev;
    }, 0);
  });
  return totals;
}

export function simpleDebounce(fn, delay = 100) {
  let timer = null;
  return function () {
    let args = arguments;
    if (timer) {
      clearTimeout(timer);
    }
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}

export function dateFormat(date, block) {
  if (!date) {
    return '';
  }
  let format = block || 'yyyy-MM-dd';
  date = new Date(date);
  const map = {
    M: date.getMonth() + 1,
    d: date.getDate(),
    h: date.getHours(),
    m: date.getMinutes(),
    s: date.getSeconds(),
    q: Math.floor((date.getMonth() + 3) / 3),
    S: date.getMilliseconds(),
  };
  format = format.replace(/([yMdhmsqS])+/g, (all, t) => {
    let v = map[t];
    if (v !== undefined) {
      if (all.length > 1) {
        v = `0${v}`;
        v = v.substr(v.length - 2);
      }
      return v;
    } else if (t === 'y') {
      return date
        .getFullYear()
        .toString()
        .substr(4 - all.length);
    }
    return all;
  });
  return format;
}

export function getEventPath(event) {
  let target = event.target;
  let path = (event.composedPath && event.composedPath()) || event.path;

  if (path != null) {
    return path.indexOf(window) < 0 ? path.concat(window) : path;
  }

  if (target === window) {
    return [window];
  }

  let getParents = (node, memo) => {
    const parentNode = node.parentNode;
    if (!parentNode) {
      return memo;
    } else {
      return getParents(parentNode, memo.concat(parentNode));
    }
  };
  return [target].concat(getParents(target, []), window);
}

export function pushIfNotExist(array, value, key) {
  for (let item of array) {
    if (key && item[key] === value[key]) {
      return false;
    } else if (item === value) {
      return false;
    }
  }
  array.push(value);
  return true;
}

export function filterObj(obj) {
  if (!(typeof obj == 'object')) {
    return;
  }
  for (let key in obj) {
    if (obj.hasOwnProperty(key) && (obj[key] == null || obj[key] == undefined || obj[key] === '')) {
      delete obj[key];
    }
  }
  return obj;
}

export function underLine2CamelCase(string) {
  return string.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

export function findTree(treeList, fn, childrenKey = 'children') {
  for (let i = 0; i < treeList.length; i++) {
    let item = treeList[i];
    if (fn(item, i, treeList)) {
      return item;
    }
    let children = item[childrenKey];
    if (isArray(children)) {
      let findResult = findTree(children, fn, childrenKey);
      if (findResult) {
        return findResult;
      }
    }
  }
  return null;
}

export function bindMapFormSchema(spanMap, spanTypeDef) {
  return function (s, spanType = spanTypeDef) {
    return merge(
      {
        disabledLabelWidth: true,
      },
      spanMap[spanType],
      s
    );
  };
}

export function stringIsNull(str) {
  return str == null || str === 'null' || str === 'undefined';
}

export function getAutoScrollContainer(node) {
  let element = node;
  while (element != null) {
    if (element.classList.contains('scrollbar__view')) {
      if (element.clientHeight < element.scrollHeight) {
        return node.parentElement;
      } else {
        return document.body;
      }
    } else {
      element = element.parentElement;
    }
  }
  return node.parentElement;
}

export function checkChildrenHidden(menuTreeItem) {
  let alwaysShow = menuTreeItem.alwaysShow;
  if (alwaysShow) {
    return false;
  }
  if (!menuTreeItem.children) {
    return false;
  }
  return menuTreeItem.children && menuTreeItem.children.find((item) => item.hideMenu == false) != null;
}

export function calculateFileSize(fileSize, unit) {
  let unitArr = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  if (unit && unit.length > 0) {
    unitArr = unit;
  }
  let size = fileSize;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < unitArr.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  size = Math.round(size * 100) / 100;
  return size + unitArr[unitIndex];
}

export function getHeaders() {
  let tenantId = getTenantId();
  // return reactive();
  return Vue.observable(  {
    'X-Access-Token': getToken(),
    'X-Tenant-Id': tenantId ? tenantId : '0',
  })

}

export function getUserInfoByExpression(expression) {
  if (!expression) {
    return expression;
  }
  if (expression === 'sys_date' || expression === 'sysDate') {
    return dayjs().format('YYYY-MM-DD');
  }
  if (expression === 'sys_time' || expression === 'sysTime') {
    return dayjs().format('HH:mm:ss');
  }
  const userStore = useUserStoreWithOut();
  let userInfo = userStore.getUserInfo;
  if (userInfo) {
    switch (expression) {
      case 'sysUserId':
        return userInfo.id;
      case 'sysUserCode':
      case 'sys_user_code':
        return userInfo.username;
      case 'sysUserName':
        return userInfo.realname;
      case 'sysOrgCode':
      case 'sys_org_code':
        return userInfo.orgCode;
    }
  }
  return expression;
}

export function replaceUserInfoByExpression(expression) {
  if (!expression) {
    return expression;
  }
  const isString = typeof expression === 'string';
  const isArray = Array.isArray(expression);
  if (!isString && !isArray) {
    return expression;
  }
  const reg = /#{(.*?)}/g;
  const replace = (str) => {
    if (typeof str !== 'string') {
      return str;
    }
    let result = str.match(reg);
    if (result && result.length > 0) {
      result.forEach((item) => {
        let userInfo = getUserInfoByExpression(item.substring(2, item.length - 1));
        str = str.replace(item, userInfo);
      });
    }
    return str;
  };
  return isString ? replace(expression) : expression.map(replace);
}

export async function userExitChangeLoginTenantId(tenantId) {
  const userStore = useUserStoreWithOut();
  const url = '/sys/tenant/getCurrentUserTenant';
  let currentTenantId = null;
  const data = await getAction(url)
  if (data && data.list) {
    let arr = data.list;
    if (arr.length > 0) {
      let filterTenantId = arr.filter((item) => item.id == tenantId);
      if (filterTenantId && filterTenantId.length > 0) {
        currentTenantId = tenantId;
      } else {
        currentTenantId = arr[0].id;
      }
    }
  }
  let loginTenantId = getTenantId();
  userStore.setTenant(currentTenantId);
  if (!currentTenantId || tenantId == loginTenantId) {
    window.location.reload();
  }
}

export function tenantSaasMessage(title) {
  let tenantId = getTenantId();
  if (!tenantId) {
    Modal.confirm({
      title: title,
      content: '此菜单需要在多租户模式下使用，否则数据会出现混乱',
      okText: '确认',
      okType: 'danger',
      cancelButtonProps: { style: { display: 'none' } },
    });
  }
}

export function sameDay(dateStr) {
  if (!dateStr) {
    return false;
  }
  let currentDate = new Date();
  let currentDay = currentDate.getDate();
  let currentMonth = currentDate.getMonth();
  let currentYear = currentDate.getFullYear();

  let otherDate = new Date(dateStr);
  let otherDay = otherDate.getDate();
  let otherMonth = otherDate.getMonth();
  let otherYear = otherDate.getFullYear();

  if (currentDay === otherDay && currentMonth === otherMonth && currentYear === otherYear) {
    return true;
  } else {
    return false;
  }
}

export function translateTitle(data) {
  if (data && data.length) {
    // const { t } = useI18n();
    let t=null;
    data.forEach((item) => {
      if (item.slotTitle) {
        if (item.slotTitle.includes("t('") && t) {
          item.slotTitle = new Function('t', `return ${item.slotTitle}`)(t);
        }
      }
      if (item.children && item.children.length) {
        translateTitle(item.children);
      }
    });
  }
  return data;
}

export function freezeDeep(obj) {
  if (obj != null) {
    if (Array.isArray(obj)) {
      obj.forEach((item) => freezeDeep(item));
    } else if (typeof obj === 'object') {
      Object.values(obj).forEach((value) => {
        freezeDeep(value);
      });
    }
    Object.freeze(obj);
  }
  return obj;
}


export function isArray(val) {
  return val && Array.isArray(val);
}

/**
 * 获取租户id
 */
export function getTenantId() {
  return "1";
}
export function getToken() {
  return Vue.ls.get(ACCESS_TOKEN);
}