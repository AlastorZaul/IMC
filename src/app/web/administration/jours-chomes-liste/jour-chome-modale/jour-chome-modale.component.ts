import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MOIS } from 'src/app/constantes/mois';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { JourChome } from 'src/app/modeles/jour-chome.model';
import { ToasterService } from 'angular2-toaster';
import { JourChomeService } from 'src/app/services/crud/jour-chome.service';



@Component({
  selector: 'app-jour-chome-modale',
  templateUrl: './jour-chome-modale.component.html'
})
export class JourChomeModaleComponent implements OnInit {

  public submitting = false;
  public submitted = false;
  // FORMULAIRE
  public modeleForm: FormGroup;
  public listeMois = MOIS;
  public maxNbJours = 31;
  private pattern = '^[0-9]*$';

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<JourChomeModaleComponent>,
    public toasterService: ToasterService,
    public svc: JourChomeService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }


  ngOnInit() {
    // Formulaire
    this.modeleForm = this.fb.group({
      id: [undefined],
      actif: true,
      code: [undefined],
      intitule: ['', [Validators.required, Validators.maxLength(250)]],
      mois: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      jour: [1, [Validators.required, Validators.pattern(this.pattern),
        Validators.min(1), Validators.max(this.maxNbJours)]
      ],
      national: false,
      systeme: false,
    });
    // Données modèle
    if (this.data.jourChome) { // Mode édition
      if (this.data.jourChome.systeme) {
        this.toasterService.pop({
          type: TYPE_TOAST.AVERTISSEMENT, title: 'Attention !',
          body: `L'édition d'un jour chômé "système" est impossible.`
        });
        this.dialogRef.close();
      }
      this.modeleForm.patchValue(this.data.jourChome);
      this.updateMaxJourSelonMois(this.mois.value);
    }
  }

  ////// UTILS
  updateMaxJourSelonMois(ndxMois: number) {
    let result = 30;
    if (ndxMois) {
      if (ndxMois ===  2) { result = 29; }
      if (ndxMois === 1 || ndxMois === 3 || ndxMois === 5 || ndxMois === 7
        || ndxMois === 8 || ndxMois === 10 || ndxMois === 12) {
          result = 31;
      }
    }
    this.maxNbJours = result;
    this.modeleForm.controls['jour'].setValidators(
      [Validators.required, Validators.pattern(this.pattern),
      Validators.min(1), Validators.max(this.maxNbJours)]
    );
    this.modeleForm.controls['jour'].updateValueAndValidity();
  }


  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.modeleForm.get('id') as FormControl; }
    get createMode(): Boolean { return !this.id.value; }
  get intitule(): FormControl { return this.modeleForm.get('intitule') as FormControl; }
  get code(): FormControl { return this.modeleForm.get('code') as FormControl; }
  get actif(): FormControl { return this.modeleForm.get('actif') as FormControl; }
  get jour(): FormControl { return this.modeleForm.get('jour') as FormControl; }
  get mois(): FormControl { return ((this.modeleForm) ? this.modeleForm.get('mois') : undefined) as FormControl; }
  get national(): FormControl { return this.modeleForm.get('national') as FormControl; }
  get systeme(): FormControl { return this.modeleForm.get('systeme') as FormControl; }
  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }

  ///// ACTIONS
  // Ferme la pop-up sans rien faire
  close() {
    this.dialogRef.close();
  }

  // Sauvegarde
  save() {
    this.submitted = true;
    if (this.modeleForm.invalid) {
      return false;
    }

    this.submitting = true;
    this.svc.saveWithCallback(
      new JourChome(this.modeleForm.value),
      (error: any) => { this.submitting = false; }
    ).subscribe((jc: JourChome) => {
      this.toasterService.pop({
        type: TYPE_TOAST.SUCCES, body: `Enregistrement réalisé avec succès.`
      });
      this.dialogRef.close(true);
    });
  }

}
