import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormGroupDirective, Validators, FormControl, FormArray, ControlContainer } from '@angular/forms';
import { Subject } from 'rxjs';
import { Demande } from 'src/app/modeles/demande.model';
import { QualiteAssistant } from 'src/app/modeles/qualite-assistant.model';
import { TYPE_QUALITE } from 'src/app/constantes/referentiel/type-qualite.enum';
import { DemandeService } from 'src/app/services/crud/demande.service';
import { JourChome } from 'src/app/modeles/jour-chome.model';
import * as moment from 'moment';
import { AbstractControl } from '@angular/forms/src/model';
import { Entretien } from 'src/app/modeles/entretien.model';

@Component({
  selector: 'app-dem-onglet-calendrier',
  templateUrl: './dem-onglet-calendrier.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class DemOngletCalendrierComponent implements OnInit {
  @Input() parentSendSubmitted: Subject<boolean>;
  @Input() parentIsConsultation: Subject<boolean>;
  @Input() listeQualiteAssistantSalarie: QualiteAssistant[];
  @Input() listeQualiteAssistantEmployeur: QualiteAssistant[];
  @Input() listeJourChomesOrganisme: JourChome[];
  public readonly TYPE_QUALITE = TYPE_QUALITE;

  // FORMULAIRE
  private parentForm: FormGroup;
  private submitted = false; // Synchronisé avec celui du parent
  private consultation = false; // Synchronisé avec celui du parent
  public controleDateFinDelaiRetrac: Date = undefined;
  public datePremierEntretien: any;

  constructor(private parent: FormGroupDirective,
    private fb: FormBuilder,
    private demandeSvc: DemandeService) { }

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
    // Initialisation du formulaire
    this.parentForm = this.parent.form;
    this.parentForm.addControl('entretiens', this.fb.array([]));
    this.parentForm.addControl('remarqueEntretiens', this.fb.control('', [Validators.maxLength(10000)]));
    this.parentForm.addControl('dateSignature', this.fb.control(undefined));
    this.parentForm.addControl('dateFinDelaiRetractation', this.fb.control(undefined));
    this.parentForm.addControl('dateFinDelaiInstruction', this.fb.control(undefined));
    this.parentForm.addControl('dateEnvisageeRupture', this.fb.control(undefined));
    this.parentForm.addControl('autresClauses', this.fb.control('', [Validators.maxLength(10000)]));

    /** Si la date de signature change, on calcul la date de fin de délai de rétractation - Contrôle */
    this.dateSignature.valueChanges.subscribe( ds => {
      // Calcul de la date de fin du délai de rétractation - Contrôle
      this.controleDateFinDelaiRetrac = this.demandeSvc.calculDateFinDelaiRetractation(ds, this.listeJourChomesOrganisme);
      // Vérifier la validation du champs "dateFinDelaiRetractation"
      if (this.dateFinDelaiRetractation.value) {
        this.isDateFinDelaiRetractationValide(this.dateFinDelaiRetractation.value, this.controleDateFinDelaiRetrac);
      }
    });
    /** Vérifier la validation du champs "dateFinDelaiRetractation" */
    this.dateFinDelaiRetractation.valueChanges.subscribe( dFDR => {
      if (dFDR !== null) {
        this.isDateFinDelaiRetractationValide(dFDR, this.controleDateFinDelaiRetrac);
        this.dateReception.setValue(this.dateReception.value);
      }
    });
   /** Si la date de réception change, on calcul la date de fin de délai d'instruction - Contrôle */
    this.dateReception.valueChanges.subscribe( dR => {
      if (dR) {
        // Calcul de la date de fin du délai de rétractation - Contrôle
        this.dateFinDelaiInstruction.setValue(this.demandeSvc.calculDateFinDelaiInstru(dR, this.listeJourChomesOrganisme));
      }
    });
    /** Si le dossier est télétransmis, il faut que ce champ récupère la date de télétransmission */
    this.dateTeletransmission.valueChanges.subscribe( dt => {
      if (dt !== null && this.dateFinDelaiRetractation !== null && this.dateFinDelaiRetractation.value === null) {
        this.setDateFinDelaiRetractation(dt);
      }
    });
    /** Vérifier la validation du champs "dateEnvisageeRupture" */
    this.dateFinDelaiInstruction.valueChanges.subscribe(dateFDI => {
      if (this.dateEnvisageeRupture.value !== undefined) {
        this.isDateEnvisageeRuptureValide(this.dateEnvisageeRupture.value, dateFDI);
      }
    });
    /** Vérifier la validation du champs "dateEnvisageeRupture" */
    this.dateEnvisageeRupture.valueChanges.subscribe(dateER => {
      if (this.dateFinDelaiInstruction.value !== undefined) {
        this.isDateEnvisageeRuptureValide(dateER, this.dateFinDelaiInstruction.value);
      }
    });

    this.entretiens.valueChanges.subscribe(e => {
      this.isAuMoinsUnEntretienRenseigne(this.entretiens);
    });
  }


  /** BEFORE / AFTER PATCH PRINCIPAL FORM */
  beforePatchPrincipalForm(dem: Demande) {
    if (!dem.entretiens) { dem.entretiens = []; }
    if (dem.entretiens && dem.entretiens.length > 0) {
      dem.entretiens.sort((a: Entretien, b: Entretien) => {
        return b.date.getTime() -  a.date.getTime();
      });
    }
  }
  afterPatchPrincipalForm(dem: Demande) {
    if (dem.entretiens && dem.entretiens.length > 0) {
      dem.entretiens.forEach((entretien) => {
        this.entretiens.push(this.createEntretien(entretien));
      });
    } else {
      this.initDemandeEntretiens();
    }
  }
  initDemandeEntretiens() {
    if (this.entretiens) { this.ajouterEntretien(); }
  }
  // Méthodes de contrôle du formulaire
  isOngletValid(): boolean {
    return this.parentForm && this.entretiens.valid && this.remarqueEntretiens.valid
      && this.dateSignature.valid && this.dateEnvisageeRupture.valid
      && this.dateFinDelaiRetractation.valid && this.dateFinDelaiInstruction.valid
      && this.autresClauses.valid;
  }
  isOngletWarn(): boolean {
    return this.parentForm &&
    ( !this.isDateSignatureRenseigne() || !this.isDateSignaturePosterieurEntretien()
      || !this.isDateEnvisageeRuptureValide(this.dateEnvisageeRupture.value, this.dateFinDelaiInstruction.value)
      || !this.isDateFinDelaiRetractationValide(this.dateFinDelaiRetractation.value, this.controleDateFinDelaiRetrac)
      || !this.isAllDataAssistantValide() || !this.isAuMoinsUnEntretienRenseigne(this.entretiens)
    );
  }
  private isAllDataAssistantValide(): Boolean {
    return this.entretiens.controls.every((entretien: FormGroup) => {
      const salarieAssiste = entretien.get('salarieAssiste').value;
      const employeurAssiste = entretien.get('employeurAssiste').value;
      return this.isSalarieAssisteValide(entretien.get('salarieAssiste'), employeurAssiste)
      && this.isQualiteAssistantValide(entretien.get('qualiteAssistantSalarie'), salarieAssiste)
      && this.isQualiteAssistantValide(entretien.get('qualiteAssistantEmployeur'), employeurAssiste);
    });
  }
  isOngletInvalid(): Boolean {
    return this.parentForm && (this.hasArrayError(this.entretiens) || this.hasError(this.remarqueEntretiens)
    || this.hasError(this.dateSignature) || this.hasError(this.dateEnvisageeRupture)
    || this.hasError(this.dateFinDelaiRetractation) || this.hasError(this.dateFinDelaiInstruction)
    || this.hasError(this.autresClauses));
  }
  isConsultMode() {
    return this.consultation;
  }



  /** ENTRETIENS */
  ajouterEntretien(): void {
    if (this.isConsultMode()) { return; }
    this.entretiens.push(this.createEntretien());
  }
  private createEntretien(entretien?: Entretien): FormGroup {
    return this.fb.group({
      'id': [(entretien) ? entretien.id : undefined],
      'date': [(entretien) ? entretien.date : undefined],
      'employeurAssiste': [(entretien) ? entretien.employeurAssiste : undefined],
      'salarieAssiste': [(entretien) ? entretien.salarieAssiste : undefined],
      'nomAssistantEmployeur': [(entretien) ? entretien.nomAssistantEmployeur : undefined, [Validators.maxLength(250)]],
      'nomAssistantSalarie': [(entretien) ? entretien.nomAssistantSalarie : undefined, [Validators.maxLength(250)]],
      'qualiteAssistantEmployeur': [
        (!entretien) ? undefined :
        ((entretien.qualiteAssistantEmployeur && entretien.qualiteAssistantEmployeur.id) ?
        this.findInListById(entretien.qualiteAssistantEmployeur.id, this.listeQualiteAssistantEmployeur) : undefined)
      ],
      'qualiteAssistantSalarie': [
        (!entretien) ? undefined :
        ((entretien.qualiteAssistantSalarie && entretien.qualiteAssistantSalarie.id) ?
        this.findInListById(entretien.qualiteAssistantSalarie.id, this.listeQualiteAssistantSalarie) : undefined)
      ],
    });
  }
  supprimerEntretien(index: number) {
    this.entretiens.removeAt(index);
    // Re-déterminer la date du premier entretien
    this.dateEntretienChange();
  }

  /** Déterminer la date du premier entretien afin de restreindre les date antérieurs dans le champs "Date de signature des parties" */
  dateEntretienChange(): void {
    this.datePremierEntretien = undefined;
    if (this.entretiens && this.entretiens.value.length !== 0) {
     let datePremierEntretien: moment.Moment = moment(this.entretiens.value[0].date);
      for (const e of this.entretiens.value) {
        const dateThisEntretien: moment.Moment = moment(e.date);
        if (dateThisEntretien.isBefore(datePremierEntretien)) {
          datePremierEntretien = dateThisEntretien;
        }
      }
      this.datePremierEntretien = datePremierEntretien.toDate();
    }
  }

  /** Vider les champs si aucun salarié assité */
  radioSalarieAssisteChange(val: boolean, ordreEntretien: number): void {
    if (!val) {
      // Si on coche le bouton "Non", on vide le champ,
      this.entretiens.get('' + ordreEntretien).get('nomAssistantSalarie').setValue(undefined);
      this.entretiens.get('' + ordreEntretien).get('qualiteAssistantSalarie').setValue(undefined);
    }
    // Pour un même entretien, un salarié doit forcément être accompagné si l'employeur l'est
    this.isSalarieAssisteValide(this.entretiens.get('' + ordreEntretien).get('salarieAssiste'), val);
    this.isQualiteAssistantValide(this.entretiens.get('' + ordreEntretien).get('qualiteAssistantSalarie'), val);
  }

  /** Vider les champs si aucun employeur assité */
  radioEmployeurAssisteChange(val: boolean, ordreEntretien: number): void {
    if (!val) {
      // Si on coche le bouton "Non", on vide le champ,
      this.entretiens.get('' + ordreEntretien).get('nomAssistantEmployeur').setValue(undefined);
      this.entretiens.get('' + ordreEntretien).get('qualiteAssistantEmployeur').setValue(undefined);
    }
    this.isQualiteAssistantValide(this.entretiens.get('' + ordreEntretien).get('qualiteAssistantEmployeur'), val);
  }

  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.parentForm.get('id') as FormControl; }
  get remarqueEntretiens(): FormControl { return this.parentForm.get('remarqueEntretiens') as FormControl; }
  get dateSignature(): FormControl { return this.parentForm.get('dateSignature') as FormControl; }
  get dateFinDelaiRetractation(): FormControl { return this.parentForm.get('dateFinDelaiRetractation') as FormControl; }
  get dateFinDelaiInstruction(): FormControl { return this.parentForm.get('dateFinDelaiInstruction') as FormControl; }
  get dateReception(): FormControl { return this.parentForm.get('dateReception') as FormControl; }
  get dateEnvisageeRupture(): FormControl { return this.parentForm.get('dateEnvisageeRupture') as FormControl; }
  get dateTeletransmission(): FormControl { return this.parentForm.get('dateTeletransmission') as FormControl; }
  get autresClauses(): FormControl { return this.parentForm.get('autresClauses') as FormControl; }
  get entretiens(): FormArray { return this.parentForm.get('entretiens') as FormArray; }
    date(i: number): FormControl { return this.entretiens.controls[i].get('date') as FormControl; }
    employeurAssiste(i: number): FormControl { return this.entretiens.controls[i].get('employeurAssiste') as FormControl; }
    salarieAssiste(i: number): FormControl { return this.entretiens.controls[i].get('salarieAssiste') as FormControl; }
    nomAssistantSalarie(i: number): FormControl { return this.entretiens.controls[i].get('nomAssistantSalarie') as FormControl; }
    nomAssistantEmployeur(i: number): FormControl { return this.entretiens.controls[i].get('nomAssistantEmployeur') as FormControl; }
    qualiteAssistantSalarie(i: number): FormControl { return this.entretiens.controls[i].get('qualiteAssistantSalarie') as FormControl; }
  qualiteAssistantEmployeur(i: number): FormControl { return this.entretiens.controls[i].get('qualiteAssistantEmployeur') as FormControl; }
  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }
  hasArrayError(array: FormArray): Boolean {
    return array.invalid && (array.dirty || array.touched || this.submitted);
  }
  ///// FORMULAIRE - SETTERS
  setDateFinDelaiInstruction(val: any): void { this.dateFinDelaiInstruction.setValue(val); }
  setDateFinDelaiRetractation(val: any): void { this.dateFinDelaiRetractation.setValue(val); }
  setDateTeletransmission(val: any): void { this.dateTeletransmission.setValue(val); }


  ////// VALIDATION IMPORTANTES ///////////
  isDateSignatureRenseigne() {
    return this.dateSignature && this.dateSignature.value;
  }
  isDateSignaturePosterieurEntretien() {
    if (this.datePremierEntretien && this.dateSignature && this.dateSignature.value) {
      const datePremierEntretien: moment.Moment = moment(this.datePremierEntretien);
      const dateSignature: moment.Moment = moment(this.dateSignature.value);
      return dateSignature.isSameOrAfter(datePremierEntretien);
    }
    return true;
  }
  isDateEnvisageeRuptureValide(dateEnvisageeRupture: Date, dateFinDelaiInstruction: Date): boolean {
    const dateEnvisageeRup: moment.Moment = moment(dateEnvisageeRupture);
    const dateFinDelaiIns: moment.Moment = moment(dateFinDelaiInstruction);
    if (dateEnvisageeRupture !== null && dateFinDelaiInstruction !== null) {
      return dateEnvisageeRup.isAfter(dateFinDelaiIns);
    }
      return true;
  }

  isDateFinDelaiRetractationValide(dateFinDelaiRetractation: Date, controle: Date): boolean {
    const dateFDR: moment.Moment = moment(dateFinDelaiRetractation);
    const dateFDRControle: moment.Moment = moment(controle);
    if (dateFinDelaiRetractation !== null && controle !== undefined) {
      return dateFDR.isAfter(dateFDRControle);
    }
    return true;
  }

  isQualiteAssistantValide(qualiteAssistant: AbstractControl, isAssiste): boolean {
    if (qualiteAssistant) {
      return !isAssiste || (qualiteAssistant.value && isAssiste);
    }
    return true;
  }

  /** @description: si employeur assisté, salarié doit l'être aussi  */
  isSalarieAssisteValide(salarieAssiste: AbstractControl, isEmpAssiste): boolean {
    if (salarieAssiste) {
      return !isEmpAssiste || (salarieAssiste.value && isEmpAssiste);
    }
    return true;
  }

  isAuMoinsUnEntretienRenseigne(entretiens: FormArray): boolean {
    if (entretiens && entretiens.value && entretiens.value.length > 0) {
      let foundEntretien = false;
      entretiens.value.forEach( e => {
        if (e.date) { foundEntretien = true; }
      });
      return foundEntretien;
    }
    return true;
  }

  ////// UTILS
  supprimerDate(control: FormControl) {
    if (control && control.enabled) {
      control.setValue(undefined);
      control.markAsTouched();
    }
  }
  findInListById(_id: number, _liste: any[]) {
    return _liste.find((val) => {
      return val.id === _id;
    });
  }

}
