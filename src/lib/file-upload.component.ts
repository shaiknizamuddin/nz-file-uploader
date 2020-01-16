import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpRequest, HttpClient, HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import { FileUploadService } from './file-upload.service';


@Component({
  selector: 'nz-file-uploader',
  templateUrl: `./file-upload.component.html`,
  styleUrls: [`./file-upload.component.scss`]
})
export class FileUploadComponent implements OnInit {
  public fileUploadForm: FormGroup;
  public active_index = 0;
  public fileUploadProgress = 0;
  public imagePreviewArray = [];
  public disableUpload = true;
  public showProgress = false;
  public fileToUpload;
  public finalFilesToPush;
  // public uploadApi = 'http://localhost:8888/api/';  // `YOUR-API-HERE`
  public uploadApi;
  public configData: any;
  public remove_image = require('../assets/remove.png')
  @ViewChild('holder', { static: true }) el: ElementRef;
  @ViewChild('fileId', { static: true }) fileId: ElementRef;
  showError: boolean = false;
  removePlaceHolder: any;

  constructor(
    public fb: FormBuilder,
    private _httpClient: HttpClient,
    public _fuService: FileUploadService
  ) {
  }

  ngOnInit() {
    this.configData = this._fuService.getConfigData();

    this.uploadApi = this.configData.API;
    this.removePlaceHolder = this.configData.removePlaceHolder;
    console.log(this.configData, '888888888888888888888888');

    this.fileUploadForm = this.fb.group({
      fileUploadName: ['']
    });

    this.el.nativeElement.ondragover = () => {
      this.el.nativeElement.className = 'hover';
      return false;
    };
    this.el.nativeElement.ondragend = () => {
      console.log('on drag endddd');
      this.el.nativeElement.className = '';
      return false;
    };
    this.el.nativeElement.ondragleave = () => {
      this.el.nativeElement.className = '';
      return false;
    };
    this.el.nativeElement.ondrop = (e) => {
      this.el.nativeElement.className = '';
      e.preventDefault();
      this.handleFilePreview(e.dataTransfer.files);
    }
  }

  closeAlert() {
    this.showError = false;
  }

  openFileOption() {
    this.fileId.nativeElement.click();
  }

  handleFilePreview(files) {
    // console.log(files);
    const file_types = this.configData.fileTypes; //['image/jpeg', 'image/jpg', 'image/gif', 'image/png'];

    for (let i = 0; i < files.length; i++) {
      // validate file type and size
      if (!(file_types.includes(files[i].type))) { alert(this.configData.fileTypeMsg); return false; }
      const fileSizeInMB = (files[i].size / 1024 / 1024) // in MB

      if (fileSizeInMB > Number(this.configData.maxFileSize)) { alert(this.configData.filesizeMsg); return false; }

      const fileSize = this.bytesToSize(files[i].size);
      // Image Display
      const reader = new FileReader();
      reader.onload = (res: any) => {
        const finalGroupedFileData = {
          sno: i + 1,
          name: files[i].name,
          size: fileSize,
          type: files[i].type,
          image: require('../assets/file.png'),
          file: files[i],
          remove_icon: 'fa fa-trash',
          uploadProgress: 0,
          file_status: 'pending' // processing , failed , completed
        };
        if (this.imagePreviewArray.length > 0) {
          // check if the same file is being added again
          for (let k = 0; k < this.imagePreviewArray.length; k++) {
            if (
              this.imagePreviewArray[k].name === finalGroupedFileData.name &&
              this.imagePreviewArray[k].size === finalGroupedFileData.size &&
              this.imagePreviewArray[k].type === finalGroupedFileData.type
            ) {
              alert('File already exist');
              return false;
            }
          }
        }
        this.imagePreviewArray.push(finalGroupedFileData);
        const currentProgressIndex = this.imagePreviewArray.findIndex(x => x.file_status === 'processing');
        // check if any file uploding is already in progress , then keep it disable
        if (currentProgressIndex > -1) {
          this.disableUpload = true;
        } else {
          this.disableUpload = false;
        }
      };
      reader.readAsDataURL(files[i]);
      this.fileToUpload = {
        file: files[i]
      };
    }
  }

  clearQueue() {
    // TO-DO
    // if (this.imagePreviewArray.length > 0) {
    //   for (let i = 0; i < this.imagePreviewArray.length; i++) {
    //     if(this.imagePreviewArray[i].file_status === 'pending') {
    //     }
    //   }
    // }
    // this.imagePreviewArray = [];
  }

  removeFile(index, isProgress) {
    if (isProgress > 0 && isProgress !== 100) {
      this.imagePreviewArray[index].file_status = `failed`;
      if (this.imagePreviewArray.length === 0) {
      }
    } else {
      this.imagePreviewArray.splice(index, 1);

      if (this.imagePreviewArray.length > 0) {
        // get the index of current in progress file and assign that index to file count
        const currentProgressIndex = this.imagePreviewArray.findIndex(x => x.file_status === 'processing');
        if (currentProgressIndex > -1) {
          this.active_index = currentProgressIndex;
          this.disableUpload = true;
        }
        this.active_index = (this.active_index > 0) ? this.active_index-- : 0;
      }
      if (this.imagePreviewArray.length === 0) {
        this.disableUpload = true;
      }

    }
  }

  bytesToSize = function (bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) { return '0 Byte'; }
    const i = (Math.floor(Math.log(bytes) / Math.log(1024)));
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
  };

  uploadFiles() {
    if (this.imagePreviewArray.length > 0) {

      this.showProgress = true; // show progress
      this.disableUpload = true;

      const currentProgressIndex = this.imagePreviewArray.findIndex(x => x.file_status === 'pending');
      if (currentProgressIndex > -1) {
        this.active_index = currentProgressIndex;
      }

      const fileToUpload = this.imagePreviewArray;
      const formData: FormData = new FormData();

      formData.append('files', fileToUpload[this.active_index].file, fileToUpload[this.active_index].file.name);
      formData.append('file_title', fileToUpload[this.active_index].file.name);
      formData.append('file_size', fileToUpload[this.active_index].file.size);

      const req = new HttpRequest('POST', this.uploadApi, formData, {
        reportProgress: true,
      });
      const subs = this._httpClient.request(req).subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress) {
          this.fileUploadProgress = Math.round(100 * event.loaded / event.total);
          this.imagePreviewArray[this.active_index].uploadProgress = this.fileUploadProgress;

          this.imagePreviewArray[this.active_index].file_status =
            (this.imagePreviewArray[this.active_index].file_status !== 'failed') ? `processing` : 'failed';

          this.imagePreviewArray[this.active_index].image =
            (this.imagePreviewArray[this.active_index].file_status !== 'failed') ? require('../assets/file.png') : require('../assets/file_error.png');

          // Check if the status of the file is failed , if so : unsubscribe the request and allow another request
          try {
            if (this.imagePreviewArray[this.active_index].file_status === 'failed') {
              this.imagePreviewArray[this.active_index].image = require('../assets/file_error.png');
              console.log('removed the file from queue...');
              subs.unsubscribe();
              console.log('unsubscribing___________________');
              throw new Error();
            }
          } catch (e) {
            subs.unsubscribe();
            this.imagePreviewArray.map((eFile, i) => {
              if (eFile.file_status === 'pending') {
                this.recursiveFileCall();
              }
            });
          }
          setTimeout(() => {
            this.imagePreviewArray[this.active_index].file_status = (this.fileUploadProgress === 100) ? `completed` : `processing`;
            this.imagePreviewArray[this.active_index].image = (this.fileUploadProgress === 100) ? require('../assets/file_success.png') : require('../assets/file.png');
          }, 500);

        } else if (event instanceof HttpResponse) {
          setTimeout(() => {
            this.imagePreviewArray[this.active_index].file_status = `completed`;
            this.imagePreviewArray[this.active_index].image = require('../assets/file_success.png');
            this.recursiveFileCall();
          }, 500)
        }
      }, (error) => {
        console.log('error in catch', error);
        this.disableUpload = false;
        alert('Please check your file upload service');
      });
    } else {
      this.disableUpload = true;
    }
  }


  recursiveFileCall() {
    if (this.imagePreviewArray.length !== this.active_index + 1) {
      this.active_index++;
      this.uploadFiles();
    } else {
      console.log('upload complete . . .');
      this.fileUploadForm.reset();
      // this.imagePreviewArray = [];
    }
  }


}
