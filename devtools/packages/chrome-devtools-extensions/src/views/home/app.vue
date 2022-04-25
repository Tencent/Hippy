<template>
  <div class="home-wrap">
    <h3>{{ isFailed ? '获取调试页面失败，请启动调试服务：npm run hippy:debug' : '调试页面：' }}</h3>
    <div class="list">
      <div v-for="(target, i) of debugTargets" :key="i" class="list-item" @click="openTarget(target)">
        <img class="target-icon" :src="getItemIcon(target)" />
        <div class="target-info">
          <div class="target-title-row">
            <span>{{ target.title || 'No context name' }}</span>
            <div class="debug-abilities">
              <span v-for="ability of getDebugAbility(target)" :key="ability" class="debug-ability">{{ ability }}</span>
            </div>
            <span class="create-ts">{{ target.ts ? 'create at ' + format(target.ts) : '' }}</span>
          </div>
          <div class="target-device-row">
            <span v-if="target.deviceName" class="device-name">Device Name: {{ target?.deviceName }}</span>
            <span v-if="target.deviceId" class="device-id">Device ID: {{ target?.deviceId }}</span>
            <span v-if="target.deviceOSVersion" class="device-os-version"
              >OS Version: {{ target?.deviceOSVersion }}</span
            >
          </div>
        </div>
      </div>
      <div v-if="isLoading || debugTargets.length === 0 || isFailed" class="list-item no-targets">
        <span v-if="isFailed">查询调试服务失败</span>
        <span v-else-if="isLoading">加载中...</span>
        <span v-else>无调试页面</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { useStore } from 'vuex';
import { Iphone } from '@element-plus/icons';
import dayjs from 'dayjs';
import '@chrome-devtools-extensions/views/index.scss';
import AndroidIcon from '@chrome-devtools-extensions/assets/img/android.png';
import IOSIcon from '@chrome-devtools-extensions/assets/img/iOS.png';
import { AppClientType, DevicePlatform } from '@chrome-devtools-extensions/@types/enum';

const fetchInterval = 1500;
let fetchTimer;

export default defineComponent({
  name: 'App',
  components: { Iphone },
  setup() {
    const store = useStore();
    const { debugTargets, isFailed, isLoading } = toRefs(store.state);
    return {
      debugTargets,
      isFailed,
      isLoading,
      format: (ts) => dayjs(ts).format('HH:mm:ss'),
    };
  },
  created() {
    this.modifyTitle();
    this.getDebugTargets();
    fetchTimer = setInterval(this.getDebugTargets, fetchInterval);
  },
  beforeDestroy() {
    clearInterval(fetchTimer);
  },
  methods: {
    getDebugTargets() {
      this.$store.dispatch('getDebugTargets');
    },
    openTarget(target) {
      window.open(target.devtoolsFrontendUrl);
    },
    getItemIcon(target) {
      return target.platform === DevicePlatform.Android ? AndroidIcon : IOSIcon;
    },
    getDebugAbility(target) {
      const abilities: string[] = [];
      const customAbilities = ['Elements'];
      const jsAbilities = ['Sources', 'Log', 'Memory'];
      if (target.platform === DevicePlatform.Android) {
        if (target.appClientTypeList.includes(AppClientType.WS)) {
          abilities.push(...customAbilities, ...jsAbilities);
        }
      } else {
        if (target.appClientTypeList.includes(AppClientType.WS)) {
          abilities.push(...customAbilities);
        }
        if (target.appClientTypeList.includes(AppClientType.IWDP)) {
          abilities.push(...jsAbilities);
        }
      }
      return abilities;
    },
    modifyTitle() {
      let env = new URL(location.href).searchParams.get('env') || 'hippy';
      env = env.replace(env[0], env[0].toUpperCase());
      document.title = `${env} DevTools`;

      const link: HTMLLinkElement = document.querySelector('link[rel*="icon"') || document.createElement('link');
      link.type = 'image/x-icon';
      link.rel = 'icon';
      const iconName = env === 'TDFCore' ? 'TDF' : env;
      link.href = `favicon-${iconName}.png`;
      document.getElementsByTagName('head')[0].appendChild(link);
    },
  },
});
</script>

<style lang="scss" scoped>
.home-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  h3 {
    width: 800px;
  }
  .list {
    width: 800px;
    .list-item {
      padding: 5px;
      display: flex;
      flex-flow: row nowrap;
      justify-items: flex-start;
      align-items: center;
      cursor: pointer;
      border-top: 1px solid #eee;
      &.no-targets {
        padding: 10px 0;
        color: var(--el-text-color-secondary);
        display: flex;
        flex-flow: row;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }
      &:last-child {
        border-bottom: 1px solid #eee;
      }
      .target-icon {
        width: 20px;
        height: 20px;
      }
      .target-info {
        flex: 1;
        overflow: hidden;
        margin-left: 20px;
        display: flex;
        flex-flow: column nowrap;
        justify-items: space-between;
        .target-title-row,
        .target-device-row {
          width: 100%;
          display: flex;
          flex-direction: row nowrap;
          justify-content: flex-start;
          align-items: center;
          overflow: hidden;
          span {
            font-size: 12px;
            margin-right: 10px;
            color: var(--el-text-color-primary);
            text-overflow: ellipsis;
            overflow: hidden;
            margin-right: 10px;
            &.target-title,
            &.device-name {
              -webkit-line-clamp: 1;
              display: -webkit-box;
              -webkit-box-orient: vertical;
              color: var(--el-text-color-primary);
            }
            &.create-ts {
              font-size: 10px;
              margin-left: auto;
            }
          }
        }
        .target-title-row {
          justify-content: flex-start;
          margin: 5px;
          > span {
            color: var(--el-text-color-primary);
            font-size: 16px;
          }
        }
        .target-device-row {
          justify-content: space-between;
          > span {
            margin: 5px;
            &.span:last-child {
              margin-right: 0;
            }
          }
        }
        .debug-abilities {
          display: flex;
          justify-content: flex-start;
          flex-direction: row nowrap;
          align-items: center;
          overflow: hidden;
          .debug-ability {
            background: #bff1be;
            padding: 0 3px;
            border-radius: 5px;
            font-size: 8px;
            margin-right: 10px;
          }
        }
      }
    }
  }
}
</style>
