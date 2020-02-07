import Vue from 'vue';
import Vuex from 'vuex';
import todoStore from './TodoStore';

Vue.use(Vuex);

const store = new Vuex.Store({
  strict: true,
  modules: {
    todoStore,
  },
});

export default store;
