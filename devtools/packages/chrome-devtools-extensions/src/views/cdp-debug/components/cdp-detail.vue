<template>
  <div class="cdp-detail-wrap">
    <div class="header">
      <div v-if="!isEventRecord" class="main-text">id: {{ id }}</div>
      <div class="method-label main-text">
        <span>method:</span><span>{{ method }}</span>
      </div>
    </div>
    <div class="body">
      <multipane class="custom-resizer" layout="horizontal" @paneResizeStop="onPaneResizeStop">
        <div v-if="!isEventRecord" ref="pane0Ref" class="pane-wrap">
          <JsonViewer v-model="reqStr" :read-only="true" class="req-json-viewer" title="request" />
        </div>
        <multipane-resizer v-if="!isEventRecord" />
        <div style="flex: 1" class="pane-wrap">
          <JsonViewer v-model="resStr" :read-only="true" class="res-json-viewer" title="response" />
        </div>
      </multipane>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, Ref, ref, onMounted } from 'vue';
import { useStore } from 'vuex';
import JsonViewer from '@chrome-devtools-extensions/components/json-viewer.vue';
import { Multipane, MultipaneResizer } from '@chrome-devtools-extensions/components/vue-multipane';

const storageKey = 'cdp_debug_request_pane_height';

export default defineComponent({
  name: 'NewCdp',
  components: { JsonViewer, Multipane, MultipaneResizer },
  setup() {
    const store = useStore();
    const pane0Height = localStorage.getItem(storageKey) || '40%';
    const pane0Ref: Ref<HTMLDivElement | null> = ref(null);
    onMounted(() => {
      if (pane0Ref.value) pane0Ref.value.style.height = pane0Height;
    });
    const onPaneResizeStop = (i, size) => {
      if (i === 0) localStorage.setItem(storageKey, size);
    };

    return {
      id: computed(() => store.state.records[store.state.selectedIndex]?.id || ''),
      isEventRecord: computed(() => Boolean(!store.state.records[store.state.selectedIndex]?.id)),
      method: computed(() => store.state.records[store.state.selectedIndex]?.method || ''),
      reqStr: computed(() => {
        const req = store.state.records[store.state.selectedIndex]?.req;
        return req ? JSON.stringify(req, null, '  ') : '';
      }),
      resStr: computed(() => {
        const res = store.state.records[store.state.selectedIndex]?.res;
        return res ? JSON.stringify(res, null, '  ') : '';
      }),
      onPaneResizeStop,
      pane0Ref,
    };
  },
  methods: {},
});
</script>
