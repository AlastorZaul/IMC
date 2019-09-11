import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormGroupDirective, Validators, FormControl, ControlContainer } from '@angular/forms';
import { DemandesGestionComponent } from 'src/app/web/demandes/demandes-gestion/demandes-gestion.component';
import { MotifDecision } from 'src/app/modeles/motif-decision.model';
import { FormArray } from '@angular/forms/src/model';
import { STATUT } from 'src/app/constantes/referentiel/statut.enum';
import { MatDialog } from '@angular/material';
import { DemOngletCourrierComponent} from 'src/app/web/demandes/demandes-gestion/dem-onglet-courrier/dem-onglet-courrier.component';
import { Statut } from 'src/app/modeles/statut.model';
import { TYPE_COURRIER } from 'src/app/constantes/referentiel/type-courrier.enum';
import { OPERATION_COURRIER } from 'src/app/constantes/referentiel/operation-courrier.enum';
import { DecAccepterModaleComponent
} from 'src/app/web/demandes/demandes-gestion/dem-onglet-decision/dec-accepter-modale/dec-accepter-modale.component';
import { ToasterService } from 'angular2-toaster/src/toaster.service';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { Demande } from 'src/app/modeles/demande.model';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dem-onglet-decision',
  templateUrl: './dem-onglet-decision.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class DemOngletDecisionComponent implements OnInit {
  @Input() parentSendSubmitted: Subject<boolean>;
  @Input() parentIsConsultation: Subject<boolean>;
  @Input() listeMotifsIrrecevable: MotifDecision[];
  @Input() listeMotifsRefus: MotifDecision[];
  @Input() listeStatut: Statut[];
  @Input() demOngletCourrierComp: DemOngletCourrierComponent;
  @Input() parentSendIsFormulaireInvalid: Subject<boolean>;
  @Input() parentSendIsFormulaireWarn: Subject<boolean>;
  @Output() formulaireInvalidEvent: EventEmitter<any> = new EventEmitter(false);
  @Output() formulaireWarnEvent: EventEmitter<any> = new EventEmitter(false);
  public readonly STATUT = STATUT;

  // BOOLEAN
  public formulaireInvalid: boolean;
  public formulaireWarn: boolean;
  // FORMULAIRE
  private parentForm: FormGroup;
  private submitted = false; // Synchronisé avec celui du parent
  private consultation = false; // Synchronisé avec celui du parent
  constructor(
    private parent: FormGroupDirective,
    private fb: FormBuilder,
    private dialog: MatDialog,
    public toasterService: ToasterService
  ) { }

  ngOnInit() {
    // EVENEMENTS PARENT
    if (this.parentSendSubmitted) {
      this.parentSendSubmitted.subscribe(submitted => {
        this.submitted = submitted;
      });
    }
    if (this.parentIsConsultation) {
      this.parentIsConsultation.subscribe(consult => {
        this.consultation = consult;
      });
    }
    this.parentSendIsFormulaireInvalid.subscribe(isFormulaireInvalid => {
      this.formulaireInvalid = isFormulaireInvalid;
    });
    this.parentSendIsFormulaireWarn.subscribe(isFormulaireWarn => {
      this.formulaireWarn = isFormulaireWarn;
    });

    // Initialisation du formulaire
    this.parentForm = this.parent.form;
    this.parentForm.addControl('dateDecision', new FormControl({value: undefined, disabled: true}));
    this.parentForm.addControl('motifsDecision', this.fb.array([]));
    this.parentForm.addControl('decisionMotifAutre', new FormControl(undefined, Validators.maxLength(10000)));
    this.parentForm.addControl('dateImpression', new FormControl({value: undefined, disabled: true}));

  }

  /** BEFORE / AFTER PATCH PRINCIPAL FORM */
  beforePatchPrincipalForm(dem: Demande) {}
  afterPatchPrincipalForm(dem: Demande) {
    if (dem.dateDecision) {
      this.dateDecision.enable();
    } else {
      this.dateDecision.disable();
    }
    if (dem.statut && dem.statut.code
      && dem.statut.code === STATUT.STT_IRR_CODE || dem.statut.code === STATUT.STT_REF_CODE) {
        this.motifsDecision.setValidators(Validators.required);
        this.motifsDecision.updateValueAndValidity();
    }
  }
  // Méthodes de contrôle du formulaire
  isOngletValid(): boolean {
    return this.parentForm && (!this.id.value || (this.dateDecision.valid
      && this.motifsDecision.valid && this.decisionMotifAutre.valid));
  }
  isOngletWarn(): boolean { return false; }

  isOngletInvalid(): Boolean {
    return this.parentForm && (this.hasError(this.dateDecision)
      || this.hasErrorArray(this.motifsDecision) || this.hasError(this.decisionMotifAutre));
  }
  isConsultMode() {
    return this.consultation;
  }


  // Boutons des statuts de la demande
  demandeIrrecevable(): void {
    this.setStatut(this.findInListByCode(STATUT.STT_IRR_CODE, this.listeStatut));
    this.setDateDecision(new Date());
    this.dateDecision.enable();
    /** Pour supprimer les couriers d'accusé de réception de la liste des courriers à rajouter à la demande lors de son enregistrement */
    this.demOngletCourrierComp.pushOrRemoveFromArray(false, TYPE_COURRIER.TCOUR_RPT_CODE, OPERATION_COURRIER.COURRIEL);
    this.demOngletCourrierComp.pushOrRemoveFromArray(false, TYPE_COURRIER.TCOUR_RPT_CODE, OPERATION_COURRIER.IMPRESSION);

    /** Au moins un motif doit être sélectionné si la décision d'irrecevabilité a été prise. => Champ "required"*/
    this.motifsDecision.setValidators(Validators.required);
    this.motifsDecision.updateValueAndValidity();

    // Toaster message d'information
    this.showToaster(TYPE_TOAST.INFORMATION, 'L\'avis d\'irrecevabilité est désormais disponible pour impression ou envoi par courriel');
  }
  demandeRefuser(): void {
    this.setStatut(this.findInListByCode(STATUT.STT_REF_CODE, this.listeStatut));
    this.setDateDecision(new Date());
    this.dateDecision.enable();

    /** Au moins un motif doit être sélectionné si la décision de refus a été prise. => Champ "required" */
    this.motifsDecision.setValidators(Validators.required);
    this.motifsDecision.updateValueAndValidity();

    // Toaster message d'information
    this.showToaster(TYPE_TOAST.INFORMATION, 'Le courrier de refus est désormais disponible pour impression ou envoi par courriel');
  }
  demandeAnnuler(): void {
    this.setStatut(this.findInListByCode(STATUT.STT_REC_CODE, this.listeStatut));
    this.setDateDecision(undefined);
    this.dateDecision.disable();

    /** Vider le champ "motifsDecision" et lui enlever la contrainte "required" */
    this.clearFormArray(this.motifsDecision);
    this.motifsDecision.clearValidators();
    this.motifsDecision.updateValueAndValidity();

    /** Vider le champ "decisionMotifAutre" */
    this.decisionMotifAutre.reset();

    /** Pour supprimer les couriers de la liste des courriers à rajouter à la demande lors de son enregistrement */
    /** Traitement des courriers irrecevables*/
    this.demOngletCourrierComp.pushOrRemoveFromArray(false, TYPE_COURRIER.TCOUR_IRR_CODE, OPERATION_COURRIER.COURRIEL);
    this.demOngletCourrierComp.pushOrRemoveFromArray(false, TYPE_COURRIER.TCOUR_IRR_CODE, OPERATION_COURRIER.IMPRESSION);

    /** Traitement des courriers refusés*/
    this.demOngletCourrierComp.pushOrRemoveFromArray(false, TYPE_COURRIER.TCOUR_REF_CODE, OPERATION_COURRIER.COURRIEL);
    this.demOngletCourrierComp.pushOrRemoveFromArray(false, TYPE_COURRIER.TCOUR_REF_CODE, OPERATION_COURRIER.IMPRESSION);

    /** Traitement des courriers accordés exprès*/
    this.demOngletCourrierComp.pushOrRemoveFromArray(false, TYPE_COURRIER.TCOUR_ACC_CODE, OPERATION_COURRIER.COURRIEL);
    this.demOngletCourrierComp.pushOrRemoveFromArray(false, TYPE_COURRIER.TCOUR_ACC_CODE, OPERATION_COURRIER.IMPRESSION);

    /** Traitement des courriers attestation*/
    this.demOngletCourrierComp.pushOrRemoveFromArray(false, TYPE_COURRIER.TCOUR_ATT_CODE, OPERATION_COURRIER.COURRIEL);
    this.demOngletCourrierComp.pushOrRemoveFromArray(false, TYPE_COURRIER.TCOUR_ATT_CODE, OPERATION_COURRIER.IMPRESSION);
  }
  demandeAccepter(): void {
    this.formulaireInvalidEvent.emit();
    this.formulaireWarnEvent.emit();
    this.dialog.open(DecAccepterModaleComponent, {
      disableClose : true,
      width: '500px',
      data : { statutModelForm: this.statut, listeStatut: this.listeStatut,
               isFormulaireInvalid: this.formulaireWarn || this.formulaireInvalid},
    }).afterClosed().subscribe( result => {
      if (result) {
        this.setDateDecision(new Date());
        this.dateDecision.enable();
        if (this.statut.value.code === STATUT.STT_ACCE_CODE) {
          // Toaster message d'information
          this.showToaster(TYPE_TOAST.INFORMATION,
            'Le courrier d\'accord exprès est désormais disponible pour impression et envoi par courriel');
        }
      }
    });
  }
  showToaster(type: TYPE_TOAST, body: String): void {
    this.toasterService.pop({
      type: type, body: body
    });
  }

  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.parentForm.get('id') as FormControl; }
  get createMode(): Boolean { return !this.id.value; }
  get statut(): FormControl { return this.parentForm.get('statut') as FormControl; }
  get dateDecision(): FormControl { return this.parentForm.get('dateDecision') as FormControl; }
  get motifsDecision(): FormArray { return this.parentForm.get('motifsDecision') as FormArray; }
  get decisionMotifAutre(): FormControl { return this.parentForm.get('decisionMotifAutre') as FormControl; }
  get dateImpression(): FormControl { return this.parentForm.get('dateImpression') as FormControl; }
  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }
  hasErrorArray(control: FormArray): Boolean {
    return control.invalid;
  }
  ///// FORMULAIRE - SETTERS
  setStatut(val: any): void { this.statut.setValue(val); }
  setDateDecision(val: any): void { this.dateDecision.setValue(val); }

  ///// UTILS
  isInArray(motif: MotifDecision) {
    if (this.motifsDecision.value.length >= 1) {
      return this.findIndexInArray(motif) !== -1;
    }
  }
  private findIndexInArray(motif: MotifDecision): number {
    return this.motifsDecision.value.findIndex((_motif: MotifDecision) => {
      return motif.id === _motif.id;
    });
  }
  pushOrRemoveFromArray(value: boolean, motif: MotifDecision) {
    if (value) {
      this.motifsDecision.push(this.fb.control(motif));
      /** Le champ "précision" devient "required" si la case "Autre" a été cochée. */
      if (((motif.intitule) as String ).lastIndexOf('Autres') >= 0) {
        this.decisionMotifAutre.setValidators([Validators.required, Validators.maxLength(10000)]);
        this.decisionMotifAutre.markAsTouched();
        this.decisionMotifAutre.updateValueAndValidity();
      }

    } else {
      const indx = this.findIndexInArray(motif);
      if (indx !== -1) {
        this.motifsDecision.removeAt(indx);
        /** Enlever le "required" de champ "précision" si la case "Autre" a été décochée. */
        if (((motif.intitule) as String ).lastIndexOf('Autres') >= 0) {
          this.decisionMotifAutre.clearValidators();
          this.decisionMotifAutre.setValidators(Validators.maxLength(10000));
          this.decisionMotifAutre.markAsTouched();
          this.decisionMotifAutre.updateValueAndValidity();
        }
      }
    }
    this.parentForm.markAsDirty();
  }
  findInListByCode(_code: string, _liste: any[]) {
    return _liste.find((val) => {
      return val.code === _code;
    });
  }
  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0);
    }
  }
  supprimerDate(control: FormControl) {
    if (control && control.enabled) {
      control.setValue(undefined);
      control.markAsTouched();
    }
  }
}
