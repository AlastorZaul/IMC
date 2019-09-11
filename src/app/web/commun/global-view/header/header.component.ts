import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { SessionUtilisateurService } from 'src/app/services/session-utilisateur.service';
import { Utilisateur } from 'src/app/modeles/dto/utilisateur.dto';
import { PROFILS } from 'src/app/constantes/referentiel/profils.enum';
import { MatDialog } from '@angular/material';
import { ConfirmModaleComponent } from '../../modales/confirm-modale.component';
import { DemandeService } from 'src/app/services/crud/demande.service';
import { ToasterService } from 'angular2-toaster';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html'
})
export class HeaderComponent implements OnInit {

  // Version récupérée directement depuis le fichier "package.json"
  public version: string = environment.VERSION;
  user: Utilisateur = undefined;

  constructor(
    public sessionUtilisateurSvc: SessionUtilisateurService,
    private dialog: MatDialog,
    private demandeService: DemandeService,
    private toasterService: ToasterService
  ) { }

  ngOnInit() {
    this.getLoggedUser();
  }

  getLoggedUser(): Utilisateur {
    if (!this.user) { this.user = this.sessionUtilisateurSvc.getStorableUser(); }
    return this.user;
  }

  showItemsGestionnaire() {
    return this.user.is(PROFILS.GESTIONNAIRE) || this.user.is(PROFILS.ADMINISTRATEUR_FONCTIONNEL)
      || this.user.is(PROFILS.ADMINISTRATEUR_NATIONAL);
  }
  showItemsAdmins() {
    return this.user.is(PROFILS.ADMINISTRATEUR_FONCTIONNEL) || this.user.is(PROFILS.ADMINISTRATEUR_NATIONAL);
  }
  showItemsAdminNational() {
    return this.user.is(PROFILS.ADMINISTRATEUR_NATIONAL);
  }

  reindexation() {
    this.dialog.open(ConfirmModaleComponent, {
      disableClose : true,
      width: '400px',
      data: {
        titre: `Réindexer les demandes ?`,
        contenu: `Vous vous apprêtez à réindexer les demandes de l'application.<br/>
        Cette opération pouvant prendre quelques minutes, merci de ne la réaliser qu'en période creuse.<br/>
        Voulez-vous poursuivre ?`,
        texteBoutonNon: 'Non', texteBoutonOui: 'Oui'
      }
    }).afterClosed().subscribe(res => {
      if (res) {
        const toast = this.toasterService.pop({
          type: TYPE_TOAST.INFORMATION, title: 'Réindexation',
          body: `Réindexation des demandes en cours, veuillez patienter...`
        });
        this.demandeService.reindexAll().subscribe((resReindex: boolean) => {
          this.toasterService.clear(toast.toastId);
          if (resReindex) {
            this.toasterService.pop({
              type: TYPE_TOAST.SUCCES,
              timeout: 0,
              body: `Les demandes ont bien été réindexées.`
            });
          } else {
            this.toasterService.pop({
              type: TYPE_TOAST.ERREUR,
              body: `Une erreur est survenue durant l'opération de réindexation. Veuillez réessayer ultérieurement.`
            });
          }
        }, (error) => {
          this.toasterService.clear(toast.toastId);
          this.toasterService.pop({
            type: TYPE_TOAST.ERREUR,
            body: `Une erreur est survenue durant l'opération de réindexation. Veuillez réessayer ultérieurement.`
          });
        });
      }
    });
  }

  logout() {
    this.sessionUtilisateurSvc.logOut();
  }
}
