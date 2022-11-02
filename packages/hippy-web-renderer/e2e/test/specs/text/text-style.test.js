const { expect } = chai;

describe('text', () => {
  it('text style', (done)  => {
    e2e.route.replace('/text-style');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
