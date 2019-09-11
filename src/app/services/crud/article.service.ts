import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BaseService } from './base.service';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { ToasterService } from 'angular2-toaster';
import { Article } from '../../modeles/article.model';
import { ROUTES_API } from 'src/app/constantes/routes-api';



@Injectable()
export class ArticleService extends BaseService<Article> {
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, Article, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_PARAMETRES + ROUTES_API.ARTICLE;
  }

  getFullArborescence(): Observable<Article | Error> {
    return this.getOne(this.url + '/arborescence');
  }
}
