import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from '@angular/core';
import { ControlContainer, FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { FormArray } from '@angular/forms/src/model';
import { ToasterService } from 'angular2-toaster/src/toaster.service';
import { Subject } from 'rxjs';
import { OPERATION_COURRIER } from 'src/app/constantes/referentiel/operation-courrier.enum';
import { STATUT } from 'src/app/constantes/referentiel/statut.enum';
import { TYPE_COURRIER } from 'src/app/constantes/referentiel/type-courrier.enum';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { Courrier } from 'src/app/modeles/courrier.model';
import { Demande } from 'src/app/modeles/demande.model';
import { Signature } from 'src/app/modeles/signature.model';
import { Statut } from 'src/app/modeles/statut.model';
import { TypeCourrier } from 'src/app/modeles/type-courrier.model';
import { DemandeService } from 'src/app/services/crud/demande.service';
import { MatDialog } from '@angular/material';
import { ConfirmModaleComponent } from 'src/app/web/commun/modales/confirm-modale.component';
import { BirtViewerService } from 'src/app/services/birt-viewer.service';

@Component({
  selector: 'app-dem-onglet-courrier',
  templateUrl: './dem-onglet-courrier.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class DemOngletCourrierComponent implements OnInit {
  @Input() parentSendSubmitted: Subject<boolean>;
  @Input() parentIsConsultation: Subject<boolean>;
  @Input() parentSendIsFormulaireInvalid: Subject<boolean>;
  @Input() listeStatut: Statut[];
  @Input() listeTypeCourrier: TypeCourrier[];
  @Input() listeSignature: Signature[];
  @Output() checkParentFormValidity: EventEmitter<any> = new EventEmitter(false);
  @Output() saveImprimerEnvoyer: EventEmitter<any> = new EventEmitter(false);

  public listeCourrierToAdd: Courrier[] = [];
  // CONSTANTES
  public readonly OPERATION_COURRIER = OPERATION_COURRIER;
  public readonly STATUT = STATUT;
  public readonly TYPE_COURRIER = TYPE_COURRIER;
  // BOOLEANS
  public showLRAR: boolean;
  public impression: boolean;
  public courriel: boolean;
  public envoyerImprimer = false;
  public previsualisation = false;
  public askForSave = false;
  // FORMULAIRE
  private parentForm: FormGroup;
  public courrielForm: FormGroup;
  private submitted = false; // Synchronisé avec celui du parent
  private consultation = false; // Synchronisé avec celui du parent
  // TELECHARGEMENT
  @ViewChild('downloadLinkCourriers') private downloadLink: ElementRef;
  isDownloading: Boolean = false;

  constructor(
    private parent: FormGroupDirective,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toasterService: ToasterService,
    private birtService: BirtViewerService,
    private demandeService: DemandeService,
  ) { }

  ngOnInit() {
    // EVENEMENT PARENT - SUBMITTED
    if (this.parentSendSubmitted) {
      this.parentSendSubmitted.subscribe(submitted => {
        this.submitted = submitted;
      });
    }
    if (this.parentIsConsultation) {
      this.parentIsConsultation.subscribe(consultation => {
        this.consultation = consultation;
      });
    }
    if (this.parentSendIsFormulaireInvalid) {
      this.parentSendIsFormulaireInvalid.subscribe(isFormulaireInvalid => {
        this.saveWithCourriers(isFormulaireInvalid);
      });
    }

    // Initialisation du formulaire
    this.parentForm = this.parent.form;
    this.parentForm.addControl('courriers', this.fb.array([]));

    /** Formulaire à part */
    this.courrielForm = this.fb.group({
      'courrielEmployeurAccuse': [undefined, [Validators.maxLength(250), Validators.email]],
      'courrielSalarieAccuse': [undefined, [Validators.maxLength(250), Validators.email]],
      'signature': [undefined],
      'lrar': [false]
    });
    this.employeurCourriel.valueChanges.subscribe( c => {
      this.setCourrielEmployeurAccuse(c);
    });
    this.salarieCourriel.valueChanges.subscribe( c => {
      this.setCourrielSalarieAccuse(c);
    });
  }

  /** BEFORE / AFTER PATCH PRINCIPAL FORM */
  beforePatchPrincipalForm(dem: Demande) {
    this.listeCourrierToAdd = [];
    this.envoyerImprimer = false;
    this.previsualisation = false;
    this.askForSave = false;
    if (dem.courriers && dem.courriers.length > 0) {
      dem.courriers.sort((a: Courrier, b: Courrier) => {
          return b.date.getTime() -  a.date.getTime();
      });
    }
    // Règles validation formulaire courriers
    this.courrielsEmpNOTRequired();
    this.courrielsSalNOTRequired();
  }
  afterPatchPrincipalForm(dem: Demande) {}
  // Méthodes de contrôle du formulaire
  isOngletValid(): boolean {
    return this.parentForm && this.courrielForm && this.courrielForm.valid && !this.consultation;
  }
  isOngletConsultValid(): boolean {
    return this.parentForm && this.courrielForm && this.courrielForm.valid;
  }
  isOngletWarn(): boolean { return false; }
  isOngletInvalid(): Boolean {
    return this.parentForm && this.courrielForm && this.courrielForm.invalid;
  }
  /** BEFORE / AFTER SAVE PRINCIPAL FORM */
  beforeSave(dem: Demande) {}
  afterSave(dem: Demande) {
    // Une impression/prévisualisation a été demandée, et il existe des courriers concernés
    if (dem && (this.envoyerImprimer || this.previsualisation) && this.listeCourrierToAdd.length > 0) {
      const pourEmployeur = !!(this.courrielEmployeurAccuse.value);
      const pourSalarie = !!(this.courrielSalarieAccuse.value);
      const signatureIdForm = (this.signature.value) ? this.signature.value.id : undefined;
      const lrarForm = (this.lrar.value) ? this.lrar.value : false;
      // Pour tous les documents, j'ouvre le viewer
      let showFirstToast = true;
      if (this.previsualisation) {
        this.listeCourrierToAdd.forEach((courrier: Courrier) => {
          if (courrier.operation === OPERATION_COURRIER.COURRIEL) {
            this.showSaveCourrierToast(showFirstToast);
            this.birtService.ouvrirCourrierDemande(courrier, dem, pourEmployeur, pourSalarie, signatureIdForm, lrarForm);
            showFirstToast = false;
          }
        });
      } else { // envoyerImprimer
        this.listeCourrierToAdd.forEach((courrier: Courrier) => {
          if (courrier.operation === OPERATION_COURRIER.IMPRESSION) {
            this.showSaveCourrierToast(showFirstToast);
            this.birtService.ouvrirCourrierDemande(courrier, dem, true, true, signatureIdForm, lrarForm);
            showFirstToast = false;
          }
        });
      }
    }
  }
  private showSaveCourrierToast(firstToast) {
    if (!firstToast) { return; }
    this.showToaster(TYPE_TOAST.INFORMATION,
      `Les courriers vont être ouverts pour ${(this.envoyerImprimer) ? 'impression' : 'prévisualisation'} dans quelques secondes.
      Si rien ne se passe, veuillez vérifier que votre navigateur ne bloque par les fenêtres pop-up.`
    );
  }
  // ONGLET GESTION - action de transfert
  // Lors d'un transfert, si impression/envoi courrier demandé, on passe par cette méthode
  public prepareCourrierTransfert(impression, courriel, mailEmployeur, mailSalarie, signature) {
    // Préparation de l'onglet
    this.listeCourrierToAdd = [];
    this.envoyerImprimer = true;
    this.courrielEmployeurAccuse.setValue(mailEmployeur);
    this.courrielSalarieAccuse.setValue(mailSalarie);
    this.signature.setValue(signature);
    this.lrar.setValue(false);
    // Préparation des courriers de transfert
    if (impression) {
      const courrierImp = new Courrier();
      courrierImp.typeCourrier = this.listeTypeCourrier.find(tc => tc.code === TYPE_COURRIER.TCOUR_TSF_CODE);
      courrierImp.operation = OPERATION_COURRIER.IMPRESSION;
      this.listeCourrierToAdd.push(courrierImp);
    }
    if (courriel) {
      const courrierEnv = new Courrier();
      courrierEnv.typeCourrier = this.listeTypeCourrier.find(tc => tc.code === TYPE_COURRIER.TCOUR_TSF_CODE);
      courrierEnv.operation = OPERATION_COURRIER.COURRIEL;
      this.listeCourrierToAdd.push(courrierEnv);
    }
    this.manageCourriersToAddBeforeSaving();
  }


  ///// BOUTONS
  exporter(): void {
    if (this.isDownloading) { return; }
    this.isDownloading = true;
    this.demandeService.exportCourriers(this.id.value, this.downloadLink, (() => {this.isDownloading = false; }));
  }

  imprimerEnvoyer(): void {
    this.envoyerImprimer = true;
    this.askForSave = true;
    this.checkParentFormValidity.emit();
    // Suite du processus dans la méthode saveWithCourriers
    // L'event est émis par ce component, reçu par le parent, qui check si le form est valide ou non
    // Si le form est valide, il retourne l'info ici (voir subscription) et lance le save ou non
  }
  previsualiser(): void {
    this.previsualisation = true;
    this.askForSave = true;
    this.checkParentFormValidity.emit();
    // Suite du processus dans la méthode saveWithCourriers
    // L'event est émis par ce component, reçu par le parent, qui check si le form est valide ou non
    // Si le form est valide, il retourne l'info ici (voir subscription) et lance le save ou non
  }

  private saveWithCourriers(parentFormInvalid: boolean) {
    if (this.askForSave) { // Le save a bien été demandé par ce component
      this.askForSave = false;
      if ((this.consultation && this.isOngletConsultValid()) || (!this.consultation && this.isOngletValid())) {
        if (!parentFormInvalid) {
          this.dialog.open(ConfirmModaleComponent, {
            disableClose : true,
            data: {
              titre: (this.envoyerImprimer) ? `Imprimer et envoyer les courriers` : 'Prévisualiser les courriers',
              contenu: (this.envoyerImprimer) ?
              `L'impression et/ou l'envoi des courriels entraîne l'enregistrement de la demande.<br/>Souhaitez-vous continuer ?`
              : `La prévisualisation des courriels entraîne l'enregistrement de la demande.<br/>Souhaitez-vous continuer ?`,
              texteBoutonNon: 'Non', texteBoutonOui: 'Oui'
            }
          }).afterClosed().subscribe(res => {
            if (res) {
              this.manageCourriersToAddBeforeSaving(); // On convertit les courriers en courrier enregistrables
              this.saveImprimerEnvoyer.emit(); // On demande un enregistrement au composant parent
            } else {
              this.envoyerImprimer = false;
              this.previsualisation = false;
            }
          });
        } else {
          this.showToaster(TYPE_TOAST.ERREUR,
            'Aucun courrier ne peut être généré si le formulaire de la demande n\'est pas valide.'
          );
          this.envoyerImprimer = false;
          this.previsualisation = false;
        }
      } else {
        if (this.isCourrielCoche()) {
          this.showToaster(TYPE_TOAST.ERREUR,
            'Aucun courrier ne peut être envoyé si aucune adresse courriel employeur/salarié n\'est renseignée'
          );
          this.envoyerImprimer = false;
          this.previsualisation = false;
          return;
        } else {
          this.showToaster(TYPE_TOAST.ERREUR,
            'Aucun courrier ne peut être généré si le formulaire de la demande n\'est pas valide.'
          );
          this.envoyerImprimer = false;
          this.previsualisation = false;
        }
      }
    }
  }
  private manageCourriersToAddBeforeSaving() {
    // On ne réalise pas les opérations si on a demandé une prévisualisation uniquement.
    if (this.envoyerImprimer && this.listeCourrierToAdd && this.listeCourrierToAdd.length > 0) {
      const destEmpl = (this.courrielEmployeurAccuse.value) ? this.courrielEmployeurAccuse.value : '';
      const destSal = (this.courrielSalarieAccuse.value) ? this.courrielSalarieAccuse.value : '';
      const signatureIdForm = (this.signature.value) ? this.signature.value.id : undefined;
      const lrarForm = (this.lrar.value) ? this.lrar.value : false;
      this.listeCourrierToAdd.forEach((courrier) => {
        const courrTC = courrier.typeCourrier.code;
        if ( courrTC === TYPE_COURRIER.TCOUR_IRR_CODE || courrTC === TYPE_COURRIER.TCOUR_REF_CODE
          || courrTC === TYPE_COURRIER.TCOUR_ACC_CODE || courrTC === TYPE_COURRIER.TCOUR_ATT_CODE
        ) {
            this.dateImpression.setValue(new Date());
        }
        this.courriers.push(
          this.fb.control(new Courrier({
            'id': courrier.id,
            'date': courrier.date,
            'destinataires': destEmpl + ' / ' + destSal,
            'identifiantExpediteur' : 'INTRA-RC',
            'operation' : courrier.operation,
            'typeCourrier' : courrier.typeCourrier,
            // Champs liés au form
            'courrielEmployeur': destEmpl,
            'courrielSalarie' : destSal,
            'signatureId' : signatureIdForm,
            'lrar': lrarForm,
          }))
        );
      });
    }
  }

  // Au changement de la valeur du courriel d'accusé de l'employeur, si ce dernier n'est pas vide,
  // le courriel d'accusé du salarié devient non obligatoire
  courrielEmpAccuseChange(val: String): void {
    if (this.isCourrielCoche()) {
      if (val) {
        this.courrielsEmplRequired();
        this.courrielsSalNOTRequired();
      } else {
        this.courrielsSalRequired();
        if (this.courrielSalarieAccuse.value) {
          this.courrielsEmpNOTRequired();
        }
      }
    }
  }
  // Au changement de la valeur du courriel d'accusé du salarié, si ce dernier n'est pas vide,
  // le courriel d'accusé de l'employeur devient non obligatoire
  courrielSalAccuseChange(val: String): void {
    if (this.isCourrielCoche()) {
      if (val) {
        this.courrielsSalRequired();
        this.courrielsEmpNOTRequired();
      } else {
        this.courrielsEmplRequired();
        if (this.courrielEmployeurAccuse.value) {
          this.courrielsSalNOTRequired();
        }
      }
    }
  }

  /* Liste des courriers à ajouter dans le FormControl('courriers) au moment de l'enregistrement
  Pour pas qu'ils s'affichent dans le tableau récapitulatif des courriers envoyés */
  pushOrRemoveFromArray(value: boolean, tcc: String, to: OPERATION_COURRIER) {
    const courrier = new Courrier();
    courrier.typeCourrier = this.listeTypeCourrier.find(tc => tc.code === tcc);
    courrier.operation = to;
    if (value) {
      this.listeCourrierToAdd.push(courrier);
    } else {
      const indx = this.findIndexInArray(tcc, to);
      if (indx !== -1) {
        this.listeCourrierToAdd.splice(indx, 1);
      }
    }
    this.isShowLRAR();
    this.isImprimerEnvoyer();
  }
  isShowLRAR(): void {
    if (this.listeCourrierToAdd !== null && this.listeCourrierToAdd.length > 0) {
      const indx = this.listeCourrierToAdd.findIndex(c => {
        return c.typeCourrier.code === TYPE_COURRIER.TCOUR_IRR_CODE ||
                c.typeCourrier.code === TYPE_COURRIER.TCOUR_REF_CODE;
      });
      this.showLRAR = indx > -1;
    } else {
      this.showLRAR = false;
    }
  }

  /** Methode permettant de savoir si au moins une case Impression/Courriel et coché */
  isImprimerEnvoyer(): void {
    this.courriel = false;
    this.impression = false;

    if (this.listeCourrierToAdd.length > 0) {
      this.impression = this.isImpressionCoche();
      this.courriel = this.isCourrielCoche();
    }

    // Au moins un des deux champs doit être rempli si au moins une case "Courriel" d'un document est cochée.
    if (this.courriel) {
      this.courrielEmpAccuseChange(this.courrielEmployeurAccuse.value);
      this.courrielSalAccuseChange(this.courrielSalarieAccuse.value);
    } else {
      this.courrielsEmpNOTRequired(); this.courrielsSalNOTRequired();
    }
  }

  /** Return true si au moins une case 'courriel' d'un document est cochée  */
  isCourrielCoche(): boolean {
    const indexC = this.listeCourrierToAdd.findIndex(c => {
      return c.operation === OPERATION_COURRIER.COURRIEL;
    });
    return indexC > -1;
  }

  /** Return true si au moins une case 'impression' d'un document est cochée  */
  isImpressionCoche(): boolean {
    const indexI = this.listeCourrierToAdd.findIndex(c => {
      return c.operation === OPERATION_COURRIER.IMPRESSION;
    });
    return indexI > -1;
  }

  courrielsEmplRequired(): void {
    this.courrielEmployeurAccuse.setValidators([Validators.required, Validators.maxLength(250), Validators.email]);
    this.courrielEmployeurAccuse.updateValueAndValidity();
  }
  courrielsSalRequired(): void {
    this.courrielSalarieAccuse.setValidators([Validators.required, Validators.maxLength(250), Validators.email]);
    this.courrielSalarieAccuse.updateValueAndValidity();
  }

  courrielsEmpNOTRequired(): void {
    this.courrielEmployeurAccuse.clearValidators();
    this.courrielEmployeurAccuse.setValidators([Validators.maxLength(250), Validators.email]);
    this.courrielEmployeurAccuse.updateValueAndValidity();
  }

  courrielsSalNOTRequired(): void {
    this.courrielSalarieAccuse.clearValidators();
    this.courrielSalarieAccuse.setValidators([Validators.maxLength(250), Validators.email]);
    this.courrielSalarieAccuse.updateValueAndValidity();
  }



  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.parentForm.get('id') as FormControl; }
  get createMode(): Boolean { return !this.id.value; }
  get statut(): FormControl { return this.parentForm.get('statut') as FormControl; }
  get etape(): FormControl { return this.parentForm.get('etape') as FormControl; }
  get courriers(): FormArray { return this.parentForm.get('courriers') as FormArray; }
  get employeur(): FormControl { return this.parentForm.get('employeur') as FormControl; }
    get employeurCourriel(): FormControl {return this.employeur.get('courriel') as FormControl; }
  get salarie(): FormControl { return this.parentForm.get('salarie') as FormControl; }
    get salarieCourriel(): FormControl {return this.salarie.get('courriel') as FormControl; }
  get dateTransfert(): FormControl { return this.parentForm.get('dateTransfert') as FormControl; }
  get dateImpression(): FormControl { return this.parentForm.get('dateImpression') as FormControl; }
  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }
  ///// FORMULAIRE COURRIELS INFOS - GETTES
  get courrielEmployeurAccuse(): FormControl {return this.courrielForm.get('courrielEmployeurAccuse') as FormControl; }
  setCourrielEmployeurAccuse(val: any): void { this.courrielEmployeurAccuse.setValue(val); }
  get courrielSalarieAccuse(): FormControl {return this.courrielForm.get('courrielSalarieAccuse') as FormControl; }
  setCourrielSalarieAccuse(val: any): void { this.courrielSalarieAccuse.setValue(val); }
  get signature(): FormControl {return this.courrielForm.get('signature') as FormControl; }
  get lrar(): FormControl {return this.courrielForm.get('lrar') as FormControl; }

  ///// UTILS
  isInArray(tcc: String, to: OPERATION_COURRIER) {
    if (this.listeCourrierToAdd.length >= 1) {
      return this.findIndexInArray(tcc, to) !== -1;
    }
  }
  private findIndexInArray(tcc: String, to: OPERATION_COURRIER): number {
    return this.listeCourrierToAdd.findIndex((_courrier: Courrier) => {
      return to === _courrier.operation && tcc === _courrier.typeCourrier.code;
    });
  }

  showToaster(type: TYPE_TOAST, body: String): void {
    this.toasterService.pop({
      type: type, body: body
    });
  }
}
