import path from 'path'
import consola from 'consola'
import glob from 'fast-glob'
import { Project } from 'ts-morph'
import type { CompilerOptions, SourceFile } from 'ts-morph'
const TSCONFIG_PATH = path.resolve( 'tsconfig.json')
const outDir = path.resolve('./dist', 'types')

export const excludeFiles = (
  files: string[],
  options: { customExcludeFiles: string[] } = { customExcludeFiles: [] }
) => {
  const { customExcludeFiles } = options
  const excludes = ['node_modules', 'gulpfile', 'dist', ...customExcludeFiles]
  return files.filter((path) => !excludes.some((exclude) => path.includes(exclude)))
}


/**
 * fork = require( https://github.com/egoist/vue-dts-gen/blob/main/src/index.ts
 */
export const generateTypesDefinitions = async () => {
  const compilerOptions: CompilerOptions = {
    emitDeclarationOnly: true,
    outDir,
    baseUrl: './',
    preserveSymlinks: true,
    skipLibCheck: true,
    noImplicitAny: false
  }
  const project = new Project({
    compilerOptions,
    tsConfigFilePath: TSCONFIG_PATH,
    skipAddingFilesFromTsConfig: true
  })

  await addSourceFiles(project)
  consola.success('Added source files')
  // todo:暂时不检查
  typeCheck(project)
  consola.success('Type check passed!')

  await project.emit({
    emitOnlyDtsFiles: true
  })
}
async function addSourceFiles(project: Project) {
  project.addSourceFileAtPath(path.resolve('./', 'env.d.ts'))

  const filePaths = excludeFiles(
    await glob(['**/*.ts',], {
      cwd: './src',
      absolute: true,
      onlyFiles: true
    })
  )
  console.log({filePaths})
  const sourceFiles: SourceFile[] = []
  await Promise.all([
    ...filePaths.map(async (file) => {
      const sourceFile = project.addSourceFileAtPath(file)
      sourceFiles.push(sourceFile)
    }),
  ])
  return sourceFiles
}
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function typeCheck(project: Project) {
  const diagnostics = project.getPreEmitDiagnostics()
  if (diagnostics.length > 0) {
    consola.error(project.formatDiagnosticsWithColorAndContext(diagnostics))
    const err = new Error('Failed to generate dts.')
    consola.error(err)
    throw err
  }
}
