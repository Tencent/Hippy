const { expect } = chai;

describe('list-view', () => {
  it('list-view load', (done)  => {
    __e2e__.route.replace('/list-view');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
