import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { ToasterService } from 'angular2-toaster';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { Organisme } from 'src/app/modeles/organisme.model';
import { BaseService } from './base.service';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Signature } from 'src/app/modeles/signature.model';
import { JourChome } from 'src/app/modeles/jour-chome.model';


@Injectable()
export class OrganismeService extends BaseService<Organisme> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, Organisme, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_METIER + ROUTES_API.ORGANISME;
  }


  // Récupération des signatures
  getSignatures(id: Number | String, _url: string = this.url): Observable<Signature[]|Error> {
    return this.http.get<Signature[]>(_url + '/' + id + ROUTES_API.SIGNATURES, {observe: 'response'}).pipe(
      map((response: any) => {
        try {
          return this._jsonConverterService.getInstance().deserializeArray(response.body, Signature);
        } catch (e) {
          throw (<Error>e);
        }
      }),
      catchError(error => throwError(error))
    );
  }

  // Récupération des jours chomés nationaux + spécifiques à l'organisme
  getJoursChomes(id: Number | String, _url: string = this.url): Observable<JourChome[]|Error> {
    return this.http.get<JourChome[]>(_url + '/' + id + ROUTES_API.JOURS_CHOMES, {observe: 'response'}).pipe(
      map((response: any) => {
        try {
          return this._jsonConverterService.getInstance().deserializeArray(response.body, JourChome);
        } catch (e) {
          throw (<Error>e);
        }
      }),
      catchError(error => throwError(error))
    );
  }
}
