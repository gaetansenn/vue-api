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
  const composableExport = path.posix.join(rootDir, '_composables_/index.ts')
  const composablesDir = path.posix.join(rootDir, '_composables_');

  try {
    await fs.mkdir(composablesDir);
  } catch (err) {
    // Directory already exists, ignore error
  }

  const files = glob.sync(path.posix.join(rootDir, '**/*.ts'), {
    ignore: [
      path.posix.join(rootDir, 'index.ts'),
      composablesDir,
      ...ignorePatterns.map(pattern => path.posix.join(rootDir, pattern))
    ],
  })

  const exports = files
    .filter(filePath => {
      const relativePath = path.posix.relative(rootDir, filePath);
      const segments = relativePath.split(path.posix.sep);
      // Check if any segment starts with an ignored prefix
      return !segments.some(segment => 
        ignorePrefixes.some(prefix => segment.startsWith(prefix))
      );
    })
    .map(filePath => {
      let relativePath = path.posix.relative(rootDir, filePath).replace(/\\/g, '/')
      relativePath = relativePath.replace('/index', '').replace('.ts', '')
  
      const directoryPath = path.posix.resolve(filePath, '..')
      const tsFilesInSameDirectory = glob.sync(path.posix.join(directoryPath, '*.ts'))
  
      if (tsFilesInSameDirectory.length === 1 && relativePath.endsWith('/index')) {
        relativePath = relativePath.replace('/index', '')
      }
  
      const pathSegments = relativePath.split('/');
      const pascalCasedSegments = pathSegments.map(segment => upperFirst(camelCase(segment)));
      const formattedPath = 'useApi' + pascalCasedSegments.join('');
  
      return `export { default as ${formattedPath} } from ${path.posix.join('..', relativePath)}`
    })

  const content = exports.join('\n')
  await fs.writeFile(composableExport, content, 'utf8')
}