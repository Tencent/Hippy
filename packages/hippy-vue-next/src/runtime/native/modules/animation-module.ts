import type { AnimationStyle } from '../../../native-component/animation';

interface CreateAnimationSetOptions {
  repeatCount: number;
  children: AnimationStyle[];
}

export interface AnimationModule {
  createAnimation: (
    flag: boolean,
    mode: string,
    fullOption: Record<string, any>,
  ) => number;
  startAnimation: (animationId: number) => void;
  createAnimationSet: (
    flag: boolean,
    options: CreateAnimationSetOptions,
  ) => number;
  resumeAnimation: (animationId: number) => void;
  pauseAnimation: (animationId: number) => void;
  destroyAnimation: (animationId: number) => void;
}
