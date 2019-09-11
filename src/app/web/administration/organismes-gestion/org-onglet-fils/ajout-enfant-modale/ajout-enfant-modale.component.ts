import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { ToasterService } from 'angular2-toaster';
import { SessionUtilisateurService } from 'src/app/services/session-utilisateur.service';
import { OrganismeService } from 'src/app/services/crud/organisme.service';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { Organisme } from 'src/app/modeles/organisme.model';
import { Utilisateur } from 'src/app/modeles/dto/utilisateur.dto';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { PROFILS } from 'src/app/constantes/referentiel/profils.enum';


@Component({
  selector: 'app-ajout-enfant-modale',
  templateUrl: './ajout-enfant-modale.component.html'
})
export class AjoutEnfantModaleComponent implements OnInit {

  public currentUser: Utilisateur;
  public currentOrganismeId: number;
  public listeOrganismes: OrganismeMiniDto[]; // Data
  public enfantsArray: FormArray; // Data
  public submitting = false;
  public submitted = false;
  // FORMULAIRE
  public modeleForm = this.fb.group({
    organisme: [undefined, [Validators.required]],
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<AjoutEnfantModaleComponent>,
    public toasterService: ToasterService,
    public svc: OrganismeService,
    private sessionUtilisateurSvc: SessionUtilisateurService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    // Data
    if (this.data.currentOrganismeId) { this.currentOrganismeId = this.data.currentOrganismeId; }
    if (this.data.enfantsArray) { this.enfantsArray = this.data.enfantsArray; }
    if (this.data.listeOrganismes) {
      this.listeOrganismes = this.data.listeOrganismes;
      // ... à l'exception de ceux se trouvant déjà dans la descendance (directe ET indirecte) de l'organisme.
      this.listeOrganismes = this.listeOrganismes.filter((org: OrganismeMiniDto) => {
        return org.id !== this.currentOrganismeId && !this.isInArray(org, this.enfantsArray.controls.map((abstControl) => {
          return abstControl.value;
        }) as Organisme[]);
      });
    }
  }


  ///// UTILS
  getLoggedUser(): Utilisateur {
    if (!this.currentUser) { this.currentUser = this.sessionUtilisateurSvc.getStorableUser(); }
    return this.currentUser;
  }

  isInArray(org: Organisme|OrganismeMiniDto, array: Organisme[]) {
    return this.findIndexInArray(org, array) !== -1;
  }
  private findIndexInArray(org: Organisme|OrganismeMiniDto, array: Organisme[]): number {
    return array.findIndex((_org: Organisme) => {
      if (org.id === _org.id) {
        return true;
      } else if (_org.enfants !== null && _org.enfants.length > 0) {
        return this.isInArray(org, _org.enfants);
      }
      return false;
    });
  }


  ///// FORMULAIRE - GETTERS
  get organisme(): FormControl { return this.modeleForm.get('organisme') as FormControl; }
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
    this.svc.getById(this.organisme.value.id).subscribe((orgResult: Organisme) => {
      this.enfantsArray.push(this.fb.control(orgResult));
      this.toasterService.pop({
        type: TYPE_TOAST.SUCCES, body: `L'organisme sélectionné a bien été ajouté à la descendance de l'organisme en cours d'édition`
      });
      this.dialogRef.close(true);
    });
  }
}
