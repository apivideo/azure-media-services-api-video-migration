

import { DefaultAzureCredential } from "@azure/identity";
import ApiVideoClient from "@api.video/nodejs-client"
import {
    AzureMediaServices,
} from '@azure/arm-mediaservices';
import * as blobHelper from "../Common/Storage/blobStorage";
import * as dotenv from "dotenv";
dotenv.config();

// This is the main Media Services client object
let mediaServicesClient: AzureMediaServices;

// Copy the samples.env file and rename it to .env first, then populate it's values with the values obtained 
// from your Media Services account's API Access page in the Azure portal.
const subscriptionId: string = process.env.AZURE_SUBSCRIPTION_ID as string;
const resourceGroup: string = process.env.AZURE_RESOURCE_GROUP as string;
const accountName: string = process.env.AZURE_MEDIA_SERVICES_ACCOUNT_NAME as string;
// This sample uses the default Azure Credential object, which relies on the environment variable settings.
// If you wish to use User assigned managed identity, see the samples for v2 of @azure/identity
// Managed identity authentication is supported via either the DefaultAzureCredential or the ManagedIdentityCredential classes
// https://docs.microsoft.com/javascript/api/overview/azure/identity-readme?view=azure-node-latest
// See the following examples for how to authenticate in Azure with managed identity
// https://github.com/Azure/azure-sdk-for-js/blob/@azure/identity_2.0.1/sdk/identity/identity/samples/AzureIdentityExamples.md#authenticating-in-azure-with-managed-identity 

// const credential = new ManagedIdentityCredential("<USER_ASSIGNED_MANAGED_IDENTITY_CLIENT_ID>");
const credential = new DefaultAzureCredential();
const apivideoClient = new ApiVideoClient({ apiKey: process.env.APIVIDEO_API_KEY });


// ----------- BEGIN SAMPLE SETTINGS -------------------------------

// A SAS URL to a remote blob storage account that you want to read files from
// Generate a Read/List SAS token URL in the portal under the storage accounts "shared access signature" menu
// Grant the allowed resource types : Service, Container, and Object
// Grant the allowed permissions: Read, List
let remoteSasUrl: string = process.env.REMOTESTORAGEACCOUNTSAS as string;

const blobConsolidator = (blobArray: Array<any>, blob: any) => {
    blobArray.push(blob)
    return blobArray
}

export async function main() {

// init the azure media services client, this client will help us
// list the media services assets
    mediaServicesClient = new AzureMediaServices(credential, subscriptionId);

// init the blob services client, with this client, we will
// list the files (blobs) that derive from the assets
    const blobServiceClient = blobHelper.createBlobServiceClient(remoteSasUrl);
    // iterate through all the assets in your media service instance
    for await (const asset of mediaServicesClient.assets.list(resourceGroup, accountName)) {
        console.log("Getting containers for: ", asset.name);
        if(asset.container) {
    // create an array for the final consolidated blob list
            let assetBlobs: Array<any> = [];
            // get all the containers that are linked to that asset
            const containerClient = blobServiceClient.getContainerClient(asset.container);
            // iterate through the container to get the list of blobs
            for await (const blob of containerClient.listBlobsFlat()) {
                // here we are getting the blob details in order to get
                // the url for the blob, if the content type (MIME type)
                // of the blob starts with `video` we will go ahead and push that
                // blob into an array, the array is needed to then compare
                // the blob sizes to get the biggest in size from the container
                // as Azure Media services will transcode the video into several qualities
                // and store them in the container 
                const tempBlockBlobClient = containerClient.getBlockBlobClient(blob.name);
                if (blob.properties && blob.properties.contentType) {
                    const videoContentType = /video/.test(blob.properties.contentType)
                    if (videoContentType) {
                        blobConsolidator(assetBlobs, {
                            blobName: blob.name, 
                            blobUrl: tempBlockBlobClient.url, 
                            blobSize: blob.properties.contentLength
                        })
                }
            }
          }
        
          if(assetBlobs.length > 0) {
            // here we compare the blob sizes to make sure we are getting the
            // largest blob size form the container. After we get the biggest blob
            // we can then pass the URL as source to our video creation payload and 
            // the name as title. Then we call the api.video client to create the object
            // and point it to the source of the video through the Azure URL
            const maxValue = Math.max.apply(Math, assetBlobs.map( x => x.blobSize));
            const maxBlob = assetBlobs.find( i => i.blobSize === maxValue);
            console.log(maxBlob)
            const videoCreationPayload = {
                title: maxBlob.blobName, 
                source: maxBlob.blobUrl 
            };
           await apivideoClient.videos.create(videoCreationPayload);
        }
    }
    }
    console.log("!!! Exiting the sample main(),  async awaited code paths will continue to complete in background.");
}


main().catch((err) => {

    console.error("Error running sample:", err.message);
    console.error(`Error code: ${err.code}`);

    if (err.name == 'RestError') {

        if (err.code == "AuthenticationFailed") {
            console.error("Check the SAS URL you provided or re-create a new one that has the right permission grants and expiration dates");
            console.error("\tGenerate a Read/List SAS token URL in the portal under the storage accounts shared access signature menu");
            console.error("\tGrant the allowed resource types : Service, Container, and Object");
            console.error("\tGrant the allowed permissions: Read, List");
        }
        else {
            // General REST API Error message
            console.error("Error request:\n\n", err.request);
        }
    }

});


