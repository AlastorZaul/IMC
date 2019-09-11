import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { ToasterService } from 'angular2-toaster';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { Localisation } from 'src/app/modeles/localisation.model';
import { SearchRequestDto } from 'src/app/modeles/recherche/search-request.dto';
import { Observable } from 'rxjs/internal/Observable';
import { SearchResponseDto } from 'src/app/modeles/recherche/search-response.dto';
import { SearchService } from 'src/app/services/crud/search.service';

@Injectable()
export class LocalisationService extends SearchService<Localisation> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, Localisation, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_REFERENTIEL + ROUTES_API.LOCALISATION;
  }
}
