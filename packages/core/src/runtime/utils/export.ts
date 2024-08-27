import { promises as fs } from 'fs'
import { resolve, relative, join } from 'path'
import glob from 'fast-glob'
import { mkdir } from 'fs/promises'
import _ from 'lodash'

export async function generateComposables(args: { dir: string }) {
  // Define the directory that contains the composables
  const rootDir = resolve(process.cwd(), args.dir || ".", args.dir || 'api');

  // Define the exportable composables path for vue-api
  const composableExport = join(rootDir, '_composables_/index.ts')

  // Create the '_composables_' directory if it doesn't exist
  const composablesDir = join(rootDir, '_composables_');

  try {
    await mkdir(composablesDir);
  } catch (err) {
    //
  }

  // Use glob to find all .ts files in the directory
  const files = glob.sync(join(rootDir, '**/*.ts'), {
    ignore: [join(rootDir, 'index.ts'), composablesDir],
  })

  // Map the file names to export statements
  const exports = files.map(filePath => {
    let relativePath = relative(rootDir, filePath).replace(/\\/g, '/')
  
    // Remove .ts extension
    relativePath = relativePath.replace('.ts', '')
  
    // Check if it's index.ts and the only .ts file in the same directory
    const directoryPath = resolve(filePath, '..')
    const tsFilesInSameDirectory = glob.sync(join(directoryPath, '*.ts'))
  
    if (tsFilesInSameDirectory.length === 1 && relativePath.endsWith('/index')) {
      // If there is only 'index.ts', remove '/index' from the relativePath
      relativePath = relativePath.replace('/index', '')
    }
  
    // Split the path into segments, convert each segment to PascalCase and join them back together
    const pathSegments = relativePath.split('/');
    const pascalCasedSegments = pathSegments.map(segment => _.upperFirst(_.camelCase(segment)));
    const formattedPath = 'useApi' + pascalCasedSegments.join('');
  
    return `export { default as ${formattedPath} } from '../${relativePath}'`
  })
  

  // Join all the export statements with newlines
  const content = exports.join('\n')

  // Write the content to the index.ts file
  await fs.writeFile(composableExport, content, 'utf8')
}