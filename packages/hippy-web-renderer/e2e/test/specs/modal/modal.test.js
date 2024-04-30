const { expect } = chai;

describe('modal', () => {
  it('modal show', (done)  => {
    __e2e__.route.replace('/modal-spec');
    setTimeout(() => {
      globalThis.currentRef.show();
    }, 500);
    snapshot(1).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
