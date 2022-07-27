export interface NetStatus {
  network_info: string;
}

export interface NetInfo {
  getCurrentConnectivity: () => NetStatus;
}
