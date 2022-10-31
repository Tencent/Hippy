const { expect } = chai;

describe('text', () => {
  it('text decoration', (done)  => {
    __e2e__.route.replace('/text-decoration');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
