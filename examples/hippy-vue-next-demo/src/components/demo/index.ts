import DemoButton from './demo-button.vue';
import DemoDiv from './demo-div.vue';
import DemoDynamicImport from './demo-dynamic-import.vue';
import DemoIFrame from './demo-iframe.vue';
import DemoImg from './demo-img.vue';
import DemoInput from './demo-input.vue';
import DemoList from './demo-list.vue';
import DemoP from './demo-p.vue';
import DemoShadow from './demo-shadow.vue';
import DemoTextarea from './demo-textarea.vue';
import DemoTurbo from './demo-turbo.vue';
import DemoWebSocket from './demo-websocket.vue';

const demos = {
  demoDiv: {
    name: 'div 组件',
    component: DemoDiv,
  },
  demoShadow: {
    name: 'box-shadow',
    component: DemoShadow,
  },
  demoP: {
    name: 'p 组件',
    component: DemoP,
  },
  demoButton: {
    name: 'button 组件',
    component: DemoButton,
  },
  demoImg: {
    name: 'img 组件',
    component: DemoImg,
  },
  demoInput: {
    name: 'input 组件',
    component: DemoInput,
  },
  demoTextarea: {
    name: 'textarea 组件',
    component: DemoTextarea,
  },
  demoUl: {
    name: 'ul/li 组件',
    component: DemoList,
  },
  demoIFrame: {
    name: 'iframe 组件',
    component: DemoIFrame,
  },
  demoWebSocket: {
    name: 'WebSocket',
    component: DemoWebSocket,
  },
  demoDynamicImport: {
    name: 'DynamicImport',
    component: DemoDynamicImport,
  },
  demoTurbo: {
    name: 'Turbo',
    component: DemoTurbo,
  },
};

export default demos;
