import { BlobServiceClient } from "@azure/storage-blob";


let client: BlobServiceClient;


export function createBlobServiceClient(sasUrl: string): BlobServiceClient {
    client = new BlobServiceClient(sasUrl);
    return client
}
