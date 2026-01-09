import { writeFileSync, readFileSync } from 'fs'
import { Writer } from './Writer'


export class FileWriter implements Writer {
  constructor(
    private readonly destination: string,
  ) {}

  async write(data: any, createBackup = true) {
    const json = JSON.stringify(data)

    if (createBackup) {
      this.createBackup(json)
    }

    writeFileSync(this.destination, json, 'utf-8')

    return json.length
  }

  async read() {
    const data = readFileSync(this.destination, 'utf-8')
    return JSON.parse(data)
  }

  toString() {
    return `<FileWriter { destination: "${this.destination}" }>`
  }

  private getBackupFilePath() {
    const d = new Date()
    const year = d.getFullYear().toString()
    const month = (d.getMonth() + 1).toString().padStart(2, '0')
    const day = d.getDate().toString().padStart(2, '0')
    const fname = this.destination.replace(/\.json$/, '')
    return `${fname}-${year}-${month}-${day}.json`
  }

  private createBackup(content: string) {
    const backupPath = this.getBackupFilePath()
    writeFileSync(backupPath, content, 'utf-8')
  }
}

export default FileWriter
