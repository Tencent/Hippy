/*
 * Tencent is pleased to support the open source community by making
 * Hippy available.
 *
 * Copyright (C) 2022 THL A29 Limited, a Tencent company.
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { HippyNativeModule } from '../../../../support/annotation/HippyNativeModule'
import { HippyException } from '../../../../support/common/HippyException'
import { HippyEngineContext } from '../../../HippyEngineContext'
import { HippyNativeModuleBase } from '../HippyNativeModuleBase'
import { LogUtils } from '../../../../support/utils/LogUtils'
import { media } from '@kit.MediaKit'
import Url from '@ohos.url'
import { HippyAny } from '../../../../support/common/HippyTypes'
import { HippyModulePromise } from '../../HippyModulePromise'

const AUDIO_MODULE_TAG: string = 'AudioPlayerModule'

@HippyNativeModule({ name: "AudioPlayerModule" })
export class AudioPlayerModule extends HippyNativeModuleBase {
  private mMediaPlayer: media.AVPlayer | null = null
  private mState = "initialized"

  constructor(ctx: HippyEngineContext) {
    super(ctx)
    this.createMediaPlayer()
  }

  public call(method: string, params: Array<HippyAny>, callback: HippyModulePromise): HippyAny {
    switch (method) {
      case 'play': {
        this.play(params[0] as string, callback)
        break;
      }
      case 'goBack': {
        this.goBack(params[0] as number)
        break;
      }
      case 'goForward': {
        this.goForward(params[0] as number)
        break;
      }
      case 'seekTo': {
        this.seekTo(params[0] as number)
        break;
      }
      case 'pause': {
        this.pause()
        break;
      }
      case 'resume': {
        this.resume()
        break;
      }
      case 'stop': {
        this.stop()
        break;
      }
      default:
        super.call(method, params, callback)
    }
    return null;
  }

  private createMediaPlayer(): Promise<media.AVPlayer | null> {
    this.mState = "prepared"
    return media.createAVPlayer().then((video) => {
      if (video != null) {
        LogUtils.i(AUDIO_MODULE_TAG, 'createAVPlayer success');
        this.mMediaPlayer = video
        return video
      } else {
        LogUtils.e(AUDIO_MODULE_TAG, 'createAVPlayer fail');
        return null
      }
    }).catch((error: HippyException) => {
      LogUtils.e(AUDIO_MODULE_TAG, `AVPlayer catchCallback, error message:${error.message}`);
      return null
    });
  }

  private getState(): string {
    if (this.mMediaPlayer != null && this.mMediaPlayer.state == "playing") {
      //'idle' | 'initialized' | 'prepared' | 'playing' | 'paused' | 'completed'
      // | 'stopped' | 'released' | 'error'
      return this.mMediaPlayer.state
    }
    return this.mState
  }

  private async play(streamingURL: string, promise: HippyModulePromise) {
    if (this.mMediaPlayer == null) {
      await this.createMediaPlayer()
    }
    if (this.mMediaPlayer != null) {
      this.mMediaPlayer.url = Url.URL.parseURL(streamingURL).toString();
      let map = new Map<string, string>()
      try {
        this.mMediaPlayer.on('stateChange', async (state, reason) => {
          switch (state) {
            case 'idle':
              LogUtils.e(AUDIO_MODULE_TAG, 'state idle called')
              break;
            case 'initialized':
              LogUtils.e(AUDIO_MODULE_TAG, 'initialized prepared called')
              break;
            case 'prepared':
              LogUtils.e(AUDIO_MODULE_TAG, 'state prepared called')
              this.resume()
              break;
            case 'playing':
              LogUtils.e(AUDIO_MODULE_TAG, 'state playing called')
              break;
            case 'paused':
              LogUtils.e(AUDIO_MODULE_TAG, 'state paused called')
              break;
            case 'completed':
              LogUtils.e(AUDIO_MODULE_TAG, 'state completed called')
              this.mState = "completed"
              break;
            case 'stopped':
              LogUtils.e(AUDIO_MODULE_TAG, 'state stopped called')
              break;
            case 'released':
              LogUtils.e(AUDIO_MODULE_TAG, 'state released called')
              break;
            case 'error':
              LogUtils.e(AUDIO_MODULE_TAG, 'state error called')
              break;
            default:
              LogUtils.e(AUDIO_MODULE_TAG, 'unkown state :' + state)
              break;
          }
        })
        map.set("play", "OK")
        promise.resolve(map);
      } catch (error) {
        LogUtils.e(AUDIO_MODULE_TAG, "play error: " + error)
        map.set("play", "ERROR")
        promise.resolve(map);
      }
    }
  }

  private goBack(seconds: number) {
    try {
      let milliseconds = Math.round(seconds) * 1000;
      if (this.mMediaPlayer !== null) {
        let newPosition = this.mMediaPlayer.currentTime - milliseconds;
        if (newPosition < 0) {
          newPosition = 0;
        }
        this.seekTo(newPosition);
      }
    } catch (error) {
      LogUtils.e(AUDIO_MODULE_TAG, "back error: " + error)
    }
  }

  private goForward(seconds: number) {
    try {
      let milliseconds = Math.round(seconds) * 1000;
      if (this.mMediaPlayer !== null) {
        let newPosition = this.mMediaPlayer.currentTime + milliseconds;
        let mDuration = 0;
        if (newPosition > mDuration) {
          newPosition = mDuration;
        }
        this.seekTo(newPosition);
      }
    } catch (error) {
      LogUtils.e(AUDIO_MODULE_TAG, "forward error: " + error)
    }
  }

  private seekTo(newPosition: number) {
    try {
      if (this.mMediaPlayer != null) {
        this.mMediaPlayer.seek(newPosition, media.SeekMode.SEEK_PREV_SYNC);
      }
    } catch (error) {
      LogUtils.e(AUDIO_MODULE_TAG, "seek error: " + error)
    } finally {
      this.mState = "prepared";
    }
  }

  private pause() {
    try {
      if (this.mMediaPlayer != null) {
        this.mMediaPlayer.pause().then(() => {
          LogUtils.i(AUDIO_MODULE_TAG, 'media pauseed')
        }).catch((err: HippyException) => {
          LogUtils.e(AUDIO_MODULE_TAG, `ERROR: ${err}`)
        });
      }
    } catch (error) {
      LogUtils.e(AUDIO_MODULE_TAG, "pause error: " + error)
    } finally {
      this.mState = "paused";
    }
  }

  private resume() {
    try {
      if (this.mMediaPlayer != null) {
        this.mMediaPlayer.play().then(() => {
          LogUtils.i(AUDIO_MODULE_TAG, 'media resumed')
        }).catch((err: HippyException) => {
          LogUtils.e(AUDIO_MODULE_TAG, `ERROR: ${err}`)
        });
      }
    } catch (error) {
      LogUtils.e(AUDIO_MODULE_TAG, "resume error: " + error)
    } finally {
      this.mState = 'playing';
    }
  }

  private stop() {
    try {
      if (this.mMediaPlayer != null) {
        this.mMediaPlayer.stop().then(() => {
          LogUtils.i(AUDIO_MODULE_TAG, 'media stopped')
        }).catch((err: HippyException) => {
          LogUtils.e(AUDIO_MODULE_TAG, `ERROR: ${err}`)
        });
      }
    } catch (error) {
      LogUtils.e(AUDIO_MODULE_TAG, "stop error: " + error)
    } finally {
      this.mState = "stopped";
    }
  }
}
