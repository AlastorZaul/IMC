import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { ToasterService } from 'angular2-toaster';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { Profil } from 'src/app/modeles/profil.model';


@Injectable()
export class ProfilService extends BaseService<Profil> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, Profil, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_REFERENTIEL + ROUTES_API.PROFIL;
  }
}
