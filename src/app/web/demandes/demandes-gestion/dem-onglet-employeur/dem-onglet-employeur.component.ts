import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormGroupDirective, Validators, FormControl, ControlContainer } from '@angular/forms';
import { SearchRequestDto } from 'src/app/modeles/recherche/search-request.dto';
import { Localisation } from 'src/app/modeles/localisation.model';
import { Observable, Subject } from 'rxjs';
import { LocalisationService } from 'src/app/services/crud/localisation.service';
import { DemandeService } from 'src/app/services/crud/demande.service';
import { startWith, map } from 'rxjs/operators';
import { SearchResponseDto } from 'src/app/modeles/recherche/search-response.dto';
import { Pays } from 'src/app/modeles/pays.model';
import { Ape } from 'src/app/modeles/ape.model';
import { Adresse } from 'src/app/modeles/adresse.model';
import { Demande } from 'src/app/modeles/demande.model';
import { MSG_ALERTE_DEMANDE } from 'src/app/constantes/msg-alerte-demande.enum';
import { CODE_PAYS } from 'src/app/constantes/referentiel/code-pays.enum';
import { isNumeroSiret } from 'src/app/directives/validators/numero-siret.validators';
import { DemOngletControleComponent } from 'src/app/web/demandes/demandes-gestion/dem-onglet-controle/dem-onglet-controle.component';
import { Employeur } from 'src/app/modeles/employeur.model';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { ToasterService } from 'angular2-toaster';
import { HttpErrorResponse } from '@angular/common/http';
import { CODE_HTTP } from 'src/app/constantes/code-http.enum';



@Component({
  selector: 'app-dem-onglet-employeur',
  templateUrl: './dem-onglet-employeur.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class DemOngletEmployeurComponent implements OnInit {
  @Input() parentSendSubmitted: Subject<boolean>;
  @Input() parentIsConsultation: Subject<boolean>;
  @Input() listePays: Pays[];
  @Input() listeAPE: Ape[];
  // Sibling component
  @Input() demOngletControleComp: DemOngletControleComponent;

  // FORMULAIRE
  private parentForm: FormGroup;
  private submitted = false; // Synchronisé avec celui du parent
  private consultation = false; // Synchronisé avec celui du parent
  public callingSirene = false; // Quand appel WS SIRENE en cours

  public readonly CODE_PAYS = CODE_PAYS;
   // Autocomplétion
   autocompleteRequestDto: SearchRequestDto;
   localisations: Localisation[] = [];
   filteredLocalisations: Observable<Localisation[]>;
  constructor(
    private parent: FormGroupDirective,
    private fb: FormBuilder,
    private svcLoc: LocalisationService,
    private demandeSvc: DemandeService,
    private toasterService: ToasterService
  ) {}

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
    this.parentForm.addControl('employeur', this.fb.group({
      'id': [undefined],
      'siret': ['', [Validators.required, Validators.maxLength(250), isNumeroSiret()]],
      'urssaf': ['', [Validators.required, Validators.maxLength(250)]],
      'raisonSociale': ['', [Validators.required, Validators.maxLength(250)]],
      'ape': [undefined],
      'nomSignataire': ['', [Validators.maxLength(250)]],
      'effectif': [undefined, [Validators.pattern('[0-9]{1,9}'), Validators.maxLength(10)]],
      'telephone': ['', [Validators.maxLength(20)]],
      'courriel': ['', [Validators.maxLength(250), Validators.email]],
      'adresse': this.fb.group({
        'id': [undefined],
        'voie': ['', [Validators.required, Validators.maxLength(250)]],
        'complement': ['', [Validators.maxLength(250)]],
        'infosEtranger': ['', [Validators.maxLength(250)]],
        'pays': [undefined, [Validators.required]],
        'localisation': [undefined, [Validators.required]],
        'bp': ['', [Validators.maxLength(250)]],
      }),
      'adresseCorrespondance': this.fb.group({
        'id': [undefined],
        'voie': ['', [Validators.maxLength(250)]],
        'complement': ['', [Validators.maxLength(250)]],
        'infosEtranger': ['', [Validators.maxLength(250)]],
        'pays': [undefined],
        'localisation': [undefined],
        'bp': ['', [Validators.maxLength(250)]],
      })
    }));
    this.autocompleteRequestDto = new SearchRequestDto();
    this.autocompleteRequestDto.updateTris('commune');
  }

  /** BEFORE / AFTER PATCH PRINCIPAL FORM */
  beforePatchPrincipalForm(dem: Demande) {
    // Initialiser l'adresse et l'adresse de correpondance de l'employeur dans la demande récupérée si elle sont null
    if (!dem.employeur.adresse) { dem.employeur.adresse = new Adresse(); }
    if (!dem.employeur.adresseCorrespondance) { dem.employeur.adresseCorrespondance = new Adresse(); }
  }
  afterPatchPrincipalForm(dem: Demande) {
    // Patch les listes déroulantes de la vue employeur + règle disabled
    if (this.employeur !== null) {
      if (this.employeurSiret && this.employeurSiret.value) {
        this.employeurUrssaf.disable();
        this.startGetDemSimilaires();
      } else if (this.employeurUrssaf && this.employeurUrssaf.value) {
        this.employeurSiret.disable();
        this.startGetDemSimilaires();
      }
      this.employeur.patchValue({
        ape: ((dem.employeur && dem.employeur.ape) ? this.findInListById(dem.employeur.ape.id, this.listeAPE) : undefined)
      });
      this.adresse.patchValue({
        pays: ((dem.employeur && dem.employeur.adresse && dem.employeur.adresse.pays) ?
          this.findInListById(dem.employeur.adresse.pays.id, this.listePays) : undefined)
      });
      this.adresseCorrespondance.patchValue({
        pays: ((dem.employeur && dem.employeur.adresseCorrespondance && dem.employeur.adresseCorrespondance.pays) ?
          this.findInListById(dem.employeur.adresseCorrespondance.pays.id, this.listePays) : undefined)
      });
      /** Activer les règles de validation/les désactiver si case "autre adresse" cochée ou non */
      if (this.adresseCorrespondance.value) {
        this.changeAdresseCorr(this.adresseCorrespondance.value.id, undefined);
      }
    }
  }
  initDemandeEmployeur(siret: string, urssaf: string) {
    if (siret) {
      this.employeurSiret.setValue(siret);
      this.siretChange();
    } else if (urssaf) {
      this.employeurUrssaf.setValue(urssaf);
      this.urssafChange();
    }
  }
  // Méthodes de contrôle du formulaire
  isOngletValid(): boolean {
    if (this.parentForm && this.employeur) {
      return this.employeur.valid;
    }
    return false;
  }
  isOngletWarn(): boolean { return false; }
  isOngletInvalid(): Boolean {
    if (this.parentForm && this.employeur) {
      return this.employeur.invalid && this.submitted;
    }
    return false;
  }
  isConsultMode() {
    return this.consultation;
  }


  /// ACTIONS ///
  /** Changement de l'input "siret" => Si === null/vide , urssaf obligatoire. Sinon, urssaf pas obligatoire */
  siretChange(): void {
    this.employeurUrssaf.clearValidators();
    this.demOngletControleComp.reinitOngletControle();  // Vider la liste des demandes dans l'établissement/entreprise
    if (this.employeurSiret && this.employeurSiret.value) {
      this.employeurUrssaf.reset();
      this.employeurUrssaf.disable();

      // APPEL DU WS SIENE
      if (this.employeurSiret.valid) {
        this.callingSirene = true;
        this.callWebserviceSirene();
      }
      this.startGetDemSimilaires();
    } else {
      this.employeurUrssaf.setValidators([Validators.required, Validators.maxLength(250)]);
      this.employeurUrssaf.enable();
    }
    this.employeurUrssaf.updateValueAndValidity();
  }
  private callWebserviceSirene() {
    this.demandeSvc.getWSSieneInfos(this.employeurSiret.value).subscribe((ret: Employeur) => {
      this.fillFormWithEmployeurFromSirene(ret);
      this.callingSirene = false;
    }, (error: Error) => {
      let titreMessageErreur = 'Erreur';
      let messageErreur = 'Une erreur inconnue est survenue. Veuillez réessayer ultérieurement';
      let typeMessage = TYPE_TOAST.ERREUR;
      if (error instanceof HttpErrorResponse) {
        messageErreur += ` (Code ${error.status})`;
        switch (error.status) {
          case CODE_HTTP.CODE_NOT_FOUND : // API INDISPONIBLE
            titreMessageErreur = 'API indisponible';
            messageErreur = `L'API SIRENE est actuellement indisponible.
            Les informations de l'employeur ne peuvent pas être récupérées automatiquement.`;
            typeMessage = TYPE_TOAST.ERREUR;
            break;
          case CODE_HTTP.CODE_ERREUR_MAITRISEE : // SIRET INCONNU
            titreMessageErreur = 'SIRET inconnu';
            messageErreur = `Le SIRET que vous avez saisi semble être inconnu de l'API SIRENE.
            Les informations de l'employeur ne peuvent pas être récupérées automatiquement.`;
            typeMessage = TYPE_TOAST.AVERTISSEMENT;
            break;
          case CODE_HTTP.CODE_ERREUR_VALIDATION :
            titreMessageErreur = 'Établissement fermé';
            messageErreur = `Le SIRET que vous avez saisi fait référence à un établissement fermé.
            Les informations de l'employeur ne peuvent pas être récupérées automatiquement.`;
            typeMessage = TYPE_TOAST.AVERTISSEMENT;
            break;
          default :
            messageErreur = `Une erreur inconnue est survenue. (Code ${error.status})`;
        }
        console.error(`ERREUR SERVEUR, code ${error.status} - ${error.message} - ${error.error}`);
      } else {
        console.error('Une erreur Client est survenue:', error.message);
        messageErreur = `Une erreur inconnue est survenue. (Code ${error.message})`;
        typeMessage = TYPE_TOAST.ERREUR;
      }
      this.toasterService.pop({
        type: typeMessage, title: titreMessageErreur, body: messageErreur
      });
      this.callingSirene = false;
    });
  }
  private fillFormWithEmployeurFromSirene(empSirene: Employeur) {
    if (empSirene) {
      // Nettoyage de l'employeur
      this.employeurRaisonSociale.setValue('');
      this.employeurNomSignataire.setValue('');
      this.employeurEffectif.setValue('');
      this.employeur.patchValue({ape:  undefined});
      this.adresse.patchValue({pays: undefined});
      this.adresseVoie.setValue('');
      this.adresseComplement.setValue('');
      this.adresseBp.setValue('');
      this.adresseLocalisation.setValue(undefined);
      this.adresseInfosEtranger.setValue('');
      // Mise à jour du formulaire avec le retour du WS
      this.employeurRaisonSociale.setValue(empSirene.raisonSociale ? empSirene.raisonSociale : undefined);
      this.employeurNomSignataire.setValue(empSirene.nomSignataire ? empSirene.nomSignataire : undefined);
      this.employeurEffectif.setValue(empSirene.effectif ? empSirene.effectif : undefined);
      this.employeur.patchValue({
        ape: ((empSirene.ape) ? this.findInListById(empSirene.ape.id, this.listeAPE) : undefined)
      });
      if (empSirene.adresse) {
        this.adresse.patchValue({
          pays: ((empSirene.adresse.pays) ? this.findInListById(empSirene.adresse.pays.id, this.listePays)
            : this.findInListByCode(CODE_PAYS.FRANCE, this.listePays))
        });
        this.adressePaysChange();
        this.adresseVoie.setValue(empSirene.adresse.voie ? empSirene.adresse.voie : undefined);
        this.adresseComplement.setValue(empSirene.adresse.complement ? empSirene.adresse.complement : undefined);
        this.adresseBp.setValue(empSirene.adresse.bp ? empSirene.adresse.bp : undefined);
        if (this.adressePays.value.code === CODE_PAYS.FRANCE) {
          this.adresseLocalisation.setValue(empSirene.adresse.localisation ? empSirene.adresse.localisation : undefined);
          this.adresseInfosEtranger.setValue(undefined);
        } else {
          this.adresseLocalisation.setValue(undefined);
          this.adresseInfosEtranger.setValue(empSirene.adresse.infosEtranger ? empSirene.adresse.infosEtranger : undefined);
        }
        this.adresse.updateValueAndValidity();
       }
    }
  }


  /** Changement de l'input "urssaf" => Si === null/vide , siret obligatoire. Sinon, siret pas obligatoire */
  urssafChange(): void {
    this.employeurSiret.clearValidators();
    this.demOngletControleComp.reinitOngletControle();  // Vider la liste des demandes dans l'établissement/entreprise
    if (this.employeurUrssaf && this.employeurUrssaf.value) {
      this.employeurSiret.disable();
      this.startGetDemSimilaires();
    } else {
      this.employeurSiret.enable();
      this.employeurSiret.setValidators([Validators.required, Validators.maxLength(250), isNumeroSiret()]);
    }
    this.employeurSiret.updateValueAndValidity();
  }


  /** OPERATIONS DE LA VUE CONTROLE */
  public startGetDemSimilaires() {
    if (this.dateReception && this.dateReception.value) {
      // APPEL 2 WS ==> Nombre de ruptures conventionnelles dans l'établissement && Nombre de ruptures conventionnelles dans l'entreprise
      if (this.employeurSiret && this.employeurSiret.value && this.employeurSiret.valid) {
        this.getDemSimilairesEtab(this.employeurSiret.value, this.dateReception.value, false);
      } else if (this.employeurUrssaf && this.employeurUrssaf.value && this.employeurUrssaf.valid) {
        // APPEL 1 WS ==> Nombre de ruptures conventionnelles dans l'établissement
        this.getDemSimilairesEtab(this.employeurUrssaf.value, this.dateReception.value, true);
      }
    }
  }
  /** VUE CONTROLE -- Récupération des demandes appartenants au même établissement + Gestion des messages d'alertes */
  private getDemSimilairesEtab(siretUrssaf: string, dateReception: Date, urssaf: boolean): void {
    this.demOngletControleComp.loaderEtab = true;
    this.demOngletControleComp.loaderEntre = true;
    this.demandeSvc.getDemSimilairesEtab(siretUrssaf, dateReception).subscribe(result => {
      if (this.demOngletControleComp !== undefined) {
        this.demOngletControleComp.listeDemSimilairesEtab = result as Demande[];
        const arr1Add = this.demandeSvc.calculSeuils(this.demOngletControleComp.listeDemSimilairesEtab, MSG_ALERTE_DEMANDE.ETABLISSEMENT);
        this.demOngletControleComp.messagesAlerte = this.demOngletControleComp.messagesAlerte.concat(arr1Add);
        if (urssaf) {
          this.demOngletControleComp.listeDemSimilairesEntre = result as Demande[];
          const arr2Add = this.demandeSvc.calculSeuils(this.demOngletControleComp.listeDemSimilairesEntre, MSG_ALERTE_DEMANDE.ENTREPRISE);
          this.demOngletControleComp.messagesAlerte = this.demOngletControleComp.messagesAlerte.concat(arr2Add);
          this.demOngletControleComp.loaderEtab = false;
          this.demOngletControleComp.loaderEntre = false;
          this.demOngletControleComp.operationEtabOk = true;
          this.demOngletControleComp.operationEntrepriseOk = true;
          this.demOngletControleComp.noCalculEntreprise = true;
        } else {
          this.demOngletControleComp.loaderEtab = false;
          this.demOngletControleComp.operationEtabOk = true;
          this.getDemSimilairesEntre(siretUrssaf, dateReception);
        }
      }
    });
  }
  /** VUE CONTROLE -- Récupération des demandes appartenants à la même entreprise + Gestion des messages d'alertes */
  private getDemSimilairesEntre(siret: string, dateReception: Date): void {
    this.demandeSvc.getDemSimilairesEntre(siret, dateReception).subscribe(result => {
      if (this.demOngletControleComp !== undefined) {
        this.demOngletControleComp.listeDemSimilairesEntre = result as Demande[];
        const arr3Add = this.demandeSvc.calculSeuils(this.demOngletControleComp.listeDemSimilairesEntre, MSG_ALERTE_DEMANDE.ENTREPRISE);
        this.demOngletControleComp.messagesAlerte = this.demOngletControleComp.messagesAlerte.concat(arr3Add);
        this.demOngletControleComp.loaderEntre = false;
        this.demOngletControleComp.operationEntrepriseOk = true;
      }
    });
  }



  /** Changement du select pays => Si étranger alors vider les champs de l'adresse */
  adressePaysChange(): void {
    this.adresseVoie.setValue('');
    this.adresseComplement.setValue('');
    this.adresseLocalisation.setValue(undefined);
    this.adresseInfosEtranger.setValue('');
    this.adresseBp.setValue('');
    this.adresseLocalisation.clearValidators();
    this.adresseInfosEtranger.clearValidators();
    if (this.adressePays.value && this.adressePays.value.code === CODE_PAYS.FRANCE) {
      this.adresseLocalisation.setValidators(Validators.required);
    } else {
      this.adresseInfosEtranger.setValidators([Validators.required, Validators.maxLength(250)]);
    }
    this.adresseLocalisation.updateValueAndValidity();
    this.adresseInfosEtranger.updateValueAndValidity();
  }

  /** Changement du select pays (de l'adresse Correspondance) => Si étranger alors vider les champs de l'adresse */
  adresseCorrespondancePaysChange(): void {
    this.adresseCorrespondanceVoie.setValue('');
    this.adresseCorrespondanceComplement.setValue('');
    this.adresseCorrespondanceLocalisation.setValue(undefined);
    this.adresseCorrespondanceInfosEtranger.setValue('');
    this.adresseCorrespondanceBp.setValue('');
    this.adresseCorrespondanceLocalisation.clearValidators();
    this.adresseCorrespondanceInfosEtranger.clearValidators();
    if (this.adresseCorrespondancePays.value && this.adresseCorrespondancePays.value.code === CODE_PAYS.FRANCE) {
      this.adresseCorrespondanceLocalisation.setValidators(Validators.required);
    } else {
      this.adresseCorrespondanceInfosEtranger.setValidators([Validators.required, Validators.maxLength(250)]);
    }
    this.adresseCorrespondanceLocalisation.updateValueAndValidity();
    this.adresseCorrespondanceInfosEtranger.updateValueAndValidity();
  }


  ///// AUTOCOMPLETION - adresse //////
  getAdresseLocalisationsByCode(): void {
    this.autocompleteRequestDto.updateFiltresWithFormGroup(this.fb.group({codePostal: this.adresseLocalisation }));
    this.getAdresseLocalisations(true);
  }
  getAdresseLocalisationsByCommune(): void {
    this.autocompleteRequestDto.updateFiltresWithFormGroup(this.fb.group({commune: this.adresseLocalisation }));
    this.getAdresseLocalisations(false);
  }
  getAdresseLocalisations(isCodePostal: boolean): void {
    this.svcLoc.search(this.autocompleteRequestDto).subscribe((searchResponse: SearchResponseDto) => {
      this.localisations = searchResponse.content as [Localisation];
      this.autocompleteRequestDto.updatePagerFromSearchResponseDto(searchResponse);
      this.filteredLocalisations = this.adresseLocalisation.valueChanges
      .pipe(
        startWith<string | Localisation>(''),
        map(value => typeof value === 'string' ? value : ((value === null || value === undefined) ?
          null : ((isCodePostal) ? value.codePostal : value.commune))),
        map(item => item ? ((isCodePostal) ? this._filterAdresseCodePostal(item) :
            this._filterAdresseCommune(item)) : this.localisations.slice())
      );
    });
  }

  displayValeurCodePostal(loc?: Localisation): string | undefined {
    return typeof loc === 'string' || loc === undefined || loc === null  ? undefined : loc.codePostal;
  }
  displayValeurCommune(loc?: Localisation): string | undefined {
    return typeof loc === 'string' || loc === undefined || loc === null  ? undefined : loc.commune;
  }
  focusOutAdresseLocalisation(): void {
    if (this.adresseLocalisation.value !== undefined && !(this.adresseLocalisation.value instanceof Localisation)) {
      this.adresseLocalisation.setValue('');
      this.adresseLocalisation.updateValueAndValidity();
      this.adresse.updateValueAndValidity();
    }
  }
  selectedAdresseOption() {
    this.adresseLocalisation.setValue(this.adresseLocalisation.value);
    this.adresseLocalisation.updateValueAndValidity();
    this.adresse.updateValueAndValidity();
  }
  private _filterAdresseCodePostal(value: string): Localisation[] {
    return this.localisations.filter(loc => loc.codePostal.toLowerCase().indexOf(value) === 0);
  }
  private _filterAdresseCommune(value: string): Localisation[] {
    return this.localisations.filter(loc => loc.commune.toLowerCase().indexOf(value) === 0);
  }


  ////// ADRESSE CORRESPONDANCE ///////
  changeAdresseCorr(val: boolean, a: HTMLInputElement): void {
    if (!val) {
      this.adresseCorrespondance.reset();
      this.adresseCorrespondanceVoie.clearValidators();
      this.adresseCorrespondancePays.clearValidators();
      this.adresseCorrespondanceLocalisation.clearValidators();
      this.adresseCorrespondanceInfosEtranger.clearValidators();
      this.adresseCorrespondanceVoie.updateValueAndValidity();
      this.adresseCorrespondancePays.updateValueAndValidity();
      this.adresseCorrespondanceLocalisation.updateValueAndValidity();
      this.adresseCorrespondanceInfosEtranger.updateValueAndValidity();
    } else {
      this.adresseCorrespondanceVoie.clearValidators();
      this.adresseCorrespondancePays.clearValidators();
      this.adresseCorrespondanceLocalisation.clearValidators();
      this.adresseCorrespondanceInfosEtranger.clearValidators();
      this.adresseCorrespondancePays.setValidators(Validators.required);
      this.adresseCorrespondanceVoie.setValidators([Validators.required, Validators.maxLength(250)]);
      if (this.adresseCorrespondancePays.value && this.adresseCorrespondancePays.value.code === CODE_PAYS.FRANCE) {
        this.adresseCorrespondanceLocalisation.setValidators(Validators.required);
      } else {
        this.adresseCorrespondanceInfosEtranger.setValidators([Validators.required, Validators.maxLength(250)]);
      }
      this.adresseCorrespondanceVoie.updateValueAndValidity();
      this.adresseCorrespondancePays.updateValueAndValidity();
      this.adresseCorrespondanceLocalisation.updateValueAndValidity();
      this.adresseCorrespondanceInfosEtranger.updateValueAndValidity();
    }
  }
  /////// AUTOCOMPLETION - adresse correspondance ///////
  getAdresseCorrespondanceLocalisationsByCode(): void {
    this.autocompleteRequestDto.updateFiltresWithFormGroup(this.fb.group({codePostal: this.adresseCorrespondanceLocalisation }));
    this.getAdresseCorrespondanceLocalisations(true);
  }
  getAdresseCorrespondanceLocalisationsByCommune(): void {
    this.autocompleteRequestDto.updateFiltresWithFormGroup(this.fb.group({commune: this.adresseCorrespondanceLocalisation }));
    this.getAdresseCorrespondanceLocalisations(false);
  }
  getAdresseCorrespondanceLocalisations(isCodePostal: boolean): void {
    this.svcLoc.search(this.autocompleteRequestDto).subscribe((searchResponse: SearchResponseDto) => {
      this.localisations = searchResponse.content as [Localisation];
      this.autocompleteRequestDto.updatePagerFromSearchResponseDto(searchResponse);
      this.filteredLocalisations = this.adresseCorrespondanceLocalisation.valueChanges
      .pipe(
        startWith<string | Localisation>(''),
        map(value => typeof value === 'string' ? value : ((value === null || value === undefined) ?
          null : ((isCodePostal) ? value.codePostal : value.commune))),
        map(item => item ? ((isCodePostal) ? this._filterAdresseCorrespondanceCodePostal(item) :
            this._filterAdresseCorrespondanceCommune(item)) : this.localisations.slice())
      );
    });
  }

  focusOutAdresseCorrespondanceLocalisation(): void {
    if (this.adresseCorrespondanceLocalisation.value !== undefined &&
       !(this.adresseCorrespondanceLocalisation.value instanceof Localisation)) {
      this.adresseCorrespondanceLocalisation.setValue('');
      this.adresseCorrespondanceLocalisation.updateValueAndValidity();
      this.adresseCorrespondance.updateValueAndValidity();
    }
  }
  selectedAdresseCorrespondanceOption() {
    this.adresseCorrespondanceLocalisation.setValue(this.adresseCorrespondanceLocalisation.value);
    this.adresseCorrespondanceLocalisation.updateValueAndValidity();
    this.adresseCorrespondance.updateValueAndValidity();
  }
  private _filterAdresseCorrespondanceCodePostal(value: string): Localisation[] {
    return this.localisations.filter(loc => loc.codePostal.toLowerCase().indexOf(value) === 0);
  }
  private _filterAdresseCorrespondanceCommune(value: string): Localisation[] {
    return this.localisations.filter(loc => loc.commune.toLowerCase().indexOf(value) === 0);
  }

  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.parentForm.get('id') as FormControl; }
  get employeur(): FormControl { return this.parentForm.get('employeur') as FormControl; }
  get employeurSiret(): FormControl { return this.employeur.get('siret') as FormControl; }
  get employeurUrssaf(): FormControl { return this.employeur.get('urssaf') as FormControl; }
  get employeurRaisonSociale(): FormControl { return this.employeur.get('raisonSociale') as FormControl; }
  get employeurNomSignataire(): FormControl { return this.employeur.get('nomSignataire') as FormControl; }
  get employeurEffectif(): FormControl { return this.employeur.get('effectif') as FormControl; }
  get employeurTelephone(): FormControl { return this.employeur.get('telephone') as FormControl; }
  get employeurCourriel(): FormControl { return this.employeur.get('courriel') as FormControl; }
  get adresse(): FormGroup { return this.employeur.get('adresse') as FormGroup; }
    get adresseVoie(): FormControl { return this.adresse.get('voie') as FormControl; }
    get adresseComplement(): FormControl { return this.adresse.get('complement') as FormControl; }
    get adresseLocalisation(): FormControl { return this.adresse.get('localisation') as FormControl; }
    get adresseBp(): FormControl { return this.adresse.get('bp') as FormControl; }
    get adressePays(): FormControl { return this.adresse.get('pays') as FormControl; }
    get adresseInfosEtranger(): FormControl { return this.adresse.get('infosEtranger') as FormControl; }
  get adresseCorrespondance(): FormGroup { return this.employeur.get('adresseCorrespondance') as FormGroup; }
    get adresseCorrespondanceVoie(): FormControl { return this.adresseCorrespondance.get('voie') as FormControl; }
    get adresseCorrespondanceComplement(): FormControl { return this.adresseCorrespondance.get('complement') as FormControl; }
    get adresseCorrespondanceLocalisation(): FormControl { return this.adresseCorrespondance.get('localisation') as FormControl; }
    get adresseCorrespondanceBp(): FormControl { return this.adresseCorrespondance.get('bp') as FormControl; }
    get adresseCorrespondancePays(): FormControl { return this.adresseCorrespondance.get('pays') as FormControl; }
    get adresseCorrespondanceInfosEtranger(): FormControl { return this.adresseCorrespondance.get('infosEtranger') as FormControl; }

  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }
  ///// FORMULAIRE SIBLINGS - GETTERS
  get dateReception(): FormControl { return this.parentForm.get('dateReception') as FormControl; }

  ////// UTILS
  findInListById(_id: number, _liste: any[]) {
    return _liste.find((val) => {
      return val.id === _id;
    });
  }
  findInListByCode(_code: string, _liste: any[]) {
    return _liste.find((val) => {
      return val.code === _code;
    });
  }
}
