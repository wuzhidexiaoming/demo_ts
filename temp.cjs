const ts = require('typescript')
const glob = require('fast-glob')
const excludeFiles = (
  files
) => {
  const excludes = ['node_modules', 'gulpfile', 'dist']
  return files.filter((path) => !excludes.some((exclude) => path.includes(exclude)))
}
const runTask = async () => {
  const filePaths = excludeFiles(
    await glob(['**/*.ts'], {
      cwd: './src',
      absolute: true,
      onlyFiles: true
    })
  )
  const options = {declaration: true, emitDeclarationOnly: true,outDir:'./dist/types2'};
  const configPath = ts.findConfigFile(
    /*searchPath*/ './',
    ts.sys.fileExists,
    'tsconfig.json'
  )
  if (!configPath) {
    throw new Error('Could not find a valid \'tsconfig.json\'.')
  }
  console.log({ filePaths })
  const program = ts.createProgram(filePaths, options)
  let emitResult = program.emit()
  let allDiagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)


  for (const diagnostic of allDiagnostics) {
    const message = diagnostic.messageText
    const file = diagnostic.file
    const filename = file.fileName
    const lineAndChar = file.getLineAndCharacterOfPosition(
      diagnostic.start
    )
    const line = lineAndChar.line + 1
    const character = lineAndChar.character + 1
    console.log(message)
    console.log(`(${filename}:${line}:${character})`)
  }
}

runTask()
