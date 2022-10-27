(function () {
  const root = globalThis ?? window;
  if (!root) {
    throw 'global init failed, not find global';
  }
  root.__e2e__ = {
    route: root.e2eHistory,
    print: root.innerPrint,
  };
  const beforeEach = function () {
    root.__e2e__.route.replace('/blank');
  };
  mocha.rootHooks({
    beforeEach,
  });
  mocha.timeout(5000);
}());
