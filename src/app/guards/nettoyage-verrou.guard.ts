import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { IPageVerrou } from '../interfaces/IPageVerrou';
import { VerrouService } from '../services/crud/verrou.service';

@Injectable()
export class NettoyageVerrouGuard implements CanDeactivate<IPageVerrou> {

  constructor(
    private verrouSvc: VerrouService,
  ) { }

  canDeactivate(component: IPageVerrou): boolean {
    if (component.intervalVerrou !== undefined) { clearInterval(component.intervalVerrou); }
    if (component.getUuidDonneePourVerrou() !== undefined) {
      this.verrouSvc.deleteByDonneeUuid(component.getUuidDonneePourVerrou()).subscribe();
    }
    return true;
  }

}
