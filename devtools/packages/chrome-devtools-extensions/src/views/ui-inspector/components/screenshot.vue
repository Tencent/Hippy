<template>
  <div ref="screenshotRef" class="screenshot-wrap">
    <div class="action-bar">
      <el-tooltip class="item" effect="dark" content="refresh" placement="bottom">
        <el-icon v-if="isRefreshing" class="is-loading action-btn" :size="20">
          <loading />
        </el-icon>
        <el-icon v-else class="action-btn" :size="20" @click="update">
          <refresh />
        </el-icon>
      </el-tooltip>
      <el-tooltip class="item" effect="dark" content="select DOM/render node" placement="bottom">
        <el-icon class="action-btn" :size="20" :color="selectIconColor" @click="toggleSelectMode">
          <top-left />
        </el-icon>
      </el-tooltip>
    </div>
    <div class="screenshot-img-wrap" :style="{ width: '100%' }" @click.capture="selectNode">
      <img :src="screenshot" :style="{ width: '100%' }" />
      <div class="node-bounds margin-wrap" :style="selectedNodeBounds?.marginBounds" />
      <div class="node-bounds border-wrap" :style="selectedNodeBounds?.borderBounds" />
      <div class="node-bounds padding-wrap" :style="selectedNodeBounds?.paddingBounds" />
      <div class="node-bounds content-wrap" :style="selectedNodeBounds?.contentBounds" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, Ref } from 'vue';
import { useStore } from 'vuex';
import { Refresh, TopLeft, Loading } from '@element-plus/icons';
import { ElNotification } from 'element-plus';
import { getDomNodeBounds, getRenderNodeBounds, getNodesByPosition } from '@chrome-devtools-extensions/utils';
import { ScreenshotBoundType, NotificationType } from '@chrome-devtools-extensions/@types/enum';
import { enableUpdateNotification } from '@chrome-devtools-extensions/api';

export default defineComponent({
  name: 'Screenshot',
  components: { Refresh, TopLeft, Loading },
  setup() {
    const screenshotRef: Ref<HTMLImageElement | null> = ref(null);
    const store = useStore();
    const getImgHeight = () => {
      const width = screenshotRef.value?.clientWidth || 0;
      const {
        metadata: { deviceHeight, deviceWidth } = {
          deviceHeight: undefined,
          deviceWidth: undefined,
        },
      } = store.state.screenshot || {};
      return (width * deviceHeight) / deviceWidth;
    };
    const selectedNodeBounds = computed(() => {
      if (!store.state.screenshot) return;
      const rootDomNode = store.state.domTree?.itree;
      const rootRenderNode = store.state.renderTree?.rtree;
      if (store.state.screenshotBoundType === ScreenshotBoundType.DOM && rootDomNode) {
        if (!store.state.selectedDomNode?.bounds || !store.state.selectDomNode?.flexNodeStyle) return;
        const { width: rootWidth, height: rootHeight } = rootDomNode;
        const imgWidth = screenshotRef.value?.clientWidth || 0;
        const imgHeight = getImgHeight();
        return getDomNodeBounds(store.state.selectedDomNode, {
          rootWidth,
          rootHeight,
          imgHeight,
          imgWidth,
        });
      }
      if (store.state.screenshotBoundType === ScreenshotBoundType.Render && rootRenderNode) {
        if (!store.state.selectedRenderNode?.bounds || !store.state.selectedRenderNode?.flexNodeStyle) return;
        const {
          bounds: { left, right, top, bottom },
        } = rootRenderNode;
        const rootWidth = right - left;
        const rootHeight = bottom - top;
        const imgWidth = screenshotRef.value?.clientWidth || 0;
        const imgHeight = getImgHeight();
        return getRenderNodeBounds(store.state.selectedRenderNode, {
          rootWidth,
          rootHeight,
          imgHeight,
          imgWidth,
        });
      }
      return {
        marginBounds: {},
        borderBounds: {},
        paddingBounds: {},
        contentBounds: {},
      };
    });
    const selectNode = (event) => {
      if (!store.state.isSelectMode) return;
      const imgWidth = screenshotRef.value?.clientWidth || 0;
      const imgHeight = getImgHeight();
      const renderNode = store.state?.renderTree?.rtree;
      const domNode = store.state?.domTree?.itree;
      if (domNode) {
        const { width: rootWidth, height: rootHeight } = domNode;
        const selectedDomNodes = getNodesByPosition(
          {
            x: event.offsetX,
            y: event.offsetY,
          },
          domNode,
          {
            rootWidth,
            rootHeight,
            imgHeight,
            imgWidth,
          },
        );
        if (selectedDomNodes.length) {
          const selectedDomNode = selectedDomNodes[selectedDomNodes.length - 1];
          store.commit('selectDomNode', selectedDomNode);
          store.commit('setDomExpandedKeys', [selectedDomNode.id]);
        }
      }
      if (renderNode) {
        const {
          bounds: { left, right, top, bottom },
        } = renderNode;
        const rootWidth = right - left;
        const rootHeight = bottom - top;
        const selectedRenderNodes = getNodesByPosition(
          {
            x: event.offsetX,
            y: event.offsetY,
          },
          renderNode,
          {
            rootWidth,
            rootHeight,
            imgHeight,
            imgWidth,
          },
        );
        if (selectedRenderNodes.length) {
          const selectedRenderNode = selectedRenderNodes[selectedRenderNodes.length - 1];
          store.commit('selectRenderNode', selectedRenderNode);
          store.commit('setRenderExpandedKeys', [selectedRenderNode.id]);
          store.dispatch('getSelectedRenderObject', selectedRenderNode);
        }
      }
    };

    return {
      screenshotRef,
      screenshot: computed(() => store.getters.screenshotImg),
      isRefreshing: computed(() => store.state.isRefreshing),
      isSupportDomTree: computed(() => store.state.isSupportDomTree),
      selectedNodeBounds,
      selectIconColor: computed(() => {
        const getCSSVariable = (variable) => getComputedStyle(document.documentElement).getPropertyValue(variable);
        return store.state.isSelectMode ? getCSSVariable('--el-color-primary') : getCSSVariable('--color-text-primary');
      }),
      selectNode,
    };
  },
  methods: {
    async update() {
      // 刷新时再次 enable 一遍，防止 app 重启的情况没有收到 enable 事件
      enableUpdateNotification();
      this.$store.commit('setRefreshing', true);
      const timer = setTimeout(() => {
        this.$store.commit('setRefreshing', false);
        ElNotification({
          title: '获取数据超时',
          type: NotificationType.error,
        });
      }, 4000);
      await Promise.all([
        this.isSupportDomTree ? this.$store.dispatch('getDomTree') : Promise.resolve(),
        this.$store.dispatch('getRenderTree'),
        this.$store.dispatch('getScreenshot'),
      ]);
      this.$store.commit('setRefreshing', false);
      clearTimeout(timer);
    },
    toggleSelectMode() {
      this.$store.commit('toggleSelectMode');
    },
  },
});
</script>

<style lang="scss" scoped>
.screenshot-wrap {
  height: 100%;
  display: flex;
  flex-flow: column;
  justify-content: flex-start;
  align-items: center;
  .action-bar {
    width: 100%;
    .action-btn {
      margin: 0 5px;
      cursor: pointer;
    }
  }
  .screenshot-img-wrap {
    position: relative;
    .node-bounds {
      position: absolute;
      left: 0;
      top: 0;
      $marginColor: rgba(246, 178, 107, 0.66);
      $borderColor: rgba(255, 229, 153, 0.66);
      $paddingColor: rgba(147, 196, 125, 0.66);
      $contentColor: rgba(111, 168, 220, 0.66);
      border-style: solid;
      border-width: 0;
      pointer-events: none;
      &.margin-wrap {
        border-color: $marginColor;
        z-index: 100;
      }
      &.border-wrap {
        border-color: $borderColor;
        z-index: 101;
      }
      &.padding-wrap {
        border-color: $paddingColor;
        z-index: 102;
      }
      &.content-wrap {
        background: $contentColor;
        z-index: 103;
      }
    }
  }
}
</style>
