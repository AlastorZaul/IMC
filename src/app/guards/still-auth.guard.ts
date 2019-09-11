import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, RouterStateSnapshot, CanActivateChild } from '@angular/router';
import { SessionUtilisateurService } from '../services/session-utilisateur.service';

@Injectable({ providedIn: 'root' })
export class StillAuthGuard implements CanActivateChild {

  constructor(
    private sessionUtilisateurSvc: SessionUtilisateurService,
  ) {}

  canActivateChild(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.sessionUtilisateurSvc.stillConnected()) {
      return true;
    } else {
      this.sessionUtilisateurSvc.logIn();
      return false;
    }
  }
}
