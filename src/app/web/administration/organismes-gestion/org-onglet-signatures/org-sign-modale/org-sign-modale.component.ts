import { Component, OnInit, Inject } from '@angular/core';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { FormArray, Validators, FormBuilder, FormControl } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToasterService } from 'angular2-toaster';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { Signature } from 'src/app/modeles/signature.model';

@Component({
  selector: 'app-org-sign-modale',
  templateUrl: './org-sign-modale.component.html'
})
export class OrgSignModaleComponent implements OnInit {
  public signatures: FormArray;
  public index: number;
  public submitting = false;
  public submitted = false;
  public initImage: any = '';
  public imageChangedEvent: any = '';
  public croppedImage: any = '';

  // FORMULAIRE
  public modeleForm = this.fb.group({
    id: [undefined],
    contenu: [undefined, [Validators.required]],
    nom: ['', [Validators.required, Validators.maxLength(250)]],
    principale: [false],
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<OrgSignModaleComponent>,
    public toasterService: ToasterService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    // Listes
    if (this.data.signatures) {
      this.signatures = this.data.signatures;
    }
    // Données modèle - Mode édition
    if (this.data.index !== undefined) {
      this.index = this.data.index;
    }
    if (this.data.signature) {
      this.modeleForm.patchValue(this.data.signature);
      this.initImage = this.contenu.value;
      this.croppedImage = this.contenu.value;
    }
  }

  ////// UTILS
  fileChangeEvent(event: any): void {
    this.imageChangedEvent = event;
  }
  imageCropped(event: ImageCroppedEvent) {
    this.croppedImage = event.base64;
    this.contenu.setValue(this.croppedImage);
  }
  loadImageFailed() {
    this.toasterService.pop({
      type: TYPE_TOAST.ERREUR, title: 'Erreur',
      body: `Une erreur est survenue lors du chargement de l'image.`
    });
  }


  ///// FORMULAIRE - GETTERS
  get createMode(): Boolean { return this.index !== null; }
  get contenu(): FormControl { return this.modeleForm.get('contenu') as FormControl; }
  get nom(): FormControl { return this.modeleForm.get('nom') as FormControl; }
  get principale(): FormControl { return this.modeleForm.get('principale') as FormControl; }
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
    if (this.signatures.controls.length === 0) {
      this.principale.setValue(true);
    }
    if (this.index !== undefined) { // Edition
      this.signatures.at(this.index).patchValue(new Signature(this.modeleForm.value));
    } else { // Création
      this.signatures.push(this.fb.control(new Signature(this.modeleForm.value)));
    }
    this.dialogRef.close(true);
  }


}
