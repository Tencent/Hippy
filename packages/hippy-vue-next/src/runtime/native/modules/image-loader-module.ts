export interface ImageLoaderModule {
  getSize: (url: string) => {
    width: number;
    height: number;
  };
  prefetch: (url: string) => void;
}
