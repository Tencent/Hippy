<template>
  <div class="demo-turbo">
    <span class="result"> {{ result }} </span>
    <ul style="flex: 1; ">
      <li
        v-for="(funcName) in funList"
        :key="funcName"
        class="cell"
      >
        <div class="contentView">
          <div class="func-info">
            <span :numberOfLines="1">函数名：{{ funcName }}</span>
          </div>
          <span
            class="action-button"
            @click.stop="() => onTurboFunc(funcName)"
          >运行</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import {
  getArray,
  getBoolean,
  getMap,
  getNum,
  getObject,
  getString,
  getTurboConfig,
  nativeWithPromise,
  printTurboConfig,
} from './demoTurbo';

export default {
  data() {
    return {
      config: null,
      result: '',
      funList: [
        'getString',
        'getNum',
        'getBoolean',
        'getMap',
        'getObject',
        'getArray',
        'nativeWithPromise',
        'getTurboConfig',
        'printTurboConfig',
        'getInfo',
        'setInfo',
      ],
    };
  },

  methods: {
    async onTurboFunc(funcName) {
      if (funcName === 'nativeWithPromise') {
        this.result = await nativeWithPromise('aaa');
      } else if (funcName === 'getTurboConfig') {
        this.config = getTurboConfig();
        this.result = '获取到config对象';
      } else if (funcName === 'printTurboConfig') {
        this.result = printTurboConfig((this.config || getTurboConfig()));
      } else if (funcName === 'getInfo') {
        this.result = (this.config || getTurboConfig()).getInfo();
      } else if (funcName === 'setInfo') {
        (this.config || getTurboConfig()).setInfo('Hello World');
        this.result = '设置config信息成功';
      } else {
        const basicFuncs = {
          getString: () => getString('123'),
          getNum: () => getNum(1024),
          getBoolean: () => getBoolean(true),
          getMap: () => getMap(new Map([['a', '1'], ['b', 2]])),
          getObject: () => getObject({ c: '3', d: '4' }),
          getArray: () => getArray(['a', 'b', 'c']),
        };
        this.result = basicFuncs[funcName]();
      }
    },
  },
};
</script>

<style scoped>
.demo-turbo {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.demo-turbo .cell .contentView {
  flex-direction: row;
  justify-content: space-between;
  background-color: #ccc;
  margin-bottom: 1px;
}

.demo-turbo .func-info {
  justify-content: center;

  padding-left: 15px;
  padding-right: 15px;
}

.demo-turbo .action-button {
  background-color: #4c9afa;
  color: white;
  height: 44px;
  line-height: 44px;
  text-align: center;
  width: 80px;
  border-radius: 6px;
}

.demo-turbo .result {
  background-color: darkseagreen;
  min-height: 150px;
  padding: 15px;
}

</style>
