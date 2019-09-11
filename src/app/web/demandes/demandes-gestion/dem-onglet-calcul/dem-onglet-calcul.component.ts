import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormGroupDirective, Validators, FormControl, ControlContainer } from '@angular/forms';
import { Subject } from 'rxjs';
import { Demande } from 'src/app/modeles/demande.model';
import * as moment from 'moment';
import { DemandeService } from 'src/app/services/crud/demande.service';


@Component({
  selector: 'app-dem-onglet-calcul',
  templateUrl: './dem-onglet-calcul.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class DemOngletCalculComponent implements OnInit {
  @Input() parentSendSubmitted: Subject<boolean>;
  public readonly MOIS = [
    {intitule: 'Janvier', ordre: 1}, {intitule: 'Février', ordre: 2}, {intitule: 'Mars', ordre: 3},
    {intitule: 'Avril', ordre: 4}, {intitule: 'Mai', ordre: 5}, {intitule: 'Juin', ordre: 6},
    {intitule: 'Juillet', ordre: 7}, {intitule: 'Août', ordre: 8}, {intitule: 'Septembre', ordre: 9},
    {intitule: 'Octobre', ordre: 10}, {intitule: 'Novembre', ordre: 11}, {intitule: 'Décembre', ordre: 12}
  ];
  public ANNEES = [];
  public moisAnneeRemuneration = []; /* Tableau sur lequel on boucle dans le DOM pour créer les 12 cases de rémunération */
  // FORMULAIRE
  private parentForm: FormGroup;
  public moyenneRemunerationMensuelleAutomatique: number;
  private submitted = false; // Synchronisé avec celui du parent
  // TELECHARGEMENT
  @ViewChild('downloadLinkConvColl') private downloadLink: ElementRef;
  public isDownloading = false;

  constructor(
    private parent: FormGroupDirective,
    private fb: FormBuilder,
    private demandeService: DemandeService
  ) { }

  ngOnInit() {
    // EVENEMENTS PARENT
    if (this.parentSendSubmitted) {
      this.parentSendSubmitted.subscribe(submitted => {
        this.submitted = submitted;
      });
    }
    // Get Actuel year;
    const dateToday = new Date();
    // const myMoment: moment.Moment = moment();
    for (let i = 1; i >= -7; i--) {
      this.ANNEES.push(dateToday.getFullYear() + i);
    }
    // Initialisation du formulaire
    this.parentForm = this.parent.form;
    this.parentForm.addControl('remuneration', this.fb.group({
      'id': [undefined],
      'anciennete': [undefined],
      'ancienneteMois': [undefined],
      'ancienneteAnnee': [undefined],
      'moisDernierMois': [undefined],
      'anneeDernierMois': [undefined],
      'mois1Valeur': [undefined],
      'mois2Valeur': [undefined],
      'mois3Valeur': [undefined],
      'mois4Valeur': [undefined],
      'mois5Valeur': [undefined],
      'mois6Valeur': [undefined],
      'mois7Valeur': [undefined],
      'mois8Valeur': [undefined],
      'mois9Valeur': [undefined],
      'mois10Valeur': [undefined],
      'mois11Valeur': [undefined],
      'mois12Valeur': [undefined],
      'prime': [undefined],
      'remunerationDernierMois': [undefined],
      'moyenneRemunerationMensuelle': [undefined],
      'indemnite': [undefined],
      'indemniteLegale': [undefined],
      'indemniteConventionnelle': [undefined],
      'commentaire': [undefined, [Validators.maxLength(10000)]]

    }));
    // OnChange sur la valeur du mois du dernier mois rémunéré
    this.moisDernierMois.valueChanges.subscribe( moisDernierMois => {
      if (this.anneeDernierMois !== null &&
          this.anneeDernierMois.value !== null && this.anneeDernierMois.value !== '' &&
          moisDernierMois !== null && moisDernierMois !== '') {
        this.callInitialiserTableau();
        // dès que le tableau sera généré, il sera automatiquement pré-rempli
        // avec la valeur du champ de la rémunération du dernier mois connu.
        this.focusOutRemunerationDernierMois();
      } else {
        this.viderRemunerationsInactives();
        this.calculRemunerationMoyenne();
      }
    });
    // OnChange sur la valeur de l'année du dernier mois rémunérée
    this.anneeDernierMois.valueChanges.subscribe( anneeDernierMois => {
      if (this.moisDernierMois !== null &&
          this.moisDernierMois.value !== null && this.moisDernierMois.value !== '' &&
          anneeDernierMois !== null && anneeDernierMois !== '') {
        this.callInitialiserTableau();
        // dès que le tableau sera généré, il sera automatiquement pré-rempli
        // avec la valeur du champ de la rémunération du dernier mois connu.
        this.focusOutRemunerationDernierMois();
      } else {
        this.viderRemunerationsInactives();
        this.calculRemunerationMoyenne();
      }
    });
  }


  /** BEFORE / AFTER PATCH PRINCIPAL FORM */
  beforePatchPrincipalForm(dem: Demande) {}
  afterPatchPrincipalForm(dem: Demande) {
    if (this.anciennete && this.anciennete.value) {
      this.setancienneteAnnee(Math.floor( this.anciennete.value / 12 ));
      this.setancienneteMois(this.anciennete.value % 12);
      this.focusOutRemunerationDernierMois();
    }
    // Call calculRemunerationMoyenne() -- Initialisation du calcul automatique après ouverture de la page
    this.calculRemunerationMoyenne();
  }
  // Méthodes de contrôle du formulaire
  isOngletValid(): boolean {
    if (this.parentForm && this.remuneration) {
      return this.remuneration.valid;
    }
    return false;
  }
  isOngletWarn(): boolean {
    return this.parentForm &&
     !(this.isMoyenneRemunerationBruteValide(this.moyenneRemunerationMensuelle, this.moyenneRemunerationMensuelleAutomatique) &&
     this.isIndemniteProposeNotNull(this.indemnite) &&
     this.isIndemniteProposeValide(this.indemnite, this.indemniteLegale) &&
     this.isIndemniteProposeValide(this.indemnite, this.indemniteConventionnelle) &&
     this.isAncienneteValide() && this.isMoisDernierMoisValide() && this.isAnneeDernierMoisValide()
     && this.isAllCaseMoisRemunValides());
  }
  isOngletInvalid(): Boolean {
    if (this.parentForm && this.remuneration) {
      return this.remuneration.invalid && (this.remuneration.dirty || this.remuneration.touched || this.submitted);
    }
    return false;
  }

  /** FocusOut sur la valeur de l'ancienneté - MOIS */
  focusOutAncienneteDernierMois(val: Number) {
    if (val !== undefined && val !== null) {
      let anciennete = 0;
      if (this.ancienneteMois !== null && this.ancienneteMois.value !== null) {anciennete = this.ancienneteMois.value; }
      if (this.ancienneteAnnee !== null && this.ancienneteAnnee.value !== null) {
        anciennete = anciennete + this.ancienneteAnnee.value * 12;
      }
      this.setanciennete(anciennete);
    }
    this.viderRemunerationsInactives();
    this.calculRemunerationMoyenne();
  }

  /** FocusOut sur la valeur de l'ancienneté - ANNEE */
  focusOutAncienneteDerniereAnnee(val: Number) {
    if (val !== undefined && val !== null) {
      let anciennete = 0;
      if (this.ancienneteMois !== null && this.ancienneteMois.value !== null) {anciennete = this.ancienneteMois.value; }
      if (this.ancienneteAnnee !== null && this.ancienneteAnnee.value !== null) {
        anciennete = anciennete + this.ancienneteAnnee.value * 12;
      }
      this.setanciennete(anciennete);
    }
    this.viderRemunerationsInactives();
    this.calculRemunerationMoyenne();
  }
  viderRemunerationsInactives(): void {
    const anc = this.anciennete.value;
    const m = this.moisDernierMois.value;
    const a = this.anneeDernierMois.value;

    if (m === null || a === null || anc === null || anc === undefined || anc <= 11) { this.setMois12Valeur(null); }
    if (m === null || a === null || anc === null || anc === undefined || anc <= 10) { this.setMois11Valeur(null); }
    if (m === null || a === null || anc === null || anc === undefined || anc <= 9)  { this.setMois10Valeur(null); }
    if (m === null || a === null || anc === null || anc === undefined || anc <= 8)  { this.setMois9Valeur(null); }
    if (m === null || a === null || anc === null || anc === undefined || anc <= 7)  { this.setMois8Valeur(null); }
    if (m === null || a === null || anc === null || anc === undefined || anc <= 6)  { this.setMois7Valeur(null); }
    if (m === null || a === null || anc === null || anc === undefined || anc <= 5)  { this.setMois6Valeur(null); }
    if (m === null || a === null || anc === null || anc === undefined || anc <= 4)  { this.setMois5Valeur(null); }
    if (m === null || a === null || anc === null || anc === undefined || anc <= 3)  { this.setMois4Valeur(null); }
    if (m === null || a === null || anc === null || anc === undefined || anc <= 2)  { this.setMois3Valeur(null); }
    if (m === null || a === null || anc === null || anc === undefined || anc <= 1)  { this.setMois2Valeur(null); }
    if (m === null || a === null || anc === null || anc === undefined || anc === 0) { this.setMois1Valeur(null); }
  }

  calculRemunerationMoyenne(): void {
    let M1 = 0;         // Moyenne des 12 derniers salaires mensuels
    let M2 = 0;         // Moyenne des 3 derniers salaires mensuels
    let nombreMois = 0;

    // Calcul M2
    if (this.mois1Valeur.value !== null) { M2 = M2 + this.mois1Valeur.value; M1 = M1 + this.mois1Valeur.value; nombreMois++; }
    if (this.mois2Valeur.value !== null) { M2 = M2 + this.mois2Valeur.value; M1 = M1 + this.mois2Valeur.value; nombreMois++; }
    if (this.mois3Valeur.value !== null) { M2 = M2 + this.mois3Valeur.value; M1 = M1 + this.mois3Valeur.value; nombreMois++; }
    if (M2 !== undefined && nombreMois !== 0) { M2 = M2 / nombreMois; }

    // Calcul M1
    if (this.mois4Valeur.value !== null) { M1 = M1 + this.mois4Valeur.value; nombreMois++; }
    if (this.mois5Valeur.value !== null) { M1 = M1 + this.mois5Valeur.value; nombreMois++; }
    if (this.mois6Valeur.value !== null) { M1 = M1 + this.mois6Valeur.value; nombreMois++; }
    if (this.mois7Valeur.value !== null) { M1 = M1 + this.mois7Valeur.value; nombreMois++; }
    if (this.mois8Valeur.value !== null) { M1 = M1 + this.mois8Valeur.value; nombreMois++; }
    if (this.mois9Valeur.value !== null) { M1 = M1 + this.mois9Valeur.value; nombreMois++; }
    if (this.mois10Valeur.value !== null) { M1 = M1 + this.mois10Valeur.value; nombreMois++; }
    if (this.mois11Valeur.value !== null) { M1 = M1 + this.mois11Valeur.value; nombreMois++; }
    if (this.mois12Valeur.value !== null) { M1 = M1 + this.mois12Valeur.value; nombreMois++; }
    if (this.prime.value !== null && nombreMois !== 0) { M2 = M2 - this.prime.value / 3 + this.prime.value / nombreMois; }
    if (M1 !== undefined && nombreMois !== 0) { M1 = M1 / nombreMois; }

    // Choix de la moyenne la plus élevée
    this.moyenneRemunerationMensuelleAutomatique = M1 > M2 ? M1 : M2;
    this.isMoyenneRemunerationBruteValide(this.moyenneRemunerationMensuelle, this.moyenneRemunerationMensuelleAutomatique);

    // Calcul indemnité Legale
    this.calculIndemniteLegale();
  }

  calculIndemniteLegale(): void {
    let A: number;
    let m: number;
    let I: number;
    if (this.anciennete.value !== null) {
      A = Math.floor(this.anciennete.value / 12);
      m = this.anciennete.value % 12;
      if (A < 10 || (A === 10 && m === 0)) {
        I = 0.25 * ( A + m / 12) * this.moyenneRemunerationMensuelleAutomatique;
      } else {
        I = ( 0.25 * ( A + m / 12) * this.moyenneRemunerationMensuelleAutomatique ) +
            ( (1 / 12) * ( A - 10 + m / 12 ) * this.moyenneRemunerationMensuelleAutomatique);
      }
      this.setIndemniteLegale(Number(I.toFixed(2)));
    }
    this.isIndemniteProposeValide(this.indemnite, this.indemniteLegale);
    this.isIndemniteProposeValide(this.indemnite, this.indemniteConventionnelle);
  }

  callInitialiserTableau(): void {
    this.moisAnneeRemuneration = []; // Tableau sur lequel on itère dans le DOM pour créer les 12 cases (ou moins) de rémunération
    let date: moment.Moment = moment(this.moisDernierMois.value + '/01/' + this.anneeDernierMois.value);
    this.initialiserTableauMoisRemuneration(date.month() + 1, date.year());
    for (let i = 1; i < 12; i++ ) {
      date = date.subtract(1, 'months');
      this.initialiserTableauMoisRemuneration(date.month() + 1, date.year());
    }
  }

  initialiserTableauMoisRemuneration(mois: Number, annee: Number): void {
    const moisIntitule = this.MOIS.find((val) => {
      return val.ordre === mois;
    });
    this.moisAnneeRemuneration.push({mois: moisIntitule.intitule, annee: annee});
  }

  /** Si la rémunération du dernier mois change, on repércute sa valeur dans les mois vide */
  focusOutRemunerationDernierMois(): void {
    const remunerationDernierMois = this.remunerationDernierMois.value;
    let isOneMonthChanged = false;
    if (this.mois1Valeur.value === null || this.mois1Valeur.value === '') {
      this.setMois1Valeur(remunerationDernierMois); isOneMonthChanged = true;
      }
    if (this.mois2Valeur.value === null || this.mois2Valeur.value === '') {
      this.setMois2Valeur(remunerationDernierMois); isOneMonthChanged = true;
      }
    if (this.mois3Valeur.value === null || this.mois3Valeur.value === '') {
      this.setMois3Valeur(remunerationDernierMois); isOneMonthChanged = true;
      }
    if (this.mois4Valeur.value === null || this.mois4Valeur.value === '') {
      this.setMois4Valeur(remunerationDernierMois); isOneMonthChanged = true;
      }
    if (this.mois5Valeur.value === null || this.mois5Valeur.value === '') {
      this.setMois5Valeur(remunerationDernierMois); isOneMonthChanged = true;
      }
    if (this.mois6Valeur.value === null || this.mois6Valeur.value === '') {
      this.setMois6Valeur(remunerationDernierMois); isOneMonthChanged = true;
      }
    if (this.mois7Valeur.value === null || this.mois7Valeur.value === '') {
      this.setMois7Valeur(remunerationDernierMois); isOneMonthChanged = true;
      }
    if (this.mois8Valeur.value === null || this.mois8Valeur.value === '') {
      this.setMois8Valeur(remunerationDernierMois); isOneMonthChanged = true;
       }
    if (this.mois9Valeur.value === null || this.mois9Valeur.value === '') {
      this.setMois9Valeur(remunerationDernierMois); isOneMonthChanged = true;
      }
    if (this.mois10Valeur.value === null || this.mois10Valeur.value === '') {
      this.setMois10Valeur(remunerationDernierMois); isOneMonthChanged = true;
      }
    if (this.mois11Valeur.value === null || this.mois11Valeur.value === '') {
      this.setMois11Valeur(remunerationDernierMois); isOneMonthChanged = true;
       }
    if (this.mois12Valeur.value === null || this.mois12Valeur.value === '') {
      this.setMois12Valeur(remunerationDernierMois); isOneMonthChanged = true;
    }
    this.viderRemunerationsInactives();
    if (isOneMonthChanged) {this.calculRemunerationMoyenne(); }
  }

  demandeTelechargerIndemConv(): void {
    if (this.isDownloading) { return; }
    this.isDownloading = true;
    this.demandeService.downloadFichierConventionCollective(
      (this.conventionCollective.value) ? this.conventionCollective.value.codeIdcc : '',
      (this.remuneration.value),
       this.downloadLink,
      (() => {this.isDownloading = false; })
    );
  }


  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.parentForm.get('id') as FormControl; }
  get createMode(): Boolean { return !this.id.value; }
  get remuneration(): FormControl { return this.parentForm.get('remuneration') as FormControl; }
  get anciennete(): FormControl { return this.remuneration.get('anciennete') as FormControl; }
  get ancienneteMois(): FormControl { return this.remuneration.get('ancienneteMois') as FormControl; }
  get ancienneteAnnee(): FormControl { return this.remuneration.get('ancienneteAnnee') as FormControl; }
  get moisDernierMois(): FormControl { return this.remuneration.get('moisDernierMois') as FormControl; }
  get anneeDernierMois(): FormControl { return this.remuneration.get('anneeDernierMois') as FormControl; }

  get mois1Valeur(): FormControl { return this.remuneration.get('mois1Valeur') as FormControl; }
  get mois2Valeur(): FormControl { return this.remuneration.get('mois2Valeur') as FormControl; }
  get mois3Valeur(): FormControl { return this.remuneration.get('mois3Valeur') as FormControl; }
  get mois4Valeur(): FormControl { return this.remuneration.get('mois4Valeur') as FormControl; }
  get mois5Valeur(): FormControl { return this.remuneration.get('mois5Valeur') as FormControl; }
  get mois6Valeur(): FormControl { return this.remuneration.get('mois6Valeur') as FormControl; }
  get mois7Valeur(): FormControl { return this.remuneration.get('mois7Valeur') as FormControl; }
  get mois8Valeur(): FormControl { return this.remuneration.get('mois8Valeur') as FormControl; }
  get mois9Valeur(): FormControl { return this.remuneration.get('mois9Valeur') as FormControl; }
  get mois10Valeur(): FormControl { return this.remuneration.get('mois10Valeur') as FormControl; }
  get mois11Valeur(): FormControl { return this.remuneration.get('mois11Valeur') as FormControl; }
  get mois12Valeur(): FormControl { return this.remuneration.get('mois12Valeur') as FormControl; }
  get prime(): FormControl { return this.remuneration.get('prime') as FormControl; }
  get remunerationDernierMois(): FormControl { return this.remuneration.get('remunerationDernierMois') as FormControl; }
  get moyenneRemunerationMensuelle(): FormControl { return this.remuneration.get('moyenneRemunerationMensuelle') as FormControl; }
  get indemnite(): FormControl { return this.remuneration.get('indemnite') as FormControl; }
  get indemniteLegale(): FormControl { return this.remuneration.get('indemniteLegale') as FormControl; }
  get indemniteConventionnelle(): FormControl { return this.remuneration.get('indemniteConventionnelle') as FormControl; }
  get commentaire(): FormControl { return this.remuneration.get('commentaire') as FormControl; }
  // Pour fichier aide Excel IDCC
  get salarie(): FormControl { return this.parentForm.get('salarie') as FormControl; }
  get conventionCollective(): FormControl { return this.salarie.get('conventionCollective') as FormControl; }

  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }
  ///// FORMULAIRE - SETTERS
  setanciennete(val: Number) { this.anciennete.setValue(val); }
  setancienneteMois(val: Number) { this.ancienneteMois.setValue(val); }
  setancienneteAnnee(val: Number) { this.ancienneteAnnee.setValue(val); }
  setMois1Valeur(val: Number) { this.mois1Valeur.setValue(val); }
  setMois2Valeur(val: Number) { this.mois2Valeur.setValue(val); }
  setMois3Valeur(val: Number) { this.mois3Valeur.setValue(val); }
  setMois4Valeur(val: Number) { this.mois4Valeur.setValue(val); }
  setMois5Valeur(val: Number) { this.mois5Valeur.setValue(val); }
  setMois6Valeur(val: Number) { this.mois6Valeur.setValue(val); }
  setMois7Valeur(val: Number) { this.mois7Valeur.setValue(val); }
  setMois8Valeur(val: Number) { this.mois8Valeur.setValue(val); }
  setMois9Valeur(val: Number) { this.mois9Valeur.setValue(val); }
  setMois10Valeur(val: Number) { this.mois10Valeur.setValue(val); }
  setMois11Valeur(val: Number) { this.mois11Valeur.setValue(val); }
  setMois12Valeur(val: Number) { this.mois12Valeur.setValue(val); }
  setIndemniteLegale(val: Number) { this.indemniteLegale.setValue(val); }


  ///// VALIDATIONS IMPORTANTES
  isMoyenneRemunerationBruteValide(moyenneRemunerationMensuelle: FormControl, moyenneRemunerationMensuelleAutomatique): boolean {
    if (moyenneRemunerationMensuelle && moyenneRemunerationMensuelleAutomatique) {
      return moyenneRemunerationMensuelle.value >=  Number(moyenneRemunerationMensuelleAutomatique.toFixed(2));
    }
    return false;
  }

  isIndemniteProposeNotNull(indemnitePropose: FormControl): boolean {
    return indemnitePropose !== null && indemnitePropose.value !== null;
  }
  isIndemniteProposeValide(indemnitePropose: FormControl, indemnite: FormControl): boolean {
    if (indemnitePropose !== undefined && indemnite !== undefined) {
      return indemnitePropose.value >=  indemnite.value;
    }
    return false;
  }

  isMoisRemunValide(i: number): boolean {
    if ( i === 0 && this.mois1Valeur.value !== '' && this.mois1Valeur.value !== null ) { return true; }
    if ( i === 1 && this.mois2Valeur.value !== '' && this.mois2Valeur.value !== null ) { return true; }
    if ( i === 2 && this.mois3Valeur.value !== '' && this.mois3Valeur.value !== null ) { return true; }
    if ( i === 3 && this.mois4Valeur.value !== '' && this.mois4Valeur.value !== null ) { return true; }
    if ( i === 4 && this.mois5Valeur.value !== '' && this.mois5Valeur.value !== null ) { return true; }
    if ( i === 5 && this.mois6Valeur.value !== '' && this.mois6Valeur.value !== null ) { return true; }
    if ( i === 6 && this.mois7Valeur.value !== '' && this.mois7Valeur.value !== null ) { return true; }
    if ( i === 7 && this.mois8Valeur.value !== '' && this.mois8Valeur.value !== null ) { return true; }
    if ( i === 8 && this.mois9Valeur.value !== '' && this.mois9Valeur.value !== null ) { return true; }
    if ( i === 9 && this.mois10Valeur.value !== '' && this.mois10Valeur.value !== null ) { return true; }
    if ( i === 10 && this.mois11Valeur.value !== '' && this.mois11Valeur.value !== null ) { return true; }
    if ( i === 11 && this.mois12Valeur.value !== '' && this.mois12Valeur.value !== null ) { return true; }
    return false;
  }

  isCaseInactive(i: number): boolean {
    return (this.anciennete.value < i + 1) || !this.moisDernierMois.value || !this.anneeDernierMois.value;
  }
  isAllCaseMoisRemunValides(): boolean {
    let caseValide = true;
    for ( let i = 0; i <= 11; i++) {
      if (!this.isCaseInactive(i)) {
        caseValide = this.isCaseMoisRemunValide(i);
        if (!caseValide) { break; }
      }
    }
    return caseValide;
  }
  isCaseMoisRemunValide(i: number): boolean {
    return this.isMoisRemunValide(i) || this.isCaseInactive(i) || this.moyenneRemunerationMensuelleAutomatique > 0;
  }
  isAncienneteValide(): boolean {
    return this.anciennete.value !== null && this.anciennete.value !== 0;
  }
  isMoisDernierMoisValide(): boolean {
    return this.moisDernierMois.value !== null;
  }
  isAnneeDernierMoisValide(): boolean {
    return this.anneeDernierMois.value !== null;
  }

}
