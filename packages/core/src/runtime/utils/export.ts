import path from 'path'
import fs from 'fs/promises'
import glob from 'fast-glob'
import { convertPathToPattern } from 'fast-glob/out/utils/path';

import { camelCase, upperFirst } from '.';

export async function generateComposables(args: { 
  dir: string, 
  ignorePatterns?: string[],
  ignorePrefixes?: string[]
}) {
  const { dir, ignorePatterns = [], ignorePrefixes = ['_'] } = args;
  const rootDir = path.resolve(process.cwd(), dir || ".", dir || 'api');
  const composableExport = path.join(rootDir, '_composables_/index.ts')
  const composablesDir = path.join(rootDir, '_composables_');

  try {
    await fs.mkdir(composablesDir);
  } catch (err) {
    // Directory already exists, ignore error
  }

  // Convert paths to patterns
  const normalizedRootDir = convertPathToPattern(rootDir);
  const normalizedComposableExport = convertPathToPattern(composableExport);
  const normalizedComposablesDir = convertPathToPattern(composablesDir);

  const files = glob.sync(`${normalizedRootDir}/**/*.ts`, {
    ignore: [
      `${normalizedRootDir}/index.ts`,
      `${normalizedRootDir}/**/*.d.ts`,
      normalizedComposablesDir,
      ...ignorePatterns.map(pattern => `${normalizedRootDir}/${convertPathToPattern(pattern)}`)
    ],
  });

  if (files.length === 0) {
    console.log('No files found. Please check the directory and patterns.');
    return;
  }

  const exports = files
    .filter(filePath => {
      const relativePath = path.relative(rootDir, filePath);
      const segments = relativePath.split(path.sep);
      // Check if any segment starts with an ignored prefix
      return !segments.some(segment => 
        ignorePrefixes.some(prefix => segment.startsWith(prefix))
      );
    })
    .map(filePath => {
      let relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/')
      relativePath = relativePath.replace('.ts', '')

      const directoryPath = path.posix.dirname(filePath);
      const tsFilesInSameDirectory = glob.sync(path.posix.join(directoryPath, '*.ts'))

      if (tsFilesInSameDirectory.length === 1 && relativePath.endsWith('/index')) {
        relativePath = relativePath.replace('/index', '')
      }

      const pathSegments = relativePath.split('/');
      const pascalCasedSegments = pathSegments.map(segment => upperFirst(camelCase(segment)));
      const formattedPath = 'useApi' + pascalCasedSegments.join('');

      const exportStatement = `export { default as ${formattedPath} } from '../${relativePath}'`;
      return exportStatement;
    });

  const content = exports.join('\n');
  
  try {
    await fs.writeFile(normalizedComposableExport, content, 'utf8');
  } catch (err) {
    console.log(`Error writing file: ${err}`);
  }
}