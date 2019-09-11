import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FormControl, FormBuilder, Validators } from '@angular/forms';
import { CompteUtilisateur } from 'src/app/modeles/compte-utilisateur.model';
import { Utilisateur } from 'src/app/modeles/dto/utilisateur.dto';
import { Profil } from 'src/app/modeles/profil.model';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { PROFILS } from 'src/app/constantes/referentiel/profils.enum';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { ToasterService } from 'angular2-toaster';
import { CompteUtilisateurService } from 'src/app/services/crud/compte-utilisateur.service';
import { SessionUtilisateurService } from 'src/app/services/session-utilisateur.service';



@Component({
  selector: 'app-compte-modale',
  templateUrl: './compte-modale.component.html'
})
export class CompteModaleComponent implements OnInit {

  public currentUser: Utilisateur;
  public listeProfils: Profil[];
  public listeOrganismes: OrganismeMiniDto[];
  public submitting = false;
  public submitted = false;
  // FORMULAIRE
  public modeleForm = this.fb.group({
    id: [undefined],
    identifiant: ['', [Validators.required, Validators.maxLength(250)]],
    profil: [undefined, Validators.required],
    organisme: [undefined, Validators.required],
    nom: ['', [Validators.required, Validators.maxLength(250)]],
    prenom: ['', [Validators.required, Validators.maxLength(250)]],
    telephone: ['', Validators.maxLength(20)],
    courriel: ['', [Validators.required, Validators.maxLength(250), Validators.email]],
  });

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CompteModaleComponent>,
    private toasterService: ToasterService,
    private svc: CompteUtilisateurService,
    private sessionUtilisateurSvc: SessionUtilisateurService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    // Listes
    if (this.data.listeProfils) {
      this.listeProfils = this.data.listeProfils.map((elem) => Object.assign(new Profil(), elem));
    }
    if (this.data.listeOrganismes) {
      this.listeOrganismes = this.data.listeOrganismes;
    }

    // Données modèle
    if (this.data.compte) { // Mode édition
      const tmpCompte = this.data.compte;
      this.modeleForm.patchValue(tmpCompte);
      this.modeleForm.patchValue({
        profil: ((tmpCompte.profil !== null) ?
          this.findInListById(tmpCompte.profil.id, this.listeProfils) : undefined),
        organisme: ((tmpCompte.organisme !== null) ?
          this.findInListById(tmpCompte.organisme.id, this.listeOrganismes) : undefined)
      });
      // On désactive les champs "identifiant", "profil" et "organisme" si l'utilisateur connecté est le compte en cours d'édition.
      if (this.compteIsCurrentUser(tmpCompte)) {
        this.identifiant.disable();
        this.profil.disable();
        this.organisme.disable();
      }
      // Si utilisateur connecté pas Admin National ET utilisateur modale ADMN, on bloque le champ
      if (!this.getLoggedUser().is(PROFILS.ADMINISTRATEUR_NATIONAL)) {
        if (this.profil.value.code === PROFILS.ADMINISTRATEUR_NATIONAL) {
          this.identifiant.disable();
          this.profil.disable();
          this.organisme.disable();
        } else {
          this.retirerChoixAdminNat();
        }
      }
    } else { // Mode Création
      if (this.listeOrganismes.length === 1) { // Un seul organisme, on le sélectionne tout de suite.
        this.modeleForm.patchValue({'organisme': this.listeOrganismes[0]});
        this.organisme.disable();
      }
      // Si utilisateur connecté pas Admin National, on retire la valeur ADMNNational
      this.retirerChoixAdminNat();
    }
  }

  ////// UTILS
  findInListById(_id: number, _liste: any[]) {
    return _liste.find((val) => {
      return val.id === _id;
    });
  }
  getLoggedUser(): Utilisateur {
    if (!this.currentUser) { this.currentUser = this.sessionUtilisateurSvc.getStorableUser(); }
    return this.currentUser;
  }
  public compteIsCurrentUser(usr: CompteUtilisateur) {
    return this.getLoggedUser().id === usr.id;
  }
  retirerChoixAdminNat() {
    if (!this.getLoggedUser().is(PROFILS.ADMINISTRATEUR_NATIONAL)) {
      const ndx = this.listeProfils.findIndex((val: Profil) => {
        return val.code === PROFILS.ADMINISTRATEUR_NATIONAL;
      });
      if (ndx !== -1) { this.listeProfils.splice(ndx, 1); }
    }
  }


  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.modeleForm.get('id') as FormControl; }
    get createMode(): Boolean { return !this.id.value; }
  get identifiant(): FormControl { return this.modeleForm.get('identifiant') as FormControl; }
  get nom(): FormControl { return this.modeleForm.get('nom') as FormControl; }
  get prenom(): FormControl { return this.modeleForm.get('prenom') as FormControl; }
  get telephone(): FormControl { return this.modeleForm.get('telephone') as FormControl; }
  get courriel(): FormControl { return this.modeleForm.get('courriel') as FormControl; }
  get profil(): FormControl { return this.modeleForm.get('profil') as FormControl; }
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
    this.svc.saveWithCallback(
      new CompteUtilisateur(this.modeleForm.getRawValue()),
      (error: any) => { this.submitting = false; }
    ).subscribe((compte: CompteUtilisateur) => {
      this.toasterService.pop({
        type: TYPE_TOAST.SUCCES, body: `Enregistrement réalisé avec succès.`
      });
      this.dialogRef.close(true);
    });
  }

}
