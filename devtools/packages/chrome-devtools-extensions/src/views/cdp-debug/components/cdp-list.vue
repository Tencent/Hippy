<template>
  <div class="records">
    <el-button type="text" size="medium" class="record new-record border" @click="newRequest"> New Request </el-button>
    <div
      v-for="(record, i) of records"
      :key="record.id"
      :class="['record', 'border', selectedIndex === i ? 'selected-record' : '']"
      @click="selectRecord(i)"
    >
      <el-icon class="record-icon" :size="10" :color="record.req ? '#409eff' : '#d11313'">
        <sort v-if="record.req" />
        <bottom v-else />
      </el-icon>
      <div class="record-id">
        {{ record.id }}
      </div>
      <div class="record-method">
        {{ record.method }}
      </div>
    </div>
    <div v-if="records.length === 0" class="record no-record accent-text">no records</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useStore } from 'vuex';
import { Sort, Bottom } from '@element-plus/icons';

export default defineComponent({
  name: 'CdpList',
  components: { Sort, Bottom },
  setup() {
    const store = useStore();
    return {
      records: computed(() => store.state.records),
      selectedIndex: computed(() => store.state.selectedIndex),
    };
  },
  methods: {
    newRequest() {
      this.$store.commit('changeToNewRecordView');
    },
    selectRecord(i: number) {
      this.$store.commit('selectRecord', i);
    },
  },
});
</script>

<style lang="scss" scoped>
.records {
  display: flex;
  flex-flow: column;
  overflow: auto;
  .record {
    height: 25px;
    padding: 2px 0 2px 8px;
    font-size: 12px;
    display: flex;
    flex-flow: row nowrap;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    &.new-record,
    &.no-record {
      text-align: center;
      justify-content: center;
      padding: 8px 0;
    }
    &.new-record {
      margin-bottom: 15px;
    }
    &.no-record {
      cursor: unset;
    }
    &.selected-record {
      background: var(--bg-hover);
    }
    > * {
      margin-right: 8px;
    }
    .record-icon {
      border-radius: 15px;
      border: 1px solid var(--color);
      padding: 1px;
    }
    .record-id {
      color: #f56c6c;
    }
    .record-method {
      color: #e6a23c;
    }
  }
  .border {
    border-bottom-width: 1px;
    border-bottom-style: solid;
  }
}
</style>
