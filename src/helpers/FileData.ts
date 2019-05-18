export class FileData<T = any> {
  constructor(private fileContent: T) {}

  getFileContent(): T {
    return this.fileContent
  }
}
