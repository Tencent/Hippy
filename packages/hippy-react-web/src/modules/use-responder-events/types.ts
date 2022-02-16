export interface TouchEvent {
  pageX: number;
  pageY: number;
  target: any;
  currentTarget: any;
  force: number;
  identifier: number;
  stopPropagation: () => void;
};
