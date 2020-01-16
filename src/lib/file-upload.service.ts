import { Injectable, Inject } from '@angular/core';
import { FileUploadConfig } from './fileUploadConfig';
import { promise } from 'protractor';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  configData: any;

  constructor(@Inject('config') private config: FileUploadConfig) {
    this.configData = config;
  }

  getConfigData(): Promise<FileUploadConfig> {
    this.configData = {
      API: this.configData.API ? this.configData.API : '',
      fileTypes: (this.configData.fileTypes) ? (this.configData.fileTypes) : ['image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'video/mp4', 'video/x-matroska', 'application/zip', 'application/gzip','application/pdf'],
      maxFileSize: (this.configData.maxFileSize) ? (this.configData.maxFileSize) : '500',
      fileTypeMsg: (this.configData.fileTypeMsg) ? (this.configData.fileTypeMsg) : 'Please select valid filetype',
      filesizeMsg: (this.configData.filesizeMsg) ? (this.configData.filesizeMsg) : 'File is too large',
      uploadSuccessMsg: (this.configData.uploadSuccessMsg) ? (this.configData.uploadSuccessMsg) : 'Successfully uploaded',
      uploadFailureMsg: (this.configData.uploadFailureMsg) ? (this.configData.uploadFailureMsg) : 'Upload failed',
      removePlaceHolder: (this.configData.removePlaceHolder) ? (this.configData.removePlaceHolder) : 'remove',
      uploadBtnLabel: (this.configData.uploadBtnLabel) ? (this.configData.uploadBtnLabel) : 'Upload'
    }
    return this.configData;
  }
}