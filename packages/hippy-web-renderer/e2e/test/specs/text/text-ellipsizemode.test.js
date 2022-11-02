const { expect } = chai;

describe('text', () => {
  it('text ellipsizeMode', (done)  => {
    e2e.route.replace('/text-ellipsizemode');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
