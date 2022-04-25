<template>
  <el-table
    ref="memorySnapshopTable"
    :data="source"
    :default-sort="{ prop: 'size', order: 'descending' }"
    border
    size="mini"
    @expand-change="onTableExpandChange"
    @row-click="onTableRowClick"
  >
    <el-table-column type="expand">
      <template #default>
        <el-table
          id="memoryDetailTable"
          :data="memoryDetailTableData"
          :row-key="getRowKey"
          highlight-current-row
          show-header="false"
          size="mini"
        >
          <el-table-column label="address" prop="a" width="150" />
          <el-table-column label="file" prop="f" />
        </el-table>
      </template>
    </el-table-column>
    <el-table-column label="type" prop="type" />
    <el-table-column label="size(byte)" prop="size" sortable width="100" />
    <el-table-column label="count" prop="count" width="100" />
  </el-table>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ElTable } from 'element-plus';
import * as MemoryData from './memory-data';

let memoryTable: typeof ElTable;
let lastExpandedRow: MemoryData.MemoryTableMeta | null;

export default defineComponent({
  name: 'MemorySnapshotTable',
  props: ['source'],
  setup() {
    const memorySnapshopTable = ref(ElTable);
    return {
      memorySnapshopTable,
    };
  },
  data() {
    return {
      memoryDetailTableData: Array<MemoryData.IMemoryHeapMeta>(),
    };
  },
  mounted() {
    memoryTable = this.memorySnapshopTable as typeof ElTable;
  },
  methods: {
    onTableRowClick(row: MemoryData.MemoryTableMeta) {
      (memoryTable as typeof ElTable).toggleRowExpansion(row);
      this.memoryDetailTableData = row.detail;
    },
    onTableExpandChange(row: MemoryData.MemoryTableMeta, expandedRows: Array<MemoryData.MemoryTableMeta>) {
      if (lastExpandedRow !== null) {
        (memoryTable as typeof ElTable).toggleRowExpansion(lastExpandedRow, false);
      }
      if (expandedRows.length === 0) {
        this.memoryDetailTableData = [];
        lastExpandedRow = null;
      } else {
        this.memoryDetailTableData = row.detail;
        lastExpandedRow = row;
      }
    },
    getRowKey(row: MemoryData.MemoryTableMeta) {
      return `${row.key}-${row.type}`;
    },
  },
});
</script>
