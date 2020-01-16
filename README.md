# Angular FileUploader

## Features

- Upload files to your server by just providing the api url in the config
- Configuration for file types and file sizes are allowed
- custom messages on success and failure of file uploads
- Supports multiple file uploads in one go
- Supports Drag&Drop uploads
-  Provides the percentage of file uploaded to server
-  Shows progress of file uploads 
-  Works with any server side platform that supports standard HTML multipart form    uploads

## Install
    npm install nz-file-uploader --save

## Setup
  **Step1 :**  Import  `FileUploadModule` from the package `nz-file-uploader` in app.module.ts file.
  
    import { FileUploadModule } from  'nz-file-uploader'


**Step2 :** Add the  `FileUploadModule` in the NgModule Imports array.

    FileUploadModule.forRoot()
    
    
 **Step3 :** Add the tags `<nz-file-uploader></nz-file-uploader>` in the app.component.ts file.

#### Setting Global Options
Pass values to `FileUploadModule.forRoot()`
     
    // root app NgModule
     imports: [
     FileUploadModule.forRoot({
         API:  'Your api url here', // The files are uploaded using your api url
         fileTypes: ['images/jpeg', 'images/png'],
         maxFileSize: '100', // in MB
         fileTypeMsg:  'Please select valid filetype',
         filesizeMsg:  'File is too large',
         uploadSuccessMsg: 'Successfully uploaded',
         uploadFailureMsg: 'Upload failed',
         removePlaceHolder: 'remove',
         uploadBtnLabel: 'Upload',
        }),
     ],

#### Options : 

Following are the options and its defaults values

|      Options      |  Type  |                         Default                        | Required |
|:-----------------:|:------:|:------------------------------------------------------:|:--------:|
|        API        | String |                          empty                         |   True   |
|     fileTypes     |  Array | 'image/jpeg' 'image/png' 'video/mp4' 'application/zip' |   False  |
|    maxFileSize    | String |                         500 MB                         |   False  |
|    fileTypeMsg    | String |              Please select valid filetype              |   False  |
|    filesizeMsg    | String |                    File is too large                   |   False  |
|  uploadSuccessMsg | String |                  Successfully uploaded                 |   False  |
|  uploadFailureMsg | String |                      Upload failed                     |   False  |
| removePlaceHolder | String |                         remove                         |   False  |
|   uploadBtnLabel  | String |                         Upload                         |   False  |
### Description :

This package handels the angular UI to upload files to server using your own backend api. Just provide your api URL in the configuration in imports.
> `Supports formData and multipart uploads`

## Credits
**Author && Developer** : [Nizamuddin shaik](mailto:nizamuddin407.shaik@gmail.com)

**Designer** : Special thanks to [Jaseem.p]() for the nice design

## License

Mit License:  [http://www.opensource.org/licenses/mit-license.php](http://www.opensource.org/licenses/mit-license.php)
 