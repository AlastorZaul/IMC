import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { ToasterService } from 'angular2-toaster';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { Parametre } from 'src/app/modeles/parametre.model';




@Injectable()
export class ParametresService extends BaseService<Parametre> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, Parametre, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_PARAMETRES + ROUTES_API.PARAMETRES;
  }
}
