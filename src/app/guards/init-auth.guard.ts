import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SessionUtilisateurService } from '../services/session-utilisateur.service';
import { MatDialog, MatDialogRef } from '@angular/material';
import { LoadingModaleComponent } from '../web/commun/modales/loading-modale.component';

@Injectable({ providedIn: 'root' })
export class InitAuthGuard implements CanActivate {
  private isAuthenticated: boolean;

  constructor(
    private sessionUtilisateurSvc: SessionUtilisateurService,
    private dialog: MatDialog
  ) {
    this.sessionUtilisateurSvc.isAuthenticated$.subscribe(i => this.isAuthenticated = i);
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    const modale: MatDialogRef<LoadingModaleComponent> = this.dialog.open(LoadingModaleComponent, {
      disableClose : true,
      data: {
        titre: `Chargement en cours`,
        contenu: `L'application IntraRC est en cours d'initialisation, veuillez patienter...`,
      }
    });
    return new Promise((resolve, reject) => {
      this.sessionUtilisateurSvc.isDoneLoading$.subscribe((isDone) => {
        if (isDone) {
          if (this.isAuthenticated) {
            this.sessionUtilisateurSvc.isUserInStorage$.subscribe((result3) => {
              if (result3) {
                if (modale) { modale.close(); }
                resolve(true);
              }
            });
          } else {
            this.sessionUtilisateurSvc.logIn();
          }
        }
      }, (error) => { reject(error); });
    });
  }
}
