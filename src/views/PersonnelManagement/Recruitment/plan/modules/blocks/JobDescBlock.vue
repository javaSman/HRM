<template>
  <div class="job-desc-block">
    <template v-if="readonly">
      <div class="ro-desc">
        <div class="desc-item">
          <span class="desc-label">任职要求</span>
          <div class="desc-text">{{ model.rzyq || '-' }}</div>
        </div>
        <div class="desc-item">
          <span class="desc-label">岗位职责</span>
          <div class="desc-text">{{ model.gwzz || '-' }}</div>
        </div>
      </div>
    </template>
    <template v-else>
      <a-form-model-item label="任职要求" prop="rzyq">
        <a-textarea
          v-model.trim="model.rzyq"
          :autoSize="{ minRows: 8, maxRows:  8 }"
          placeholder="请输入任职要求"
          style="resize: none;"

        />
      </a-form-model-item>
      <a-form-model-item label="岗位职责" prop="gwzz">
        <a-textarea
          v-model.trim="model.gwzz"
          :autoSize="{ minRows: 8, maxRows:  8 }"
          placeholder="请输入岗位职责"
          style="resize: none;"
        />
      </a-form-model-item>
    </template>
  </div>
</template>

<script>
export default {
  name: 'PlanJobDescBlock',
  props: {
    model: { type: Object, required: true },
    readonly: { type: Boolean, default: false },
  },
}
</script>

<style scoped lang="less">
.job-desc-block {
  display: flex;
  flex-direction: column;
}



.desc-item {
  margin-bottom: 20px;
}

.desc-label {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  color: #8c8c8c;
  font-size: 13px;
  font-weight: 600;

  // &::before {
  //   display: inline-block;
  //   width: 3px;
  //   height: 13px;
  //   margin-right: 7px;
  //   border-radius: 2px;
  //   content: '';
  //   background: linear-gradient(180deg, #5b8cff 0%, #4a7bf7 100%);
  // }
}

.desc-text {
  height: 150px;
  padding: 12px 14px;
  background: #fafbff;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  color: #262626;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-all;
  overflow: auto;
}
</style>
