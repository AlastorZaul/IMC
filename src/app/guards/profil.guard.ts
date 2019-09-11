import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { SessionUtilisateurService } from '../services/session-utilisateur.service';
import { ToasterService } from 'angular2-toaster';
import { TYPE_TOAST } from '../constantes/type-toast.enum';
import { ROUTES } from '../constantes/routes';

@Injectable({ providedIn: 'root' })
export class ProfilGuard implements CanActivate {

  constructor(
    private sessionUtilisateurSvc: SessionUtilisateurService,
    private toasterService: ToasterService,
    private router: Router
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      if (!this.sessionUtilisateurSvc.isConnected()) {
        this.sessionUtilisateurSvc.logIn();
        return false;
      }
      const user = this.sessionUtilisateurSvc.getStorableUser();
      for (const profil of next.data['profils']) {
        if (user.is(profil)) { return true; }
      }
      // NON-AUTORISÉ, on redirige l'utilisateur
      this.toasterService.pop({
        type: TYPE_TOAST.AVERTISSEMENT, title: 'Accès non-autorisé',
        body: `Il semblerait que vous ne soyez pas autorisé à accéder à cette page.`
      });
      this.router.navigate(['/' + ROUTES.ACCUEIL]);
      return false;
  }
}
