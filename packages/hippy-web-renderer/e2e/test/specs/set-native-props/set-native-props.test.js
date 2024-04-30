const { expect } = chai;

describe('set-native-props', () => {
  it('set-native-props load', (done)  => {
    __e2e__.route.replace('/set-native-props-spec');
    snapshot(0.2).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
  it('set-native-props move', (done)  => {
    __e2e__.route.replace('/set-native-props-spec');
    setTimeout(() => {
      globalThis.currentRef.move();
    }, 200);
    snapshot(0.5).then((resolve) => {
      expect(resolve).to.equal(true);
      done();
    });
  });
});
