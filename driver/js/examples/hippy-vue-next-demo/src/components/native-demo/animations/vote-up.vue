<template>
  <div>
    <animation
      :actions="animations.face"
      class="vote-face"
      playing
    />
    <animation
      tag="img"
      class="vote-up-eye"
      playing
      :props="{ src: imgs.upVoteEye }"
      :actions="animations.upVoteEye"
    />
    <animation
      tag="img"
      class="vote-up-mouth"
      playing
      :props="{ src: imgs.upVoteMouth }"
      :actions="animations.upVoteMouth"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from '@vue/runtime-core';

import upVoteEye from './up-vote-eye.png';
import upVoteMouth from './up-vote-mouth.png';

export default defineComponent({
  setup() {
    return {
      imgs: {
        upVoteEye,
        upVoteMouth,
      },
      animations: {
        face: {
          transform: {
            scale: [
              {
                startValue: 1,
                toValue: 1.2,
                duration: 250,
                timingFunction: 'linear',
              },
              {
                startValue: 1.2,
                toValue: 1,
                duration: 250,
                delay: 750,
                timingFunction: 'linear',
              },
            ],
          },
        },
        upVoteEye: {
          top: [
            {
              startValue: 14,
              toValue: 8,
              delay: 250,
              duration: 125,
            },
            {
              startValue: 8,
              toValue: 14,
              duration: 250,
            },
            {
              startValue: 14,
              toValue: 8,
              duration: 250,
            },
            {
              startValue: 8,
              toValue: 14,
              duration: 125,
            },
          ],
          transform: {
            scale: [
              {
                startValue: 1.2,
                toValue: 1.4,
                duration: 250,
                timingFunction: 'linear',
              },
              {
                startValue: 1.4,
                toValue: 1.2,
                delay: 750,
                duration: 250,
                timingFunction: 'linear',
              },
            ],
          },
        },
        upVoteMouth: {
          bottom: [
            {
              startValue: 9,
              toValue: 14,
              delay: 250,
              duration: 125,
            },
            {
              startValue: 14,
              toValue: 9,
              duration: 250,
            },
            {
              startValue: 9,
              toValue: 14,
              duration: 250,
            },
            {
              startValue: 14,
              toValue: 9,
              duration: 125,
            },
          ],
          transform: {
            scale: [
              {
                startValue: 1,
                toValue: 1.2,
                duration: 250,
                timingFunction: 'linear',
              },
              {
                startValue: 1.2,
                toValue: 1,
                delay: 750,
                duration: 250,
                timingFunction: 'linear',
              },
            ],
            scaleY: [
              {
                startValue: 0.725,
                delay: 250,
                toValue: 1.45,
                duration: 125,
              },
              {
                startValue: 1.45,
                toValue: 0.87,
                duration: 250,
              },
              {
                startValue: 0.87,
                toValue: 1.45,
                duration: 250,
              },
              {
                startValue: 1.45,
                toValue: 1,
                duration: 125,
              },
            ],
          },
        },
      },
    };
  },
});
</script>

<style scoped>
.vote-face {
  width: 40px;
  height: 40px;
  background-color: #ffdb00;
  border-color: #e9b156;
  border-width: 1px;
  border-style: solid;
  border-radius: 20px;
}

.vote-up-eye {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 18px;
  height: 4px;
}
.vote-up-mouth {
  position: absolute;
  bottom: 9px;
  left: 9px;
  width: 32px;
  height: 16px;
}
</style>
