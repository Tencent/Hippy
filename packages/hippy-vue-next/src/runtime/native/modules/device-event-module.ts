export interface DeviceEventModule {
  invokeDefaultBackPressHandler: () => void;
  setListenBackPress: (flag: boolean) => void;
}
