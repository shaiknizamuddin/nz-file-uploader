import { NgModule, ModuleWithProviders } from '@angular/core';
import { FileUploadComponent } from './file-upload.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpHandler, HttpClientModule } from '@angular/common/http';
import { FileUploadService } from './file-upload.service';
import { FileUploadConfig } from './fileUploadConfig';


@NgModule({
  declarations: [FileUploadComponent],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    HttpClientModule
  ],
  exports: [FileUploadComponent]
})
export class FileUploadModule {
  
  static forRoot(config: FileUploadConfig): ModuleWithProviders {
    return {
      ngModule: FileUploadModule,
      providers: [FileUploadService, {provide: 'config', useValue: config}]
    };
  }
}
