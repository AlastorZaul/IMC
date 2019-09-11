import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';
import { TYPE_TOAST } from '../constantes/type-toast.enum';
import { ROUTES } from '../constantes/routes';
import { OrganismeMiniDtoService } from '../services/crud/mini-dto/organisme-mini-dto.service';
import { OrganismeMiniDto } from '../modeles/dto/organisme-mini-dto.dto';
import { SessionUtilisateurService } from '../services/session-utilisateur.service';
import { PROFILS } from '../constantes/referentiel/profils.enum';


/** @description: Guard vérifiant que l'utilisateur connecté a bien le droit d'accéder à l'organisme visé par la navigation */
@Injectable()
export class OrganismeGuard implements CanActivate {
  constructor(
    private organismeMiniService: OrganismeMiniDtoService,
    private toasterService: ToasterService,
    private router: Router,
    private sessionUtilisateurService: SessionUtilisateurService
  ) { }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (this.sessionUtilisateurService.getStorableUser().is(PROFILS.ADMINISTRATEUR_NATIONAL)) {
        resolve(true);
      } else {
        this.organismeMiniService.getAutorises().subscribe((orgasAccessibles: OrganismeMiniDto[]) => {
          if (orgasAccessibles.find((elem: OrganismeMiniDto) => elem.uuid === next.params.uuid)) {
            resolve(true); // On poursuit la connexion
          } else {
            // NON-AUTORISÉ, on redirige l'utilisateur
            this.toasterService.pop({
              type: TYPE_TOAST.AVERTISSEMENT, title: 'Organisme inaccessible',
              body: `Il semblerait que vous ne soyez pas autorisé à intéragir avec cet organisme.`
            });
            this.router.navigate(['/' + ROUTES.ADMINISTRATION + '/' + ROUTES.ORGANISMES]);
            resolve(false);
          }
        }, (error) => {
          this.router.navigate(['/' + ROUTES.ADMINISTRATION + '/' + ROUTES.ORGANISMES]);
          reject(error);
        });
      }
    });
  }
}
