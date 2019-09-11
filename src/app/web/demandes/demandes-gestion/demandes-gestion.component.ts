import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormArray } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { forkJoin, Subject } from 'rxjs/';
import { TYPE_MOTIF } from 'src/app/constantes/referentiel/type-motif.enum';
import { TYPE_QUALITE } from 'src/app/constantes/referentiel/type-qualite.enum';
import { ROUTES } from 'src/app/constantes/routes';
import { IFilAriane } from 'src/app/interfaces/IFilAriane';
import { IPageVerrou } from 'src/app/interfaces/IPageVerrou';
import { IPreventNavigation } from 'src/app/interfaces/IPreventNavigation';
import { Ape } from 'src/app/modeles/ape.model';
import { Demande } from 'src/app/modeles/demande.model';
import { Utilisateur } from 'src/app/modeles/dto/utilisateur.dto';
import { MotifDecision } from 'src/app/modeles/motif-decision.model';
import { Pays } from 'src/app/modeles/pays.model';
import { Qualification } from 'src/app/modeles/qualification.model';
import { QualiteAssistant } from 'src/app/modeles/qualite-assistant.model';
import { Signature } from 'src/app/modeles/signature.model';
import { Statut } from 'src/app/modeles/statut.model';
import { TypeCourrier } from 'src/app/modeles/type-courrier.model';
import { FilArianeItem } from 'src/app/modeles/utils/fil-ariane-item.model';
import { Verrou } from 'src/app/modeles/verrou.model';
import { ConfigurationService } from 'src/app/services/configuration.service';
import { ApeService } from 'src/app/services/crud/ape.service';
import { DemandeService } from 'src/app/services/crud/demande.service';
import { MotifDecisionService } from 'src/app/services/crud/motif-decision.service';
import { OrganismeService } from 'src/app/services/crud/organisme.service';
import { PaysService } from 'src/app/services/crud/pays.service';
import { QualificationService } from 'src/app/services/crud/qualification.service';
import { QualiteAssistantService } from 'src/app/services/crud/qualite-assistant.service';
import { StatutService } from 'src/app/services/crud/statut.service';
import { TypeCourrierService } from 'src/app/services/crud/type-courrier.service';
import { VerrouService } from 'src/app/services/crud/verrou.service';
import { ToasterService } from 'angular2-toaster';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { JourChomeService } from 'src/app/services/crud/jour-chome.service';
import { JourChome } from 'src/app/modeles/jour-chome.model';
import { STATUT } from 'src/app/constantes/referentiel/statut.enum';
import { SessionUtilisateurService } from 'src/app/services/session-utilisateur.service';
import { StorageService } from 'src/app/services/storage.service';
import { JsonConverterService } from 'src/app/services/json-converter.service';
import { SESSION_CLES } from 'src/app/constantes/session-cles';
import { Etape } from 'src/app/modeles/etape.model';
import { ETAPE } from 'src/app/constantes/referentiel/etape.enum';
import { EtapeService } from 'src/app/services/crud/etape.service';
import { OrganismeMiniDtoService } from 'src/app/services/crud/mini-dto/organisme-mini-dto.service';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
// Sibling components
import { DemOngletGestionComponent } from 'src/app/web/demandes/demandes-gestion/dem-onglet-gestion/dem-onglet-gestion.component';
import { DemOngletEmployeurComponent } from 'src/app/web/demandes/demandes-gestion/dem-onglet-employeur/dem-onglet-employeur.component';
import { DemOngletSalarieComponent } from 'src/app/web/demandes/demandes-gestion/dem-onglet-salarie/dem-onglet-salarie.component';
import { DemOngletCalculComponent } from 'src/app/web/demandes/demandes-gestion/dem-onglet-calcul/dem-onglet-calcul.component';
import { DemOngletCalendrierComponent } from './dem-onglet-calendrier/dem-onglet-calendrier.component';
import { DemOngletCourrierComponent } from 'src/app/web/demandes/demandes-gestion/dem-onglet-courrier/dem-onglet-courrier.component';
import { DemOngletDecisionComponent } from 'src/app/web/demandes/demandes-gestion/dem-onglet-decision/dem-onglet-decision.component';
import { DemOngletControleComponent } from 'src/app/web/demandes/demandes-gestion/dem-onglet-controle/dem-onglet-controle.component';


@Component({
  selector: 'app-gestion-modification',
  templateUrl: './demandes-gestion.component.html'
})
export class DemandesGestionComponent implements OnInit, AfterViewInit, IFilAriane, IPageVerrou, IPreventNavigation {

  // Children components + communication
  @ViewChild(DemOngletGestionComponent) demOngletGestionComp: DemOngletGestionComponent;
  @ViewChild(DemOngletEmployeurComponent) demOngletEmployeurComp: DemOngletEmployeurComponent;
  @ViewChild(DemOngletSalarieComponent) demOngletSalarieComp: DemOngletSalarieComponent;
  @ViewChild(DemOngletCalculComponent) demOngletCalculComp: DemOngletCalculComponent;
  @ViewChild(DemOngletCalendrierComponent) demOngletCalendrierComp: DemOngletCalendrierComponent;
  @ViewChild(DemOngletControleComponent) demOngletControleComp: DemOngletControleComponent;
  @ViewChild(DemOngletDecisionComponent) demOngletDecisionComp: DemOngletDecisionComponent;
  @ViewChild(DemOngletCourrierComponent) demOngletCourrierComp: DemOngletCourrierComponent;

  parentSendSubmitted: Subject<boolean> = new Subject();
  parentIsConsultation: Subject<boolean> = new Subject();
  parentSendIsFormulaireValid: Subject<boolean> = new Subject();
  parentSendIsFormulaireInvalid: Subject<boolean> = new Subject();
  parentSendIsFormulaireWarn: Subject<boolean> = new Subject();

  // IPreventNavigation + IFilAriane + Verrous
  textModalConfirm: string;
  filAriane: FilArianeItem[];
  user: Utilisateur = undefined;
  intervalVerrou: NodeJS.Timer;
  // Loaders
  loading = true;
  ongletAffiche: Number = 0; // Indique l'index de l'onglet affiché.
  // Référentiels
  listeAPE: Ape[];
  listeOrganismesAccessibles: OrganismeMiniDto[];
  listePays: Pays[];
  listeStatut: Statut[];
  listeEtapes: Etape[];
  listeQualification: Qualification[];
  listeTypeCourrier: TypeCourrier[];
  listeQualiteAssistant: QualiteAssistant[];
  listeQualiteAssistantSalarie: QualiteAssistant[] = [];
  listeQualiteAssistantEmployeur: QualiteAssistant[] = [];
  listeMotifs: MotifDecision[];
  listeMotifsRefus: MotifDecision[] = [];
  listeMotifsIrrecevable: MotifDecision[] = [];
  listeSignature: Signature[];
  listeJourChomesOrganisme: JourChome[];
  public readonly TYPE_MOTIF = TYPE_MOTIF;
  public readonly TYPE_QUALITE = TYPE_QUALITE;
  // Formulaire
  submitting = false;
  submitted = false;
  consultation = false;
  currentDemande: Demande;
  // FORMULAIRE PRINCIPAL
  public modelForm: FormGroup = this.fb.group({});

  constructor(private fb: FormBuilder,
    private router: Router,
    private location: Location,
    private route: ActivatedRoute,
    private confSvc: ConfigurationService,
    private userSvc: SessionUtilisateurService,
    private storageService: StorageService,
    private sessionUtilisateurSvc: SessionUtilisateurService,
    private jsonConverterService: JsonConverterService,
    private toasterService: ToasterService,
    private verrouSvc: VerrouService,
    private demandeService: DemandeService,
    private apeSvc: ApeService,
    private paysSvc: PaysService,
    private qualificationSvc: QualificationService,
    private qualiteAssistantScv: QualiteAssistantService,
    private motifDecisionSvc: MotifDecisionService,
    private statutSvc: StatutService,
    private etapesSvc: EtapeService,
    private typeCourrierSvc: TypeCourrierService,
    private jourChomeSvc: JourChomeService,
    private organismeSvc: OrganismeService,
    private organismeMiniSvc: OrganismeMiniDtoService,
  ) { }

  ngOnInit() {
    if (window !== undefined) { window.scroll(0, 0); }
    this.getLoggedUser();
    this.modelForm = this.fb.group({
      'statut': this.fb.control(''),
      'etape': this.fb.control(''),
    });
  }

  ngAfterViewInit() {
    // Chargement des référentiels
    this.initListesReferentiels();
  }

  private initListesReferentiels() {
    forkJoin([
      this.apeSvc.getAll(), this.paysSvc.getAll(),
      this.qualificationSvc.getAll(), this.statutSvc.getAll(), this.etapesSvc.getAll(),
      this.typeCourrierSvc.getAll()
    ]).subscribe(results => {
      this.listeAPE = results[0] as Ape[];
      this.listePays = this.paysSvc.sortListePaysFrancePremierOption((results[1] as Pays[]));
      this.listeQualification = results[2] as Qualification[];
      this.listeStatut = results[3] as Statut[];
      this.listeEtapes = results[4] as Etape[];
      this.listeTypeCourrier = results[5] as TypeCourrier[];
        /** Deuxième forkJoin parce que la définition du forkJoin limite ses paramètres à 6 */
        forkJoin([
          this.qualiteAssistantScv.getAll(), this.motifDecisionSvc.getAll(),
          this.jourChomeSvc.getJourChomeNationaux(),
          this.organismeSvc.getSignatures(this.getLoggedUser().organisme.id),
          this.organismeMiniSvc.getAutorises()
        ]).subscribe(results2 => {
        this.listeQualiteAssistant = results2[0] as QualiteAssistant[];
        this.listeQualiteAssistant.forEach(q => {
        q.typeQa === TYPE_QUALITE.EMPLOYEUR ? this.listeQualiteAssistantEmployeur.push(q) :
                this.listeQualiteAssistantSalarie.push(q);
        });
        this.listeMotifs = results2[1] as MotifDecision[];
        this.listeMotifs.forEach(m => {
        m.typeMotif === TYPE_MOTIF.IRR ? this.listeMotifsIrrecevable.push(m) :
                this.listeMotifsRefus.push(m);
        });
        // Jours chômés
        this.listeJourChomesOrganisme = results2[2] as JourChome[];
        this.listeSignature = results2[3] as Signature[];
        this.listeOrganismesAccessibles = results2[4] as OrganismeMiniDto[];
        // TOUS LES REFERENTIELS SONT CHARGES, on initialise le formulaire
        this.initFormulaireDemande();
        });
    });
  }
  private initFormulaireDemande() {
    const currentDemUuid = this.route.snapshot.params['uuid'];
    // EDITION
    if (currentDemUuid) {
      this.demandeService.getByUuid(currentDemUuid).subscribe((demResult: Demande) => {
        if (this.route.snapshot.routeConfig.path.lastIndexOf(ROUTES.ACT_GESTION) >= 0
          && demResult.etape && demResult.etape.code === ETAPE.ETP_CLO_CODE) {
          // SI MODE GESTION, ON VERIFIE QUE LA DEMANDE NE SOIT PAS CLOTUREE. SI C'EST LE CAS, ON REDIRIGE EN MODE CONSULTATION
          this.router.navigate(['/' + ROUTES.DEMANDES + '/' + ROUTES.ACT_CONSULTATION + '/' + demResult.uuid]);
        } else {
          this.prepareFormulaire(demResult);
          if (this.route.snapshot.routeConfig.path.lastIndexOf(ROUTES.ACT_CONSULTATION) >= 0) {
            // MODE CONSULTATION
            this.consultation = true;
            this.modelForm.disable({emitEvent: true});
            this.modelForm.updateValueAndValidity();
            this.parentIsConsultation.next(this.consultation);
            // SI CLOTURE, ON REND POSSIBLE LA MODIFICATION DE L'ADRESSE DU SALARIE
            if (this.isCloture()) {
              this.salarieAdresse.enable({emitEvent: true});
              this.demOngletSalarieComp.manualUpdateAdresseRules();
              this.salarieAdresse.updateValueAndValidity();
            }
          } else { // MODE GESTION
            this.initMecaniqueVerrous();
          }
        }
      });
    } else { // CREATION
      // Ouverture du formulaire - DUPLICATION
      if (this.storageService.isItemInSessionStorage(SESSION_CLES.DEMANDE_DUPLICATION)) {
        const sourceDemande = this.jsonConverterService.getInstance().deserialize(
          this.storageService.getItemSessionStorage(SESSION_CLES.DEMANDE_DUPLICATION), Demande
        );
        this.currentDemande = new Demande(sourceDemande);
        this.storageService.removeItemSessionStorage(SESSION_CLES.DEMANDE_DUPLICATION);
        this.prepareFormulaire(this.currentDemande);
      } else {
        // Ouverture du formulaire - CREATION COMPLETE
        this.currentDemande = new Demande();
        if (this.storageService.isItemInSessionStorage(SESSION_CLES.NOUVELLE_DEMANDE_INFOS_PRINCIPALES)) {
          const initDemandeDonnees = this.storageService.getItemSessionStorage(SESSION_CLES.NOUVELLE_DEMANDE_INFOS_PRINCIPALES);
          this.demOngletEmployeurComp.initDemandeEmployeur(initDemandeDonnees.siret, initDemandeDonnees.urssaf);
          this.demOngletSalarieComp.initDemandeSalarie(initDemandeDonnees.nom);
          this.storageService.removeItemSessionStorage(SESSION_CLES.NOUVELLE_DEMANDE_INFOS_PRINCIPALES);
        }
        this.setEtape(this.findInListByCode(ETAPE.ETP_AIN_CODE, this.listeEtapes));
        this.setStatut(this.findInListByCode(STATUT.STT_REC_CODE, this.listeStatut));
        this.demOngletCalendrierComp.initDemandeEntretiens();
        this.initFilAriane();
        this.localInitFilAriane(undefined);
        this.loading = false;
      }
    }
  }

  // Prépare le formulaire à partir des données de la demande de l'uuid passé en paramètre
  // OU après un premier enregistrement
  private prepareFormulaire(dem: Demande) {
    this.submitting = false;
    this.submitted = false;

    // Initialiser les objets appartenant au formulaire mais qui sont null dans la demande récupérée
    this.currentDemande = dem;
    // BEFORE - COMPOSANTS ENFANTS
    this.demOngletGestionComp.beforePatchPrincipalForm(dem);
    this.demOngletEmployeurComp.beforePatchPrincipalForm(dem);
    this.demOngletSalarieComp.beforePatchPrincipalForm(dem);
    this.demOngletCalendrierComp.beforePatchPrincipalForm(dem);
    this.demOngletCourrierComp.beforePatchPrincipalForm(dem);
    // PATCH DU FORMULAIRE
    if (!this.currentDemande.etape) { this.currentDemande.etape = this.findInListByCode(ETAPE.ETP_AIN_CODE, this.listeEtapes); }
    if (!this.currentDemande.statut) { this.currentDemande.statut = this.findInListByCode(STATUT.STT_REC_CODE, this.listeStatut); }
    if (!this.currentDemande.courriers) { this.currentDemande.courriers = []; }
    if (!this.currentDemande.motifsDecision) { this.currentDemande.motifsDecision = []; }
    this.modelForm.patchValue(dem);
    // AFTER - COMPOSANTS ENFANTS
    this.demOngletGestionComp.afterPatchPrincipalForm(dem);
    this.demOngletEmployeurComp.afterPatchPrincipalForm(dem);
    this.demOngletSalarieComp.afterPatchPrincipalForm(dem);
    this.demOngletCalendrierComp.afterPatchPrincipalForm(dem);
    this.demOngletCalculComp.afterPatchPrincipalForm(dem);
    this.demOngletDecisionComp.afterPatchPrincipalForm(dem);
    // Remplissage des FormArray
    this.setListeElements(dem.motifsDecision, 'motifsDecision');
    this.setListeElements(dem.courriers, 'courriers');
    // Finalisation IHM
    this.initFilAriane();
    this.localInitFilAriane((this.currentDemande.numero) ? this.currentDemande.numero : undefined);
    this.loading = false;
  }

  private cleanForm() {
    this.modelForm.markAsPristine();
    this.modelForm.markAsUntouched();
    this.cleanArray('motifsDecision');
    this.cleanArray('courriers');
    this.cleanArray('entretiens');
  }
  private cleanArray(nomTableau: string) {
    const array = <FormArray>this.modelForm.controls[nomTableau];
    for (let i = array.length - 1; i >= 0; i--) {
      array.removeAt(i);
    }
  }

  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return (this.modelForm) ? this.modelForm.get('id') as FormControl : undefined; }
  get createMode(): Boolean { return (this.id) ? !this.id.value : true; }
  get uuid(): FormControl { return this.modelForm.get('uuid') as FormControl; }
  get statut(): FormControl { return this.modelForm.get('statut') as FormControl; }
  get etape(): FormControl { return this.modelForm.get('etape') as FormControl; }
  get salarie(): FormControl { return this.modelForm.get('salarie') as FormControl; }
    get salarieAdresse(): FormControl {return this.salarie.get('adresse') as FormControl; }
  get courriers(): FormControl { return this.modelForm.get('courriers') as FormControl; }
  hasError(control: FormControl): Boolean { return control.invalid && (control.dirty || control.touched || this.submitted); }
  hasGroupError(group: FormGroup): Boolean { return group.invalid && (group.dirty || group.touched || this.submitted); }
  ///// FORMULAIRE - SETTERS
  setStatut(val: any): void { this.statut.setValue(val); }
  setEtape(val: any): void { this.etape.setValue(val); }

  ///// FORMULAIRE - VALIDATION //////
  isFormulaireValid(): boolean {
    this.sendSubmittedToChildren(true);
    const isFormulaireValid = this.demOngletGestionComp.isOngletValid() && this.demOngletEmployeurComp.isOngletValid()
      && this.demOngletSalarieComp.isOngletValid() && this.demOngletCourrierComp.isOngletValid()
      && this.demOngletDecisionComp.isOngletValid() && this.demOngletControleComp.isOngletValid()
      && this.demOngletCalculComp.isOngletValid();
    this.sendIsFormulaireValidToChildren(isFormulaireValid);
    return isFormulaireValid;
  }
  isFormulaireInvalid(): Boolean {
    let isFormulaireInvalid: Boolean = false;
    this.sendSubmittedToChildren(true);
    if (this.isConsultEditMode()) { // Seuls les onglets Salarié et Courrier peuvent être modifiés en mode CONSULT + CLOTURE.
      isFormulaireInvalid = this.demOngletSalarieComp.isOngletConsultInvalid() || this.demOngletCourrierComp.isOngletInvalid();
    } else {
      isFormulaireInvalid = this.demOngletGestionComp.isOngletInvalid() || this.demOngletEmployeurComp.isOngletInvalid() ||
      this.demOngletSalarieComp.isOngletInvalid() || this.demOngletCourrierComp.isOngletInvalid() ||
      this.demOngletDecisionComp.isOngletInvalid() || this.demOngletControleComp.isOngletInvalid() ||
      this.demOngletCalculComp.isOngletInvalid();
    }
    this.sendIsFormulaireInvalidToChildren(isFormulaireInvalid as boolean);
    return isFormulaireInvalid;
  }
  isFormulaireWarn(): boolean {
    this.sendSubmittedToChildren(true);
    const isFormulaireWarn =  this.demOngletGestionComp.isOngletWarn() || this.demOngletEmployeurComp.isOngletWarn() ||
    this.demOngletSalarieComp.isOngletWarn() || this.demOngletCourrierComp.isOngletWarn() ||
    this.demOngletDecisionComp.isOngletWarn() || this.demOngletControleComp.isOngletWarn() ||
    this.demOngletCalculComp.isOngletWarn();
    this.sendIsFormulaireWarnToChildren(isFormulaireWarn);
    return isFormulaireWarn;
  }
  isConsultMode(): boolean {
    return this.consultation;
  }
  isConsultEditMode(): boolean {
    return this.consultation && this.isCloture();
  }
  isCloture() {
    return this.etape && this.etape.value && this.etape.value.code === ETAPE.ETP_CLO_CODE;
  }
  sendSubmittedToChildren(submitted: boolean) { this.submitted = submitted; this.parentSendSubmitted.next(submitted); }
  sendIsFormulaireValidToChildren(isFormulaireValid: boolean) { this.parentSendIsFormulaireValid.next(isFormulaireValid); }
  sendIsFormulaireInvalidToChildren(isFormulaireInvalid: boolean) { this.parentSendIsFormulaireInvalid.next(isFormulaireInvalid); }
  sendIsFormulaireWarnToChildren(isFormulaireWarn: boolean) { this.parentSendIsFormulaireWarn.next(isFormulaireWarn); }

  ///// GESTION DES ONGLETS (affichage, navigation)
  public isOngletAffiche(ongIndx: Number) {
    return ongIndx === this.ongletAffiche;
  }
  public navigateToOnglet(ongIndx: Number) {
    this.ongletAffiche = ongIndx;
  }



  ///// ACTIONS BAS DE PAGE
  sortir() {
    this.router.navigate(['/' + ROUTES.DEMANDES]);
  }
  // Sauvegarde
  save() {
    this.sendSubmittedToChildren(true);
    if (this.isFormulaireInvalid() || this.submitting) {
      if (window !== undefined) { window.scroll(0, 0); }
      return false;
    }
    this.submitting = true;
    const demandeToSave = new Demande(this.modelForm.getRawValue());
    this.allBeforeSave(demandeToSave);
    this.demandeService.saveWithCallback(
      demandeToSave, (error: any) => { this.submitting = false; }
    ).subscribe((dem: Demande) => {
      if (window !== undefined) { window.scroll(0, 0); }
      this.loading = true;
      this.toasterService.pop({
        type: TYPE_TOAST.SUCCES,
        body: `Enregistrement réalisé avec succès.`
      });
      if (this.demOngletGestionComp.getIsTransfert()) {
        this.demOngletCourrierComp.afterSave(dem); // Pour l'impression du courrier, si nécessaire.
        this.router.navigate(['/' + ROUTES.DEMANDES]).then((res) => {
          this.router.navigate(['/' + ROUTES.DEMANDES + '/' + ROUTES.ACT_GESTION + '/' + this.uuid.value]);
        });
      } else {
        let wasCreateMode = false;
        if (this.createMode) { // Si on était en mode création, on modifie l'URL
          const url = this.router.createUrlTree([dem.uuid], {relativeTo: this.route}).toString();
          this.location.go(url);
          wasCreateMode = true;
        }
        this.allAfterSave(dem);
        this.cleanForm();
        this.prepareFormulaire(dem);
        if (wasCreateMode) {
          this.initMecaniqueVerrous();
        }
      }
    });
  }
  // SAUVEGARDES SPECIFIQUES
  allBeforeSave(dem: Demande) {
    // this.demOngletGestionComp.beforeSave(dem);
    // this.demOngletEmployeurComp.beforeSave(dem);
    // this.demOngletSalarieComp.beforeSave(dem);
    // this.demOngletCalculComp.beforeSave(dem);
    // this.demOngletCalendrierComp.beforeSave(dem);
    // this.demOngletControleComp.beforeSave(dem);
    // this.demOngletDecisionComp.beforeSave(dem);
    // this.demOngletCourrierComp.beforeSave(dem);
  }
  allAfterSave(dem: Demande) {
    // this.demOngletGestionComp.afterSave(dem);
    // this.demOngletEmployeurComp.afterSave(dem);
    // this.demOngletSalarieComp.afterSave(dem);
    // this.demOngletCalculComp.afterSave(dem);
    // this.demOngletCalendrierComp.afterSave(dem);
    // this.demOngletControleComp.afterSave(dem);
    // this.demOngletDecisionComp.afterSave(dem);
    this.demOngletCourrierComp.afterSave(dem);
  }
  saveImprimerEnvoyer() {
    this.save();
  }
  saveTransfert() {
    this.save();
  }


  /** IPreventNavigation + IFilAriane */
  get canNavigate(): boolean { return !this.modelForm.dirty; }

  initFilAriane() {
    this.filAriane = [
      new FilArianeItem('Demandes', '/' + ROUTES.DEMANDES)
    ];
  }
  localInitFilAriane(numDemande: string) {
    this.filAriane.push(new FilArianeItem((this.createMode) ? `Création d'une demande` : numDemande, undefined));
  }
  getFilAriane(): FilArianeItem[] {
    return this.filAriane;
  }

  /** Utilisateur connecté */
  getLoggedUser(): Utilisateur {
    if (!this.user) { this.user = this.sessionUtilisateurSvc.getStorableUser(); }
    return this.user;
  }

  /** Verrous */
  initMecaniqueVerrous() {
    this.genererVerrou();
    this.intervalVerrou = setInterval(() => {
      this.genererVerrou();
    }, this.confSvc.getEnvironment().verrou.refreshInterval);
  }
  genererVerrou() {
    const verrou = new Verrou();
    const user = this.userSvc.getStorableUser();
    verrou.identiteUtilisateur = user.identite;
    verrou.idUtilisateur = user.id;
    verrou.identifiantOrganisme = user.organisme.nomCourt;
    verrou.typeDonnee = 'Demande';
    verrou.timestampAcces = new Date();
    verrou.uuidDonnee = this.currentDemande.uuid;
    this.verrouSvc.createSafe(verrou).subscribe();
  }
  getUuidDonneePourVerrou(): string {
    return (this.currentDemande) ? this.currentDemande.uuid : undefined;
  }

  ////// UTILS
  findInListByCode(_code: string, _liste: any[]) {
    return _liste.find((val) => {
      return val.code === _code;
    });
  }
  private setListeElements(liste: any[], nomTableau: string) {
    if (liste && liste.length > 0) {
      const array = <FormArray>this.modelForm.controls[nomTableau];
      if (array !== undefined) {
        liste.forEach(x => {
          array.push(this.fb.control(x));
        });
      }
    }
  }

}
