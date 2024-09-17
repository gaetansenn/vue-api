import path from 'path'
import glob from 'fast-glob'
import fs from 'fs/promises'
import { upperFirst } from 'lodash-es'
import { camelCase } from 'lodash-es'

export async function generateComposables(args: { dir: string }) {
  // Define the directory that contains the composables
  const rootDir = path.resolve(process.cwd(), args.dir || ".", args.dir || 'api');

  // Define the exportable composables path for vue-api
  const composableExport = path.join(rootDir, '_composables_/index.ts')

  // Create the '_composables_' directory if it doesn't exist
  const composablesDir = path.join(rootDir, '_composables_');

  try {
    await fs.mkdir(composablesDir);
  } catch (err) {
    //
  }

  // Use glob to find all .ts files in the directory
  const files = glob.sync(path.join(rootDir, '**/*.ts'), {
    ignore: [path.join(rootDir, 'index.ts'), composablesDir],
  })

  // Map the file names to export statements
  const exports = files.map(filePath => {
    let relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/')
  
    // Remove .ts extension
    relativePath = relativePath.replace('.ts', '')
  
    // Check if it's index.ts and the only .ts file in the same directory
    const directoryPath = path.resolve(filePath, '..')
    const tsFilesInSameDirectory = glob.sync(path.join(directoryPath, '*.ts'))
  
    if (tsFilesInSameDirectory.length === 1 && relativePath.endsWith('/index')) {
      // If there is only 'index.ts', remove '/index' from the relativePath
      relativePath = relativePath.replace('/index', '')
    }
  
    // Split the path into segments, convert each segment to PascalCase and join them back together
    const pathSegments = relativePath.split('/');
    const pascalCasedSegments = pathSegments.map(segment => upperFirst(camelCase(segment)));
    const formattedPath = 'useApi' + pascalCasedSegments.join('');
  
    return `export { default as ${formattedPath} } from '../${relativePath}'`
  })
  

  // Join all the export statements with newlines
  const content = exports.join('\n')

  // Write the content to the index.ts file
  await fs.writeFile(composableExport, content, 'utf8')
}