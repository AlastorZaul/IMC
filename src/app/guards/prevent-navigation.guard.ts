import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { IPreventNavigation } from '../interfaces/IPreventNavigation';
import { MatDialog } from '@angular/material';
import { ConfirmModaleComponent } from '../web/commun/modales/confirm-modale.component';

@Injectable()
export class PreventNavigationGuard implements CanDeactivate<IPreventNavigation> {

  constructor(
    private dialog: MatDialog
  ) { }

  /** @return : si "TRUE", on peut naviguer. SINON non.*/
  canDeactivate(component: IPreventNavigation): Promise<boolean> {
    return new Promise((resolve, reject) => {
      if (!component.canNavigate) {
        this.dialog.open(ConfirmModaleComponent, {
          disableClose : true,
          data: {
            titre: `Annuler la saisie`,
            contenu: (component.textModalConfirm) ?
            component.textModalConfirm :
            `Toute modification non-enregistrée sera définitivement perdue.<br/>Êtes-vous sûr de vouloir quitter la page ?`,
            texteBoutonNon: 'Non', texteBoutonOui: 'Oui'
          }
        }).afterClosed().subscribe(res => {
          resolve(res);
        });
      } else {
        resolve(true);
      }
    });
  }

}
