export default function applyReload() {
  console.info('App updated. Reloading...');
  global.Hippy.bridge.callNative('DevMenu', 'reload');
}
