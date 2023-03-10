/**
 * iOS vite build config
 */
import { getViteBaseConfig } from './vite.config.client-base';

const isProd = process.argv[process.argv.length - 1] !== 'development';

const options = {
  platform: isProd ? 'ios' : null,
  env: isProd
    ? `{
            NODE_ENV: 'production',
          }`
    : `{
          NODE_ENV: 'development',
          HOST: '127.0.0.1',
          PORT: 38989,
        }`,
  targets: ['iOS 9'],
  fileName: 'dev/ios/index.js',
  isProd,
  manifest: 'manifest.ios.json',
};

export default getViteBaseConfig(options);
