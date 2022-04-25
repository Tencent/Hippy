import glob from 'glob';
import util from 'util';
import { generateDts } from './protocol-dts-generator';
import fs from 'fs';
import path from 'path';

const globAsync = util.promisify(glob);

(async () => {
  await generateDts({
    inputFileNames: ['js_protocol.json', 'browser_protocol.json'],
    outputTypeFileName: 'protocol-chrome',
    outputEnumPrefix: 'chrome',
  });

  await generateDts({
    inputFileNames: ['tdf_protocol.json'],
    outputTypeFileName: 'protocol-tdf',
    outputEnumPrefix: 'tdf',
  });

  const iosJsonFiles = await globAsync('../json/ios/**/*.json', { cwd: __dirname });
  await Promise.all(
    iosJsonFiles.map((file) => {
      const version = file.match(/(\d+\.\d+)\.json$/)[1];
      const inputFileNames = [`ios/Inspector-iOS-${version}.json`];
      const outputTypeFileName = `protocol-ios-${version}`;
      const outputEnumPrefix = `ios-${version}`;
      return generateDts({
        inputFileNames,
        outputTypeFileName,
        outputEnumPrefix,
      });
    }),
  );

  await writeEnumIndexFile();
})();

async function writeEnumIndexFile() {
  const enumFiles = await globAsync('./**/*.ts', {
    cwd: path.join(__dirname, '../types'),
    ignore: './index.ts',
  });
  const fileData = enumFiles
    .map((file) => {
      if (!isIosEnumFile(file)) return `export * from '${file.replace('.ts', '')}';\n`;
      const matchGroup = file.match(/enum-ios-(\d+)\.(\d+)\.ts$/);
      const iosVersion = `${matchGroup[1]}${matchGroup[2]}`;
      return `export * as IOS${iosVersion} from '${file.replace('.ts', '')}';\n`;
    })
    .join('');
  return fs.promises.writeFile(path.join(__dirname, '../types/index.ts'), fileData);
}

function isIosEnumFile(file: string) {
  return file.includes('ios') && !file.includes('mapping');
}
