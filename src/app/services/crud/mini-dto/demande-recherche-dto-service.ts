import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import { Observable } from 'rxjs';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { DemandeRechercheDto } from 'src/app/modeles/dto/demande-recherche-dto.model';
import { ConfigurationService } from '../../configuration.service';
import { JsonConverterService } from '../../json-converter.service';
import { SearchService } from '../search.service';


@Injectable()
export class DemandeRechercheDtoService extends SearchService<DemandeRechercheDto> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService) {
    super(http, DemandeRechercheDto, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_METIER + ROUTES_API.DEMANDE;
  }

  getByUuidMin(uuid: String): Observable<DemandeRechercheDto|Error> {
    return this.getOne(this.url + ROUTES_API.UUID + '/'  + uuid + ROUTES_API.MINI);
  }

  getDemandesSimilaires(siret: string, urssaf: string, nom: string): Observable<DemandeRechercheDto[]|Error> {
    const siretOrUrssaf = ((siret) ? 'siret=' + encodeURIComponent(siret) : 'urssaf=' + encodeURIComponent(urssaf) );
    return this.getMulti(this.url + '/similaires?' + siretOrUrssaf  + '&nom=' + encodeURIComponent(nom.substring(0, 3)));
  }
}
