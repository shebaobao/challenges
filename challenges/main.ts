import fs from 'fs'
import path from 'path'

const folders = fs
  .readdirSync(__dirname, { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => entry.name)

for (const folder of folders) {
  const folderPath = path.join(__dirname, folder)
  const tsFiles = fs.readdirSync(folderPath)
    .filter(file => path.extname(file) === '.ts')
    .map(file => path.join(folderPath, file))

  for (const tsFile of tsFiles) {
    require(tsFile)
  }
}
