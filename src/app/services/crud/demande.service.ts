import { HttpClient } from '@angular/common/http';
import { ElementRef, Injectable } from '@angular/core';
import { ToasterService } from 'angular2-toaster';
import * as moment from 'moment';
import { Moment } from 'moment';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { DELAI } from 'src/app/constantes/delai';
import { MSG_ALERTE_DEMANDE } from 'src/app/constantes/msg-alerte-demande.enum';
import { NIVEAU_ACCES_DEMANDE } from 'src/app/constantes/niveau-acces-demande.enum';
import { JOUR_CHOME_PAQUE } from 'src/app/constantes/referentiel/jour-chome-paque.enum';
import { Demande } from 'src/app/modeles/demande.model';
import { AccueilTuileDto } from 'src/app/modeles/dto/accueil-tuile.dto';
import { Employeur } from 'src/app/modeles/employeur.model';
import { JourChome } from 'src/app/modeles/jour-chome.model';
import { Remuneration } from 'src/app/modeles/remuneration.model';
import { ROUTES_API } from '../../constantes/routes-api';
import { ConfigurationService } from '../configuration.service';
import { JsonConverterService } from '../json-converter.service';
import { BaseService } from './base.service';


@Injectable()
export class DemandeService extends BaseService<Demande> {
  uri: String;
  constructor(http: HttpClient, toasterService: ToasterService,
    jsonConverterService: JsonConverterService,
    configService: ConfigurationService ) {
    super(http, Demande, toasterService, jsonConverterService, configService);
    this.url = this.url + ROUTES_API.SCHEMA_METIER + ROUTES_API.DEMANDE;
  }

  getByNumeroOnIntra(numero: String): Observable<Demande|Error> {
    return this.getOne(this.url + ROUTES_API.NUMERO + '/'  + numero);
  }

  getByNumeroOnPublic(numero: String): Observable<Demande|Error> {
    return this.getOne(this.url + ROUTES_API.TELERC + ROUTES_API.NUMERO + '/'  + numero);
  }

  /**@description: réindexe les demandes ElasticSearch */
  reindexAll(): Observable<boolean|Error> {
    return this.http.get<boolean>(this.url + ROUTES_API.REINDEXATION, {observe: 'response'}).pipe(
      map((response: any) => true),
      catchError(error => throwError(error))
    );
  }

  // Récupération des tuiles
  getTuiles(): Observable<AccueilTuileDto[]|Error> {
    return this.http.get<AccueilTuileDto[]>(this.url + ROUTES_API.TUILES, {observe: 'response'}).pipe(
      map((response: any) => {
        try {
          return this._jsonConverterService.getInstance().deserializeArray(response.body, AccueilTuileDto);
        } catch (e) {
          throw (<Error>e);
        }
      }),
      catchError(error => throwError(error))
    );
  }

  // Détermine si l'utilisateur à l'origine de la requête a accès à la demande ciblée, et surtout, à "quel point" (cf NIVEAU_ACCES_DEMANDE)
  canAccess(uuid: string, _url: string = this.url): Observable<NIVEAU_ACCES_DEMANDE|Error> {
    return this.http.get<NIVEAU_ACCES_DEMANDE>(_url + '/' + uuid + ROUTES_API.ACCES, {observe: 'response'}).pipe(
      map((response: any) => { try {return response.body; } catch (e) {throw (<Error>e); }}),
      catchError(error => throwError(error))
    );
  }

  /**@description: retourne les informations SIENE de l'employeur dont le SIRET a été passé en paramètre */
  getWSSieneInfos(siret: string): Observable<Employeur|Error> {
    return this.http.get<Employeur>(this.url + '/employeur/siret/' + siret, {observe: 'response'}).pipe(
      map((response: any) => {
        try {
          return this._jsonConverterService.getInstance().deserialize(response.body, Employeur);
        } catch (e) {
          throw (<Error>e);
        }
      }),
      catchError(error => throwError(error))
    );
  }

  //////// FICHIERS ////////
  downloadCerfaTeletransmis(idDemande: number, numeroDemande: string, downloadLink: ElementRef, stopLoading: Function) {
    const realUrl = this.url + '/' + idDemande + '/cerfa-teletransmis';
    this.http.get<Blob>(realUrl,  {observe: 'response', responseType: 'blob' as 'json'}).pipe(
      map((response: any) => response.body),
      catchError(error => throwError(error))
    ).subscribe((blob) => {
      this.manageFichier(blob, downloadLink, 'cerfa-' + numeroDemande + '.pdf');
      stopLoading();
    });
  }
  downloadSynthese(idDemande: number, downloadLink: ElementRef, stopLoading: Function) {
    const realUrl = this.url + '/' + idDemande + '/synthese';
    this.http.get<Blob>(realUrl,  {observe: 'response', responseType: 'blob' as 'json'}).pipe(
      map((response: any) => response.body),
      catchError(error => throwError(error))
    ).subscribe((blob) => {
      this.manageFichier(blob, downloadLink, 'synthese-demande-' + idDemande + '.pdf');
      stopLoading();
    });
  }
  downloadFichierConventionCollective(codeConvColl: string, remun: Remuneration, downloadLink: ElementRef, stopLoading: Function) {
    const realUrl = this.url + '/aide-indemnites/' + ((codeConvColl) ? codeConvColl : '0');
    this.http.post<Blob>(realUrl, this._jsonConverterService.getInstance().serialize(new Remuneration(remun)),
      {observe: 'response', responseType: 'blob' as 'json'}
    ).pipe(
      map((response: any) => response.body),
      catchError(error => throwError(error))
    ).subscribe((blob) => {
      this.manageFichier(blob, downloadLink, 'aide-indemnites-cc.xls');
      stopLoading();
    });
  }
  exportCourriers(idDemande: number, downloadLink: ElementRef, stopLoading: Function) {
    const realUrl = this.url + '/' + idDemande + '/courriers' + ROUTES_API.EXPORT;
    this.http.get<Blob>(realUrl,  {observe: 'response', responseType: 'blob' as 'json'}).pipe(
      map((response: any) => response.body),
      catchError(error => throwError(error))
    ).subscribe((blob) => {
      this.manageFichier(blob, downloadLink, 'demande-' + idDemande + '-export-courriers.xls');
      stopLoading();
    });
  }
  private manageFichier(blob: any, downloadLink: ElementRef, nomFichier: string) {
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
  }

  // Récupération des demandes appartenants au même établissement
  getDemSimilairesEtab(siretUrssaf: string, dateReception: Date): Observable<Demande[]|Error> {
    const siretOrUrssaf = 'siret=' + encodeURIComponent(siretUrssaf);
    return this.getMulti(this.url + ROUTES_API.ETABLISSEMENT_SIMILAIRE
    + '?' + siretOrUrssaf  + '&dateReception=' + encodeURIComponent(dateReception.toLocaleDateString()));
  }

  // Récupération des demandes appartenants à la même entreprise
  getDemSimilairesEntre(siret: string, dateReception: Date): Observable<Demande[]|Error> {
    const siretOrUrssaf = 'siret=' + encodeURIComponent(siret);
    return this.getMulti(this.url + ROUTES_API.ENTREPRISE_SIMILAIRE
    + '?' + siretOrUrssaf  + '&dateReception=' + encodeURIComponent(dateReception.toLocaleDateString()));
  }

  ////// Calcul des seuils de nombre de demandes entreprise/établissement à ne pas dépasser ///////

    /** SEUIL 1 : 10 demandes sur une même période de 30 jours (entreprise/établissement) -- Si seuil dépassé ==> return TRUE*/
    /** SEUIL 2 : Au moins une demande sur une période de 3 mois, faisant suite à plus de 10 demandes s'étant échelonnées sur
      *  la période de 3 mois immédiatement antérieure (entreprise/établissement) -- Si seuil dépassé ==> return TRUE*/
    /** SEUIL 3 : Une demande au cours des trois premiers mois de l’année faisant suite à plus de 18
      *  demandes au cours de l’année civile précédente --
      * Si seuil dépassé ET que la date du jour est en Janvier, Février ou Mars ==> return TRUE*/
    calculSeuils(listeDemandes: Demande[], type: String): Array<any> {
      const seuilDepasseeTab = [];
      const dateDuJour = moment();
      // SEUIL 1
      let nmbreDemandesSeuil1 = 0;
      const dateMinSeuil1 = moment().subtract(30, 'days');
      // SEUIL 2
      let nmbreDemandesSeuil2 = 0;
      const dateMaxSeuil2 = moment().subtract(3, 'months');
      const dateMinSeuil2 = moment().subtract(6, 'months');
      // SEUIL 3
      let nmbreDemandesSeuil3 = 0;
      const actualYear = dateDuJour.year();
      const actualMonth = dateDuJour.month();
      const dateMinSeui3 = moment('01-01-' + actualYear);
      const dateMaxSeui3 = moment('31-12-' + actualYear);

      for (const d of listeDemandes) {
        const dateReception = moment(d.dateReception);
        if (dateReception.isAfter(dateMinSeuil1) && dateReception.isBefore(dateDuJour)) {nmbreDemandesSeuil1++; }
        if (dateReception.isAfter(dateMinSeuil2) && dateReception.isBefore(dateMaxSeuil2)) {nmbreDemandesSeuil2++; }
        if (dateReception.isAfter(dateMinSeui3) && dateReception.isBefore(dateMaxSeui3)) {nmbreDemandesSeuil3++; }
      }

      if (nmbreDemandesSeuil1 >= 10) {
        type === MSG_ALERTE_DEMANDE.ETABLISSEMENT ? seuilDepasseeTab.push({'msg': MSG_ALERTE_DEMANDE.MSG_ETAB_1}) :
                                                  seuilDepasseeTab.push({'msg': MSG_ALERTE_DEMANDE.MSG_ENTRE_1});
      }
      if (nmbreDemandesSeuil2 >= 10) {
        type === MSG_ALERTE_DEMANDE.ETABLISSEMENT ? seuilDepasseeTab.push({'msg': MSG_ALERTE_DEMANDE.MSG_ETAB_2}) :
                                                  seuilDepasseeTab.push({'msg': MSG_ALERTE_DEMANDE.MSG_ENTRE_2});
      }
      if (nmbreDemandesSeuil3 > 18 && (actualMonth === 0 || actualMonth === 1 || actualMonth === 2)) {
        type === MSG_ALERTE_DEMANDE.ETABLISSEMENT ? seuilDepasseeTab.push({'msg': MSG_ALERTE_DEMANDE.MSG_ETAB_3}) :
                                                  seuilDepasseeTab.push({'msg': MSG_ALERTE_DEMANDE.MSG_ENTRE_3});
      }
      return seuilDepasseeTab;
    }

  // Permet de vérifier si la date est un jour chômé ou pas
  isDateChomeeLoc(listeJourChomes: JourChome[], date: Moment): boolean {
    let isJourChome = false;
    if (listeJourChomes !== undefined) {
      for (const jC of listeJourChomes) {
        let dateJC;
        // Créer un objet date si le jour chomé est à calculé
        if (jC.jour === null || jC.mois === null ) {
          switch (jC.code) {
            case JOUR_CHOME_PAQUE.ASSOMPTION: {
              dateJC = this.JoursFeries(date.year(), true, false, false, false, false, false, false); break;
            }
            case JOUR_CHOME_PAQUE.PAQUES: {
              dateJC = this.JoursFeries(date.year(), false, true, false, false, false, false, false); break;
            }
            case JOUR_CHOME_PAQUE.VENDREDI_SAINT: {
              dateJC = this.JoursFeries(date.year(), false, false, true, false, false, false, false); break;
            }
            case JOUR_CHOME_PAQUE.LUNDI_PAQUES: {
              dateJC = this.JoursFeries(date.year(), false, false, false, true, false, false, false); break;
            }
            case JOUR_CHOME_PAQUE.ASCENSION: {
              dateJC = this.JoursFeries(date.year(), false, false, false, false, true, false, false); break;
            }
            case JOUR_CHOME_PAQUE.PENTECOTE: {
              dateJC = this.JoursFeries(date.year(), false, false, false, false, false, true, false); break;
            }
            case JOUR_CHOME_PAQUE.LUNDI_PENTECOTE: {
              dateJC = this.JoursFeries(date.year(), false, false, false, false, false, false, true); break;
            }
          }
        } else { // Créer un objet date si le jour chomé est fixe
          dateJC = new Date(date.year(), jC.mois - 1, jC.jour);
        }
        // Comparer le jour chômé avec la date
        if (dateJC.getDate() === date.date() && dateJC.getMonth() === date.month() && dateJC.getFullYear() === date.year()) {
          isJourChome = true;
        }
      }
    }
    return isJourChome;
  }

  JoursFeries (an: number, assomption: boolean, paques: boolean, vendrediSaint: boolean,
               lundipaque: boolean, ascension: boolean, pentecote: boolean, lundiPentocote: boolean): Date {

    let date;
    const G = an % 19;
    const C = Math.floor(an / 100);
    const H = (C  -  Math.floor(C / 4)  -  Math.floor((8 * C + 13) / 25) + 19 * G + 15) % 30;
    const I = H  -  Math.floor(H / 28) * (1  -  Math.floor(H / 28) * Math.floor(29 / (H + 1)) * Math.floor((21  -  G) / 11));
    const J = (an * 1 + Math.floor(an / 4) + I + 2  -  C + Math.floor(C / 4)) % 7;
    const L = I  -  J;
    const MoisPaques = 3 + Math.floor((L + 40) / 44);
    const JourPaques = L + 28  -  31 * Math.floor(MoisPaques / 4);

    // Assomption
    if (assomption)     { date = new Date(an,  7, 15); }
    // Paques
    if (paques)         { date = new Date(an, MoisPaques - 1, JourPaques); }
    // VendrediSaint
    if (vendrediSaint)  { date = new Date(an, MoisPaques - 1, JourPaques - 2); }
    // LundiPaques
    if (lundipaque)     { date = new Date(an, MoisPaques - 1, JourPaques + 1); }
    // Ascension
    if (ascension)      { date = new Date(an, MoisPaques - 1, JourPaques + 39); }
    // Pentecote
    if (pentecote)      { date = new Date(an, MoisPaques - 1, JourPaques + 49); }
    // LundiPentecote
    if (lundiPentocote) { date = new Date(an, MoisPaques - 1, JourPaques + 50); }
    return date;
  }

  /** Calcul date de fin du délai d'instruction */
  calculDateFinDelaiInstru(dateReception: Date, listeJourChomes: JourChome[]): Date {
    const dateInstru: moment.Moment = moment(dateReception);
    // Prise en compte du délai d'instruction - en jours ouvrables
    for (let i = 0; i < DELAI.DELAI_INSTRUCTION ; i++) {
      dateInstru.add(1, 'days');
      // Si le jour de réception potentiel est un jour chomé ou un dimanche ==> on se déplace au jour ouvré suivant
      while (dateInstru.weekday() === 0 || this.isDateChomeeLoc(listeJourChomes, dateInstru)) {
        dateInstru.add(1, 'days');
      }
    }
    // Lorsque le délai expire un samedi, dimanche ou jour férié ou chômé, il est prorogé jusqu’au premier jour ouvrable suivant.
    while (dateInstru.weekday() === 6 || dateInstru.weekday() === 0 || this.isDateChomeeLoc(listeJourChomes, dateInstru)) {
      dateInstru.add(1, 'days');
    }
    return dateInstru.toDate();
  }

  /** Calcul date de fin du délai de rétractation */
  calculDateFinDelaiRetractation(dateSignature: Date, listeJourChomes: JourChome[]): Date {
    if (dateSignature) {
      const dateSign: moment.Moment = moment(dateSignature);
      // Prise en compte du délai de rétractation - en jours calendaires
      dateSign.add(15, 'days');
      // Lorsque le délai expire un samedi, dimanche ou jour férié ou chômé, il est prorogé jusqu’au premier jour ouvrable suivant.
      while (dateSign.weekday() === 6 || dateSign.weekday() === 0 || this.isDateChomeeLoc(listeJourChomes, dateSign)) {
        dateSign.add(1, 'days');
      }
      return dateSign.toDate();
    }
    return undefined;
  }
}

