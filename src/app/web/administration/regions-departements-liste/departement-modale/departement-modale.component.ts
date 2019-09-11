import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { Departement } from 'src/app/modeles/departement.model';
import { Region } from 'src/app/modeles/region.model';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { ToasterService } from 'angular2-toaster';
import { DepartementService } from 'src/app/services/crud/departement.service';



@Component({
  selector: 'app-departement-modale',
  templateUrl: './departement-modale.component.html'
})
export class DepartementModaleComponent implements OnInit {

  public modele: Departement;
  public listeRegions: Region[];
  public listeOrganismes: OrganismeMiniDto[];
  public submitting = false;
  public submitted = false;
  // FORMULAIRE
  public modeleForm = this.fb.group({
    id: [undefined],
    code: ['', [Validators.required, Validators.maxLength(10)]],
    intitule: ['', [Validators.required, Validators.maxLength(250)]],
    region: [undefined, Validators.required],
    organismeReferent: [undefined, Validators.required]
  });


  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<DepartementModaleComponent>,
    public toasterService: ToasterService,
    public svc: DepartementService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    // Listes
    if (!this.data.listeRegions || this.data.listeRegions.length === 0) {
      this.erreurInitModale('Région');
    } else {
      this.listeRegions = this.data.listeRegions;
    }
    if (!this.data.listeOrganismes || this.data.listeOrganismes.length === 0) {
      this.erreurInitModale('Organisme');
    } else {
      this.listeOrganismes = this.data.listeOrganismes;
    }

    // Données modèle
    if (this.data.departement) { // Mode édition
      const tmpDept = this.data.departement;
      this.modeleForm.patchValue(tmpDept);
      this.modeleForm.patchValue({
        organismeReferent: ((tmpDept.organismeReferent !== null) ?
          this.findInListById(tmpDept.organismeReferent.id, this.listeOrganismes) : undefined),
        region: ((tmpDept.region !== null) ?
          this.findInListById(tmpDept.region.id, this.listeRegions) : undefined)
      });
    } else if (this.data.region) { // Ajout pour une région en particulier
      this.modeleForm.patchValue({'region': this.data.region});
    }
  }

  erreurInitModale(typeDonnee: string) {
    this.toasterService.pop({
      type: TYPE_TOAST.AVERTISSEMENT, title: 'Attention !',
      body: `La création d'un département est impossible tant qu'il n'existe aucune donnée de type "${typeDonnee}".`
    });
  }
  findInListById(_id: number, _liste: any[]) {
    return _liste.find((val) => {
      return val.id === _id;
    });
  }

  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.modeleForm.get('id') as FormControl; }
    get createMode(): Boolean { return !this.id.value; }
  get code(): FormControl { return this.modeleForm.get('code') as FormControl; }
  get intitule(): FormControl { return this.modeleForm.get('intitule') as FormControl; }
  get region(): FormControl { return this.modeleForm.get('region') as FormControl; }
  get organismeReferent(): FormControl { return this.modeleForm.get('organismeReferent') as FormControl; }
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
      new Departement(this.modeleForm.value),
      (error: any) => { this.submitting = false; }
    ).subscribe((dpt: Departement) => {
      this.toasterService.pop({
        type: TYPE_TOAST.SUCCES, body: `Enregistrement réalisé avec succès.`
      });
      this.dialogRef.close(true);
    });
  }

}
