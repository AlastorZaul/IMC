import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { ConfirmModaleComponent } from './confirm-modale.component';
import { BaseService } from 'src/app/services/crud/base.service';
import { ToasterService } from 'angular2-toaster';


@Component({
  selector: 'app-remove-modale',
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
        class="btn-sirc-danger btn-small col-12 col-sm-5"
        (click)="clicOui()" cdkFocusInitial>{{texteBoutonOui}}</button>
      <mat-progress-bar mode="indeterminate" *ngIf="isSubmitting && !noSubmitting"></mat-progress-bar>
    </div>`
})
export class RemoveModaleComponent<T, S extends BaseService<T>> extends ConfirmModaleComponent implements OnInit {

  elementASupprimer: T;
  service: S;

  constructor(
    public dialogRef: MatDialogRef<RemoveModaleComponent<T, S>>,
    private toasterService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      super(dialogRef, data);
  }

  ngOnInit() {
    if (this.data.elementASupprimer && this.data.service) {
      this.elementASupprimer = this.data.elementASupprimer;
      this.service = this.data.service;
    } else {
      console.error('La modale de suppression n\'a pas été configurée correctement.');
      this.dialogRef.close(true);
    }
  }

  clicOui(): void {
    if (!this.noSubmitting) { this.isSubmitting = true; }
    this.service.deleteById(
      this.elementASupprimer['id'],
      () => { if (!this.noSubmitting) { this.isSubmitting = false; }}
    ).subscribe(() => {
      this.toasterService.pop({
        type: TYPE_TOAST.SUCCES, body: `L'élément demandé a bien été supprimé.`
      });
      this.dialogRef.close(true);
    });
  }

  clicNon(): void {
    this.dialogRef.close(undefined);
  }

}
