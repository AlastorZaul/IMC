import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';
import { TYPE_TOAST } from '../constantes/type-toast.enum';
import { ROUTES } from '../constantes/routes';
import { DemandeService } from '../services/crud/demande.service';
import { ConfigurationService } from '../services/configuration.service';
import { SessionUtilisateurService } from '../services/session-utilisateur.service';
import { VerrouService } from '../services/crud/verrou.service';
import { NIVEAU_ACCES_DEMANDE } from '../constantes/niveau-acces-demande.enum';
import { MatDialog } from '@angular/material';
import { ConfirmModaleComponent } from '../web/commun/modales/confirm-modale.component';
import { DemandesConsultationRestreinteComponent
  } from '../web/demandes/demandes-consultation-restreinte/demandes-consultation-restreinte.component';
import { SearchRequestDto } from '../modeles/recherche/search-request.dto';
import { SearchResponseDto } from '../modeles/recherche/search-response.dto';
import { Verrou } from '../modeles/verrou.model';
import { FormBuilder } from '@angular/forms';
import * as moment from 'moment';


/** @description: Guard vérifiant que l'utilisateur connecté a bien le droit d'accéder à la demande visée par la navigation
 * S'il a le droit et qu'il souhaite accéder en modification à la demande, le système vérifie l'existence ou non de verrous */
@Injectable()
export class DemandeGuard implements CanActivate {
  constructor(
    private dialog: MatDialog,
    private router: Router,
    private fb: FormBuilder,
    private demandeService: DemandeService,
    private toasterService: ToasterService,
    private confSvc: ConfigurationService,
    private userSvc: SessionUtilisateurService,
    private verrouSvc: VerrouService,
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.demandeService.canAccess(next.params.uuid).subscribe((result: NIVEAU_ACCES_DEMANDE) => {
        switch (result) {
          case NIVEAU_ACCES_DEMANDE.ACCES_COMPLET:
            if (next.routeConfig.path.lastIndexOf(ROUTES.ACT_GESTION) >= 0) { // Edition
              this.gestionVerrou(next.params.uuid, resolve, reject, state);
            } else { // Consultation
              resolve(true); // On poursuit la navigation
            }
            break;
          case NIVEAU_ACCES_DEMANDE.ACCES_RESTREINT:
            // Si l'utilisateur vient de nulle part, on le redirige vers l'accueil
            if (state && state.root && !state.root.component) {
              this.router.navigate(['/' + ROUTES.ACCUEIL]);
            }
            // ... avant d'ouvrir la modale de consultation restreinte
            this.dialog.open(DemandesConsultationRestreinteComponent, {
              disableClose : true,
              data : { demandeUuid: next.params.uuid}
            });
            resolve(false); // On interrompt la navigation
            break;
          case NIVEAU_ACCES_DEMANDE.ACCES_INTERDIT:
            this.toasterService.pop({
              type: TYPE_TOAST.AVERTISSEMENT, title: 'Demande inaccessible',
              body: `Il semblerait que vous ne soyez pas autorisé à intéragir avec cette demande.`
            });
            // Si l'utilisateur vient de nulle part, on le redirige vers l'accueil
            if (state && state.root && !state.root.component) {
              this.router.navigate(['/' + ROUTES.ACCUEIL]);
            }
            resolve(false);
            break;
        }
      }, (error) => {
        this.router.navigate(['/' + ROUTES.DEMANDES]);
        reject(error);
      });
    });
  }

  gestionVerrou(uuidDemande, resolve, reject, state) {
    if (!uuidDemande) {
      this.router.navigate(['/' + ROUTES.DEMANDES]);
      reject('Aucun uuid passé en paramètre');
    }
    const utilisateurConnecte = this.userSvc.getStorableUser();
    const searchRequestItem = new SearchRequestDto();
    searchRequestItem.updateFiltresWithFormGroup(this.fb.group({uuidDonnee: uuidDemande}));
    this.verrouSvc.search(searchRequestItem).subscribe((searchResponse: SearchResponseDto) => {
      const verrous = searchResponse.content as [Verrou];
      if (verrous && verrous.length > 0) {
          // Il y a un verrou sur cette demande. On vérifie que ce ne soit pas le même utilisateur que celui connecté.
          const verrou = verrous[0];
          if (verrou.idUtilisateur === utilisateurConnecte.id) {
            // C'est le même utilisateur, il n'y a pas de blocage, on poursuit la connexion
            resolve(true);
          } else if (moment().isAfter(moment(verrou.timestampAcces).add(this.confSvc.getEnvironment().verrou.duree, 'minutes'))) {
            // Ce n'est pas le même utilisateur, mais la durée de vie du verrou est dépassée. On poursuit la connexion
            this.verrouSvc.deleteById(verrou.id).subscribe(); // On supprime le verrou périmé
            resolve(true);
          } else {
            // On bloque la navigation
            this.dialog.open(ConfirmModaleComponent, {
              disableClose : true,
              data: {
                titre: `Demande en cours d'édition`,
                contenu: `Vous ne pouvez accéder à cette demande en édition car elle est actuellement
                ouverte par un autre utilisateur :<br/>
                - Utilisateur: ${verrou.identiteUtilisateur}<br/>
                - Organisme: ${verrou.identifiantOrganisme}<br/>
                - Demande en cours d'édition le ${moment(verrou.timestampAcces).format('DD/MM/YYYY à HH:mm:ss')}<br/>`,
                texteBoutonOui: `Ouvrir en consultation`
              }
            }).afterClosed().subscribe(res => {
              if (res) { // Si l'utilisateur souhaite accéder à la demande en consultation
                this.router.navigate(['/' + ROUTES.DEMANDES + '/' + ROUTES.ACT_CONSULTATION + '/' + uuidDemande]);
                resolve(true);
              } else {
                // Si l'utilisateur vient de nulle part, on le redirige vers la page de recherche des demandes
                if (state && state.root && !state.root.component) {
                  this.router.navigate(['/' + ROUTES.DEMANDES]);
                } else {
                  resolve(false);
                }
              }
            });
          }
      } else { // Aucun verrou, on poursuit la connexion
        resolve(true); // On poursuit la connexion
      }
    }, (error) => { // Erreur. On redirige l'utilisateur vers la page de recherche des demandes
      this.router.navigate(['/' + ROUTES.DEMANDES]);
      reject(error);
    });
  }
}
