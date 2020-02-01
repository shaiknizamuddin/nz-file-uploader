import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpRequest, HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
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
  public filePreviewArray = [];
  public disableUpload = true;
  public showProgress = false;
  public fileToUpload;
  public finalFilesToPush;
  public uploadApi;
  public configData: any;
  public remove_image = require('../assets/remove-circle.svg');
  public retry_image = require('../assets/sync-alt.svg');
  public showError: boolean = false;
  public removePlaceHolder: any;

  @ViewChild('holder', { static: true }) el: ElementRef;
  @ViewChild('fileId', { static: true }) fileId: ElementRef;

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

    this.fileUploadForm = this.fb.group({
      fileUploadName: ['']
    });

    this.el.nativeElement.ondragover = () => {
      this.el.nativeElement.className = 'hover';
      return false;
    };
    this.el.nativeElement.ondragend = () => {
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
      this.filePreviewHandler(e.dataTransfer.files);
    }
  }

  openFileOption() {
    this.fileId.nativeElement.click();
  }

  filePreviewHandler(files) {
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
          uploadProgress: 0,
          visited: 0,
          file_status: 'pending' // processing , failed , completed , unknown
        };
        if (this.filePreviewArray.length > 0) {
          // check if the same file is being added again
          for (let k = 0; k < this.filePreviewArray.length; k++) {
            if (
              this.filePreviewArray[k].name === finalGroupedFileData.name &&
              this.filePreviewArray[k].size === finalGroupedFileData.size &&
              this.filePreviewArray[k].type === finalGroupedFileData.type
            ) {
              alert('File already exist');
              return false;
            }
          }
        }
        this.filePreviewArray.push(finalGroupedFileData);
        const currentProgressIndex = this.filePreviewArray.findIndex(x => x.file_status === 'processing');
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
    // if (this.filePreviewArray.length > 0) {
    //   for (let i = 0; i < this.filePreviewArray.length; i++) {
    //     if(this.filePreviewArray[i].file_status === 'pending') {
    //     }
    //   }
    // }
    // this.filePreviewArray = [];
  }

  removeFile(index, isProgress) {
    if (isProgress > 0 && isProgress !== 100) {
      this.filePreviewArray[index].file_status = `failed`;
      if (this.filePreviewArray.length === 0) {
      } else {
        this.filePreviewArray.splice(index, 1);
      }
    } else {
      this.filePreviewArray.splice(index, 1);

      if (this.filePreviewArray.length > 0) {
        // get the index of current in progress file and assign that index to file count
        const currentProgressIndex = this.filePreviewArray.findIndex(x => x.file_status === 'processing');
        if (currentProgressIndex > -1) {
          this.active_index = currentProgressIndex;
          this.disableUpload = true;
        }
        this.active_index = (this.active_index > 0) ? this.active_index-- : 0;
      }
      if (this.filePreviewArray.length === 0) {
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

  uploadFiles(pointer?, type?) {
    if (this.filePreviewArray.length > 0) {

      this.showProgress = true; // show progress
      this.disableUpload = true;



      if (type === 'single_uploads') {
        this.active_index = pointer;
      } else {
        const currentProgressIndex = this.filePreviewArray.findIndex(x => x.file_status === 'pending');
        if (currentProgressIndex > -1) {
          this.active_index = currentProgressIndex;
        } else {
          const CPI = this.filePreviewArray.findIndex(x => x.file_status === 'unknown');
          if (CPI > -1) {
            this.active_index = CPI;
          }
        }
      }

      const fileToUpload = this.filePreviewArray;
      const formData: FormData = new FormData();

      formData.append('files', fileToUpload[this.active_index].file, fileToUpload[this.active_index].file.name);
      formData.append('file_title', fileToUpload[this.active_index].file.name);
      formData.append('file_size', fileToUpload[this.active_index].file.size);

      const req = new HttpRequest('POST', this.uploadApi, formData, {
        reportProgress: true,
      });
      const subs = this._httpClient.request(req).subscribe((event) => {
        // console.log(event, 'eventevent');
        if (event.type === HttpEventType.UploadProgress) {
          this.fileUploadProgress = Math.round(100 * event.loaded / event.total);
          this.filePreviewArray[this.active_index].uploadProgress = this.fileUploadProgress;

          this.filePreviewArray[this.active_index].file_status =
            (this.filePreviewArray[this.active_index].file_status !== 'failed') ? `processing` : 'failed';

          this.filePreviewArray[this.active_index].image =
            (this.filePreviewArray[this.active_index].file_status !== 'failed') ? require('../assets/file.png') : require('../assets/file_error.png');

          // Check if the status of the file is failed , if so : unsubscribe the request and allow another request
          try {
            if (this.filePreviewArray[this.active_index].file_status === 'failed') {
              this.filePreviewArray[this.active_index].image = require('../assets/file_error.png');
              subs.unsubscribe();
              console.log('unsubscribing___________________');
              throw new Error();
            }
          } catch (e) {
            subs.unsubscribe();
            this.filePreviewArray.map((eFile, i) => {
              if (eFile.file_status === 'pending') {
                this.recursiveFileCall();
              }
            });
          }
          setTimeout(() => {
            this.filePreviewArray[this.active_index].file_status = (this.fileUploadProgress === 100) ? `completed` : `processing`;
            this.filePreviewArray[this.active_index].image = (this.fileUploadProgress === 100) ? require('../assets/file_success.png') : require('../assets/file.png');
          }, 500);

        } else if (event instanceof HttpResponse) {
          setTimeout(() => {
            this.filePreviewArray[this.active_index].file_status = `completed`;
            this.filePreviewArray[this.active_index].image = require('../assets/file_success.png');
            this.recursiveFileCall();
          }, 500)
        }
      }, (error) => {
        this.disableUpload = false;
        setTimeout(() => {
          this.filePreviewArray[this.active_index].file_status = `unknown`;
          this.filePreviewArray[this.active_index].image = require('../assets/file_error.png');

          const checkIfAllFilesFailed = this.filePreviewArray.every((x) => x.status === 'unknown');

          /**
           * when single upload comes into picture , the visited values of the field will always be 1; , so it will never call recersively()'
           * 1. what if 2 success and then unknown
           * 2. all status is unknown
           * 3. 2 status unknown and remaining success
           * 4. middle unknown and ramaining success
           */

          if ((type !== 'single_uploads' && checkIfAllFilesFailed) || this.filePreviewArray[this.active_index].visited === 0) {
            this.recursiveFileCall();
          }
        }, 500);



        // alert('Please check your file upload service');
      });
    } else {
      this.disableUpload = true;
    }
  }

  retryFailedUploads(index, uploadProgress , status) {
    const currentProgressIndex = this.filePreviewArray.findIndex(x => x.file_status === 'processing');
    if(currentProgressIndex > -1) { // some file is uploading
      alert('please wait , till the current file is uploaded and then try again')
    } else {
      this.uploadFiles(index, 'single_uploads');
    }

  }


  recursiveFileCall() {
    if (this.filePreviewArray.length !== this.active_index + 1) {
      this.filePreviewArray[this.active_index].visited = 1;
      this.active_index++;
      this.uploadFiles();
    } else {
      console.log('upload complete . . .');
      this.fileUploadForm.reset();
      // this.filePreviewArray = [];
    }
  }


}
