import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { ToasterService } from 'angular2-toaster';
import { Statut } from 'src/app/modeles/statut.model';
import { STATUT } from 'src/app/constantes/referentiel/statut.enum';



@Component({
  selector: 'app-dec-accepter-modale',
  templateUrl: './dec-accepter-modale.component.html'
})
export class DecAccepterModaleComponent implements OnInit {

  public statut: FormControl;
  public listeStatut: Statut[];
  public codeStatutChoisi = STATUT.STT_ACCIM_CODE;
  public isFormulaireInvalid: boolean;
  public readonly STATUT = STATUT;
  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DecAccepterModaleComponent>,
    public toasterService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    // Listes
    if (this.data.isFormulaireInvalid !== null) {
      this.isFormulaireInvalid = this.data.isFormulaireInvalid;
    }
    if (this.data.statutModelForm) {
      this.statut = this.data.statutModelForm;
    }
    if (this.data.listeStatut) {
      this.listeStatut = this.data.listeStatut;
    }
  }

  demandeImplicite(): void {
    this.codeStatutChoisi = STATUT.STT_ACCIM_CODE;
  }
  demandeExpres(): void {
    this.codeStatutChoisi = STATUT.STT_ACCE_CODE;
  }
  ////// UTILS
  findInListByCode(_code: string, _liste: any[]) {
    return _liste.find((val) => {
      return val.code === _code;
    });
  }

  /// SETTER
  setStatut(val: any): void { this.statut.setValue(val); }

  ///// ACTIONS
  // Ferme la pop-up sans rien faire
  close() {
    this.dialogRef.close();
  }

  // Sauvegarde
  save() {
    this.setStatut(this.findInListByCode(this.codeStatutChoisi, this.listeStatut));
    this.dialogRef.close(true);
  }

}
