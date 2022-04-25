<template>
  <div
    ref="multipaneRef"
    :class="classnames"
    :style="{ cursor, userSelect, overflow: 'hidden' }"
    @mousedown.stop="onMouseDown"
  >
    <slot />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';

const LAYOUT_HORIZONTAL = 'horizontal';
const LAYOUT_VERTICAL = 'vertical';

export default defineComponent({
  name: 'Multipane',
  props: {
    layout: {
      type: String,
      default: LAYOUT_VERTICAL,
    },
  },
  setup(props) {
    const isResizing = ref(false);

    return {
      isResizing,
      classnames: computed(() => [
        'multipane',
        `layout-${props.layout.slice(0, 1)}`,
        isResizing.value ? 'is-resizing' : '',
      ]),
      cursor: computed(() =>
        isResizing.value ? (props.layout === LAYOUT_VERTICAL ? 'col-resize' : 'row-resize') : '',
      ),
      userSelect: computed(() => (isResizing.value ? 'none' : '')),
    };
  },
  methods: {
    onMouseDown({ target: resizer, pageX: initialPageX, pageY: initialPageY }) {
      if (resizer?.className?.toString()?.match('multipane-resizer')) {
        const { $el: container } = this;
        const { layout } = this.$props;

        const pane = resizer.previousElementSibling;
        const { offsetWidth: initialPaneWidth, offsetHeight: initialPaneHeight } = pane;

        const isVertical = this.$props.layout === LAYOUT_VERTICAL;
        const usePercentage = !!`${isVertical ? pane.style.width : pane.style.height}`.match('%');

        const { addEventListener, removeEventListener } = window;

        const resize = (initialSize = 0, offset = 0) => {
          if (layout === LAYOUT_VERTICAL) {
            const containerWidth = container.clientWidth;
            const paneWidth = initialSize + offset;

            return (pane.style.width = usePercentage ? `${(paneWidth / containerWidth) * 100}%` : `${paneWidth}px`);
          }

          if (layout === LAYOUT_HORIZONTAL) {
            const containerHeight = container.clientHeight;
            const paneHeight = initialSize + offset;

            return (pane.style.height = usePercentage ? `${(paneHeight / containerHeight) * 100}%` : `${paneHeight}px`);
          }
        };
        this.isResizing = true;
        let size = resize(isVertical ? initialPaneWidth : initialPaneHeight);
        this.$emit('paneResizeStart', pane, resizer, size);

        const onMouseMove = ({ pageX, pageY }) => {
          size =
            layout === LAYOUT_VERTICAL
              ? resize(initialPaneWidth, pageX - initialPageX)
              : resize(initialPaneHeight, pageY - initialPageY);

          this.$emit('paneResize', pane, resizer, size);
        };

        const onMouseUp = () => {
          size = layout === LAYOUT_VERTICAL ? resize(pane.offsetWidth) : resize(pane.offsetHeight);
          this.isResizing = false;
          removeEventListener('mousemove', onMouseMove);
          removeEventListener('mouseup', onMouseUp);
          const resizerList = (this as any).$refs.multipaneRef.getElementsByClassName('multipane-resizer');
          const index = Array.from(resizerList).findIndex((item) => item === resizer);
          this.$emit('paneResizeStop', index, size);
        };

        addEventListener('mousemove', onMouseMove);
        addEventListener('mouseup', onMouseUp);
      }
    },
  },
});
</script>

<style lang="scss">
.multipane {
  display: flex;
  box-sizing: border-box;

  > * {
    box-sizing: border-box;
  }

  .multipane-resizer {
    display: block;
    position: relative;
    z-index: 2;
    margin: 0;
    left: 0;
    position: relative;
    border: 1px solid #53535326;
    &:before {
      display: block;
      content: '';
      width: 3px;
      height: 40px;
      position: absolute;
      top: 50%;
      left: 50%;
      margin-top: -20px;
      transform: translate(-50%, -50%);
      border-left: 1px solid #ccc;
      border-right: 1px solid #ccc;
    }
    &:hover {
      &:before {
        border-color: #999;
      }
    }
  }

  &.layout-h {
    flex-direction: column;
    > .multipane-resizer {
      width: 100%;
      height: 10px;
      cursor: row-resize;
      &:before {
        transform: translate(0) rotate(90deg);
      }
    }
  }

  &.layout-v {
    flex-direction: row;
    > .multipane-resizer {
      width: 10px;
      height: 100%;
      cursor: col-resize;
    }
  }
}

.multipane > div {
  position: relative;
  z-index: 1;
}
</style>
