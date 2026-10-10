import { EDUCATION_LEVEL_OPTIONS } from '../../onboardingSupplement/supplementFields'
import { getFileAccessHttpUrl } from '@/api/manage'

const HTML_ESCAPE_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
}

function escapeHtml(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (character) => HTML_ESCAPE_MAP[character])
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== ''
}

function firstValue() {
  for (let index = 0; index < arguments.length; index++) {
    if (hasValue(arguments[index])) return arguments[index]
  }
  return ''
}

function asList(value) {
  return Array.isArray(value) ? value : []
}

function getHighestEducation(educationList) {
  if (!educationList || !educationList.length) return { xlcc: '', zy: '' }

  let highestIndex = -1
  let highestRecord = null

  for (const record of educationList) {
    if (!record || !record.xlcc) continue
    const index = EDUCATION_LEVEL_OPTIONS.findIndex((option) => option.value === record.xlcc)
    if (index > highestIndex) {
      highestIndex = index
      highestRecord = record
    }
  }

  return highestRecord ? { xlcc: highestRecord.xlcc, zy: highestRecord.zy || '' } : { xlcc: '', zy: '' }
}

function detailValue(detail, detailKey, mainKey) {
  return firstValue(detail.jbxx[detailKey], detail[mainKey])
}

function parseDateParts(value) {
  const match = /^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}))?/.exec(String(value || ''))
  if (!match) return { year: '', month: '', day: '', period: '' }
  return {
    year: match[1],
    month: match[2],
    day: match[3],
    period: match[4] === undefined ? '' : Number(match[4]) < 12 ? '上午' : '下午',
  }
}

function formatRange(start, end) {
  if (!hasValue(start) && !hasValue(end)) return ''
  const formatDate = (value) =>
    String(value || '')
      .split(/[ T]/)[0]
      .replace(/-/g, '.')
  return `${formatDate(start)}-${formatDate(end)}`
}

function formatSalary(value) {
  return hasValue(value) ? `${value}K` : ''
}

function renderRows(records, minimumRows, renderRecord, emptyRow) {
  if (records.length) return records.map(renderRecord).join('')
  return Array(minimumRows).fill(emptyRow).join('')
}

function buildResumeHtml(detail) {
  const jbxx = detail.jbxx
  const educationList = asList(detail.jyjl).filter(
    (record) =>
      record &&
      [record.rxsj, record.bysj, record.byyxjg, record.zypxnr, record.zy, record.zsbh, record.xw].some(hasValue)
  )
  const highestEducation = getHighestEducation(educationList)
  const workList = asList(detail.gzll)
  const familyList = asList(detail.jtcy)
  const relationList = asList(detail.gxsb)
  const spouse = familyList.find((item) => item && item.gx === '配偶') || {}
  const name = escapeHtml(detailValue(detail, 'name', 'xm'))
  const department = escapeHtml(firstValue(detail.dept_dictText, jbxx.dept, detail.dept))
  const post = escapeHtml(firstValue(detail.postId_dictText, detail.gwmc, jbxx.gwmc))
  const employeeNo = escapeHtml(detailValue(detail, 'no', 'gh'))
  const reportParts = parseDateParts(
    firstValue(jbxx.bdrq, jbxx.actualDate, detail.sjrzsj, jbxx.entryDate, detail.yjrzsj)
  )
  const phone = escapeHtml(detailValue(detail, 'phoneNumber', 'sjh'))
  const idCard = escapeHtml(detailValue(detail, 'idCard', 'sfzh'))
  const email = escapeHtml(detailValue(detail, 'email', 'yx'))
  const photoUrl = getFileAccessHttpUrl(String(jbxx.photo || '').split(',')[0])
  const photoCell = `<td class="photo-cell" rowspan="5">${
    photoUrl
      ? `<img class="photo-img" src="${escapeHtml(
          photoUrl
        )}" alt="照片" onload="window.__onPhotoReady&&window.__onPhotoReady()" onerror="window.__onPhotoReady&&window.__onPhotoReady()">`
      : '照片'
  }</td>`
  const educationRowCount = educationList.length || 2
  const educationRows = renderRows(
    educationList,
    2,
    (record) => `
    <tr><td class="date-range" colspan="2">${escapeHtml(
      formatRange(record.rxsj, record.bysj)
    )}</td><td colspan="2">${escapeHtml(record.byyxjg)}</td><td colspan="2">${escapeHtml(
      firstValue(record.zypxnr, record.zy)
    )}</td><td>${escapeHtml(firstValue(record.zsbh, record.xw))}</td></tr>`,
    '<tr class="empty-row"><td colspan="2">&nbsp;</td><td colspan="2">&nbsp;</td><td colspan="2">&nbsp;</td><td>&nbsp;</td></tr>'
  )
  const workRowCount = workList.length || 2
  const workRows = renderRows(
    workList,
    2,
    (record) => `
    <tr><td class="date-range" colspan="2">${escapeHtml(
      formatRange(record.zzqssj, record.zzjssj)
    )}</td><td>${escapeHtml(record.gzdw)}</td><td>${escapeHtml(
      [record.rzgw, record.lzyy].filter(hasValue).join(' / ')
    )}</td><td>${escapeHtml(formatSalary(record.jbnpjgz))}</td><td>${escapeHtml(record.zmrxm)}</td><td>${escapeHtml(
      record.zmrlxdh
    )}</td></tr>`,
    '<tr class="empty-row"><td colspan="2">&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td><td>&nbsp;</td></tr>'
  )
  const familyRowCount = familyList.length || 2
  const familyRows = renderRows(
    familyList,
    2,
    (record) => `
    <tr><td>${escapeHtml(record.xm)}</td><td>${escapeHtml(record.gx)}</td><td colspan="2">${escapeHtml(
      record.gzdw
    )}</td><td>${escapeHtml(record.zw)}</td><td colspan="2">${escapeHtml(record.lxdh)}</td></tr>`,
    '<tr class="empty-row"><td>&nbsp;</td><td>&nbsp;</td><td colspan="2">&nbsp;</td><td>&nbsp;</td><td colspan="2">&nbsp;</td></tr>'
  )
  const relationRowCount = relationList.length || 1
  const relationRows = renderRows(
    relationList,
    1,
    (record) => `
    <tr><td>${escapeHtml(record.xm)}</td><td>${escapeHtml(record.gx)}</td><td colspan="2">${escapeHtml(
      record.bm
    )}</td><td>${escapeHtml(record.gw)}</td><td colspan="2">${escapeHtml(record.lxdh)}</td></tr>`,
    '<tr class="empty-row"><td>&nbsp;</td><td>&nbsp;</td><td colspan="2">&nbsp;</td><td>&nbsp;</td><td colspan="2">&nbsp;</td></tr>'
  )

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>员工履历表 - ${name}</title>
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; }
    html, body { margin: 0; padding: 0; }
    body { font-family: SimSun, "Microsoft YaHei", serif; font-size: 10pt; line-height: 1.35; color: #000; background: #fff; }
    .resume-page { width: 190mm; margin: 0 auto; }
    @media screen {
      html, body { min-width: 210mm; }
      body { padding: 10mm; background: #f5f5f5; }
      .resume-page { background: #fff; }
    }
    @media print {
      html, body { width: 100%; min-width: 0; }
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .resume-page { width: auto; margin: 0; }
      tr { break-inside: avoid; page-break-inside: avoid; }
      .title, .note, .commit-cell { break-inside: avoid; page-break-inside: avoid; }
    }
    .title { text-align: center; font-size: 16pt; font-weight: bold; letter-spacing: 4px; padding: 0 0 3mm; border: none; }
    .top-bar-cell { padding: 1.2mm 2mm; font-size: 9pt; }
    .top-bar-left { font-weight: bold; text-align: left; }
    .hr-fill, .date-fill { display: flex; align-items: center; width: 100%; }
    .fill-label { white-space: nowrap; }
    .fill-center { text-align: center; }
    .fill-line { flex: 1; min-width: 6mm; height: 4mm; margin: 0 1.5mm; border-bottom: 1px solid #000; text-align: center; }
    .fill-line-dept { flex: 2; min-width: 20mm; }
    .fill-line-post { flex: 1.5; min-width: 12mm; }
    .fill-line-year { min-width: 11mm; }
    .date-fill .fill-line { min-width: 5mm; }
    .ampm { text-align: center; white-space: nowrap; }
    table { width: 100%; border-collapse: collapse; table-layout: fixed; }
    td, th { border: 1px solid #333; padding: 1.2mm 1.5mm; font-size: 9pt; line-height: 1.3; text-align: center; vertical-align: middle; overflow-wrap: anywhere; word-break: break-word; }
    .section-hdr { background: #f0f0f0; font-weight: bold; text-align: left; padding: 1.3mm 2mm; }
    .section-side { background: #f0f0f0; font-weight: bold; text-align: center; }
    .lbl { background: #fafafa; font-weight: bold; white-space: nowrap; }
    .lbl.wide { white-space: normal; }
    .date-range { font-size: 8pt; white-space: nowrap; overflow-wrap: normal; word-break: normal; }
    .photo-cell { position: relative; padding: 0; text-align: center; vertical-align: middle; color: #888; font-size: 9pt; overflow: hidden; }
    .photo-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: block; object-fit: fill; }
    .note { font-size: 8pt; color: #555; padding: 1mm 1.5mm; text-align: left; }
    .commit-cell { padding: 0; }
    .commit-box { display: flex; align-items: stretch; }
    .commit-label { display: flex; align-items: flex-start; justify-content: center; padding: 1.2mm 1.5mm; font-weight: bold;margin-left:20px; }
    .commit-content { flex: 1; padding: 1.2mm 1.5mm; font-size: 8.5pt; line-height: 1.6; text-align: left; }
    .sign { text-align: right; padding: 2mm 0 0; font-size: 8.5pt; border: none; }
  </style>
</head>
<body>
<div class="resume-page">
  <table class="basic-table">
    <colgroup><col style="width: 11%"><col style="width: 12%"><col style="width: 10%"><col style="width: 19%"><col style="width: 13%"><col style="width: 12%"><col style="width: 10%"><col style="width: 13%"></colgroup>
    <tr><td class="title" colspan="8">员工履历表</td></tr>
    <tr><td class="top-bar-cell top-bar-left" colspan="8">入职者资料（人事部门填写）</td></tr>
    <tr>
      <td colspan="4"><div class="hr-fill"><span class="fill-label">部门：</span><span class="fill-line fill-line-dept">${department}</span><span class="fill-label">岗位：</span><span class="fill-line fill-line-post">${post}</span><span class="fill-label">工号：</span><span class="fill-line">${employeeNo}</span></div></td>
      <td><div class="fill-center">报到日期</div></td>
      <td colspan="2"><div class="date-fill"><span class="fill-line fill-line-year">${
        reportParts.year
      }</span>年<span class="fill-line">${reportParts.month}</span>月<span class="fill-line">${
    reportParts.day
  }</span>日</div></td>
      <td class="ampm">${reportParts.period}</td>
    </tr>
    <tr><td class="section-hdr" colspan="8">个人基本信息资料（以下由入职者填写）</td></tr>
    <tr><td class="lbl">姓名</td><td>${name}</td><td class="lbl">性别</td><td>${escapeHtml(
    jbxx.gender
  )}</td><td class="lbl">民族</td><td colspan="2">${escapeHtml(jbxx.mz)}</td>${photoCell}</tr>
    <tr><td class="lbl">最高学历</td><td>${escapeHtml(
      highestEducation.xlcc
    )}</td><td class="lbl">专业</td><td>${escapeHtml(
    highestEducation.zy
  )}</td><td class="lbl">职称</td><td colspan="2"></td></tr>
    <tr><td class="lbl">籍贯</td><td>${escapeHtml(
      jbxx.jg
    )}</td><td class="lbl">户籍性质</td><td colspan="4">${escapeHtml(jbxx.hjxz)}</td></tr>
    <tr><td class="lbl">政治面貌</td><td>${escapeHtml(
      jbxx.zzmm
    )}</td><td class="lbl">手机号码</td><td>${phone}</td><td class="lbl">电子邮箱</td><td colspan="2">${email}</td></tr>
    <tr><td class="lbl">健康状况</td><td>${escapeHtml(
      jbxx.jkzk
    )}</td><td class="lbl">以往病史</td><td colspan="4">${escapeHtml(jbxx.ywbs)}</td></tr>
    <tr><td class="lbl">身份证号码</td><td colspan="2">${idCard}</td><td class="lbl wide" colspan="4">是否存在竞业限制协议</td><td >${escapeHtml(
    jbxx.sfczjyxzxy
  )}</td></tr>
    <tr><td class="lbl">居住地址</td><td colspan="3">${escapeHtml(
      firstValue(jbxx.zzdz, jbxx.jzd, jbxx.address)
    )}</td><td class="lbl wide">户籍地址</td><td colspan="3">${escapeHtml(jbxx.hjdz)}</td></tr>
    <tr><td class="lbl">兴趣爱好</td><td colspan="7">${escapeHtml(jbxx.xqah)}</td></tr>
    <tr><td class="note" colspan="8">*公积金情况勾选“未在本市开户或已提取销户”且勾选“已婚”者，配偶信息为必填；勾选“已有本市公积金账号”者，公积金账号为必填</td></tr>
 <tr><td class="note" colspan="8">*查询社保电脑号：微信公众号“本市社保”-便民服务-个人业务办理-登录-个人信息查询-个人参保信息查询-电脑号（9位纯数字）</td></tr>
 <tr><td class="note" colspan="8">*查询公积金账号：微信登录小程序粤省事-搜索公积金-进入公积金服务主页-我的信息-账号（11位纯数字）</td></tr>
    <tr><td class="lbl">社保情况</td><td colspan="3">${escapeHtml(
      firstValue(jbxx.sbqk, jbxx.socialSecurityStatus)
    )}</td><td class="lbl wide">社保账号</td><td colspan="3">${escapeHtml(jbxx.sbdnh)}</td></tr>
    <tr><td class="lbl">公积金情况</td><td colspan="3">${escapeHtml(
      firstValue(jbxx.gjjqk, jbxx.accumulationFundStatus)
    )}</td><td class="lbl wide">公积金账号</td><td colspan="3">${escapeHtml(jbxx.gjjdhh)}</td></tr>
    <tr><td class="lbl">工资卡银行</td><td colspan="3">${escapeHtml(
      jbxx.gzkyh
    )}</td><td class="lbl wide">银行卡号</td><td colspan="3">${escapeHtml(jbxx.gzkyhkh)}</td></tr>
    <tr><td class="lbl">婚姻状况</td><td>${escapeHtml(jbxx.hyzk)}</td><td class="lbl">配偶姓名</td><td>${escapeHtml(
    spouse.xm
  )}</td><td  colspan="2" class="lbl wide">配偶证件号</td><td colspan="2"></td></tr>
    <tr><td  rowspan="${
      educationRowCount + 1
    }">教育/培训经历</td><td colspan="2">起止时间</td><td colspan="2">学校/培训机构</td><td colspan="2">专业/培训内容</td><td>获得何种证书</td></tr>
    ${educationRows}
    <tr><td  rowspan="${
      workRowCount + 1
    }">工作/社会实践经历</td><td colspan="2">起止时间</td><td>工作单位</td><td>岗位/离职原因</td><td>工资</td><td>证明人</td><td>联系电话</td></tr>
    ${workRows}
    <tr><td  rowspan="${
      familyRowCount + 1
    }">家庭成员及紧急联系人</td><td>姓名</td><td>关系</td><td colspan="2">工作单位</td><td>职务</td><td colspan="2">联系电话</td></tr>
    ${familyRows}
    <tr><td  rowspan="${
      relationRowCount + 1
    }">与本公司关联关系申报</td><td>关联人姓名</td><td>关联关系</td><td colspan="2">所在部门</td><td>担任何岗</td><td colspan="2">联系电话</td></tr>
    ${relationRows}
    <tr><td class="commit-cell" colspan="8">
      <div class="commit-box">
        <div class="commit-label">承诺</div>
        <div class="commit-content">
          1、本人承诺以上填写内容属实，除需接受公司调查，如有隐瞒不实，一经查出愿接受公司按《员工手册》及人事管理制度的处理，直至解除劳动合同，并不追讨任何经济补偿。<br>
          2、本人承诺提供的证件有效、真实，如证件虚假、不实，一经查出愿因证件不真实而造成的一切后果，概由本人承担，愿意接受除名处分，并不追究任何责任。<br>
          3、在正式报到之日起，本人与原服务单位解除/终止劳动关系，如因未发生的一切法律责任与纠纷，由本人全部承担。
          <div style="margin-left:50%;">
            <div>本人已阅读：</div>
            <div>日期：&nbsp;&nbsp;&nbsp;年&nbsp;&nbsp;&nbsp;月&nbsp;&nbsp;&nbsp;日</div>
          </div>
        </div>
      </div>
    </td></tr>
   
  </table>
</div>
</body>
</html>`
}

export function printOnboardingResume(detail, printWindow) {
  if (!printWindow || printWindow.closed) return false

  let started = false
  const startPrint = () => {
    if (started || printWindow.closed) return
    started = true
    printWindow.focus()
    printWindow.print()
  }

  const hasPhoto = Boolean(String(firstValue(detail.jbxx && detail.jbxx.photo) || '').split(',')[0])
  // 写入前先挂好回调，图片（含缓存同步触发的情况）加载完成立即打印
  if (hasPhoto) {
    printWindow.__onPhotoReady = startPrint
    setTimeout(startPrint, 3000) // 兜底：网络异常不响应时最多等 3 秒
  }

  printWindow.document.open()
  printWindow.document.write(buildResumeHtml(detail))
  printWindow.document.close()

  if (!hasPhoto) startPrint()
  return true
}
