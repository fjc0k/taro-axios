import { FileData } from './FileData'
import { isObject } from '../utils'

export class PostData<T extends Record<string, any>> {
  constructor(private postData: T) {}

  getParsedPostData() {
    const postData = this.postData
    const parsedPostData: Record<'normalData' | 'fileData', T> = {
      normalData: {} as any,
      fileData: {} as any,
    }
    if (isObject(postData)) {
      Object.keys(postData).forEach(key => {
        if (postData[key] && postData[key] instanceof FileData) {
          (parsedPostData.fileData as any)[key] = (postData[key] as FileData).getFileContent()
        } else {
          (parsedPostData.normalData as any)[key] = postData[key]
        }
      })
    }
    return parsedPostData
  }

  toString() {
    return `[object ${PostData.name}]`
  }
}
