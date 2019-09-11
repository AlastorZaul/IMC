import { Component, OnInit, Input } from '@angular/core';
import { ControlContainer, FormGroupDirective, FormGroup, FormControl, Validators, FormBuilder, FormArray } from '@angular/forms';
import { Signature } from 'src/app/modeles/signature.model';
import { MatDialog } from '@angular/material';
import { ConfirmModaleComponent } from 'src/app/web/commun/modales/confirm-modale.component';
import { OrgSignModaleComponent } from './org-sign-modale/org-sign-modale.component';

@Component({
  selector: 'app-org-onglet-signatures',
  templateUrl: './org-onglet-signatures.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class OrgOngletSignaturesComponent implements OnInit {
  @Input() submitted: boolean;
  private parentForm: FormGroup;

  constructor(
    private parent: FormGroupDirective,
    private fb: FormBuilder,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    // Initialisation du formulaire
    this.parentForm = this.parent.form;
    this.parentForm.addControl('signatures', this.fb.array([]));
  }


  ///// FORMULAIRE - GETTERS
  get signatures(): FormArray { return this.parentForm.get('signatures') as FormArray; }
  get firstItem(): FormControl { return this.signatures.at(0) as FormControl; }


  // ACTIONS D'AJOUT/RETRAIT
  ajoutSignature() {
    this.dialog.open(OrgSignModaleComponent, {
      disableClose : true,
      minWidth: 500,
      data : {
        signatures: this.signatures
      }
    }).afterClosed().subscribe((res) => {
      if (res) { this.parentForm.markAsDirty(); }
    });
  }
  modifSignature(sign: Signature, index: number) {
    this.dialog.open(OrgSignModaleComponent, {
      disableClose : true,
      minWidth: 500,
      data : {
        signature: sign,
        index: index,
        signatures: this.signatures
      }
    }).afterClosed().subscribe((res) => {
      if (res) { this.parentForm.markAsDirty(); }
    });
  }
  supprSignature(sign: Signature, indexSign: number) {
    this.dialog.open(ConfirmModaleComponent, {
      disableClose : true,
      data: {
        titre: `Supprimer une signature`,
        contenu: `Cette signature va être supprimée.<br/>Confirmer la suppression ?`,
        classeBoutonOui: 'danger'
      }
    }).afterClosed().subscribe(res => {
      if (res) { // S'il y a confirmation de suppression
        const principale = sign.principale;
        this.removeFromArrayWithIndex(indexSign);
        if (principale) {
          this.setFirstItemPrincipale();
        }
        this.parentForm.markAsDirty();
      }
    });
  }

  setSignPrincipale(sign: Signature, indexSign: number) {
    this.signatures.controls.forEach((control) => {
      control.value.principale = false;
    });
    this.signatures.get(indexSign.toString()).value.principale = true;
    this.parentForm.markAsDirty();
  }

  private setFirstItemPrincipale() {
    const first = this.firstItem;
    if (first !== undefined) {
      this.firstItem.value.principale = true;
    }
  }

  // UTILS
  removeFromArrayWithIndex(index: number) {
    this.signatures.removeAt(index);
  }


}
