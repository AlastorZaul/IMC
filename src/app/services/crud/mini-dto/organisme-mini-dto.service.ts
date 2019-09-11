import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../../configuration.service';
import { JsonConverterService } from '../../json-converter.service';
import { ToasterService } from 'angular2-toaster';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { SearchService } from '../search.service';
import { SearchRequestDto } from 'src/app/modeles/recherche/search-request.dto';
import { Observable } from 'rxjs';
import { SearchResponseDto } from 'src/app/modeles/recherche/search-response.dto';


@Injectable()
export class OrganismeMiniDtoService extends SearchService<OrganismeMiniDto> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, OrganismeMiniDto, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_METIER + ROUTES_API.ORGANISME + ROUTES_API.MINI;
  }

  // Retourne uniquement les régions autorisées à l'utilisateur
  getAutorises(): Observable<OrganismeMiniDto[]|Error> {
    return this.getMulti(this.url.replace(ROUTES_API.MINI, ROUTES_API.AUTORISES));
  }

  search(requestItem: SearchRequestDto, _url: string = this.url): Observable<SearchResponseDto|Error> {
    return super.search(requestItem, _url.replace(ROUTES_API.MINI, ''));
  }
}
