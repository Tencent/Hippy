export const CDP_DOMAIN_LIST = [
  'Accessibility',
  'Animation',
  'ApplicationCache',
  'Audits',
  'BackgroundService',
  'Browser',
  'CSS',
  'CacheStorage',
  'Cast',
  'DOM',
  'DOMDebugger',
  'DOMSnapshot',
  'DOMStorage',
  'Database',
  'DeviceOrientation',
  'Emulation',
  'HeadlessExperimental',
  'IO',
  'IndexedDB',
  'Input',
  'Inspector',
  'LayerTree',
  'Log',
  'Memory',
  'Network',
  'Overlay',
  'Page',
  'Performance',
  'PerformanceTimeline',
  'Security',
  'ServiceWorker',
  'Storage',
  'SystemInfo',
  'Target',
  'Tethering',
  'Tracing',
  'Fetch',
  'WebAudio',
  'WebAuthn',
  'Media',
  'Console',
  'Debugger',
  'HeapProfiler',
  'Profiler',
  'Runtime',
  'Schema',
];

export const isCdpDomains = (domain) => CDP_DOMAIN_LIST.indexOf(domain) !== -1;

export const getDomain = (method: string) => {
  let domain = method;
  const group = method.match(/^(\w+)(\.\w+)?$/);
  if (group) {
    domain = group[1];
  }
  return domain;
};

export class DomainRegister {
  protected listeners: Map<string, Adapter.DomainListener[]> = new Map();

  public registerDomainListener: Adapter.RegisterDomainListener = (domain, listener) => {
    if (!this.listeners.has(domain)) this.listeners.set(domain, []);
    this.listeners.get(domain).push(listener);
  };

  protected triggerListerner(msg: Adapter.CDP.Res) {
    if (this.listeners.has(msg.method)) {
      this.listeners.get(msg.method).forEach((listener) => {
        listener(msg);
      });
    }
  }
}
