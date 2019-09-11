import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormGroupDirective, Validators, FormControl, ControlContainer } from '@angular/forms';
import { Subject } from 'rxjs';
import * as moment from 'moment';
import { MatDialog } from '@angular/material';
import { TransfertModaleComponent
 } from 'src/app/web/demandes/demandes-gestion/dem-onglet-gestion/transfert-modale/transfert-modale.component';
import { ToasterService } from 'angular2-toaster/src/toaster.service';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { Demande } from 'src/app/modeles/demande.model';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { DemOngletControleComponent } from 'src/app/web/demandes/demandes-gestion/dem-onglet-controle/dem-onglet-controle.component';
import { DemOngletEmployeurComponent } from 'src/app/web/demandes/demandes-gestion/dem-onglet-employeur/dem-onglet-employeur.component';
import { OrganismeService } from 'src/app/services/crud/organisme.service';
import { JourChome } from 'src/app/modeles/jour-chome.model';
import { JourChomeService } from 'src/app/services/crud/jour-chome.service';
import { DemandeService } from 'src/app/services/crud/demande.service';
import { BirtViewerService } from 'src/app/services/birt-viewer.service';
import { Signature } from 'src/app/modeles/signature.model';
import { DemOngletCourrierComponent } from '../dem-onglet-courrier/dem-onglet-courrier.component';


@Component({
  selector: 'app-dem-onglet-gestion',
  templateUrl: './dem-onglet-gestion.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class DemOngletGestionComponent implements OnInit {
  @Input() parentSendSubmitted: Subject<boolean>;
  @Input() parentIsConsultation: Subject<boolean>;
  @Input() parentSendIsFormulaireInvalid: Subject<boolean>;
  @Input() listeOrganismesAccessibles: OrganismeMiniDto[];
  @Input() listeJourChomesOrganisme: JourChome[];
  @Input() listeSignature: Signature[];
  @Output() checkParentFormValidity: EventEmitter<any> = new EventEmitter(false);
  @Output() saveTransfert: EventEmitter<any> = new EventEmitter(false);
  // Sibling component
  @Input() demOngletControleComp: DemOngletControleComponent;
  @Input() demOngletCourrierComp: DemOngletCourrierComponent;
  @Input() demOngletEmployeurComp: DemOngletEmployeurComponent;

  // FORMULAIRE
  private parentForm: FormGroup;
  private submitted = false; // Synchronisé avec celui du parent
  private consultation = false; // Synchronisé avec celui du parent
  public maxDateReception: Date = new Date();
  public demandeTransfert = false;
  public askForSave = false;
  // TELECHARGEMENT
  @ViewChild('downloadLinkCerfa') private downloadLink: ElementRef;
  public isDownloading = false;

  constructor(
    private parent: FormGroupDirective,
    private organismeSvc: OrganismeService,
    private jourChomeSvc: JourChomeService,
    private demandeService: DemandeService,
    private dialog: MatDialog,
    private fb: FormBuilder,
    private birtService: BirtViewerService,
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
    if (this.parentSendIsFormulaireInvalid) {
      this.parentSendIsFormulaireInvalid.subscribe(isFormulaireInvalid => {
        this.ouvrirModaleTransfert(isFormulaireInvalid);
      });
    }
    // Initialisation du formulaire
    this.parentForm = this.parent.form;
    this.parentForm.addControl('id', this.fb.control(undefined));
    this.parentForm.addControl('uuid', this.fb.control(''));
    this.parentForm.addControl('dateCreation', this.fb.control(undefined));
    this.parentForm.addControl('dateCloture', this.fb.control(undefined));
    this.parentForm.addControl('dateDecisionImpression', this.fb.control(undefined));
    this.parentForm.addControl('dateReception', this.fb.control(undefined, [Validators.required]));
    this.parentForm.addControl('dateTransfert', this.fb.control({value: undefined, disabled: true}));
    this.parentForm.addControl('dateTeletransmission', this.fb.control({value: undefined, disabled: true}));
    this.parentForm.addControl('commentaire', this.fb.control('', [Validators.maxLength(10000)]));
    this.parentForm.addControl('courrielContact', this.fb.control('', [Validators.maxLength(250), Validators.email]));
    this.parentForm.addControl('organismeReception', this.fb.control(undefined, [Validators.required]));
    this.parentForm.addControl('organismeAttribution', this.fb.control({value: undefined, disabled: true}));
  }

  ouvrirModaleTransfert(isFormulaireInvalid: boolean) {
    if (this.askForSave) {
      this.askForSave = false;
      if (!isFormulaireInvalid) {
        this.dialog.open(TransfertModaleComponent, {
          disableClose : true, width: '900px',
          data : {
            etapeModelForm: this.etape,
            organismeAttributionModelForm: this.organismeAttribution,
            listeSignature: this.listeSignature,
            dateFinDelaiInstructionModelForm: this.dateFinDelaiInstruction,
            dateTransfertModelForm: this.dateTransfert
          }
        }).afterClosed().subscribe( res => {
          if (res) {
            // NOTE : res = FormGroup.rawValue() de la modale de transfert, soit les elements suivants :
            // courrielEmployeurAccuse(str), courrielSalarieAccuse (str), signature (Signature), impression (bool), envoi (bool)
            if (res.impression || res.envoi) { // Un courrier de transfert a été demandé
              this.demOngletCourrierComp.prepareCourrierTransfert( // ... on laisse l'onglet courrier gérer ça
                res.impression, res.envoi, res.courrielEmployeurAccuse, res.courrielSalarieAccuse, res.signature
              );
            }
            this.saveTransfert.emit(); // On demande un enregistrement au composant parent
          } else {
            this.demandeTransfert = false;
          }
        });
      } else {
        // FORMULAIRE NON VALIDE //
        this.toasterService.pop({
          type: TYPE_TOAST.ERREUR, body: 'Un transfert ne peut être opéré si le formulaire de la demande n\'est pas valide'
        });
        this.demandeTransfert = false;
      }
    }
  }

  /** BEFORE / AFTER PATCH PRINCIPAL FORM */
  beforePatchPrincipalForm(dem: Demande) {
    this.demandeTransfert = false;
    this.askForSave = false;
    if (!dem.organismeAttribution) { dem.organismeAttribution = new OrganismeMiniDto(); }
    if (!dem.organismeReception) { dem.organismeReception = new OrganismeMiniDto(); }
  }
  afterPatchPrincipalForm(dem: Demande) {
    if (this.organismeReception && this.organismeReception.value && this.organismeReception.value.id) {
      // S'il y a déjà eu un transfert
      if (this.dateTransfert && this.dateTransfert.value
        && this.organismeAttribution && this.organismeAttribution.value && this.organismeAttribution.value.id) {
        this.organismeSvc.getJoursChomes(this.organismeAttribution.value.id).subscribe((result: JourChome[]) => {
          this.listeJourChomesOrganisme = result;
        });
      } else {
        this.organismeSvc.getJoursChomes(this.organismeReception.value.id).subscribe((result: JourChome[]) => {
          this.listeJourChomesOrganisme = result;
        });
      }
    }
  }
  // Méthodes de contrôle du formulaire
  isOngletValid(): boolean {
    return this.parentForm && this.organismeReception.valid && this.dateReception.valid
      && this.commentaire.valid && this.courrielContact.valid;
  }
  isOngletWarn(): boolean {
    return this.parentForm && !this.isDateReceptionValide(this.dateReception.value, this.dateFinDelaiRetractation.value);
  }
  isOngletInvalid(): Boolean {
    return this.parentForm && (this.hasError(this.organismeReception) || this.hasError(this.dateReception)
    || this.hasError(this.commentaire) || this.hasError(this.courrielContact));
  }
  isConsultMode() {
    return this.consultation;
  }
  /** BEFORE / AFTER SAVE PRINCIPAL FORM */
  beforeSave(dem: Demande) {}
  afterSave(dem: Demande) {}
  getIsTransfert(): Boolean {
    return this.demandeTransfert;
  }



  /// BOUTONS
  // Au click sur le bouton transférer
  demandeTransferer(): void {
    this.askForSave = true;
    this.demandeTransfert = true;
    this.checkParentFormValidity.emit();
    // Suite du processus dans la méthode ouvrirModaleTransfert
    // L'event est émis par ce component, reçu par le parent, qui check si le form est valide ou non
    // Si le form est valide, il retourne l'info ici (voir subscription) et lance le save ou non
  }
  demandeTelechargerCERFA() {
    if (this.isDownloading) { return; }
    this.isDownloading = true;
    if (this.id.value && this.numero.value) {
      this.demandeService.downloadCerfaTeletransmis(this.id.value, this.numero.value, this.downloadLink,
        (() => {this.isDownloading = false; }));
    }
  }
  demandeGenererLaSynthese() {
    this.birtService.ouvrirSynthese(this.id.value);
  }


  organismeReceptionChange() {
    if (this.organismeReception && this.organismeReception.value && this.organismeReception.value.id) {
      // On récupère les jours chomes de l'organisme concerné
      this.organismeSvc.getJoursChomes(this.organismeReception.value.id).subscribe((result: JourChome[]) => {
        this.listeJourChomesOrganisme = result;
      });
    } else {
      // Aucun organisme précisé, on récupère les jours chomés nationaux
      this.jourChomeSvc.getJourChomeNationaux().subscribe((result: JourChome[]) => {
        this.listeJourChomesOrganisme = result;
      });
    }
  }
  dateReceptionChange() {
    this.demOngletControleComp.reinitOngletControle();
    this.demOngletEmployeurComp.startGetDemSimilaires();
  }

  ////// VALIDATIONS IMPORTANTES //////
  isDateReceptionValide(dateReception: Date, dateFinDelaiRetractation: Date): boolean {
    if (dateReception && dateFinDelaiRetractation) {
      const dateR: moment.Moment = moment(dateReception);
      const dateFnDR: moment.Moment = moment(dateFinDelaiRetractation);
      return dateR.isAfter(dateFnDR);
    }
    return true;
  }

  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.parentForm.get('id') as FormControl; }
  get numero(): FormControl { return this.parentForm.get('numero') as FormControl; }
  get dateReception(): FormControl { return this.parentForm.get('dateReception') as FormControl; }
  get dateTransfert(): FormControl { return this.parentForm.get('dateTransfert') as FormControl; }
  get dateTeletransmission(): FormControl { return this.parentForm.get('dateTeletransmission') as FormControl; }
  get commentaire(): FormControl { return this.parentForm.get('commentaire') as FormControl; }
  get courrielContact(): FormControl { return this.parentForm.get('courrielContact') as FormControl; }
  get dateFinDelaiInstruction(): FormControl { return this.parentForm.get('dateFinDelaiInstruction') as FormControl; }
  get etape(): FormControl { return this.parentForm.get('etape') as FormControl; }
  get organismeReception(): FormControl { return this.parentForm.get('organismeReception') as FormControl; }
  get organismeAttribution(): FormControl { return this.parentForm.get('organismeAttribution') as FormControl; }

  //// GETTERS - SETTERS D'UNE AUTREE VUE
  get dateFinDelaiRetractation(): FormControl { return this.parentForm.get('dateFinDelaiRetractation') as FormControl; }
  setDateFinDelaiInstruction(val: any): void { this.dateFinDelaiInstruction.setValue(val); }

  get employeur(): FormControl { return this.parentForm.get('employeur') as FormControl; }
  get employeurSiret(): FormControl { return this.employeur.get('siret') as FormControl; }
  get employeurUrssaf(): FormControl { return this.employeur.get('urssaf') as FormControl; }
  ///// FORMULAIRE - SETTERS
  setDateReception(val: any): void { this.dateReception.setValue(val); }

  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }

  // UTILS
  supprimerDateReception() {
    if (this.dateReception && this.dateReception.enabled) {
      this.dateReception.setValue(undefined);
      this.dateReception.markAsTouched();
      this.dateReceptionChange();
    }
  }
  findInListById(_id: number, _liste: any[]) {
    return _liste.find((val) => {
      return val.id === _id;
    });
  }

}
