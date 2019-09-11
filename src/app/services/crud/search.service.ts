import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ToasterService } from 'angular2-toaster/angular2-toaster';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { SearchResponseDto } from 'src/app/modeles/recherche/search-response.dto';
import { BaseService } from './base.service';
import { SearchRequestDto } from 'src/app/modeles/recherche/search-request.dto';
import { ElementRef } from '@angular/core';


export abstract class SearchService<T> extends BaseService<T> {
  constructor(protected _http: HttpClient, protected _type: { new(): T; }|any,
    protected _toasterService: ToasterService,
    protected _jsonConverterService: JsonConverterService,
    protected _configService: ConfigurationService) {
      super(_http, _type, _toasterService, _jsonConverterService, _configService);
  }

  search(requestItem: SearchRequestDto, _url: string = this.url): Observable<SearchResponseDto|Error> {
    const realUrl = _url + ROUTES_API.RECHERCHE + requestItem.toURLString();
    return this._http.get<SearchResponseDto>(realUrl, {observe: 'response'}).pipe(
      map((response: any) => {
        const searchResult: SearchResponseDto = this._jsonConverterService.getInstance().deserialize(response.body, SearchResponseDto);
        searchResult.content = this._jsonConverterService.getInstance().deserializeArray(searchResult.content, this._type);
        try {
          return searchResult;
        } catch (e) {
          throw (<Error>e);
        }
      }),
      catchError(error => {
        return throwError(error);
      })
    );
  }

  exportXLS(requestItem: SearchRequestDto, downloadLink: ElementRef, nomFichier: string, stopLoading: Function) {
    const realUrl = this.url + ROUTES_API.EXPORT_EXCEL + requestItem.toURLString();
    this.http.get<Blob>(realUrl,  {observe: 'response', responseType: 'blob' as 'json'}).pipe(
      map((response: any) => response.body),
      catchError(error => throwError(error))
    ).subscribe((blob) => {
      if (window.navigator && window.navigator.msSaveOrOpenBlob) { // IE
        window.navigator.msSaveOrOpenBlob(blob);
      } else { // Others
        const url = window.URL.createObjectURL(blob);
        const link = downloadLink.nativeElement;
        link.href = url;
        link.download = nomFichier;
        link.click();
        window.URL.revokeObjectURL(url);
      }
      stopLoading();
    });
  }
}
