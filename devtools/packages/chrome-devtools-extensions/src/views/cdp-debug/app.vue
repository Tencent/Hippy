<template>
  <div class="cdp-debug-wrapper">
    <multipane class="custom-resizer" layout="vertical" @paneResizeStop="onPaneResizeStop">
      <CdpList ref="pane0Ref" class="pane-wrap" />
      <multipane-resizer />
      <NewCdp v-if="showNewPanel" class="pane-wrap" style="flex: 1" />
      <CdpDetail v-else class="pane-wrap" style="flex: 1" />
    </multipane>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { Multipane, MultipaneResizer } from '@chrome-devtools-extensions/components/vue-multipane';
import CdpList from './components/cdp-list.vue';
import CdpDetail from './components/cdp-detail.vue';
import NewCdp from './components/new-cdp.vue';
import '@chrome-devtools-extensions/views/index.scss';
import './index.scss';

const storageKey = 'cdp_debug_list_pane_width';

export default defineComponent({
  name: 'App',
  components: {
    Multipane,
    MultipaneResizer,
    CdpList,
    CdpDetail,
    NewCdp,
  },
  setup() {
    const store = useStore();
    store.dispatch('registerEventListener');
    const pane0Width = localStorage.getItem(storageKey) || '25%';
    const pane0Ref = ref(null) as unknown as Ref<typeof CdpList>;
    onMounted(() => {
      pane0Ref.value.$el.style.width = pane0Width;
    });
    const onPaneResizeStop = (i, size) => {
      if (i === 0) localStorage.setItem(storageKey, size);
    };

    return {
      pane0Ref,
      onPaneResizeStop,
      showNewPanel: computed(() => store.getters.showNewPanel),
    };
  },
});
</script>

<style lang="scss" scoped>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

.cdp-debug-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;

  .pane-wrap {
    padding: 2px;
    box-sizing: border-box;
  }
}

.custom-resizer {
  height: 100%;
  flex: 1;
  overflow: hidden;

  > .pane {
    text-align: left;
    padding: 15px;
    overflow: hidden;
    background: #eee;
    border: 1px solid #ccc;
  }
}
</style>
