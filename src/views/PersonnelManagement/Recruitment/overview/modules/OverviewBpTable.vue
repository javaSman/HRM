<template>
  <div class="recruitment-dashboard-table-wrap">
    <a-empty v-if="rows.length === 0" class="recruitment-dashboard-table-empty" description="暂无BP统计数据" />
    <table v-else class="recruitment-dashboard-bp-table">
      <thead>
        <tr>
          <th>BP姓名</th>
          <th>负责部门</th>
          <th>月度完成招聘量</th>
          <th>Offer量</th>
          <th>待入职量</th>
          <th>入职量</th>
          <th>内部推荐人数</th>
          <th style="min-width:80px">操作</th>
        </tr>
      </thead>
      <tbody id="overviewBpBody">
        <tr v-for="(row, rowIndex) in rows" :key="row.dept + '-' + rowIndex">
          <td><strong>{{ displayValue(row.name) }}</strong></td>
          <td :title="row.mainDeptPath">{{ displayValue(row.departName) }}</td>
          <td>{{ displayValue(row.monthlyCount) }}</td>
          <td>{{ displayValue(row.offerCount) }}</td>
          <td>{{ displayValue(row.drzCount) }}</td>
          <td>{{ displayValue(row.rzCount) }}</td>
          <td>{{ displayValue(row.nbCount) }}</td>
          <td>
            <button class="recruitment-dashboard-link" type="button" @click="$emit('detail', row)">详情</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'OverviewBpTable',
  props: {
    rows: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    displayValue(value) {
      return value === 0 || value ? value : '-'
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

.recruitment-dashboard-bp-table {
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

.recruitment-dashboard-link {
  padding: 0;
  border: none;
  background: transparent;
  color: #2563eb;
  cursor: pointer;
  font-size: 14px;
}

.recruitment-dashboard-table-empty {
  min-width: 560px;
  padding: 36px 0;
}
</style>
