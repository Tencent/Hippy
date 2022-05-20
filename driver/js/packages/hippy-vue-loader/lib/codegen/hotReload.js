const hotReloadAPIPath = JSON.stringify(require.resolve('../vue-hot-reload-api'));

const genTemplateHotReloadCode = (id, request) => `
    module.hot.accept(${request}, function () {
      api.rerender('${id}', {
        render: render,
        staticRenderFns: staticRenderFns
      })
    })
  `.trim();

const genStyleHotReloadCode = (id, requestList) => {
  if (!requestList.length) return '';
  return requestList.map(request => `
      module.hot.accept(${request}, function () {
        api.repaint('${id}');
      })
    `.trim()).join('\n');
};

exports.genHotReloadCode = (id, functional, templateRequest, styleRequestList) => `
/* hot reload */
if (module.hot) {
  var api = require(${hotReloadAPIPath})
  api.install(require('vue'))
  if (api.compatible) {
    module.hot.accept()
    if (!api.isRecorded('${id}')) {
      api.createRecord('${id}', component.options)
    } else {
      api.${functional ? 'rerender' : 'reload'}('${id}', component.options)
    }
    ${templateRequest ? genTemplateHotReloadCode(id, templateRequest) : ''}
    ${styleRequestList ? genStyleHotReloadCode(id, styleRequestList) : ''}
  }
}
  `.trim();
