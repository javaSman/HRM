<template>
    <!--
    ApprovalTimeline.vue
    审批流程时间轴组件（调动申请，与加班申请版统一）
    用途：在抽屉、表单等场景中复用
    Props:
      - applyId: 主表ID，用于获取审批日志
      - LCdata: 详情数据（customProcessSqdSpjdList 审批节点）
  -->
    <div class="approval-timeline-wrapper">
        <!-- 空数据提示 -->
        <a-empty v-if="!logData || logData.length == 0" description="暂无审批记录" />

        <!-- 时间轴 -->
        <div class="log-timeline" v-else>
            <div class="log-node" v-for="(group, index) in groupedLog" :key="index">
                <!-- 时间线左侧：节点 + 连接线 -->
                <div class="log-node-track">
                    <div class="log-node-dot" :class="'log-dot-' + getNodeState(group)">
                        <a-icon v-if="getNodeState(group) == 'completed'" type="check" class="log-dot-icon" />
                        <a-icon v-else-if="getNodeState(group) == 'copied'" type="copy" class="log-dot-icon" />
                        <a-icon v-else-if="getNodeState(group) == 'rejected'" type="close" class="log-dot-icon" />
                        <span v-else-if="getNodeState(group) == 'processing'" class="log-dot-inner"></span>
                    </div>
                    <div v-if="index !== groupedLog.length - 1" class="log-node-line"
                        :style="{ backgroundColor: getStateColor(getNodeState(group)) }"></div>
                </div>

                <!-- 时间线右侧：内容卡片 -->
                <div class="log-node-card">
                    <!-- 节点标题行 -->
                    <div class="log-card-header">
                        <span class="log-role-name">{{ group.status }}</span>
                        <a-tag v-if="group.approvalRule === '1' || group.approvalRule === 1" color="orange" class="log-rule-tag">会签</a-tag>
                        <a-tag v-if="group.approvalRule === '2' || group.approvalRule === 2" color="red" class="log-rule-tag">或签</a-tag>
                        <a-tag v-if="!isApplicantNode(group) && !isCcGroup(group)"
                            :color="getStateTagColor(getNodeState(group))" class="log-state-tag">
                            {{ getStateTagText(getNodeState(group)) }}
                        </a-tag>
                    </div>

                    <!-- 审批人列表（仅当存在 approver 时渲染） -->
                    <div class="log-card-body" v-if="group.approvers.length > 0">
                        <!-- 申请人节点 -->
                        <template v-if="isApplicantNode(group)">
                            <div class="approver-row">
                                <div class="approver-avatar avatar-applicant">
                                    {{ getAvatarText(group.approvers[0].sprName) }}
                                </div>
                                <div class="approver-info applicant-info">
                                    <div class="approver-name">{{ group.approvers[0].sprName }}</div>
                                    <div class="applicant-opinion" v-if="group.approvers[0].spOpinion">
                                        审批意见：{{ group.approvers[0].spOpinion }}
                                    </div>
                                </div>
                                <div class="approver-result">
                                    <div class="approver-result-text spStatus-pass">
                                        <a-icon type="check-square" class="result-icon" />
                                        <span>已提交</span>
                                    </div>
                                    <div class="approver-result-time" v-if="group.approvers[0].spCreateTime">
                                        {{ formatTime(group.approvers[0].spCreateTime) }}
                                    </div>
                                </div>
                            </div>
                        </template>

                        <!-- 审批/抄送节点：每个审批人单独一行（姓名+状态 / 工号+审批时间 / 审批意见） -->
                        <template v-else>
                            <div v-for="(approver, aIdx) in getGroupApprovers(group)"
                                :key="(approver.sprId || '') + '-' + (approver.sprName || approver.csrName) + '-' + aIdx" class="approver-item">
                                <!-- 头像（按本人审批结果着色） -->
                                <div class="approver-avatar" :class="getAvatarClass(approver)">
                                    {{ getAvatarText(approver.sprName || approver.csrName) }}
                                </div>

                                <!-- 审批人信息 -->
                                <div class="approver-info">
                                    <!-- 第一行：姓名 + 审批状态 -->
                                    <div class="approver-head">
                                        <span class="approver-name">{{ approver.sprName || approver.csrName }}</span>
                                        <span class="approver-status" :class="'spStatus-' + getResultState(approver)">
                                            <a-icon v-if="getResultState(approver) == 'pass'" type="check-circle"
                                                theme="filled" class="result-icon" />
                                            <a-icon v-else-if="getResultState(approver) == 'reject'" type="close-circle"
                                                theme="filled" class="result-icon" />
                                            {{ getSingleResultText(approver) }}
                                        </span>
                                    </div>
                                    <!-- 第二行：工号 + 审批时间（审批完成后展示） -->
                                    <div class="approver-sub">
                                        <span class="approver-no" v-if="getApproverNo(approver, aIdx)">工号 {{ getApproverNo(approver, aIdx) }}</span>
                                        <span class="approver-time" v-if="showApproverTime(approver, aIdx)">
                                            {{ getApproverTime(approver, aIdx) }}
                                        </span>
                                    </div>
                                    <!-- 第三行：审批意见（有才显示） -->
                                    <div class="approver-opinion" v-if="getApproverOpinion(approver, aIdx)">
                                        {{ getApproverOpinion(approver, aIdx) }}
                                    </div>
                                </div>
                            </div>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
/**
 * 审批流程时间轴组件（调动申请，与加班申请版统一）
 * 数据来源：LCdata.customProcessSqdSpjdList
 */
export default {
    name: 'MobilizeApprovalTimeline',
    props: {
        /**
         * 主表ID（申请单ID）
         */
        applyId: {
            type: String,
            default: null
        },
        LCdata: { type: Object, default: () => ({}) }
    },
    data() {
        return {
            // 审批日志数据
            logData: []
        }
    },
    watch: {
        /**
         * applyId 与 LCdata 任一到达/变化都重建时间轴（详情数据可能异步传入）
         */
        applyId: {
            handler() {
                this.buildLogData()
            },
            immediate: true
        },
        LCdata: {
            handler() {
                this.buildLogData()
            },
            immediate: true,
            deep: true
        }
    },
    computed: {
        /**
         * 按 nodeName 分组渲染
         * - 同一 nodeName 的多个 approver 合并为同一张卡片（如部门审批会签）
         */
        groupedLog() {
            const groups = [];
            (this.logData || []).forEach((item) => {
                const existing = groups.find(g => g.status == item.nodeName)
                if (existing) {
                    existing.approvers.push(item)
                } else {
                    groups.push({
                        status: item.nodeName,
                        approvalRule: item.approvalRule,
                        nodeProperties: item.nodeProperties,
                        isApplicant: item.isApplicant,
                        approvers: [item]
                    })
                }
            })
            return groups
        }
    },
    methods: {
        /**
         * 组装审批日志数据（全部取自 LCdata，applyId/LCdata 变化时调用）
         */
        buildLogData() {
            const d = this.LCdata
            if (!d) {
                this.logData = []
                return
            }
            const applicantName = d.xm || d.empName || d.name || d.createBy || d.fqr || ''
            const applicantTime = d.applyTime || d.createTime || ''

            const recordList = d.customProcessSqdSpjdList
            if (recordList && Array.isArray(recordList) && recordList.length > 0) {
                // 将每个节点拍平成「一人一行」：节点上的 sprId/sprName 可能是逗号分隔的多人，
                // 每个人的工号/审批结果取一人一条的 sqdSpjdRecordList（按 sprId/姓名/顺序匹配）
                let arr = []
                recordList.forEach(node => {
                    arr = arr.concat(this.flattenNodeApprovers(node))
                })
                arr.unshift({
                    sprName: applicantName,
                    nodeName: '申请人',
                    spCreateTime: applicantTime,
                    spStatus: 1,
                    spOpinion: '发起申请',
                    isApplicant: true
                })
                this.logData = arr
                return
            }

            // 没有审批节点数据时，至少展示申请人节点
            this.logData = applicantName ? [{
                sprName: applicantName,
                nodeName: '申请人',
                spCreateTime: applicantTime,
                spStatus: 1,
                spOpinion: '发起申请',
                isApplicant: true
            }] : []
        },

        /**
         * 获取节点的最终状态
         * - completed: 全部通过
         * - processing: 有审批人但未通过（待处理）
         * - rejected: 有已退回/撤回
         * - pending: 没有审批人（未开始）
         */
        getNodeState(group) {
            const approvers = group.approvers || []
            if (approvers.length == 0) return 'pending'
            // 申请人节点：只要有人名就算已完成
            if (this.isApplicantNode(group)) {
                return 'completed'
            }
            // 抄送节点：视为已抄送（独立状态，区别于审批通过）
            if (this.isCcGroup(group)) {
                return 'copied'
            }

            // 有人退回(4)/撤回(3) → 节点退回
            if (approvers.some(item => item.spStatus == 3 || item.spStatus == 4)) {
                return 'rejected'
            }
            // approvalRule: 1=会签，2=或签
            if (group.approvalRule == 1) {
                // 会签：所有人通过才算完成
                return approvers.every(item => item.spStatus == 2) ? 'completed' : 'processing'
            }
            // 或签：任一人通过即完成
            return approvers.some(item => item.spStatus == 2) ? 'completed' : 'processing'
        },

        /**
         * 判断是否为抄送节点（nodeProperties: 1=审批, 2=抄送）
         */
        isCcGroup(group) {
            return group && Number(group.nodeProperties) === 2
        },

        /**
         * 判断是否为申请人节点
         */
        isApplicantNode(group) {
            return group && group.isApplicant === true
        },

        /**
         * 节点状态对应主色（用于连接线）
         */
        getStateColor(state) {
            const map = {
                completed: '#22c55e',   // 绿
                processing: '#94a3b8',  // 灰
                rejected: '#ef4444',    // 红
                pending: '#cdd3dd',     // 浅灰
                copied: '#3b82f6'       // 蓝（抄送）
            }
            return map[state] || '#cdd3dd'
        },

        /**
         * 节点状态对应 ant-tag 颜色
         */
        getStateTagColor(state) {
            const map = {
                completed: 'green',
                processing: 'orange',
                rejected: 'red',
                pending: 'default'
            }
            return map[state] || 'default'
        },

        /**
         * 节点状态文字
         */
        getStateTagText(state) {
            const map = {
                completed: '已完成',
                processing: '待审批',
                rejected: '已退回',
                pending: '未开始'
            }
            return map[state] || ''
        },

        /**
         * 单个审批人结果状态
         */
        getResultState(approver) {
            if (approver.isApplicant) return 'pass'
            if (Number(approver.nodeProperties) === 2) return 'copied'
            if (approver.spStatus == 2) return 'pass'
            if (approver.spStatus == 3 || approver.spStatus == 4) return 'reject'
            return 'pending'
        },

        /**
         * 单个审批人结果文字
         */
        getSingleResultText(approver) {
            if (approver.isApplicant) return '已提交'
            if (Number(approver.nodeProperties) === 2) {
                return '已抄送'
            }
            if (approver.spStatus == 1) return '审批中'
            if (approver.spStatus == 2) return '已通过'
            if (approver.spStatus == 4) return '退回'
            if (approver.spStatus == 3) return '撤回'
            return '待处理'
        },

        /**
         * 将一个流程节点拍平成「一人一行」的扁平结构
         */
        flattenNodeApprovers(node) {
            const ids = String(node.sprId || '').split(/[,，、]/).map(s => s.trim()).filter(Boolean)
            const names = String(node.sprName || node.csrName || '').split(/[,，、]/).map(s => s.trim()).filter(Boolean)

            // 审批记录归一化（customProcessSqdSpjdRecord 对象/数组，sqdSpjdRecordList 一人一条数组）
            const records = []
            const mainRecord = node.customProcessSqdSpjdRecord
            if (Array.isArray(mainRecord)) {
                mainRecord.forEach(r => r && records.push(r))
            } else if (mainRecord) {
                records.push(mainRecord)
            }
            const recordList = Array.isArray(node.sqdSpjdRecordList) ? node.sqdSpjdRecordList.filter(Boolean) : []
            recordList.forEach(r => records.push(r))
            // 已审批记录按 sprId 建索引；一人一条记录未审批时可能 sprId 为空，需靠姓名/顺序匹配
            const recordMap = new Map()
            records.forEach(r => {
                if (r.sprId != null && r.sprId !== '') {
                    recordMap.set(String(r.sprId).trim(), r)
                }
            })
            // 查找某个人对应的记录：优先 sprId，其次姓名，最后按位置取 sqdSpjdRecordList
            const findRecord = (sprId, sprName, index) => {
                if (sprId && recordMap.has(sprId)) return recordMap.get(sprId)
                if (sprName) {
                    const byName = records.find(r => String(r.sprName || r.csrName || '').trim() === sprName)
                    if (byName) return byName
                }
                return recordList[index] || null
            }

            const base = {
                nodeName: node.nodeName,
                approvalRule: node.approvalRule,
                nodeProperties: node.nodeProperties
            }
            const isCc = Number(node.nodeProperties) === 2
            const rows = []
            // 以 id/姓名中数量较多的一侧为准逐个生成行；都为空时保留节点本身一行
            const count = Math.max(ids.length, names.length, 1)
            for (let i = 0; i < count; i++) {
                const sprId = ids[i] || ''
                const sprName = names[i] || sprId
                const record = findRecord(sprId, sprName, i)
                rows.push({
                    ...base,
                    sprId,
                    sprName,
                    csrName: isCc ? sprName : '',
                    // 工号取本人在 sqdSpjdRecordList 里的记录，不区分是否已审批
                    sprNo: record ? (record.sprNo || '') : '',
                    // 一人一条记录未审批时 spStatus 为 null：审批节点按审批中(1)，抄送沿用节点状态
                    spStatus: record && record.spStatus != null ? record.spStatus : (isCc ? node.spStatus : 1),
                    spOpinion: record ? (record.spOpinion || null) : null,
                    // 审批时间：spTime 预留，为空时取记录的 createTime
                    spCreateTime: record ? (record.spTime || record.createTime || null) : null
                })
            }
            return rows
        },

        /**
         * 获取节点下的审批人/抄送人列表（一人一条）
         */
        getGroupApprovers(group) {
            return group.approvers || []
        },

        /**
         * 单个审批人头像样式（按本人的审批结果着色）
         */
        getAvatarClass(approver) {
            const map = {
                pass: 'avatar-completed',
                pending: 'avatar-processing',
                reject: 'avatar-rejected',
                copied: 'avatar-copied'
            }
            return map[this.getResultState(approver)] || 'avatar-pending'
        },

        /**
         * 是否展示审批时间
         * - 已通过(2)/撤回(3)/退回(4) 即审批完成后展示；审批中(1)不展示
         * - 抄送节点：有抄送时间才展示
         */
        showApproverTime(approver) {
            if (!approver) return false
            if (Number(approver.nodeProperties) === 2) return !!this.getApproverTime(approver)
            return approver.spStatus == 2 || approver.spStatus == 3 || approver.spStatus == 4 || !!approver.spCreateTime
        },

        /**
         * 获取审批人工号（拍平时取自 sqdSpjdRecordList 中本人记录的 sprNo）
         */
        getApproverNo(approver) {
            return (approver && approver.sprNo) || ''
        },

        /**
         * 获取审批时间
         */
        getApproverTime(approver) {
            if (approver && approver.spCreateTime) return this.formatTime(approver.spCreateTime)
            return ''
        },

        /**
         * 获取审批意见
         */
        getApproverOpinion(approver) {
            if (approver && approver.spOpinion && !approver.isApplicant) return approver.spOpinion
            return ''
        },

        /**
         * 头像文字（取名字最后一个字符）
         */
        getAvatarText(name) {
            if (!name) return '?'
            const trimmed = String(name).trim()
            return trimmed.charAt(trimmed.length - 1).toUpperCase()
        },

        /**
         * 格式化时间（直接返回原值，预留扩展）
         */
        formatTime(time) {
            if (!time) return ''
            return time
        }
    }
}
</script>

<style scoped lang="less">
/* ==== 时间轴容器 ==== */
.approval-timeline-wrapper {
    width: 100%;
}

.log-timeline {
    padding: 8px 0 16px;
    position: relative;
}

/* ==== 每个节点行 ==== */
.log-node {
    display: flex;
    gap: 14px;
    position: relative;
    margin-bottom: 16px;
}

.log-node:last-child {
    margin-bottom: 0;
}

/* ==== 左侧：节点圆点 + 连接线 ==== */
.log-node-track {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 24px;
    flex-shrink: 0;
    padding-top: 2px;
}

.log-node-dot {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1;
    flex-shrink: 0;
    transition: all 0.25s;
}

/* 已完成：绿色实心圆 + 白色对勾 */
.log-dot-completed {
    background: #22c55e;
    border: 2px solid #22c55e;
}

.log-dot-completed .log-dot-icon {
    color: #fff;
    font-size: 12px;
    font-weight: 700;
}

/* 进行中：灰色实心圆 + 中心小点 */
.log-dot-processing {
    background: #b1e6ff;
    border: 2px solid #4494b9;
}

.log-dot-processing .log-dot-inner {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #fff;
    display: block;
}

/* 已退回：红色描边圆 + 红色叉 */
.log-dot-rejected {
    background: #fff;
    border: 2px solid #ef4444;
}

.log-dot-rejected .log-dot-icon {
    color: #ef4444;
    font-size: 12px;
    font-weight: 700;
}

/* 已抄送：蓝色实心圆 + 白色抄送图标 */
.log-dot-copied {
    background: #3b82f6;
    border: 2px solid #3b82f6;
}

.log-dot-copied .log-dot-icon {
    color: #fff;
    font-size: 11px;
    font-weight: 700;
}

/* 未开始：灰色描边圆 */
.log-dot-pending {
    background: #e6f7ff;
    border: 2px solid #9ad2ff;
    border-radius: 50%;
}

/* 连接线 */
.log-node-line {
    width: 2px;
    flex: 1;
    min-height: 24px;
    margin-top: 4px;
    background: #cdd3dd;
}

/* ==== 右侧：内容卡片 ==== */
.log-node-card {
    flex: 1;
    min-width: 0;
    background: #fff;
    border: 1px solid #e6eaf0;
    border-radius: 8px;
    padding: 10px 12px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
}

.log-card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;
}

.log-role-name {
    font-size: 14px;
    font-weight: 600;
    color: #1a2a3d;
    line-height: 22px;
}

/* 会签/或签规则标签 */
.log-rule-tag {
    margin: 0;
    font-size: 11px;
    line-height: 18px;
    height: 18px;
    padding: 0 6px;
    font-weight: 500;
}

.log-state-tag {
    margin-left: auto !important;
    font-size: 12px;
    line-height: 20px;
    border-radius: 4px;
    padding: 0 8px;
    height: 22px;
    display: inline-flex;
    align-items: center;
}

/* 卡片主体 */
.log-card-body {
    display: flex;
    flex-direction: column;
}

/* 审批人条目：每个审批人单独占一行 */
.approver-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 9px 0;
}

.approver-item+.approver-item {
    border-top: 1px dashed #e2e8f0;
}

/* 申请人节点行布局（垂直居中） */
.approver-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 6px 0;
}

.applicant-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.applicant-opinion {
    font-size: 12px;
    color: #64748b;
    line-height: 1.4;
}

/* 头像 */
.approver-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 1px;
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    line-height: 1;
}

.avatar-completed {
    background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
    box-shadow: 0 2px 6px rgba(245, 158, 11, 0.25);
}

.avatar-processing {
    background: linear-gradient(135deg, #ec4899 0%, #db2777 100%);
    box-shadow: 0 2px 6px rgba(236, 72, 153, 0.25);
}

.avatar-rejected {
    background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%);
}

.avatar-pending {
    background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 100%);
}

.avatar-copied {
    background: linear-gradient(135deg, #94a3b8 0%, #64748b 100%);
    box-shadow: 0 2px 6px rgba(100, 116, 139, 0.25);
}

/* 申请人头像：蓝色 */
.avatar-applicant {
    background: linear-gradient(135deg, #4a7bf7 0%, #2d5fe0 100%);
    box-shadow: 0 2px 6px rgba(74, 123, 247, 0.25);
}

/* 审批人信息列 */
.approver-info {
    flex: 1;
    min-width: 0;
}

/* 第一行：姓名 + 审批状态 */
.approver-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
}

.approver-name {
    font-size: 13px;
    font-weight: 600;
    color: #1a2a3d;
    line-height: 18px;
}

.approver-status {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    font-weight: 600;
    line-height: 18px;
    flex-shrink: 0;
}

.approver-status .result-icon {
    font-size: 12px;
}

/* 第二行：工号 + 审批时间 */
.approver-sub {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: 3px;
}

.approver-no,
.approver-time {
    font-size: 11px;
    color: #94a3b8;
    line-height: 16px;
}

/* 第三行：审批意见（引用块样式） */
.approver-opinion {
    margin-top: 7px;
    padding: 6px 10px;
    font-size: 12px;
    color: #475569;
    line-height: 1.6;
    background: rgba(37, 99, 235, 0.05);
    border-left: 3px solid rgba(37, 99, 235, 0.35);
    border-radius: 0 6px 6px 0;
    word-break: break-all;
}

/* 申请人节点右侧：状态 + 时间 */
.approver-result {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    gap: 3px;
    flex-shrink: 0;
    text-align: right;
}

.approver-result-text {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    line-height: 18px;
}

.approver-result-text .result-icon {
    font-size: 12px;
}

.spStatus-pass {
    color: #059669;
    font-weight: 600;
}

.spStatus-pass .result-icon {
    color: #059669;
}

.spStatus-reject {
    color: #dc2626;
    font-weight: 600;
}

.spStatus-reject .result-icon {
    color: #dc2626;
}

.spStatus-pending {
    color: #2563eb;
    font-weight: 600;
}

.spStatus-copied {
    color: #334155;
    font-weight: 600;
}

.approver-result-time {
    font-size: 11px;
    color: #94a3b8;
    line-height: 16px;
}
</style>
