import Vue from './runtime/index';
import { setVue } from './util/index';
import WebSocket from './runtime/websocket';

global.process = global.process || {};
global.process.env = global.process.env || {};
global.WebSocket = WebSocket;

Vue.config.silent = false;

setVue(Vue);

export default Vue;
