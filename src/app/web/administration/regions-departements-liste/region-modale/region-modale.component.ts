import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { RegionService } from 'src/app/services/crud/region.service';
import { ToasterService } from 'angular2-toaster';
import { Region } from 'src/app/modeles/region.model';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';


@Component({
  selector: 'app-region-modale',
  templateUrl: './region-modale.component.html'
})
export class RegionModaleComponent implements OnInit {

  public modele: Region;
  public submitting = false;
  public submitted = false;
  // FORMULAIRE
  public modeleForm = this.fb.group({
    id: [undefined],
    code: ['', [Validators.required, Validators.maxLength(10)]],
    intitule: ['', [Validators.required, Validators.maxLength(250)]],
    departements: [undefined]
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<RegionModaleComponent>,
    public toasterService: ToasterService,
    public svc: RegionService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    if (this.data.region) { // Mode édition
      this.modeleForm.patchValue(this.data.region);
    }
  }

  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.modeleForm.get('id') as FormControl; }
    get createMode(): Boolean { return !this.id.value; }
  get code(): FormControl { return this.modeleForm.get('code') as FormControl; }
  get intitule(): FormControl { return this.modeleForm.get('intitule') as FormControl; }
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
      new Region(this.modeleForm.value),
      (error: any) => { this.submitting = false; }
    ).subscribe((reg: Region) => {
      this.toasterService.pop({
        type: TYPE_TOAST.SUCCES, body: `Enregistrement réalisé avec succès.`
      });
      this.dialogRef.close(true);
    });
  }
}
