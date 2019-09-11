import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { Verrou } from 'src/app/modeles/verrou.model';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { SearchService } from './search.service';


@Injectable()
export class VerrouService extends SearchService<Verrou> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, Verrou, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_PARAMETRES + ROUTES_API.VERROU;
  }

  deleteByDonneeUuid(donneeUuid: string): Observable<Boolean> {
    return this.http.delete(
        this.url + ROUTES_API.UUID + '/' + donneeUuid,
        { headers: new HttpHeaders({ 'Content-Type': 'application/json'}), observe: 'response' }
      ).pipe(map((response: any) =>  true ), catchError(error => throwError(error)));
  }

  /** @description : crée un verrou et supprime tous les verrous existant pour le même uuid */
  createSafe(entity: Verrou): Observable<Verrou|Error> {
    return this.put(entity, this.url + '/safe');
  }
}
