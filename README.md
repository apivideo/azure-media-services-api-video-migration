[![badge](https://img.shields.io/twitter/follow/api_video?style=social)](https://twitter.com/intent/follow?screen_name=api_video)
&nbsp; [![badge](https://img.shields.io/github/stars/apivideo/azure-media-services-api-video-migration?style=social)](https://github.com/apivideo/azure-media-services-api-video-migration)
&nbsp; [![badge](https://img.shields.io/discourse/topics?server=https%3A%2F%2Fcommunity.api.video)](https://community.api.video)
![](https://github.com/apivideo/.github/blob/main/assets/apivideo_banner.png)
<h1 align="center">Azure Media Services to api.video migration</h1>

[api.video](https://api.video) is the video infrastructure for product builders. Lightning fast
video APIs for integrating, scaling, and managing on-demand & low latency live streaming features in
your app.


# Table of contents

- [Table of contents](#table-of-contents)
- [Project description](#project-description)
- [Getting started](#getting-started)
    - [Installation](#installation)
    - [Execution](#Execution)
- [FAQ](#faq)

# Project description

This project purpose is to provide an easy way to migrate from Azure Media Services to api.video.

The script is pretty simple:

1. List all assets in your Azure Media Service Instance
2. Get the Storage containers and list the blobs for these storage containers
3. Because of the way that Azure is encoding their videos, the script will take the file with the highest resolution (in order not to duplicate the files)
4. Once it get’s the list, it will create a video object with the name as same as the blob and set the source to the Azure storage url
5. The file then will be uploaded and encoded with api.video

## Note
The script does not automatically delete the files from your Azure Storage or Azure Media Services, you will have to do that manually.

# Getting started



## Installation

After you've cloned the repo, navigate to the repo directory and run `npm install`

Next, you will have to add your API keys and credentials to the enviormental variables.

Rename sample.env to .env

### Credentials & API keys

1. Passing in credentials that we are getting from Azure Media Services to the client and the [api.video](http://api.video) client
    
    ```tsx
    let mediaServicesClient: AzureMediaServices;
    
    const subscriptionId: string = process.env.AZURE_SUBSCRIPTION_ID as string;
    const resourceGroup: string = process.env.AZURE_RESOURCE_GROUP as string;
    const accountName: string = process.env.AZURE_MEDIA_SERVICES_ACCOUNT_NAME as string;
    
    const credential = new DefaultAzureCredential();
    const apivideoClient = new ApiVideoClient({ apiKey: process.env.APIVIDEO_API_KEY });
    
    let remoteSasUrl: string = process.env.REMOTESTORAGEACCOUNTSAS as string;
    ```
    

2. In the previous step, you will also need to update the `.env` file and grab the parameters from Azure. In order to do that, navigate to your Azure Media Service, and select the directory that you would like to migrate:
    
    ![Screenshot 2023-07-06 at 21.19.26.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/04baa900-afd1-476a-beea-87669a742ff4/Screenshot_2023-07-06_at_21.19.26.png)
    
3. Select API keys and copy over the parameters presented in the `.ENV` pane (you can select to either do the User Authentication or Service principal authentication it’s really up to you, in terms of what you’ve configured on your end
    
    ![Screenshot 2023-07-06 at 21.19.55.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/30ef3fb3-2659-49b0-a1d5-a02367200d24/Screenshot_2023-07-06_at_21.19.55.png)
    
    ![Screenshot 2023-07-06 at 21.23.14.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/34b1d947-c41c-4f66-94bb-e3e41a5fb23f/Screenshot_2023-07-06_at_21.23.14.png)
    

4. Now we also need to get access to the storage, so navigate to the Azure Storage Account → Shared access signature:
    
    ![Screenshot 2023-07-06 at 21.24.55.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/31d6501f-2df2-4d14-ba08-06ce174537cc/Screenshot_2023-07-06_at_21.24.55.png)
    
5. Allow the following:
    
    ![Screenshot 2023-07-06 at 21.28.00.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/3a91d4ef-e5df-40bd-b022-f4b2d9335d7e/Screenshot_2023-07-06_at_21.28.00.png)
    
6. And make sure that you generate the Shared access signature and once you have the links, copy the Blob service SAS URL link to the `.env` file. The parameter you are looking for is `REMOTESTORAGEACCOUNTSAS`
    
    ![Screenshot 2023-07-06 at 21.29.06.png](https://s3-us-west-2.amazonaws.com/secure.notion-static.com/38e8c885-a1aa-4e9d-95d1-893e3c073b78/Screenshot_2023-07-06_at_21.29.06.png)
    
## Execution

1. Run the build command: `npm run build`
2. To start the script, run: `npm run start`

# FAQ

If you have any questions, ask us in the [community](https://community.api.video) or
just open a ticket with us on the api.video website
