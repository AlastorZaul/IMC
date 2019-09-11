import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormBuilder, FormGroupDirective, Validators, FormControl, ControlContainer } from '@angular/forms';
import { SearchRequestDto } from 'src/app/modeles/recherche/search-request.dto';
import { Localisation } from 'src/app/modeles/localisation.model';
import { Observable, Subject } from 'rxjs';
import { LocalisationService } from 'src/app/services/crud/localisation.service';
import { startWith, map } from 'rxjs/operators';
import { SearchResponseDto } from 'src/app/modeles/recherche/search-response.dto';
import { Pays } from 'src/app/modeles/pays.model';
import { Demande } from 'src/app/modeles/demande.model';
import { CIVILITE } from 'src/app/constantes/referentiel/civilite.enum';
import { CODE_PAYS } from 'src/app/constantes/referentiel/code-pays.enum';
import { Qualification } from 'src/app/modeles/qualification.model';
import { ConventionCollectiveService } from 'src/app/services/crud/convention-collective.service';
import { ConventionCollective } from 'src/app/modeles/convention-collective.model';
import { Adresse } from 'src/app/modeles/adresse.model';
import { ETAPE } from 'src/app/constantes/referentiel/etape.enum';

@Component({
  selector: 'app-dem-onglet-salarie',
  templateUrl: './dem-onglet-salarie.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class DemOngletSalarieComponent implements OnInit {
  @Input() parentSendSubmitted: Subject<boolean>;
  @Input() listePays: Pays[];
  @Input() listeQualification: Qualification[];
  @Input() currentDemande: Demande;
  @Input() listeErreurBloquant: String[];
  private parentForm: FormGroup;
  private submitted = false; // Synchronisé avec celui du parent

  public readonly CIVILITE = CIVILITE;
  public readonly CODE_PAYS = CODE_PAYS;
  // Autocomplétion
  autocompleteLocRequestDto: SearchRequestDto;
  autocompleteConvRequestDto: SearchRequestDto;
  localisations: Localisation[] = [];
  filteredLocalisations: Observable<Localisation[]>;
  conventionsCollectives: ConventionCollective[] = [];
  filteredConventionsCollectives: Observable<ConventionCollective[]>;
  constructor(    private parent: FormGroupDirective,
    private fb: FormBuilder,
    private svcLoc: LocalisationService,
    private svcConvColl: ConventionCollectiveService) { }

  ngOnInit() {
    // EVENEMENTS PARENT
    if (this.parentSendSubmitted) {
      this.parentSendSubmitted.subscribe(submitted => {
        this.submitted = submitted;
      });
    }
    // Initialisation du formulaire
    this.parentForm = this.parent.form;
    this.parentForm.addControl('salarie', this.fb.group({
      'id': [undefined],
      'civilite': [undefined],
      'nom': ['', [Validators.required, Validators.maxLength(250)]],
      'prenom': ['', [Validators.required, Validators.maxLength(250)]],
      'dateNaissance': [undefined],
      'adresse': this.fb.group({
        'id': [undefined],
        'voie': ['', [Validators.required, Validators.maxLength(250)]],
        'complement': ['', [Validators.maxLength(250)]],
        'infosEtranger': ['', [Validators.maxLength(250)]],
        'pays': [undefined, [Validators.required]],
        'localisation': [undefined, [Validators.required]],
        'bp': ['', [Validators.maxLength(30)]],
      }),
      'telephone': ['', [Validators.maxLength(20)]],
      'courriel': ['', [Validators.maxLength(250), Validators.email]],
      'qualification': [undefined],
      'emploi': ['', [Validators.maxLength(250)]],
      'conventionCollective': [undefined]
    }));
    this.autocompleteLocRequestDto = new SearchRequestDto();
    this.autocompleteLocRequestDto.updateTris('commune');
    this.autocompleteConvRequestDto = new SearchRequestDto();
    this.autocompleteConvRequestDto.updateTris('codeIdcc');
  }


  /** METHODE DE COMMUNICATION AVEC LE PARENT - beforePatch, afterPatch, isOngletWarn, isOngletError */
  beforePatchPrincipalForm(dem: Demande) {
    // Initialiser l'adresse du salarié dans la demande récupérée si ce dernier est null
    if (!dem.salarie.adresse) {
      dem.salarie.adresse = new Adresse();
    }
  }
  afterPatchPrincipalForm(dem: Demande) {
    // Patch les listes déroulantes de la vue salarié
    if (this.salarie) {
      this.adresse.patchValue({
        pays: ((dem.salarie && dem.salarie.adresse && dem.salarie.adresse.pays) ?
          this.findInListById(dem.salarie.adresse.pays.id, this.listePays) : undefined)
      });
      this.salarie.patchValue({
        qualification: ((dem.salarie && dem.salarie.qualification) ?
          this.findInListById(dem.salarie.qualification.id, this.listeQualification) : undefined)
      });
    }
  }
  initDemandeSalarie(nomSalarie: string) {
    if (nomSalarie) { this.salarieNom.setValue(nomSalarie); }
  }
  // Méthodes de contrôle du formulaire
  isOngletValid(): boolean {
    if (this.parentForm && this.salarie) {
      return this.salarie.valid;
    }
    return false;
  }
  isOngletWarn(): boolean { return false; }
  isOngletInvalid(): Boolean {
    if (this.parentForm && this.salarie) {
      return this.salarie.invalid && this.submitted;
    }
    return false;
  }
  isOngletConsultInvalid(): Boolean {
    return this.parentForm && this.salarie && this.salarie.invalid;
  }
  isCloture() {
    return this.etape && this.etape.value && this.etape.value.code === ETAPE.ETP_CLO_CODE;
  }

  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.parentForm.get('id') as FormControl; }
  get etape(): FormControl { return this.parentForm.get('etape') as FormControl; }
  get salarie(): FormControl { return this.parentForm.get('salarie') as FormControl; }
  get salarieCivilite(): FormControl { return this.salarie.get('civilite') as FormControl; }
  get salarieNom(): FormControl { return this.salarie.get('nom') as FormControl; }
  get salariePrenom(): FormControl { return this.salarie.get('prenom') as FormControl; }
  get salarieDateNaissance(): FormControl { return this.salarie.get('dateNaissance') as FormControl; }
  get adresse(): FormGroup { return this.salarie.get('adresse') as FormGroup; }
    get voie(): FormControl { return this.adresse.get('voie') as FormControl; }
    get complement(): FormControl { return this.adresse.get('complement') as FormControl; }
    get localisation(): FormControl { return this.adresse.get('localisation') as FormControl; }
    get bp(): FormControl { return this.adresse.get('bp') as FormControl; }
    get pays(): FormControl { return this.adresse.get('pays') as FormControl; }
    get infosEtranger(): FormControl { return this.adresse.get('infosEtranger') as FormControl; }
  get salarieTelephone(): FormControl { return this.salarie.get('telephone') as FormControl; }
  get salarieCourriel(): FormControl { return this.salarie.get('courriel') as FormControl; }
  get salarieQualification(): FormControl { return this.salarie.get('qualification') as FormControl; }
  get salarieEmploi(): FormControl { return this.salarie.get('emploi') as FormControl; }
  get conventionCollective(): FormControl { return this.salarie.get('conventionCollective') as FormControl; }
  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }

  /** Changement du select pays => Si étranger alors vider les champs de l'adresse */
  paysChange(): void {
    this.voie.setValue('');
    this.complement.setValue('');
    this.localisation.setValue(undefined);
    this.infosEtranger.setValue('');
    this.bp.setValue('');
    this.localisation.clearValidators();
    this.infosEtranger.clearValidators();
    if (this.pays.value && this.pays.value.code === CODE_PAYS.FRANCE) {
      this.localisation.setValidators(Validators.required);
    } else {
      this.infosEtranger.setValidators([Validators.required, Validators.maxLength(250)]);
    }
    this.localisation.updateValueAndValidity();
    this.infosEtranger.updateValueAndValidity();
  }
  manualUpdateAdresseRules() {
    this.localisation.clearValidators();
    this.infosEtranger.clearValidators();
    if (this.pays.value && this.pays.value.code === CODE_PAYS.FRANCE) {
      this.localisation.setValidators(Validators.required);
    } else {
      this.infosEtranger.setValidators([Validators.required, Validators.maxLength(250)]);
    }
    this.localisation.updateValueAndValidity();
    this.infosEtranger.updateValueAndValidity();
  }
  // AUTOCOMPLETION -- Localisation
  getLocalisationsByCode(): void {
    this.autocompleteLocRequestDto.updateFiltresWithFormGroup(this.fb.group({codePostal: this.localisation }));
    this.getLocalisations(true);
  }
  getLocalisationsByCommune(): void {
    this.autocompleteLocRequestDto.updateFiltresWithFormGroup(this.fb.group({commune: this.localisation }));
    this.getLocalisations(false);
  }
  getLocalisations(isCodePostal: boolean): void {
    this.svcLoc.search(this.autocompleteLocRequestDto).subscribe((searchResponse: SearchResponseDto) => {
      this.localisations = searchResponse.content as [Localisation];
      this.autocompleteLocRequestDto.updatePagerFromSearchResponseDto(searchResponse);
      this.filteredLocalisations = this.localisation.valueChanges
      .pipe(
        startWith<string | Localisation>(''),
        map(value => typeof value === 'string' ? value : ((value === null || value === undefined) ?
          null : ((isCodePostal) ? value.codePostal : value.commune))),
        map(item => item ? ((isCodePostal) ? this._filterCodePostal(item) : this._filterCommune(item)) : this.localisations.slice())
      );
    });
  }

  displayValeurCodePostal(loc?: Localisation): string | undefined {
    return typeof loc === 'string' || loc === undefined || loc === null  ? undefined : loc.codePostal;
  }
  displayValeurCommune(loc?: Localisation): string | undefined {
    return typeof loc === 'string' || loc === undefined || loc === null  ? undefined : loc.commune;
  }
  focusOutLocalisation(): void {
    if (this.localisation.value !== undefined && !(this.localisation.value instanceof Localisation)) {
      this.localisation.setValue(undefined);
      this.localisation.updateValueAndValidity();
      this.adresse.updateValueAndValidity();
    }
  }
  selectedOption() {
    this.localisation.setValue(this.localisation.value);
    this.localisation.updateValueAndValidity();
    this.adresse.updateValueAndValidity();
  }

  private _filterCodePostal(value: string): Localisation[] {
    return this.localisations.filter(loc => loc.codePostal.toLowerCase().indexOf(value) === 0);
  }
  private _filterCommune(value: string): Localisation[] {
    return this.localisations.filter(loc => loc.commune.toLowerCase().indexOf(value) === 0);
  }

  // AUTOCOMPLETION -- Convention Collective
  getConventionsCollectivesByCodeIdcc(): void {
    this.autocompleteConvRequestDto.updateFiltresWithFormGroup(this.fb.group({codeIdcc: this.conventionCollective, actif: true }));
    this.getConventionsCollectives(true);
  }
  getConventionsCollectivesByIntitule(): void {
    this.autocompleteConvRequestDto.updateFiltresWithFormGroup(this.fb.group({intitule: this.conventionCollective, actif: true }));
    this.getConventionsCollectives(false);
  }
  getConventionsCollectives(isCodeIdcc: boolean): void {
    this.svcConvColl.search(this.autocompleteConvRequestDto).subscribe((searchResponse: SearchResponseDto) => {
      this.conventionsCollectives = searchResponse.content as [ConventionCollective];
      this.autocompleteConvRequestDto.updatePagerFromSearchResponseDto(searchResponse);
      this.filteredConventionsCollectives = this.conventionCollective.valueChanges
      .pipe(
        startWith<string | ConventionCollective>(''),
        map(value => typeof value === 'string' ? value : ((isCodeIdcc) ? value.codeIdcc : value.intitule)),
        map(item => item ? ((isCodeIdcc) ? this._filterCodeIdcc(item) : this._filterIntitule(item)) : this.conventionsCollectives.slice())
      );
    });
  }

  displayValeurCodeIdcc(conv?: ConventionCollective): string | undefined {
    return typeof conv === 'string' || conv === undefined || conv === null  ? undefined : conv.codeIdcc;
  }
  displayValeurIntitule(conv?: ConventionCollective): string | undefined {
    return typeof conv === 'string' || conv === undefined || conv === null  ? undefined : conv.intitule;
  }
  focusOutConventionCollective(): void {
    if (this.conventionCollective.value !== undefined && !(this.conventionCollective.value instanceof ConventionCollective)) {
      this.conventionCollective.setValue('');
      this.conventionCollective.updateValueAndValidity();
    }
  }
  selectedConventionCollectiveOption() {
    this.conventionCollective.setValue(this.conventionCollective.value);
    this.conventionCollective.updateValueAndValidity();
  }

  private _filterCodeIdcc(value: string): ConventionCollective[] {
    return this.conventionsCollectives.filter(conv => conv.codeIdcc.toLowerCase().indexOf(value) === 0);
  }
  private _filterIntitule(value: string): ConventionCollective[] {
    return this.conventionsCollectives.filter(conv => conv.intitule.toLowerCase().indexOf(value) === 0);
  }

  // UTILS
  supprimerDate(control: FormControl) {
    if (control && control.enabled) {
      control.setValue(undefined);
      control.markAsTouched();
    }
  }
  private findInListById(_id: number, _liste: any[]) {
    return _liste.find((val) => {
      return val.id === _id;
    });
  }
}
