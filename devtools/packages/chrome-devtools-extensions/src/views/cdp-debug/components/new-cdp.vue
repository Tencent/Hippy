<template>
  <div class="new-cdp-wrap">
    <div class="header">
      <div class="method-label main-text">method:</div>
      <el-autocomplete
        v-model="method"
        :fetch-suggestions="queryCommand"
        :trigger-on-focus="false"
        size="medium"
        class="method-input"
        :style="{ flex: 1 }"
        placeholder="please input CDP command"
      />
      <el-button type="primary" :disabled="!method" size="medium" @click="send"> send </el-button>
    </div>
    <div class="body">
      <multipane class="custom-resizer" layout="horizontal" @paneResizeStop="onPaneResizeStop">
        <div ref="pane0Ref" class="pane-wrap">
          <JsonViewer v-model="reqStr" title="request" class="req-json-viewer json-viewer" />
        </div>
        <multipane-resizer />
        <div class="pane-wrap" style="flex: 1">
          <JsonViewer v-model="resStr" :read-only="true" title="response" class="res-json-viewer json-viewer" />
        </div>
      </multipane>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { ElNotification } from 'element-plus';
import { Multipane, MultipaneResizer } from '@chrome-devtools-extensions/components/vue-multipane';
import JsonViewer from '@chrome-devtools-extensions/components/json-viewer.vue';
import { NotificationType } from '@chrome-devtools-extensions/@types/enum';
import { getAllCommands } from '@chrome-devtools-extensions/utils';

const allCommands = getAllCommands();
const storageKey = 'cdp_debug_request_pane_height';

export default defineComponent({
  name: 'NewCdp',
  components: { JsonViewer, Multipane, MultipaneResizer },
  setup() {
    const store = useStore();
    const pane0Height = localStorage.getItem(storageKey) || '40%';
    const pane0Ref = ref(null) as unknown as Ref<HTMLDivElement>;
    onMounted(() => {
      pane0Ref.value.style.height = pane0Height;
    });
    const onPaneResizeStop = (i, size) => {
      localStorage.setItem(storageKey, size);
    };
    return {
      method: ref(''),
      reqStr: ref(''),
      resStr: computed(() => {
        const res = store.state.newRecord?.res;
        return store.getters.showNewPanel && res ? JSON.stringify(res, null, '  ') : '';
      }),
      onPaneResizeStop,
      pane0Ref,
    };
  },
  methods: {
    send() {
      try {
        const params = JSON.parse(this.reqStr);
        this.$store.dispatch('send', {
          method: this.method,
          params,
        });
      } catch (e) {
        ElNotification({
          title: 'invalid request body',
          message: 'request body must be JSON',
          type: NotificationType.error,
        });
      }
    },
    queryCommand(queryString: string, cb) {
      const filteredCommands = allCommands
        .filter((command) => command.toLowerCase().indexOf(queryString.toLowerCase()) !== -1)
        .map((command) => ({
          value: command,
          label: command,
        }));
      cb(filteredCommands);
    },
  },
});
</script>
