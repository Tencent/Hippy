<template>
  <div>
    <animation :actions="animations.face" class="vote-face" playing />
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

export default {
  data() {
    return {
      imgs: {
        downVoteFace,
      },
      animations: {
        face: {
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
        },
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
