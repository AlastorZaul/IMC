import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormBuilder, FormControl } from '@angular/forms';
import { isNumeroDemande } from 'src/app/directives/validators/numero-demande.validators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToasterService } from 'angular2-toaster';
import { DemandeService } from 'src/app/services/crud/demande.service';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { Router } from '@angular/router';
import { ROUTES } from 'src/app/constantes/routes';
import { Demande } from 'src/app/modeles/demande.model';

@Component({
  selector: 'app-modale-demande-par-numero',
  templateUrl: './modale-demande-par-numero.component.html'
})
export class ModaleDemandeParNumeroComponent implements OnInit {

  public submitting = false;
  public submitted = false;
  public demandeIntraRc = undefined;
  public recupEnCours = false;
  // FORMULAIRE
  public modeleForm = this.fb.group({
    numero: ['', [Validators.required, Validators.maxLength(250), isNumeroDemande()]],
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModaleDemandeParNumeroComponent>,
    private toasterService: ToasterService,
    private svc: DemandeService,
    private router: Router,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
  }

  ////// UTILS

  ///// FORMULAIRE - GETTERS
  get numero(): FormControl { return this.modeleForm.get('numero') as FormControl; }
  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }


  ///// ACTIONS
  // Ferme la pop-up sans rien faire
  close() {
    this.dialogRef.close();
  }

  // Récupération de la demande
  recuperer() {
    this.submitted = true;
    if (this.modeleForm.invalid) {
      return false;
    }

    this.submitting = true;
    this.numero.disable();
    this.svc.getByNumeroOnIntra(this.numero.value).subscribe((demande: Demande) => {
      if (demande) { // Demande trouvée dans l'Intranet
        this.router.navigate(
          ['/' + ROUTES.DEMANDES + '/' + ROUTES.ACT_GESTION + '/' + demande.uuid]
        ).then((value) => { // Retour du Guard "DemandeGuard"
          if (value) {
            this.dialogRef.close();
          } else {
            this.submitting = false;
            this.numero.enable();
          }
        });
      } else { // Demande introuvable côté IntraRC
        this.toasterService.pop({
          type: TYPE_TOAST.AVERTISSEMENT, title: 'Demande introuvable',
          body: `Aucune demande ne portant ce numéro n'a été trouvée sur IntraRC. Peut-être existe-t-elle sur TéléRC ?
          Si vous souhaitez le vérifier, veuillez utiliser la fonctionnalité de récupération de demande depuis TéléRC.`
        });
        this.submitting = false;
        this.numero.enable();
      }
    }, (error) => { // Si c'est une "401", c'est une erreur "autorisée", on la traite spécifiquement ici.
      if (error.status === 401) {
        this.toasterService.pop({
          type: TYPE_TOAST.AVERTISSEMENT, title: 'Demande inaccessible',
          body: `Il semblerait qu'il existe dans la base de données Intra-RC une demande correspondant au numéro saisi,
          mais que vous n'êtes pas autorisé à y accéder.`
        });
      } else {
        this.toasterService.pop({ type: TYPE_TOAST.ERREUR, title: 'Une erreur est survenue', body: error.message });
      }
      this.submitting = false;
      this.numero.enable();
    });
  }
}
