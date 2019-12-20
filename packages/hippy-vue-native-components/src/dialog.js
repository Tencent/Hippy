function registerDialog(Vue) {
  Vue.registerElement('dialog', {
    component: {
      name: 'Modal',
      defaultNativeProps: {
        transparent: true,
        immersionStatusBar: true,
      },
    },
  });
}

export default registerDialog;
