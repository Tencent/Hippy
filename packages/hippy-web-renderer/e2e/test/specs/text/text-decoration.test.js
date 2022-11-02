const { expect } = chai;

describe('text', () => {
  it('text decoration', (done)  => {
    e2e.route.replace('/text-decoration');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
