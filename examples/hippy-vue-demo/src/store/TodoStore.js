

const todoStore = {
  state: {
    todo: [
      {
        name: 'Buy Milk',
        id: 1,
      },
      {
        name: 'Buy Chocolates',
        id: 2,
      },
      {
        name: 'Do Laundry',
        id: 3,
      },
    ],
    count: 3,
  },
  mutations: {
    ADD_TODO: (state, name) => {
      state.count += 1;
      state.todo.push({ name, id: state.count });
    },
    DELETE_TODO: (state, id) => {
      const todos = state.todo.filter(val => val.id !== id);
      state.todo = [...todos];
      state.count -= 1;
    },
  },
  actions: {
    addTodo: (context, name) => {
      context.commit('ADD_TODO', name);
    },
    deleteTodo: (context, id) => {
      context.commit('DELETE_TODO', id);
    },
  },
};

export default todoStore;
