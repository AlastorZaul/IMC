import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { ToasterService } from 'angular2-toaster';
import { ROUTES_API } from 'src/app/constantes/routes-api';
import { Pays } from 'src/app/modeles/pays.model';
import { CODE_PAYS } from 'src/app/constantes/referentiel/code-pays.enum';


@Injectable()
export class PaysService extends BaseService<Pays> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, Pays, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_REFERENTIEL + ROUTES_API.PAYS;
  }

  /** Mettre l'option France en haute de la liste des pays */
  sortListePaysFrancePremierOption(listePays: Pays[]): Pays[] {
    const oldIndex = listePays.findIndex(p => {
      return p.code === CODE_PAYS.FRANCE;
    });
    const paysFrance = listePays[oldIndex] as Pays;
    if (oldIndex > -1) {
      const arrayClone = listePays.slice();
      arrayClone.splice(oldIndex, 1);
      arrayClone.splice(0, 0, paysFrance);
      listePays = arrayClone;
    }
    return listePays;
  }
}
