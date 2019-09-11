import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Router } from '@angular/router';
import { ToasterService } from 'angular2-toaster';
import { forkJoin } from 'rxjs';
import * as moment from 'moment';
import { ETAPE } from 'src/app/constantes/referentiel/etape.enum';
import { PROFILS } from 'src/app/constantes/referentiel/profils.enum';
import { STATUT } from 'src/app/constantes/referentiel/statut.enum';
import { ROUTES } from 'src/app/constantes/routes';
import { SESSION_CLES } from 'src/app/constantes/session-cles';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { IFilAriane } from 'src/app/interfaces/IFilAriane';
import { Demande } from 'src/app/modeles/demande.model';
import { Departement } from 'src/app/modeles/departement.model';
import { DemandeRechercheDto } from 'src/app/modeles/dto/demande-recherche-dto.model';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { RegionDtoDepartement } from 'src/app/modeles/dto/region-departement.dto';
import { Utilisateur } from 'src/app/modeles/dto/utilisateur.dto';
import { Etape } from 'src/app/modeles/etape.model';
import { SearchRequestDto } from 'src/app/modeles/recherche/search-request.dto';
import { SearchResponseDto } from 'src/app/modeles/recherche/search-response.dto';
import { Statut } from 'src/app/modeles/statut.model';
import { FilArianeItem } from 'src/app/modeles/utils/fil-ariane-item.model';
import { DemandeService } from 'src/app/services/crud/demande.service';
import { DepartementService } from 'src/app/services/crud/departement.service';
import { EtapeService } from 'src/app/services/crud/etape.service';
import { DemandeRechercheDtoService } from 'src/app/services/crud/mini-dto/demande-recherche-dto-service';
import { OrganismeMiniDtoService } from 'src/app/services/crud/mini-dto/organisme-mini-dto.service';
import { RegionService } from 'src/app/services/crud/region.service';
import { StatutService } from 'src/app/services/crud/statut.service';
import { SessionUtilisateurService } from 'src/app/services/session-utilisateur.service';
import { StorageService } from 'src/app/services/storage.service';
import { ModaleDemandePapierComponent } from 'src/app/web/commun/actions-rapides/modale-demande-papier/modale-demande-papier.component';
import { ModaleDemandeParNumeroComponent
} from 'src/app/web/commun/actions-rapides/modale-demande-par-numero/modale-demande-par-numero.component';
import { ModaleDemandeTeleRCComponent } from 'src/app/web/commun/actions-rapides/modale-demande-tele-rc/modale-demande-tele-rc.component';
import { RemoveModaleComponent } from 'src/app/web/commun/modales/remove-modale.component';
import { JsonConverterService } from 'src/app/services/json-converter.service';

@Component({
  selector: 'app-demandes-recherche',
  templateUrl: './demandes-recherche.component.html'
})
export class DemandesRechercheComponent implements OnInit, IFilAriane {

  // IPreventNavigation + IFilAriane
  textModalConfirm: string;
  filAriane: FilArianeItem[];
  // CONSTANTES
  STATUT: STATUT;
  ETAPE: ETAPE;
  // Recherche
  searchRequestItem: SearchRequestDto;
  etapes: Etape[];
  statuts: Statut[];
  regionsFiltre: RegionDtoDepartement[];
  departementsFiltre: Departement[];
  miniDemandes: DemandeRechercheDto[];
  organismesAccessibles: OrganismeMiniDto[];
  // Loaders
  loading = true;
  loadingListe = true;
  rechercheEffectuee = false;
  // Formulaire filtres
  filtresForm: FormGroup;
  user: Utilisateur = undefined;
  // Filters
  minFilter: (date: Date) => Boolean;
  maxFilter: (date: Date) => Boolean;
  resetDept: Boolean = true;
  hideEncartFiltres: Boolean = true;
  // export
  @ViewChild('downloadLink') private downloadLink: ElementRef;
  isExporting = false;

  constructor(private fb: FormBuilder,
    private router: Router,
    private dialog: MatDialog,
    private sessionUtilisateurSvc: SessionUtilisateurService,
    private toasterService: ToasterService,
    private etapeService: EtapeService,
    private statutService: StatutService,
    private regionService: RegionService,
    private departementService: DepartementService,
    private demandeService: DemandeRechercheDtoService,
    private demandeFullService: DemandeService,
    private organismeMiniService: OrganismeMiniDtoService,
    private storageService: StorageService,
    private jsonConverterService: JsonConverterService
  ) { }

  ngOnInit() {
    this.initFilAriane();
    this.getLoggedUser();
    this.searchRequestItem = new SearchRequestDto();
    this.filtresForm = this.fb.group({
      siretUrssaf: ['', [Validators.maxLength(250)]],
      'employeur.raisonSociale': ['', [ Validators.maxLength(250)]],
      'salarie.nom': ['', [Validators.maxLength(250)]],
      'salarie.prenom': ['', [Validators.maxLength(250)]],
      numero: [undefined],
      teletransmise: [undefined],
      'etape.code': [undefined],
      'statut.code': [undefined],
      'organismeAttribution.departement.region.id': [undefined],
      'organismeAttribution.departement.id': [undefined],
      dateReceptionMin: [undefined],
      dateReceptionMax: [undefined],
      'organismeAttribution.id': [undefined]
    });
    this.organismeAttributionId.disable();
    // Tris par défaut
    this.searchRequestItem.updateTris('dateReception');
    this.searchRequestItem.updateTris('employeur.raisonSociale');
    this.searchRequestItem.updateTris('salarie.nom');
    this.chargerReferentielFiltres();
  }

  private chargerReferentielFiltres() {
    forkJoin([
      this.etapeService.getAll(), this.statutService.getAll(),
      this.regionService.getAutorises(), this.departementService.getAutorises(),
      this.organismeMiniService.getAutorises()
    ]).subscribe(results => {
      this.etapes = results[0] as Etape[];
      this.statuts = results[1] as Statut[];
      this.regionsFiltre = results[2] as RegionDtoDepartement[];
      this.departementsFiltre = results[3] as Departement[];
      this.organismesAccessibles = results[4] as OrganismeMiniDto[];
      this.departementsFiltre.forEach((dpt) => {
        const regId = dpt.region.id;
        const currRegion = this.regionsFiltre.find((reg) => {
          return reg.id === regId;
        });
        if (currRegion) {
          if (currRegion.departements === undefined) {
            currRegion.departements = ([] as Departement[]);
          }
          currRegion.departements.push(dpt);
        }
      });
      this.loading = false;

      // Vérification des données dans le LocalStorage
      const rechercheDemandeFiltreStorage = this.storageService.getItemSessionStorage(SESSION_CLES.RECHERCHE_DEMANDE_FILTRES);
      if (rechercheDemandeFiltreStorage && Object.keys(rechercheDemandeFiltreStorage).length > 0) {
        this.filtresForm.patchValue(rechercheDemandeFiltreStorage);
        this.prepareForm();
        this.rechercher();
      } else {
        this.prepareForm();
        this.loadingListe = false;
      }

    });
  }

  // RG de sélection/initialisation des filtres région/département
  public prepareForm() {
    // Une seule région accessible, on la sélectionne tout de suite
    if (this.regionsFiltre.length === 1 && !this.region.value) {
      this.region.setValue(this.regionsFiltre[0].id);
      // Un seul dpt accessible, on le sélectionne tout de suite
      if (this.regionsFiltre[0].departements.length === 1) {
        if (!this.departement.value) {
          this.departement.setValue(this.regionsFiltre[0].departements[0].id);
        }
      } else {
        this.departement.setValue(undefined);
      }
    }
    // Initialisation des filtres des datePickers
    this.dateReceptionMinChange();
    this.dateReceptionMaxChange();
  }

  public rechargeGrille() {
    this.loadingListe = true;
    this.demandeService.search(this.searchRequestItem).subscribe((searchResponse: SearchResponseDto) => {
      this.miniDemandes = searchResponse.content as [DemandeRechercheDto];
      this.searchRequestItem.updatePagerFromSearchResponseDto(searchResponse);
      this.rechercheEffectuee = true;
      this.loading = false;
      this.loadingListe = false;
      this.hideEncartFiltres = false;
    });
  }

  /// RECHERCHE
  public rechercher(backToFirstPage = false) {
    if (this.filtresForm.invalid) {
      this.toasterService.pop({
        type: TYPE_TOAST.AVERTISSEMENT, title: 'Formulaire invalide',
        body: `Votre formulaire de recherche est invalide. La recherche est impossible.`
      });
      return false;
    }
    this.dateReceptionMin.setValue(((this.dateReceptionMin.value) ? moment(this.dateReceptionMin.value).format('YYYY-MM-DD') : undefined));
    this.dateReceptionMax.setValue(((this.dateReceptionMax.value) ? moment(this.dateReceptionMax.value).format('YYYY-MM-DD') : undefined));
    this.searchRequestItem.updateFiltresWithFormGroup(this.filtresForm, backToFirstPage);
    // Enregistrer les valeurs des filtres dans le LocalStorage
    this.majFiltresEnSession();
    this.rechargeGrille();
  }
  public reinitialiserFiltres() {
    this.filtresForm.reset();
    this.setDateReceptionMin(undefined);
    this.setDateReceptionMax(undefined);
    this.dateReceptionMinChange();
    this.dateReceptionMaxChange();
    this.cleanFiltresSession();
  }

  ///// FORMULAIRE - GETTERS
  get siretUrssaf(): FormControl { return this.filtresForm.get('siretUrssaf') as FormControl; }
  get employeurRaisonSociale(): FormControl { return this.filtresForm.get(['employeur.raisonSociale']) as FormControl; }
  get salarieNom(): FormControl { return this.filtresForm.get(['salarie.nom']) as FormControl; }
  get salariePrenom(): FormControl { return this.filtresForm.get(['salarie.prenom']) as FormControl; }
  get numero(): FormControl { return this.filtresForm.get('numero') as FormControl; }
  get teletransmise(): FormControl { return this.filtresForm.get('teletransmise') as FormControl; }
  get etapeCode(): FormControl { return this.filtresForm.get(['etape.code']) as FormControl; }
  get statutCode(): FormControl { return this.filtresForm.get(['statut.code']) as FormControl; }
  get region(): FormControl {
    return this.filtresForm.get(['organismeAttribution.departement.region.id']) as FormControl; }
  get departement(): FormControl {
    return this.filtresForm.get(['organismeAttribution.departement.id']) as FormControl; }
  get dateReceptionMin(): FormControl { return this.filtresForm.get('dateReceptionMin') as FormControl; }
  get dateReceptionMax(): FormControl { return this.filtresForm.get('dateReceptionMax') as FormControl; }
  get organismeAttributionId(): FormControl { return this.filtresForm.get(['organismeAttribution.id']) as FormControl; }
  hasError(control: FormControl): Boolean {
    return control !== undefined && control !== null && control.invalid && (control.dirty || control.touched);
  }
  //// FORMULAIRE - SETTERS
  setDateReceptionMin(dateReceptionMin: Date) { this.dateReceptionMin.setValue(dateReceptionMin); }
  setDateReceptionMax(dateReceptionMax: Date) { this.dateReceptionMax.setValue(dateReceptionMax); }

  /// FORMULAIRE - CLEAN
  supprimerDate(control: FormControl, min: boolean) {
    if (control) { control.setValue(undefined); }
    if (min) {this.dateReceptionMinChange();
    } else {  this.dateReceptionMaxChange(); }
  }
  supprimerFiltreOrganisme() {
    this.organismeAttributionId.setValue(undefined);
    this.searchRequestItem.updateFiltresWithFormGroup(this.filtresForm, false);
    this.majFiltresEnSession();
  }

  //// FORMULAIRE - ValueChange
  dateReceptionMaxChange() { // Restreindre le choix de la date de réception Min aux jours antérieurs à la date de réception Max
    this.dateReceptionMax.clearValidators();
    if (this.dateReceptionMax.value) {
      this.minFilter = (d: Date): boolean => moment(d).isSameOrBefore(moment(this.dateReceptionMax.value), 'day');
    } else {
      this.minFilter = (d: Date): boolean => true;
    }
    this.dateReceptionMax.updateValueAndValidity();
    this.dateReceptionMin.updateValueAndValidity();
  }
  dateReceptionMinChange() { // Restreindre le choix de la date de réception Min aux jours antérieurs à la date de réception Max
    this.dateReceptionMin.clearValidators();
    if (this.dateReceptionMin.value) {
      this.maxFilter = (d: Date): boolean => moment(d).isSameOrAfter(moment(this.dateReceptionMin.value), 'day');
    } else {
      this.maxFilter = (d: Date): boolean => true;
    }
    this.dateReceptionMax.updateValueAndValidity();
    this.dateReceptionMin.updateValueAndValidity();
  }
  regionChange() { // Controle sur le champ region
    this.departementService.getDepartementByRegionId(this.region.value).subscribe(results => {
      this.departementsFiltre = results as Departement[];
      if (this.resetDept || this.region.value === undefined || this.region.value === null) {
        this.departement.setValue(undefined);
        this.resetDept = true;
      }
    });
  }
  departementChange() { // Controle sur le champ departement
    if (this.departement.value !== null && this.departement.value !== undefined) {
      const dep = this.departementsFiltre.find((d) => {
        return d.id === this.departement.value;
      });
      this.resetDept = false;
      this.region.setValue(dep.region.id);
    }
  }
  getOrganismeFiltre(): OrganismeMiniDto {
    if (this.organismeAttributionId.value !== undefined) {
      return this.organismesAccessibles.find((elem: OrganismeMiniDto) => elem.id === this.organismeAttributionId.value);
    }
  }


  /** RECHERCHE et EXPORT **/
  //// TRIS
  public triColonne(nomColonneTri: string): void {
    if (this.filtresForm.invalid) {
      return;
    }
    this.searchRequestItem.updateTris(nomColonneTri);
    this.rechargeGrille();
  }
  public getSortIconName(nomColonneTri: string): string {
    return this.searchRequestItem.getSortIconNameByNomColonneTri(nomColonneTri);
  }

   /// AUTRES - UTILS - STYLE
   // SESSION : filtres
   private majFiltresEnSession() {
    this.storageService.setItemSessionStorage(SESSION_CLES.RECHERCHE_DEMANDE_FILTRES, {
      siretUrssaf: this.siretUrssaf.value ? this.siretUrssaf.value : undefined,
      'employeur.raisonSociale': this.employeurRaisonSociale.value ? this.employeurRaisonSociale.value : undefined,
      'salarie.nom': this.salarieNom.value ? this.salarieNom.value : undefined,
      'salarie.prenom': this.salariePrenom.value ? this.salariePrenom.value : undefined,
      numero: this.numero.value ? this.numero.value : undefined,
      teletransmise: this.teletransmise.value ? this.teletransmise.value : undefined,
      'etape.code': this.etapeCode.value ? this.etapeCode.value : undefined,
      'statut.code': this.statutCode.value ? this.statutCode.value : undefined,
      'organismeAttribution.departement.region.id': this.region.value ?
       this.region.value : undefined,
      'organismeAttribution.departement.id': this.departement.value ?
       this.departement.value : undefined,
      dateReceptionMin: this.dateReceptionMin.value ? this.dateReceptionMin.value : undefined,
      dateReceptionMax: this.dateReceptionMax.value ? this.dateReceptionMax.value : undefined,
      'organismeAttribution.id': this.organismeAttributionId.value ?
       this.organismeAttributionId.value : undefined,
    });
  }
  private cleanFiltresSession() {
    this.storageService.removeItemSessionStorage(SESSION_CLES.RECHERCHE_DEMANDE_FILTRES);
  }

   // AUTRES
  public isUdConcernee(demande: DemandeRechercheDto) {
    return this.organismesAccessibles.find((elem: OrganismeMiniDto) => elem.id === demande.organismeAttribution.id);
  }
  /** @description: utilisateur autorisé uniquement si Admin ou Gestionnaire */
  public isUserQualifiedToModify(): Boolean {
    const currentUser = this.getLoggedUser();
    return (currentUser.is(PROFILS.ADMINISTRATEUR_FONCTIONNEL) || currentUser.is(PROFILS.ADMINISTRATEUR_NATIONAL) ||
      currentUser.is(PROFILS.GESTIONNAIRE));
  }
  public isADupliquer(demande: DemandeRechercheDto): Boolean {
    return (demande.etape.code === ETAPE.ETP_INS_CODE &&
    (demande.statut.code === STATUT.STT_IRR_CODE || demande.statut.code === STATUT.STT_REF_CODE));
  }
  public visibilityChange(): Boolean {
    this.hideEncartFiltres = !this.hideEncartFiltres;
    return this.hideEncartFiltres;
  }

  /** ETAPES */
  public isAInstruire(codeEtape: String): Boolean { return codeEtape === ETAPE.ETP_AIN_CODE; }
  public isInstruite(codeEtape: String): Boolean { return codeEtape === ETAPE.ETP_INS_CODE; }
  public isCloture(codeEtape: String): Boolean { return codeEtape === ETAPE.ETP_CLO_CODE; }
  /** STATUT */
  public isRecevable(codeStatut: String): Boolean { return codeStatut === STATUT.STT_REC_CODE; }
  public isIrrecevable(codeStatut: String): Boolean { return (codeStatut === STATUT.STT_IRR_CODE || codeStatut === STATUT.STT_REF_CODE); }
  public isAccordee(codeStatut: String): Boolean {
    return (codeStatut === STATUT.STT_ACCE_CODE || codeStatut === STATUT.STT_ACCIA_CODE || codeStatut === STATUT.STT_ACCIM_CODE);
  }


  /** ACTIONS D'EDITION */
  consultDemande(demande: DemandeRechercheDto) {
    this.loadingListe = true;
    this.router.navigate(
      ['/' + ROUTES.DEMANDES + '/' + ROUTES.ACT_CONSULTATION + '/' + demande.uuid]
    ).then((value: boolean) => { // Retour du Guard "DemandeGuard"
      if (!value) { this.loadingListe = false; }
    });
  }

  modifDemande(demande: DemandeRechercheDto) {
    if (!this.isUdConcernee(demande) || !this.isUserQualifiedToModify()
      || this.isCloture(demande.etape.code)) {
        return false;
    }
    this.loadingListe = true;
    this.router.navigate(
      ['/' + ROUTES.DEMANDES + '/' + ROUTES.ACT_GESTION + '/' + demande.uuid]
    ).then((value: boolean) => { // Retour du Guard "DemandeGuard"
      if (!value) { this.loadingListe = false; }
    });
  }

  /** Récupère la demande correspondant à la ligne, la nettoie et l'envoi au formulaire de création de demande via le sessionStorage */
  dupliquerDemande(demande: DemandeRechercheDto) {
    if (!this.isUdConcernee(demande) || !this.isUserQualifiedToModify()
      || !this.isADupliquer(demande)) {
        return false;
    }
    this.loadingListe = true;
    this.demandeFullService.getByUuid(demande.uuid).subscribe((dem: Demande) => {
      dem.cleanPourDuplication();
      this.storageService.setItemSessionStorage(
        SESSION_CLES.DEMANDE_DUPLICATION,
        this.jsonConverterService.getInstance().serializeObject(dem)
      );
      this.router.navigate(['/' + ROUTES.DEMANDES + '/' + ROUTES.ACT_GESTION]);
      this.loadingListe = false;
    });
  }

  supprDemande(demande: DemandeRechercheDto) {
    if (!this.isUdConcernee(demande) || !this.isUserQualifiedToModify()) { return false; }
    this.dialog.open(RemoveModaleComponent, {
      disableClose : true,
      data: {
        titre: `Supprimer une demande`,
        contenu: `Cette demande va être supprimée.<br/>Confirmer la suppression ?`,
        elementASupprimer: demande,
        service: this.demandeService,
      }
    }).afterClosed().subscribe(res => {
      if (res) { // S'il y a eu une suppression
        this.rechargeGrille();
      }
    });
  }

  // ACTIONS RAPIDES
  actionOuvrirDemandeAvecNumero() {
    this.dialog.open(ModaleDemandeParNumeroComponent, {
      disableClose : true,
      data: {}
    });
  }
  actionRecupererDemandeTeleRC() {
    this.dialog.open(ModaleDemandeTeleRCComponent, {
      disableClose : true,
      data: {}
    });
  }
  actionSaisirDemandePapier() {
    this.dialog.open(ModaleDemandePapierComponent, {
      disableClose : true,
      data: {}
    });
  }

  // EXPORT
  public exporter() {
    this.isExporting = true;
    this.demandeService.exportXLS(this.searchRequestItem, this.downloadLink, 'export-demandes.xls',
      (() => { this.isExporting = false; }));
  }

  /** IFilAriane */
  initFilAriane() {
    this.filAriane = [new FilArianeItem('Recherche de demandes', '/' + ROUTES.DEMANDES)];
  }
  getFilAriane(): FilArianeItem[] {
    return this.filAriane;
  }

  getLoggedUser(): Utilisateur {
    if (!this.user) { this.user = this.sessionUtilisateurSvc.getStorableUser(); }
    return this.user;
  }
  userIsObservateur() {
    return this.getLoggedUser().is(PROFILS.OBSERVATEUR);
  }
}
