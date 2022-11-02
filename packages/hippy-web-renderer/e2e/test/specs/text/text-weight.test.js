const { expect } = chai;

describe('text', () => {
  it('text weight', (done)  => {
    e2e.route.replace('/text-weight');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
