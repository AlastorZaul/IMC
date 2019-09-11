import { Injectable } from '@angular/core';
import { ConfigurationService } from './configuration.service';
import { TYPE_COURRIER } from '../constantes/referentiel/type-courrier.enum';
import * as moment from 'moment';
import { Courrier } from '../modeles/courrier.model';
import { SessionUtilisateurService } from './session-utilisateur.service';
import { Demande } from '../modeles/demande.model';


export enum BIRT_PARAMETRES {
  NOM_RAPPORT =               '__report=',
  AFFICHER_PAGE_PARAMETRES =  '__parameterpage=',
  NOM_DOCUMENT_FINAL =        '__document=', // Exemple : courEmp0201923226451651509
  ID_DEMANDE =                'idDemande=',
  NOM_AGENT =                 'nomAgent=', /** URL ENCODE A FAIRE */
  DATE_DECISION =             'dateDecision=', /** FORMAT dd/MM/YYYY */
  IS_DOM_COM =                'isDomCom=',
  IS_EMPLOYEUR =              'isEmployeur=',
  LENDEMAIN_DATE_FIN_INSTRU = 'LenDateFinInst=',
  PAS_MEME_REGION           = 'pasMemeRegion=',
  ID_ORGANISME_CONNECTE =     'idOrganismeConnecte=',
  ID_SIGNATURE =              'idImage=',
  LRAR =                      'lrar='
}

export class BirtParametreItem {
  parametre: BIRT_PARAMETRES;
  valeur: any;
  constructor(parametre: BIRT_PARAMETRES, valeur: any) {
    this.parametre = parametre;
    this.valeur = valeur;
  }
}


/** @description: Service permettant de gérer les appels au BirtViewer */
@Injectable({ providedIn: 'root' })
export class BirtViewerService {
  constructor(
    private confService: ConfigurationService,
    private utilSessionService: SessionUtilisateurService
  ) {}

  public ouvrirRapportAvecParametres(parametres: BirtParametreItem[]) {
    let url = '';
    if (parametres !== undefined && parametres.length > 0) {
      let firstFiltreParam = true;
      parametres.forEach((bpI: BirtParametreItem) => {
        if (firstFiltreParam) { firstFiltreParam = false; } else { url += '&'; }
        url += bpI.parametre + encodeURIComponent(bpI.valeur);
      });
    }
    window.open(this.confService.getEnvironment().birt.birtBaseUrl + url, '_blank');
  }

  /** @description: ouverture du BirtViewer de la synthèse de la demande.
   * PARAMETRES BIRT NECESSAIRES :
   * idDemande => id de la demande concernée */
  public ouvrirSynthese(idDemande: number) {
    this.ouvrirRapportAvecParametres([
      new BirtParametreItem(BIRT_PARAMETRES.NOM_RAPPORT, this.getSyntheseReportName()),
      new BirtParametreItem(BIRT_PARAMETRES.AFFICHER_PAGE_PARAMETRES, false),
      new BirtParametreItem(BIRT_PARAMETRES.ID_DEMANDE, idDemande)
    ] as BirtParametreItem[]);
  }

  /** @description: ouverture du BirtViewer pour un/deux courriers de type "courrier de demande" (tous sauf synthèse, en fait)
   * PARAMETRES BIRT NECESSAIRES :
   * // COMMUNS A TOUS LES RAPPORTS
   * idDemande => id de la demande concernée
   * nomAgent => nom de l'agent
   * isEmployeur => si le courrier est adressé à l'employeur (si false, courrier pour le salarié)
   * idOrganismeConnecte => id de l'organisme de l'utilisateur
   * idImage => id de la signature
   * isDomCom => si départements d'outre-mer et territoires d'outre-mer
   * // RAPPORTS REFUS / IRRECEV
   * lrar => utilisation du LRAR
   * // RAPPORTS DE DECISION (ACC, REF, IRR, ATT)
   * dateDecision => date de décision
   * // ACCUSE DE RECEPTION UNIQUEMENT
   * LenDateFinInst => da date de fin du délai d'instruction + 1 jour
   * // TRANSFERT UNIQUEMENT
   * pasMemeRegion => est-ce que le transfert s'est fait entre deux UD de la même région ou non
   * */
  public ouvrirCourrierDemande(courrier: Courrier, demande: Demande,
    pourEmployeur: boolean, pourSalarie: boolean, idSignature: number, lrar: boolean
  ) {
    if (!courrier || !demande
      || (courrier.typeCourrier.code === TYPE_COURRIER.TCOUR_RPT_CODE && !demande.dateFinDelaiInstruction)) {
      console.error(`Un courrier n'a pas pu être généré car il manquait des paramètres obligatoires`);
      return;
    }
    const user = this.utilSessionService.getStorableUser();
    const courrTC = courrier.typeCourrier.code;
    // TABLEAU DES PARAMETRES
    const parametres: BirtParametreItem[] = [];
    parametres.push(new BirtParametreItem(BIRT_PARAMETRES.NOM_RAPPORT,
      this.getNomRapportParTypeCourrier(courrier.typeCourrier.code as TYPE_COURRIER)));
    parametres.push(new BirtParametreItem(BIRT_PARAMETRES.AFFICHER_PAGE_PARAMETRES, false));
    parametres.push(new BirtParametreItem(BIRT_PARAMETRES.ID_DEMANDE, demande.id));
    parametres.push(new BirtParametreItem(BIRT_PARAMETRES.NOM_AGENT, user.identite));
    if ( courrTC === TYPE_COURRIER.TCOUR_IRR_CODE || courrTC === TYPE_COURRIER.TCOUR_REF_CODE
      || courrTC === TYPE_COURRIER.TCOUR_ACC_CODE || courrTC === TYPE_COURRIER.TCOUR_ATT_CODE
    ) {
        parametres.push(new BirtParametreItem(BIRT_PARAMETRES.DATE_DECISION, this.dateToString(moment(demande.dateDecision))));
    }
    if ( courrTC === TYPE_COURRIER.TCOUR_RPT_CODE && demande.dateFinDelaiInstruction) {
      parametres.push(new BirtParametreItem(BIRT_PARAMETRES.LENDEMAIN_DATE_FIN_INSTRU,
        this.calculLendemainDate(demande.dateFinDelaiInstruction)));
    }
    parametres.push(new BirtParametreItem(BIRT_PARAMETRES.ID_ORGANISME_CONNECTE, user.organisme.id));
    if (idSignature) {
      parametres.push(new BirtParametreItem(BIRT_PARAMETRES.ID_SIGNATURE, idSignature));
    }
    if (courrTC === TYPE_COURRIER.TCOUR_IRR_CODE || courrTC === TYPE_COURRIER.TCOUR_REF_CODE) {
      parametres.push(new BirtParametreItem(BIRT_PARAMETRES.LRAR, lrar));
    }
    if (courrTC === TYPE_COURRIER.TCOUR_TSF_CODE) {
      parametres.push(new BirtParametreItem(BIRT_PARAMETRES.PAS_MEME_REGION, this.transfertMemeRegion(demande)));
    }
    parametres.push(new BirtParametreItem(BIRT_PARAMETRES.IS_DOM_COM, this.isDomCom(user.organisme.nomCourt)));
    if (pourEmployeur) { this.ouvrirRapportAvecParametres(parametres.concat([new BirtParametreItem(BIRT_PARAMETRES.IS_EMPLOYEUR, true)])); }
    if (pourSalarie) { this.ouvrirRapportAvecParametres(parametres.concat([new BirtParametreItem(BIRT_PARAMETRES.IS_EMPLOYEUR, false)])); }
  }

  // UTILS / HELPER
  public getNomRapportParTypeCourrier(typeCourrier: TYPE_COURRIER): string {
    let reportName = '';
    const configBirtRapports = this.confService.getEnvironment().birt.rapports;
    switch (typeCourrier) {
      case TYPE_COURRIER.TCOUR_RPT_CODE : reportName = configBirtRapports.ACCUSE_RECEPTION; break;
      case TYPE_COURRIER.TCOUR_ATT_CODE : reportName = configBirtRapports.ATTESTATION_HOMOLOGATION; break;
      case TYPE_COURRIER.TCOUR_IRR_CODE : reportName = configBirtRapports.AVIS_IRRECEVABILITE; break;
      case TYPE_COURRIER.TCOUR_REF_CODE : reportName = configBirtRapports.COURRIER_REFUS; break;
      case TYPE_COURRIER.TCOUR_TSF_CODE : reportName = configBirtRapports.COURRIER_TRANSFERT; break;
      case TYPE_COURRIER.TCOUR_ACC_CODE : reportName = configBirtRapports.ACCORD_EXPRES; break;
    }
    return reportName;
  }
  public getSyntheseReportName(): string {
    return this.confService.getEnvironment().birt.rapports.SYNTHESE;
  }
  private calculLendemainDate(dateSource): string {
    if (!dateSource) { return '<INDÉTERMINÉE>'; }
    return this.dateToString(moment(dateSource).add(1, 'days'));
  }
  private dateToString(dateSource: moment.Moment): string {
    return dateSource.format('DD/MM/YYYY');
  }

  private isDomCom(nomCourtOrganisme: string) {
    if (!nomCourtOrganisme || nomCourtOrganisme.length < 4) { return false; }
    const code = nomCourtOrganisme.substring(0, 4);
    return ['DR96', 'DR97', 'DR98'].findIndex((codeDomTom) => code === codeDomTom) >= 0;
  }
  private transfertMemeRegion(demande: Demande) {
    if (!demande.organismeReception || !demande.organismeAttribution) { return true; }
    return demande.organismeReception.departement.region.id === demande.organismeAttribution.departement.region.id;
  }

}
