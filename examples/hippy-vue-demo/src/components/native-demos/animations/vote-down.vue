<template>
  <div>
    <animation ref='animationRef' :actions="animations.face" class="vote-face" playing
               @start="animationStart"
               @end="animationEnd"
               @repeat="animationRepeat"
               @cancel="animationCancel"
    />
    <animation
      tag="img"
      class="vote-down-face"
      playing
      :props="{src: imgs.downVoteFace}"
      :actions="animations.downVoteFace" />
  </div>
</template>

<script>
import downVoteFace from './down-vote-face.png';

const face1 = {
  transform: {
    scale: [
      {
        startValue: 1,
        toValue: 1.2,
        duration: 250,
        timingFunction: 'ease_bezier',
      },
      {
        startValue: 1.2,
        toValue: 1,
        duration: 250,
        delay: 750,
        timingFunction: 'ease_bezier',
      },
    ],
  },
};
const face2 = {
  transform: {
    translateX: [
      {
        startValue: 10,
        toValue: 1,
        duration: 250,
        timingFunction: 'ease_bezier',
      },
      {
        startValue: 1,
        toValue: 10,
        duration: 250,
        delay: 750,
        timingFunction: 'ease_bezier',
        repeatCount: -1,
      },
    ],
  },
};

export default {
  props: ['isChanged'],
  mounted() {
    this.animationRef = this.$refs.animationRef;
  },
  watch: {
    isChanged(to, from) {
      if (!from && to) {
        console.log('changed to face2');
        this.animations.face = face2;
      } else if (from && !to) {
        console.log('changed to face1');
        this.animations.face = face1;
      }
      // actions切换后，手动启动动画，由于创建动画需要与终端通信，延迟10ms保证动画已创建
      setTimeout(() => {
        this.animationRef.start();
      }, 10);
    },
  },
  data() {
    return {
      imgs: {
        downVoteFace,
      },
      animations: {
        face: face1,
        downVoteFace: {
          left: [
            {
              startValue: 16,
              toValue: 10,
              delay: 250,
              duration: 125,
            },
            {
              startValue: 10,
              toValue: 24,
              duration: 250,
            },
            {
              startValue: 24,
              toValue: 10,
              duration: 250,
            },
            {
              startValue: 10,
              toValue: 16,
              duration: 125,
            },
          ],
          transform: {
            scale: [
              {
                startValue: 1,
                toValue: 1.3,
                duration: 250,
                timingFunction: 'ease_bezier',
              },
              {
                startValue: 1.3,
                toValue: 1,
                delay: 750,
                duration: 250,
                timingFunction: 'ease_bezier',
              },
            ],
          },
        },
      },
    };
  },
  methods: {
    animationStart() {
      console.log('animation-start callback');
    },
    animationEnd() {
      console.log('animation-end callback');
    },
    animationRepeat() {
      console.log('animation-repeat callback');
    },
    animationCancel() {
      console.log('animation-cancel callback');
    },
  },
};
</script>

<style scope>
.vote-face {
  width: 40px;
  height: 40px;
  background-color: #ffdb00;
  border-color: #e9b156;
  border-width: 1px;
  border-radius: 20px;
}

.vote-down-face {
  position: absolute;
  top: 15px;
  left: 16px;
  width: 18px;
  height: 18px;
  resize-mode: stretch;
}
</style>
