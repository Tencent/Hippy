(async function () {
  await waitEngineReady(); // only needed in this demo env, to fix parcel bundler issue

  const { engine } = Hippy.web;

  // await engine.load([
  //   "http://localhost:38989/index.bundle?platform=android&dev=1&hot=1&minify=0",
  // ]);

  // start up your business
  engine.start({
    id: 'test-app',
    name: 'Demo',
    params: { path: '/test' },
  });
}());

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitEngineReady() {
  let i = 0;
  while (typeof Hippy === 'undefined' && i < 500) {
    await sleep(10);
    i = i + 1;
  }
}
