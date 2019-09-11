import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { ToasterService } from 'angular2-toaster';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { Departement } from 'src/app/modeles/departement.model';
import { Observable } from 'rxjs/internal/Observable';
import { catchError } from 'rxjs/internal/operators/catchError';
import { throwError } from 'rxjs/internal/observable/throwError';
import { map } from 'rxjs/internal/operators/map';



@Injectable()
export class DepartementService extends BaseService<Departement> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, Departement, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_REFERENTIEL + ROUTES_API.DEPARTEMENT;
  }

  // Retourne uniquement les départements autorisés à l'utilisateur
  getAutorises(): Observable<Departement[]|Error> {
    return this.getMulti(this.url + ROUTES_API.AUTORISES);
  }

  // Récupération des départements par regionId
  getDepartementByRegionId(regionId: Number | String): Observable<Departement[]|Error> {
    if (regionId !== null && regionId !== undefined) {
      return this.http.get<Departement[]>(this.url + '/region/' + regionId, {observe: 'response'}).pipe(
        map((response: any) => {
          try {
            return this._jsonConverterService.getInstance().deserializeArray(response.body, Departement);
          } catch (e) {
            throw (<Error>e);
          }
        }),
        catchError(error => {
          return throwError(error);
        })
      );
    } else {
      return this.getAll();
    }
  }
}
