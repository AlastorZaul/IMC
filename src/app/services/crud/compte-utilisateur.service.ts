import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { ToasterService } from 'angular2-toaster';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { CompteUtilisateur } from 'src/app/modeles/compte-utilisateur.model';
import { SearchService } from './search.service';


@Injectable()
export class CompteUtilisateurService extends SearchService<CompteUtilisateur> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, CompteUtilisateur, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_METIER + ROUTES_API.COMPTE_UTILISATEUR;
  }
}
