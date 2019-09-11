import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormBuilder, FormControl } from '@angular/forms';
import { isNumeroSiret } from 'src/app/directives/validators/numero-siret.validators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToasterService } from 'angular2-toaster';
import { DemandeService } from 'src/app/services/crud/demande.service';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { Router } from '@angular/router';
import { ROUTES } from 'src/app/constantes/routes';
import { StorageService } from 'src/app/services/storage.service';
import { SESSION_CLES } from 'src/app/constantes/session-cles';
import { Demande } from 'src/app/modeles/demande.model';
import { DemandeRechercheDto } from 'src/app/modeles/dto/demande-recherche-dto.model';
import { DemandeRechercheDtoService } from 'src/app/services/crud/mini-dto/demande-recherche-dto-service';

@Component({
  selector: 'app-modale-demande-papier',
  templateUrl: './modale-demande-papier.component.html'
})
export class ModaleDemandePapierComponent implements OnInit {

  public submitting = false;
  public submitted = false;
  public demandes = undefined;
  // FORMULAIRE
  public modeleForm = this.fb.group({
    siret: ['', [Validators.required, isNumeroSiret()]],
    urssaf: ['', [Validators.required, Validators.maxLength(250)]],
    nom: ['', [Validators.required, Validators.maxLength(250)]],
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModaleDemandePapierComponent>,
    private toasterService: ToasterService,
    private svc: DemandeRechercheDtoService,
    private storageSvc: StorageService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  ////// UTILS
  siretChange() {
    if (this.siret.value === '') { this.urssaf.enable();
    } else { this.urssaf.disable(); }
    this.urssaf.setValue('');
  }
  urssafChange() {
    if (this.urssaf.value === '') { this.siret.enable();
    } else { this.siret.disable(); }
    this.siret.setValue('');
  }

  ///// FORMULAIRE - GETTERS
  get siret(): FormControl { return this.modeleForm.get('siret') as FormControl; }
  get urssaf(): FormControl { return this.modeleForm.get('urssaf') as FormControl; }
  get nom(): FormControl { return this.modeleForm.get('nom') as FormControl; }
  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }


  ///// ACTIONS
  // Ferme la pop-up sans rien faire
  close() {
    this.dialogRef.close();
  }

  // Récupération de la demande
  commencer() {
    this.submitted = true;
    if (this.modeleForm.invalid) {
      return false;
    }
    this.submitting = true;
    this.demandes = undefined;

    this.svc.getDemandesSimilaires(this.siret.value, this.urssaf.value, this.nom.value).subscribe((demandes: DemandeRechercheDto[]) => {
      if (demandes && demandes.length > 0) {
        this.demandes = demandes;
        this.submitting = false;
      } else {
        this.poursuivreCreation();
      }
    });
  }

  ouvrirDemande(demande: DemandeRechercheDto) {
    this.router.navigate(
      ['/' + ROUTES.DEMANDES + '/' + ROUTES.ACT_GESTION + '/' + demande.uuid]
    ).then((value: boolean) => { // Retour du Guard "DemandeGuard"
      if (value) { this.dialogRef.close(); }
    });
  }

  poursuivreCreation() {
    this.storageSvc.setItemSessionStorage(SESSION_CLES.NOUVELLE_DEMANDE_INFOS_PRINCIPALES, {
      'siret': this.siret.value,
      'urssaf': this.urssaf.value,
      'nom': this.nom.value
    });
    this.router.navigate(['/' + ROUTES.DEMANDES + '/' + ROUTES.ACT_GESTION]);
    this.dialogRef.close();
  }
}
