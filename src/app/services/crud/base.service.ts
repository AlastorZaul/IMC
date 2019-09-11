import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { CODE_HTTP } from '../../constantes/code-http.enum';
import { ROUTES_API } from 'src/app/constantes/routes-api';


const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json'})
};

export abstract class BaseService<T> {
  protected url: string;

  constructor(protected http: HttpClient, protected type: { new(): T; }|any,
    protected _toasterService: ToasterService,
    protected _jsonConverterService: JsonConverterService,
    protected _configService: ConfigurationService) {
      this.url = _configService.getEnvironment().socleBaseUrl;
  }


  // REQUETE GET PAR DEFAUT - PLUSIEURS ELEMENTS
  getMulti(_url: string = this.url, _noContentIsError: boolean = false): Observable<T[]|Error> {
    return this.http.get<T[]>(_url, {observe: 'response'}).pipe(
      map((response: any) => {
        if (_noContentIsError && (response.status === CODE_HTTP.CODE_NO_CONTENT || response.body === null)) {
          throw new HttpErrorResponse({
            error: new Error('Réponse inattendue : aucun contenu retourné par le serveur'),
            status: response.status, statusText: response.statusText, url: _url
          });
        }
        try {
          return this._jsonConverterService.getInstance().deserializeArray(response.body, this.type);
        } catch (e) {
          throw (<Error>e);
        }
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }
  getAll(): Observable<T[]|Error> {
    return this.getMulti();
  }


  // REQUETE GET PAR DEFAUT - UN SEUL ELEMENT
  getOne(_url: string = this.url, _noContentIsError: boolean = false): Observable<T|Error> {
    return this.http.get<T[]>(_url, {observe: 'response'}).pipe(
      map((response: any) => {
        if (_noContentIsError && (response.status === CODE_HTTP.CODE_NO_CONTENT || response.body === null)) {
          throw new HttpErrorResponse({
            error: new Error('Réponse inattendue : aucun contenu retourné par le serveur'),
            status: response.status, statusText: response.statusText, url: _url
          });
        }
        try {
          return this._jsonConverterService.getInstance().deserialize(response.body, this.type);
        } catch (e) {
          throw (<Error>e);
        }
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }
  getById(id: Number | String): Observable<T|Error> {
    return this.getOne(this.url + '/' + id);
  }
  getByCode(code: String): Observable<T|Error> {
    return this.getOne(this.url + ROUTES_API.CODE + '/'  + code);
  }
  getByUuid(uuid: String): Observable<T|Error> {
    return this.getOne(this.url + ROUTES_API.UUID + '/'  + uuid);
  }

  // REQUETE PUT/CREATION
  put(entity: T, _url: string = this.url, _notCreatedIsError: boolean = true, _callbackError?: Function): Observable<T|Error> {
    return this.http
      .put(_url, this._jsonConverterService.getInstance().serialize(entity), {headers: httpOptions.headers, observe: 'response'})
      .pipe(
        map(response => {
          if (_notCreatedIsError && response.status !== CODE_HTTP.CODE_CREATED) {
            throw new HttpErrorResponse({
              error: new Error(`Réponse inattendue : l'objet n'a pas été créé.`),
              status: response.status, statusText: response.statusText, url: _url
            });
          }
          try {
            return this._jsonConverterService.getInstance().deserialize(response.body, this.type);
          } catch (e) {
            throw (<Error>e);
          }
        }),
        catchError(error => {
          if (_callbackError) { _callbackError(error); }
          return throwError(error);
        })
      );
  }
  create(entity: T): Observable<T|Error> {
    return this.put(entity);
  }
  createWithCallback(entity: T, _callbackError?: Function) {
    return this.put(entity, undefined, undefined, _callbackError);
  }



  // REQUETE POST/EDITION
  post(entity: T, _url: string = this.url, _notModifiedIsError: boolean = true, _callbackError?: Function): Observable<T|Error> {
    return this.http
      .post(_url, this._jsonConverterService.getInstance().serialize(entity), {headers: httpOptions.headers, observe: 'response'})
      .pipe(
        map(response => {
          if (_notModifiedIsError && response.status === CODE_HTTP.CODE_NOT_MODIFIED) {
            throw new HttpErrorResponse({
              error: new Error(`Réponse inattendue : l'objet n'a pas été modifié.`),
              status: response.status, statusText: response.statusText, url: _url
            });
          }
          try {
            return this._jsonConverterService.getInstance().deserialize(response.body, this.type);
          } catch (e) {
            throw (<Error>e);
          }
        }),
        catchError(error => {
          if (_callbackError) { _callbackError(error); }
          return throwError(error);
        })
    );
  }
  postList(entities: T[], _url: string = this.url, _callbackError?: Function): Observable<T[]|Error> {
    return this.http
      .post(_url, this._jsonConverterService.getInstance().serialize(entities), {headers: httpOptions.headers, observe: 'response'})
      .pipe(
        map(response => {
          try {
            return this._jsonConverterService.getInstance().deserialize(response.body, this.type);
          } catch (e) {
            throw (<Error>e);
          }
        }),
        catchError(error => {
          if (_callbackError) { _callbackError(error); }
          return throwError(error);
        })
    );
  }

  update(entity: T): Observable<T|Error> {
    return this.post(entity);
  }
  updateWithCallback(entity: T, _callbackError?: Function) {
    return this.post(entity, undefined, undefined, _callbackError);
  }

  /** Enregistre l'objet avec un CREATE ou un UPDATE en fonction de la situation */
  save(entity: T, _callbackError?: Function): Observable<T|Error> {
    if (entity['id'] === undefined) {
      return this.create(entity);
    } else {
      return this.update(entity);
    }
  }
  saveWithCallback(entity: T, _callbackError?: Function): Observable<T|Error> {
    if (entity['id'] === undefined || entity['id'] === null) {
      return this.createWithCallback(entity, _callbackError);
    } else {
      return this.updateWithCallback(entity, _callbackError);
    }
  }

  // REQUETE DELETE
  delete(_url: string = this.url, _callbackError?: Function): Observable<Boolean> {
    return this.http
      .delete(_url, { headers: httpOptions.headers, observe: 'response' }).pipe(
        map((response: any) => {
          return true;
        }),
        catchError(error => {
          if (_callbackError) { _callbackError(); }
          return throwError(error);
        })
      );
  }
  deleteById(id: any, _callbackError?: Function): Observable<Boolean> {
    const url = `${this.url}/${id}`;
    return this.delete(url, _callbackError);
  }
}
