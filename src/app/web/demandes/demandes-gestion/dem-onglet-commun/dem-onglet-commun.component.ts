import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormGroupDirective, FormControl, ControlContainer } from '@angular/forms';
import { STATUT } from 'src/app/constantes/referentiel/statut.enum';
import { TYPE_COURRIER } from 'src/app/constantes/referentiel/type-courrier.enum';
import { Courrier } from 'src/app/modeles/courrier.model';
import { ETAPE } from 'src/app/constantes/referentiel/etape.enum';

@Component({
  selector: 'app-dem-onglet-commun',
  templateUrl: './dem-onglet-commun.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class DemOngletCommunComponent implements OnInit {
  STATUT: STATUT;
  TYPE_COURRIER = TYPE_COURRIER;
  private parentForm: FormGroup;
  constructor(  private parent: FormGroupDirective) { }

  ngOnInit() {
    // Initialisation du formulaire
    this.parentForm = this.parent.form;
    this.parentForm.addControl('numero', new FormControl(undefined));
  }

  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.parentForm.get('id') as FormControl; }
  get statut(): FormControl { return this.parentForm.get('statut') as FormControl; }
  get etape(): FormControl { return this.parentForm.get('etape') as FormControl; }
  get dateReception(): FormControl { return this.parentForm.get('dateReception') as FormControl; }
  get numero(): FormControl { return this.parentForm.get('numero') as FormControl; }
  get courriers(): FormControl { return this.parentForm.get('courriers') as FormControl; }

  public isRecevable(codeStatut: String): Boolean {
    return codeStatut === STATUT.STT_REC_CODE;
  }
  public isIrrecevable(codeStatut: String): Boolean {
    return codeStatut === STATUT.STT_IRR_CODE;
  }
  public isAccordeeImplicite(codeStatut: String): Boolean {
    return (codeStatut === STATUT.STT_ACCIA_CODE || codeStatut === STATUT.STT_ACCIM_CODE);
  }
  public isAccordeeExpres(codeStatut: String): Boolean {
    return codeStatut === STATUT.STT_ACCE_CODE;
  }
  public isRefusee(codeStatut: String): Boolean {
    return codeStatut === STATUT.STT_REF_CODE;
  }
  public isCloture() {
    return this.etape && this.etape.value && this.etape.value.code === ETAPE.ETP_CLO_CODE;
  }

  isCourrierExists(code: String): boolean {
    let indx = -1;
    if (this.courriers.value !== null && this.courriers.value !== undefined) {
      indx =  this.courriers.value.findIndex((_courrier: Courrier) => {
        return code === _courrier.typeCourrier.code;
      });
    }
    return indx > -1;
  }

}
