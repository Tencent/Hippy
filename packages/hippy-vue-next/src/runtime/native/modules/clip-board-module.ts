export interface ClipboardModule {
  getString: () => string;
  setString: (content: string) => void;
}
