import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { ToasterService } from 'angular2-toaster';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { Region } from 'src/app/modeles/region.model';
import { Observable } from 'rxjs';




@Injectable()
export class RegionService extends BaseService<Region> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, Region, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_REFERENTIEL + ROUTES_API.REGION;
  }

  // Retourne uniquement les régions autorisées à l'utilisateur
  getAutorises(): Observable<Region[]|Error> {
    return this.getMulti(this.url + ROUTES_API.AUTORISES);
  }
}
