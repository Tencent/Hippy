export class Singleton {
  private static instance: Singleton;
  public static getInstance(...args): Singleton {
    if (!Singleton.instance) {
      Singleton.instance = new Singleton(args);
    }
    return Singleton.instance;
  }

  constructor(..._args) {}
}
