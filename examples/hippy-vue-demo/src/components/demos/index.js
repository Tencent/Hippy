import demoButton from './demo-button.vue';
import demoDiv from './demo-div.vue';
import demoImg from './demo-img.vue';
import demoInput from './demo-input.vue';
import demoP from './demo-p.vue';
import demoShadow from './demo-shadow.vue';
import demoTextarea from './demo-textarea.vue';
import demoList from './demo-list.vue';
import demoIFrame from './demo-iframe.vue';
import demoWebSocket from './demo-websocket.vue';
import demoDynamicImport from './demo-dynamicimport.vue';
import demoTurbo from './demo-turbo.vue';

const demos = {
  demoDiv: {
    name: 'div 组件',
    component: demoDiv,
  },
  demoShadow: {
    name: 'box-shadow',
    component: demoShadow,
  },
  demoP: {
    name: 'p 组件',
    component: demoP,
  },
  demoButton: {
    name: 'button 组件',
    component: demoButton,
  },
  demoImg: {
    name: 'img 组件',
    component: demoImg,
  },
  demoInput: {
    name: 'input 组件',
    component: demoInput,
  },
  demoTextarea: {
    name: 'textarea 组件',
    component: demoTextarea,
  },
  demoUl: {
    name: 'ul/li 组件',
    component: demoList,
  },
  demoIFrame: {
    name: 'iframe 组件',
    component: demoIFrame,
  },
  demoWebSocket: {
    name: 'WebSocket',
    component: demoWebSocket,
  },
  demoDynamicImport: {
    name: 'DynamicImport',
    component: demoDynamicImport,
  },
  demoTurbo: {
    name: 'Turbo',
    component: demoTurbo,
  },
};

export default demos;
