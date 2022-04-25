<template>
  <div class="ui-inspector-wrapper">
    <div class="sider-bar">
      <el-tooltip v-for="(pane, i) in panes" :key="i" effect="dark" :content="pane.tip" placement="right">
        <div class="pane-thumb" @click="togglePane(pane.id)">
          <i
            :class="[pane.icon, showConfig[pane.showKey] ? 'pane-showed' : '']"
            :style="{ fontWeight: showConfig[pane.showKey] ? '500' : '400' }"
          />
        </div>
      </el-tooltip>
    </div>
    <multipane class="custom-resizer" layout="vertical" @paneResizeStop="onPaneResizeStop">
      <template v-for="(pane, i) of visiablePanes" :key="i">
        <multipane-resizer v-if="i !== 0" :id="'resizer-' + i" />
        <component :is="pane.component" class="pane-wrap" :style="pane.style" />
      </template>
    </multipane>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, Ref, computed, shallowRef } from 'vue';
import { useStore } from 'vuex';
import { Multipane, MultipaneResizer } from '@chrome-devtools-extensions/components/vue-multipane';
import { enableUpdateNotification, disableUpdateNotification } from '@chrome-devtools-extensions/api';
import Screenshot from './components/screenshot.vue';
import Attribute from './components/attribute.vue';
import DomTree from './components/dom-tree.vue';
import RenderTree from './components/render-tree.vue';
import { EVENT_MAP as STORE_EVENT_MAP } from './store';
import '@chrome-devtools-extensions/views/index.scss';

export default defineComponent({
  name: 'App',
  components: {
    Multipane,
    MultipaneResizer,
    Screenshot,
    Attribute,
    DomTree,
    RenderTree,
  },
  setup() {
    const store = useStore();
    store.dispatch(STORE_EVENT_MAP.actions.GetDomTree);
    store.dispatch(STORE_EVENT_MAP.actions.GetRenderTree);
    store.dispatch(STORE_EVENT_MAP.actions.GetScreenshot);
    store.dispatch(STORE_EVENT_MAP.actions.GegisterDomTreeUpdatedListener);
    store.dispatch(STORE_EVENT_MAP.actions.GegisterRenderTreeUpdatedListener);
    store.dispatch(STORE_EVENT_MAP.actions.GegisterScreenshotUpdatedListener);
    enableUpdateNotification();

    const panes: Ref<
      {
        id: number;
        component: unknown;
        style: any;
        lastStyle?: any;
        showKey: string;
        icon: string;
      }[]
    > = ref([
      {
        id: 1,
        component: shallowRef(Screenshot),
        style: {
          width: '25%',
        },
        showKey: 'showScreenshot',
        tip: 'Screenshot',
        icon: 'el-icon-mobile-phone',
      },
      {
        id: 2,
        component: shallowRef(DomTree),
        style: {
          width: '25%',
        },
        showKey: 'showDomTree',
        tip: 'DOM',
        icon: 'el-icon-grape',
      },
      {
        id: 3,
        component: shallowRef(RenderTree),
        style: {
          width: '25%',
        },
        showKey: 'showRenderTree',
        tip: 'Render',
        icon: 'el-icon-grape',
      },
      {
        id: 4,
        component: shallowRef(Attribute),
        style: {
          flex: 1,
        },
        showKey: 'showAttribute',
        tip: 'Attribute',
        icon: 'el-icon-menu',
      },
    ]);
    const visiablePanes = computed(() => panes.value.filter((pane) => store.state[pane.showKey]));
    const togglePane = (id) => {
      const pane = panes.value.find((pane) => pane.id === id);
      const visiblePanesValue = visiablePanes.value;
      const lastVisiblePane = visiblePanesValue[visiblePanesValue.length - 1];
      const last2thVisiblePane = visiblePanesValue[visiblePanesValue.length - 2];
      const isLastVisiblePane = lastVisiblePane.id === id;
      const showPane = store.state[pane!.showKey];
      const afterAppendIsLastVisiblePane = !showPane && pane!.id > lastVisiblePane.id;

      if (isLastVisiblePane) {
        last2thVisiblePane.style = { flex: 1 };
      }
      if (afterAppendIsLastVisiblePane) {
        pane!.style = {
          flex: 1,
        };
        if (lastVisiblePane.style.flex === 1) {
          lastVisiblePane.style = { width: '25%' };
        }
      }

      store.commit(STORE_EVENT_MAP.mutations.SetVisibility, {
        key: pane?.showKey,
        value: !showPane,
      });
    };
    const onPaneResizeStop = (i, size) => {
      visiablePanes.value[i]!.style.width = size;
    };

    return {
      panes,
      visiablePanes,
      togglePane,
      onPaneResizeStop,
      showConfig: computed(() => ({
        showScreenshot: store.state.showScreenshot,
        showDomTree: store.state.showDomTree,
        showRenderTree: store.state.showRenderTree,
        showAttribute: store.state.showAttribute,
      })),
    };
  },
  beforeDestroy() {
    disableUpdateNotification();
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

.ui-inspector-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-flow: row nowrap;
  overflow: hidden;

  .sider-bar {
    width: 62px;
    border-right: 1px solid rgb(68, 68, 68);
    display: flex;
    flex-flow: column nowrap;
    .pane-thumb {
      text-align: center;
      padding: 15px 0;
      font-size: 24px;
      cursor: pointer;
      &:hover {
        // filter: brightness(1.4);
      }
      .pane-showed {
      }
    }
  }
  .pane-wrap {
    overflow: auto;
    padding: 2px;
  }
}

.custom-resizer {
  height: 100%;
  flex: 1;

  > .pane {
    text-align: left;
    padding: 15px;
    overflow: hidden;
    background: #eee;
    border: 1px solid #ccc;
  }
}
</style>
