const { expect } = chai;

describe('refresh-wrapper', () => {
  it('refresh-wrapper load', (done)  => {
    __e2e__.route.replace('/refresh-wrapper-spec');
    setTimeout(() => {
      globalThis.currentRef.startRefresh();
    }, 500);
    snapshot(1).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
