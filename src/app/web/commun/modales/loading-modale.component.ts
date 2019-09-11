import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

/** @description: modale pour les chargements */
@Component({
  selector: 'app-loading-modale',
  template: `
    <div class="sirc-modale-titre-container">
      <h3>{{titre}}</h3>
    </div>
    <div class="sirc-modale-content-container">
      <div class="sirc-modale-content loading-modale-text" [innerHTML]="contenu"></div>
      <mat-progress-bar mode="indeterminate" *ngIf="progressBar"></mat-progress-bar>
    </div>`
})
export class LoadingModaleComponent {
  // Paramètres
  titre = '~Titre de la modale~';
  contenu = '';
  progressBar = true;
  spinner = false;
  constructor(
    public dialogRef: MatDialogRef<LoadingModaleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      if (data.titre !== undefined) { this.titre = data.titre; }
      if (data.contenu !== undefined) { this.contenu = data.contenu; }
      if (data.progressBar !== undefined) { this.progressBar = data.progressBar; }
      if (data.spinner !== undefined) { this.spinner = data.spinner; }
  }

}
