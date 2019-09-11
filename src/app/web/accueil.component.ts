import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CODE_MESSAGE_INFO } from '../constantes/referentiel/code-message-info.enum';
import { ETAPE } from '../constantes/referentiel/etape.enum';
import { PROFILS } from '../constantes/referentiel/profils.enum';
import { ROUTES } from '../constantes/routes';
import { SESSION_CLES } from '../constantes/session-cles';
import { Article } from '../modeles/article.model';
import { AccueilTuileDto } from '../modeles/dto/accueil-tuile.dto';
import { Utilisateur } from '../modeles/dto/utilisateur.dto';
import { MessageInfo } from '../modeles/message-info.model';
import { FilArianeItem } from '../modeles/utils/fil-ariane-item.model';
import { ArticleService } from '../services/crud/article.service';
import { DemandeService } from '../services/crud/demande.service';
import { MessageInfoService } from '../services/crud/message-info.service';
import { SessionUtilisateurService } from '../services/session-utilisateur.service';
import { StorageService } from '../services/storage.service';
import { ModaleDemandePapierComponent } from './commun/actions-rapides/modale-demande-papier/modale-demande-papier.component';
import { ModaleDemandeParNumeroComponent } from './commun/actions-rapides/modale-demande-par-numero/modale-demande-par-numero.component';
import { ModaleDemandeTeleRCComponent } from './commun/actions-rapides/modale-demande-tele-rc/modale-demande-tele-rc.component';




@Component({
  selector: 'app-accueil',
  templateUrl: './accueil.component.html'
})
export class AccueilComponent implements OnInit {

  // FilAriane
  filAriane: FilArianeItem[];
  // Loaders
  loading = true;
  tuilesLoading = true;
  // Autres
  user: Utilisateur = undefined;
  messageInfo: MessageInfo;
  mainArticle: Article;
  tuiles: AccueilTuileDto[] = [];
  tuileTotaux: AccueilTuileDto = undefined;
  tuilesVisibles = true;
  _ETAPE = ETAPE;
  titreLiens = 'Afficher les demandes associées';

  constructor(
    private router: Router,
    private storageService: StorageService,
    private sessionUtilisateurSvc: SessionUtilisateurService,
    private artSvc: ArticleService,
    private miSvc: MessageInfoService,
    private dialog: MatDialog,
    private demSvc: DemandeService,
  ) { }

  ngOnInit() {
    this.loading = true;
    this.getLoggedUser();
    /** @todo : appeler la route /demandes/tuiles à la place de celle des organismes */
    forkJoin([
      this.artSvc.getFullArborescence(),
      this.miSvc.getByCode(CODE_MESSAGE_INFO.CODE_MI_INTRARC_ACCUEIL)
    ]).subscribe(results => {
      this.mainArticle = results[0] as Article;
      this.messageInfo = results[1] as MessageInfo;
      this.loading = false;
      this.demSvc.getTuiles().subscribe((tuiles: AccueilTuileDto[]) => {
        this.tuiles = tuiles;
        this.genererTuileTotaux();
        this.tuilesLoading = false;
      });
    });
  }


  /** @description : Génère la tuile "Totaux" SSI l'utilisateur connecté a accès à plus d'un organisme */
  private genererTuileTotaux() {
    if (this.tuiles.length > 1) {
      let nbrAInstruire = 0;
      let nbrInstruits = 0;
      this.tuiles.forEach((tuile: AccueilTuileDto) => {
        nbrInstruits += tuile.nbrInstruits;
        nbrAInstruire += tuile.nbrAInstruire;
      });
      this.tuileTotaux = new AccueilTuileDto({
        nbrInstruits: nbrInstruits,
        nbrAInstruire: nbrAInstruire
      });
    } else if (this.tuiles.length === 1) {
      this.tuileTotaux = this.tuiles[0];
    }
  }


  // ACTIONS
  ouvrirRecherche(tuile: AccueilTuileDto, codeEtape?: ETAPE, total?: boolean ) {
    const withOrganisme = !!(tuile.organisme);
    this.storageService.setItemSessionStorage(SESSION_CLES.RECHERCHE_DEMANDE_FILTRES, {
      'etape.code': codeEtape,
      'organismeAttribution.departement.region.id': (withOrganisme) ? tuile.organisme.departement.region.id : undefined,
      'organismeAttribution.departement.id': (withOrganisme) ? tuile.organisme.departement.id : undefined,
      'organismeAttribution.id': (withOrganisme) ? tuile.organisme.id : undefined,
    });
    this.router.navigate(['/' + ROUTES.DEMANDES ]);
  }

  // ACTIONS RAPIDES
  actionOuvrirDemandeAvecNumero() {
    this.dialog.open(ModaleDemandeParNumeroComponent, {
      disableClose : true,
      data: {}
    });
  }
  actionRecupererDemandeTeleRC() {
    this.dialog.open(ModaleDemandeTeleRCComponent, {
      disableClose : true,
      data: {}
    });
  }
  actionSaisirDemandePapier() {
    this.dialog.open(ModaleDemandePapierComponent, {
      disableClose : true,
      data: {}
    });
  }

  // UTILS
  messageInfoDatePublicationDepassee(): boolean {
    if (this.messageInfo === undefined || this.messageInfo.datePublication === null) { return false; }
    return this.messageInfo.datePublication.getTime() <= new Date().getTime();
  }
  changeAccordeon(etat: boolean) { this.tuilesVisibles = etat; }

  getLoggedUser(): Utilisateur {
    if (!this.user) { this.user = this.sessionUtilisateurSvc.getStorableUser(); }
    return this.user;
  }

  userIsObservateur() {
    return this.getLoggedUser().is(PROFILS.OBSERVATEUR);
  }
}
