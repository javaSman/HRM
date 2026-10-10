<template>
  <div class="recruitment-dashboard-table-wrap">
    <a-empty v-if="rows.length === 0" class="recruitment-dashboard-table-empty" description="暂无部门招聘数据" />
    <table v-else class="recruitment-dashboard-dept-table">
      <thead>
        <tr>
          <th>部门</th>
          <th>岗位数</th>
          <th>需求人数</th>
          <th>待招聘</th>
          <th>已入职</th>
          <th>招聘进度</th>
          <th>简历数</th>
          <th>面试数</th>
          <th>Offer数</th>
        </tr>
      </thead>
      <tbody id="overviewDeptBody">
        <tr v-for="row in rows" :key="row.dept">
          <td :title="row.mainDeptPath"><strong>{{ displayValue(row.departName) }}</strong></td>
          <td>{{ displayValue(row.gws) }}</td>
          <td>{{ displayValue(row.zprs) }}</td>
          <td>{{ displayValue(row.dzprs) }}</td>
          <td>{{ displayValue(row.rzrs) }}</td>
          <td>
            <span class="recruitment-dashboard-dept-progress">
              <span
                class="recruitment-dashboard-dept-progress-inner"
                :style="{ width: getProgress(row) + '%', backgroundColor: getProgressColor(row) }"
              ></span>
            </span>
            {{ getProgress(row) }}%
          </td>
          <td>{{ displayValue(row.jlsl) }}</td>
          <td>{{ displayValue(row.msrs) }}</td>
          <td>{{ displayValue(row.offerrs) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'OverviewDeptTable',
  props: {
    rows: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    displayValue(value) {
      return value === 0 || value ? value : '-'
    },
    getProgress(row) {
      const demand = Number(row.zprs) || 0
      return demand > 0 ? Math.round((Number(row.rzrs) || 0) / demand * 100) : 0
    },
    getProgressColor(row) {
      const progress = this.getProgress(row)
      if (progress < 30) {
        return '#F56C6C'
      }
      if (progress < 70) {
        return '#E6A23C'
      }
      return '#67C23A'
    }
  }
}
</script>

<style lang="less" scoped>
.recruitment-dashboard-table-wrap {
  overflow-x: auto;
  border: 1px solid #e5eaf2;
  border-radius: 8px;
}

.recruitment-dashboard-dept-table {
  width: 100%;
  border-collapse: collapse;
  background: #fff;

  th {
    padding: 14px 20px;
    background: #f1f5fb;
    color: #475569;
    font-size: 14px;
    font-weight: 700;
    text-align: left;
    white-space: nowrap;
    text-align: center;
  }

  td {
    padding: 16px 20px;
    border-top: 1px solid #edf2f7;
    color: #334155;
    font-size: 14px;
    white-space: nowrap;
    text-align: center;
  }

  tbody tr {
    transition: background .2s ease;
  }

  tbody tr:hover {
    background: #f5f8ff;
  }
}

.recruitment-dashboard-dept-progress {
  display: inline-block;
  width: 92px;
  height: 8px;
  margin-right: 8px;
  overflow: hidden;
  vertical-align: middle;
  background: #eef2f7;
  border-radius: 999px;
}

.recruitment-dashboard-dept-progress-inner {
  display: block;
  height: 100%;
  border-radius: 999px;
  transition: width .25s ease;
}

.recruitment-dashboard-table-empty {
  min-width: 560px;
  padding: 36px 0;
}
</style>
