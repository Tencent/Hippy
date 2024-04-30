const { expect } = chai;

describe('net-info', () => {
  it('fetch', async ()  => {
    __e2e__.route.replace('/net-info-spec');
    const data = await globalThis.currentRef.fetchUrl();
    expect(data.status).to.not.equal(null);
  });
  it('fetch net info status', async ()  => {
    __e2e__.route.replace('/net-info-spec');
    const data = await globalThis.currentRef.fetchNetInfoStatus();
    expect(data).to.equal('WIFI');
  });
});
