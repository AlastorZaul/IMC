import { Component, OnInit, Input } from '@angular/core';
import { ControlContainer, FormGroupDirective, FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { Departement } from 'src/app/modeles/departement.model';
import { Localisation } from 'src/app/modeles/localisation.model';
import { Observable } from 'rxjs';
import { SearchRequestDto } from 'src/app/modeles/recherche/search-request.dto';
import { LocalisationService } from 'src/app/services/crud/localisation.service';
import { SearchResponseDto } from 'src/app/modeles/recherche/search-response.dto';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'app-org-onglet-infos',
  templateUrl: './org-onglet-infos.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class OrgOngletInfosComponent implements OnInit {
  @Input() submitted;
  @Input() listeDept: Departement[];
  private parentForm: FormGroup;
  // Autocomplétion
  autocompleteRequestDto: SearchRequestDto;
  localisations: Localisation[] = [];
  filteredLocalisations: Observable<Localisation[]>;

  constructor(
    private parent: FormGroupDirective,
    private fb: FormBuilder,
    private svcLoc: LocalisationService,
  ) { }

  ngOnInit() {
    // Initialisation du formulaire
    this.parentForm = this.parent.form;
    this.parentForm.addControl('id', this.fb.control(undefined));
    this.parentForm.addControl('uuid', this.fb.control(undefined));
    this.parentForm.addControl('nomCourt', this.fb.control('', [Validators.required, Validators.maxLength(15)]));
    this.parentForm.addControl('nom', this.fb.control('', [Validators.required, Validators.maxLength(250)]));
    this.parentForm.addControl('infosService', this.fb.control('', [Validators.maxLength(250)]));
    this.parentForm.addControl('infosComplementaires', this.fb.control('', [Validators.maxLength(250)]));
    this.parentForm.addControl('notificationTeletransmission', this.fb.control(true));
    this.parentForm.addControl('telephone', this.fb.control('', [Validators.maxLength(20)]));
    this.parentForm.addControl('fax', this.fb.control('', [Validators.maxLength(20)]));
    this.parentForm.addControl('telephoneService', this.fb.control('', [Validators.maxLength(20)]));
    this.parentForm.addControl('courriel', this.fb.control('', [Validators.required, Validators.maxLength(250), Validators.email]));
    this.parentForm.addControl('adresse', this.fb.group({
      'id': [undefined],
      'voie': ['', [Validators.required, Validators.maxLength(250)]],
      'complement': ['', [Validators.maxLength(250)]],
      'infosEtranger': [undefined],
      'pays': [undefined], // id
      'localisation': [undefined, Validators.required], // id
      'bp': ['', Validators.maxLength(30)],
    }));
    this.parentForm.addControl('departement', this.fb.control(undefined, [Validators.required]));
    this.autocompleteRequestDto = new SearchRequestDto();
    this.autocompleteRequestDto.updateTris('commune');
  }

  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return this.parentForm.get('id') as FormControl; }
    get createMode(): Boolean { return !this.id.value; }
  get uuid(): FormControl { return this.parentForm.get('uuid') as FormControl; }
  get nomCourt(): FormControl { return this.parentForm.get('nomCourt') as FormControl; }
  get nom(): FormControl { return this.parentForm.get('nom') as FormControl; }
  get infosService(): FormControl { return this.parentForm.get('infosService') as FormControl; }
  get infosComplementaires(): FormControl { return this.parentForm.get('infosComplementaires') as FormControl; }
  get notificationTeletransmission(): FormControl { return this.parentForm.get('notificationTeletransmission') as FormControl; }
  get telephone(): FormControl { return this.parentForm.get('telephone') as FormControl; }
  get fax(): FormControl { return this.parentForm.get('fax') as FormControl; }
  get telephoneService(): FormControl { return this.parentForm.get('telephoneService') as FormControl; }
  get courriel(): FormControl { return this.parentForm.get('courriel') as FormControl; }
  get adresse(): FormGroup { return this.parentForm.get('adresse') as FormGroup; }
    get voie(): FormControl { return this.adresse.get('voie') as FormControl; }
    get complement(): FormControl { return this.adresse.get('complement') as FormControl; }
    get localisation(): FormControl { return this.adresse.get('localisation') as FormControl; }
    get bp(): FormControl { return this.adresse.get('bp') as FormControl; }
  get departement(): FormControl { return this.parentForm.get('departement') as FormControl; }
  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }

  // ACTION
  /** Changement de la combo "notification" => Si oui, courriel obligatoire. Sinon, courriel pas obligatoire */
  notificationChange() {
    if (this.notificationTeletransmission.value) {
      this.courriel.clearValidators();
      this.courriel.setValidators([Validators.required, Validators.maxLength(250), Validators.email]);
      this.courriel.updateValueAndValidity();
    } else {
      this.courriel.clearValidators();
      this.courriel.setValidators([Validators.maxLength(250), Validators.email]);
      this.courriel.updateValueAndValidity();
    }
  }





  // AUTOCOMPLETION
  getLocalisationsByCode(): void {
    this.autocompleteRequestDto.updateFiltresWithFormGroup(this.fb.group({codePostal: this.localisation }));
    this.getLocalisations(true);
  }
  getLocalisationsByCommune(): void {
    this.autocompleteRequestDto.updateFiltresWithFormGroup(this.fb.group({commune: this.localisation }));
    this.getLocalisations(false);
  }
  getLocalisations(isCodePostal: boolean): void {
    this.svcLoc.search(this.autocompleteRequestDto).subscribe((searchResponse: SearchResponseDto) => {
      this.localisations = searchResponse.content as [Localisation];
      this.autocompleteRequestDto.updatePagerFromSearchResponseDto(searchResponse);
      this.filteredLocalisations = this.localisation.valueChanges
      .pipe(
        startWith<string | Localisation>(''),
        map(value => typeof value === 'string' ? value : ((isCodePostal) ? value.codePostal : value.commune)),
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
      this.localisation.setValue('');
    }
  }
  selectedOption() {
    this.localisation.setValue(this.localisation.value);
  }
  private _filterCodePostal(value: string): Localisation[] {
    return this.localisations.filter(loc => loc.codePostal.toLowerCase().indexOf(value) === 0);
  }
  private _filterCommune(value: string): Localisation[] {
    return this.localisations.filter(loc => loc.commune.toLowerCase().indexOf(value) === 0);
  }

}
