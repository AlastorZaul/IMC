import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';

@Component({
  selector: 'app-confirm-modale',
  template: `
    <div class="sirc-modale-titre-container">
      <h3>{{titre}}</h3>
    </div>
    <div class="sirc-modale-content-container">
      <div class="sirc-modale-content" [innerHTML]="contenu"></div>
    </div>
    <div class="sirc-modale-boutons-container pt-1">
      <button *ngIf="!cacheBoutonNon && (!isSubmitting || noSubmitting)"
        class="btn-sirc-o btn-small col-12 col-sm-5"
        (click)="clicNon()">{{texteBoutonNon}}</button>
      <button *ngIf="!cacheBoutonOui && (!isSubmitting || noSubmitting)"
        class="btn-sirc-{{classeBoutonOui}} btn-small col-12 col-sm-5"
        (click)="clicOui()" cdkFocusInitial>{{texteBoutonOui}}</button>
      <mat-progress-bar mode="indeterminate" *ngIf="isSubmitting && !noSubmitting"></mat-progress-bar>
    </div>`
})
export class ConfirmModaleComponent {

  isSubmitting = false;
  // Paramètres
  titre = '~Titre de la modale~';
  contenu = '';
  texteBoutonNon = 'Annuler';
  texteBoutonOui = 'Confirmer';
  cacheBoutonNon = false;
  cacheBoutonOui = false;
  classeBoutonOui = 'success';
  noSubmitting = false;

  constructor(
    public dialogRef: MatDialogRef<ConfirmModaleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      if (data.titre !== undefined) { this.titre = data.titre; }
      if (data.contenu !== undefined) { this.contenu = data.contenu; }
      if (data.texteBoutonNon !== undefined) { this.texteBoutonNon = data.texteBoutonNon; }
      if (data.texteBoutonOui !== undefined) { this.texteBoutonOui = data.texteBoutonOui; }
      if (data.cacheBoutonNon !== undefined) { this.cacheBoutonNon = data.cacheBoutonNon; }
      if (data.cacheBoutonOui !== undefined) { this.cacheBoutonOui = data.cacheBoutonOui; }
      if (data.classeBoutonOui !== undefined) { this.classeBoutonOui = data.classeBoutonOui; }
      if (data.noSubmitting !== undefined) { this.noSubmitting = data.noSubmitting; }
  }

  clicOui(): void {
    this.dialogRef.close(true);
  }

  clicNon(): void {
    this.dialogRef.close(undefined);
  }

}
