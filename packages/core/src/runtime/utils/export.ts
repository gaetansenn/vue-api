import path from 'path'
import fs from 'fs/promises'
import glob from 'fast-glob'
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

  const files = glob.sync(path.join(rootDir, '**/*.ts'), {
    ignore: [
      path.join(rootDir, 'index.ts'),
      composablesDir,
      ...ignorePatterns.map(pattern => path.join(rootDir, pattern))
    ],
  })

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
  
      const directoryPath = path.resolve(filePath, '..')
      const tsFilesInSameDirectory = glob.sync(path.join(directoryPath, '*.ts'))
  
      if (tsFilesInSameDirectory.length === 1 && relativePath.endsWith('/index')) {
        relativePath = relativePath.replace('/index', '')
      }
  
      const pathSegments = relativePath.split('/');
      const pascalCasedSegments = pathSegments.map(segment => upperFirst(camelCase(segment)));
      const formattedPath = 'useApi' + pascalCasedSegments.join('');
  
      return `export { default as ${formattedPath} } from '../${relativePath}'`
    })

  const content = exports.join('\n')
  await fs.writeFile(composableExport, content, 'utf8')
}