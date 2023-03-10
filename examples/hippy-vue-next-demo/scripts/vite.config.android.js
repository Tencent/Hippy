/**
 * Android vite build config
 */
import { getViteBaseConfig } from './vite.config.client-base';

const isProd = process.argv[process.argv.length - 1] !== 'development';

const options = {
  platform: isProd ? 'android' : null,
  env: isProd
    ? `{
            NODE_ENV: 'production',
          }`
    : `{
          NODE_ENV: 'development',
          HOST: '127.0.0.1',
          PORT: 38989,
        }`,
  targets: ['chrome 57'],
  fileName: 'dev/android/index.js',
  isProd,
  manifest: 'manifest.android.json',
};

export default getViteBaseConfig(options);
