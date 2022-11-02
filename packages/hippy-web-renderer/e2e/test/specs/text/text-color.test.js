const { expect } = chai;

describe('text', () => {
  it('text color', (done)  => {
    e2e.route.replace('/text-color');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      console.log('get resoluve');
      done();
    });
  });
});
