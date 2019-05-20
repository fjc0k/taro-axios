export declare class PostData<T extends Record<string, any>> {
    private postData;
    constructor(postData: T);
    getParsedPostData(): Record<"normalData" | "fileData", T>;
}
