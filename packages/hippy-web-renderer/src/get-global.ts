export const getGlobal = (): typeof globalThis => {
  let win;

  if (typeof window !== "undefined") {
      win = window;
  } else if (typeof global !== "undefined") {
      win = global;
  } else if (typeof self !== "undefined") {
      win = self;
  } else {
      win = {} as any;
  }
  return win;
}

export default getGlobal();
