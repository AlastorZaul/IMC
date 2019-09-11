import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { ToasterService } from 'angular2-toaster';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { SearchService } from './search.service';
import { Ape } from 'src/app/modeles/ape.model';



@Injectable()
export class ApeService extends SearchService<Ape> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, Ape, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_REFERENTIEL + ROUTES_API.APE;
  }
}
