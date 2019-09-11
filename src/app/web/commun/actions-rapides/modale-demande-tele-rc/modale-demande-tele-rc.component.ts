import { Component, OnInit, Inject } from '@angular/core';
import { Validators, FormBuilder, FormControl } from '@angular/forms';
import { isNumeroDemandePublic } from 'src/app/directives/validators/numero-demande.validators';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ToasterService } from 'angular2-toaster';
import { DemandeService } from 'src/app/services/crud/demande.service';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { Router } from '@angular/router';
import { ROUTES } from 'src/app/constantes/routes';
import { StorageService } from 'src/app/services/storage.service';
import { SESSION_CLES } from 'src/app/constantes/session-cles';
import { Demande } from 'src/app/modeles/demande.model';
import { throwError } from 'rxjs';

@Component({
  selector: 'app-modale-demande-tele-rc',
  templateUrl: './modale-demande-tele-rc.component.html'
})
export class ModaleDemandeTeleRCComponent implements OnInit {

  public submitting = false;
  public submitted = false;
  public demandeIntraRc: Demande = undefined;
  public recupEnCours = false;
  // FORMULAIRE
  public modeleForm = this.fb.group({
    numero: ['', [Validators.required, Validators.maxLength(250), isNumeroDemandePublic()]],
  });

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<ModaleDemandeTeleRCComponent>,
    private toasterService: ToasterService,
    private svc: DemandeService,
    private storageSvc: StorageService,
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
    // Nettoyage préliminaire, au cas où
    this.demandeIntraRc = undefined;
    this.recupEnCours = false;

    this.svc.getByNumeroOnIntra(this.numero.value).subscribe((demande: Demande) => {
      // Demande trouvée dans l'Intranet, on interrompt l'opération
      if (demande) {
        this.demandeIntraRc = demande;
        this.submitting = false;
        this.numero.enable();
      } else { // Demande introuvable côté IntraRC, on poursuit
        this.recupEnCours = true;
        this.svc.getByNumeroOnPublic(this.numero.value).subscribe((demandePub: Demande) => {
          // Demande trouvée sur le Public
          if (demandePub) {
            this.toasterService.pop({
              type: TYPE_TOAST.SUCCES, title: 'Récupération achevée',
              body: `La demande portant le numéro ${demandePub.numero} a bien été récupérée depuis TéléRC.
              Le formulaire d'édition de la demande va s'ouvrir.`
            });
            /** @TODO : LOT 3 */
            this.toasterService.pop({
              type: TYPE_TOAST.INFORMATION, title: 'Développement en cours',
              body: `Cette fonctionnalité est en cours de développement. Merci de votre compréhension.`
            });
            this.recupEnCours = false;
            this.submitting = false;
            this.numero.enable();
            /** @TODO : LOT 3 */
            /*
            this.storageSvc.setItemSessionStorage(SESSION_CLES.RECUP_DEMANDE_TELERC, demandePub);
            // ==> Element à supprimer dès qu'on arrive sur la page du formulaire.
            this.router.navigate(['/' + ROUTES.DEMANDES + '/' + ROUTES.ACT_GESTION]);
            this.dialogRef.close();
            */
          } else { // Demande introuvable côté Public non plus
            this.toasterService.pop({
              type: TYPE_TOAST.AVERTISSEMENT, title: 'Demande introuvable',
              body: `Aucune demande ne portant ce numéro n'a été trouvée sur TéléRC`
            });
            this.recupEnCours = false;
            this.submitting = false;
            this.numero.enable();
          }
        });
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

  ouvrirDemandeIntraRc() {
    if (this.demandeIntraRc && this.demandeIntraRc.uuid) {
      this.router.navigate(
        ['/' + ROUTES.DEMANDES + '/' + ROUTES.ACT_GESTION + '/' + this.demandeIntraRc.uuid]
      ).then((value: boolean) => { // Retour du Guard "DemandeGuard"
        if (value) {
          this.dialogRef.close();
        } else {
          this.submitting = false;
          this.numero.enable();
        }
      });
    } else {
      this.toasterService.pop({
        type: TYPE_TOAST.ERREUR, title: 'Erreur',
        body: `Il semblerait que votre demande ne soit pas conforme.`
      });
    }
  }

}
