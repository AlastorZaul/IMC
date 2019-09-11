import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { ToasterService } from 'angular2-toaster';
import { MessageInfo } from 'src/app/modeles/message-info.model';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { Observable } from 'rxjs/internal/Observable';




@Injectable()
export class MessageInfoService extends BaseService<MessageInfo> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, MessageInfo, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.MESSAGE_INFO;
  }

  saveList(messages: MessageInfo[]): Observable<MessageInfo[]|Error> {
    return this.postList(messages, this.url + ROUTES_API.LISTE);
  }

}
