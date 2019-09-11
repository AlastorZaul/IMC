import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, FormArray, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { IFilAriane } from 'src/app/interfaces/IFilAriane';
import { IPreventNavigation } from 'src/app/interfaces/IPreventNavigation';
import { FilArianeItem } from 'src/app/modeles/utils/fil-ariane-item.model';
import { ROUTES } from 'src/app/constantes/routes';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { Organisme } from 'src/app/modeles/organisme.model';
import { JourChome } from 'src/app/modeles/jour-chome.model';
import { Departement } from 'src/app/modeles/departement.model';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { Signature } from 'src/app/modeles/signature.model';
import { OrganismeService } from 'src/app/services/crud/organisme.service';
import { JourChomeService } from 'src/app/services/crud/jour-chome.service';
import { DepartementService } from 'src/app/services/crud/departement.service';
import { OrganismeMiniDtoService } from 'src/app/services/crud/mini-dto/organisme-mini-dto.service';
import { ToasterService } from 'angular2-toaster';
import { PaysService } from 'src/app/services/crud/pays.service';
import { CODE_PAYS } from 'src/app/constantes/referentiel/code-pays.enum';
import { Pays } from 'src/app/modeles/pays.model';
import { Adresse } from 'src/app/modeles/adresse.model';
import { Utilisateur } from 'src/app/modeles/dto/utilisateur.dto';
import { SessionUtilisateurService } from 'src/app/services/session-utilisateur.service';
import { PROFILS } from 'src/app/constantes/referentiel/profils.enum';


@Component({
  selector: 'app-organismes-gestion',
  templateUrl: './organismes-gestion.component.html'
})
export class OrganismesGestionComponent implements OnInit, AfterViewInit, IFilAriane, IPreventNavigation {

  currentUser: Utilisateur;
  // IPreventNavigation + IFilAriane
  textModalConfirm: string;
  filAriane: FilArianeItem[];
  // Loaders
  loading = true;
  // Référentiels
  listeJc: JourChome[];
  listeOrg: OrganismeMiniDto[];
  listeDept: Departement[];
  paysFrance: Pays;
  // Formulaire
  submitting = false;
  submitted = false;
  canEditEnfants = false;
  currentOrganismeId: number = undefined;
  // FORMULAIRE PRINCIPAL
  public modelForm: FormGroup;


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    private toasterService: ToasterService,
    private organismeService: OrganismeService,
    private jcSvc: JourChomeService,
    private deptSvc: DepartementService,
    private orgSvc: OrganismeMiniDtoService,
    private sessionUtilisateurSvc: SessionUtilisateurService,
    private paysSvc: PaysService
  ) { }

  ngOnInit() {
    if (window !== undefined) { window.scroll(0, 0); }
    this.modelForm = this.fb.group({});
    this.initFilAriane();
  }

  ngAfterViewInit() {
    // Chargement des référentiels
    this.initListesReferentiels();
  }

  private initListesReferentiels() {
    forkJoin([this.jcSvc.getAll(), this.deptSvc.getAutorises(),
      this.getLoggedUser().is(PROFILS.ADMINISTRATEUR_NATIONAL) ? this.orgSvc.getAll() : this.orgSvc.getAutorises(),
      this.paysSvc.getByCode(CODE_PAYS.FRANCE)]
    ).subscribe(results => {
      this.listeJc = results[0] as JourChome[];
      this.listeDept = results[1] as Departement[];
      this.listeOrg = results[2] as OrganismeMiniDto[];
      this.paysFrance = results[3] as Pays;
      this.initFormulaireOrganisme();
    });
  }
  private initFormulaireOrganisme() {
    const currentOrgUuid = this.route.snapshot.params['uuid'];
    // EDITION
    if (currentOrgUuid) {
      this.organismeService.getByUuid(currentOrgUuid).subscribe((orgResult: Organisme) => {
        this.prepareFormulaire(orgResult);
      });
    } else { // CREATION
      this.canEditEnfants = true;
      this.loading = false;
      this.initFilAriane();
      this.localInitFilAriane(undefined);
    }
  }
  // Prépare le formulaire à partir des données de l'organisme de l'uuid passé en paramètre
  // OU après un premier enregistrement
  private prepareFormulaire(org: Organisme) {
    this.submitting = false;
    this.submitted = false;
    this.canEditEnfants = !this.currentOrganismeIsUserOrganisme(org);
    this.currentOrganismeId = org.id;
    // Signatures
    this.organismeService.getSignatures(this.currentOrganismeId).subscribe((signatures: Signature[]) => {
      // Sécurisation de l'adresse, si nécessaire
      if (org.adresse === undefined || org.adresse === null) {
        org.adresse = new Adresse();
      }
      // Patch du formulaire
      org.signatures = (signatures) ? signatures : [];
      this.modelForm.patchValue(org);
      this.modelForm.patchValue({
        departement: ((org.departement !== null) ? this.findInListById(org.departement.id, this.listeDept) : undefined),
      });
      // Traitement de la règle de validation du courriel
      const courriel = this.modelForm.get('courriel');
      if (!org.notificationTeletransmission) {
        courriel.clearValidators();
        courriel.setValidators([Validators.maxLength(250), Validators.email]);
        courriel.updateValueAndValidity();
      }
      // Remplissage des FormArray
      this.setListeElements(org.enfants, 'enfants');
      this.setListeElements(org.joursChomes, 'joursChomes');
      this.triListeSignatures(org.signatures);
      this.setListeElements(org.signatures, 'signatures');
      this.initFilAriane();
      this.localInitFilAriane(org.nomCourt);
      this.loading = false;
    });
  }


  // UTILS
  private triListeSignatures(listeSign: Signature[]) {
    listeSign = listeSign.sort((a, b) => {
      if (a.principale && !b.principale) { return -1; }
      if (!a.principale && b.principale)  { return 1; }
      return 0;
    });
  }
  private setListeElements(liste: any[], nomTableau: string) {
    if (liste && liste.length > 0) {
      const array = <FormArray>this.modelForm.controls[nomTableau];
      liste.forEach(x => {
        array.push(this.fb.control(x));
      });
    }
  }
  private findInListById(_id: number, _liste: any[]) {
    return _liste.find((val) => {
      return val.id === _id;
    });
  }
  private cleanForm() {
    this.modelForm.markAsPristine();
    this.modelForm.markAsUntouched();
    this.cleanArray('enfants');
    this.cleanArray('joursChomes');
    this.cleanArray('signatures');
  }
  private cleanArray(nomTableau: string) {
    const array = <FormArray>this.modelForm.controls[nomTableau];
    for (let i = array.length - 1; i >= 0; i--) {
      array.removeAt(i);
    }
  }
  private currentOrganismeIsUserOrganisme(org: Organisme) {
    return this.getLoggedUser().organisme.id === org.id;
  }
  private getLoggedUser(): Utilisateur {
    if (!this.currentUser) { this.currentUser = this.sessionUtilisateurSvc.getStorableUser(); }
    return this.currentUser;
  }


  ///// FORMULAIRE - GETTERS
  get id(): FormControl { return (this.modelForm) ? this.modelForm.get('id') as FormControl : undefined; }
    get createMode(): Boolean { return (this.id) ? !this.id.value : true; }
  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched || this.submitted);
  }
  hasGroupError(group: FormGroup): Boolean {
    return group.invalid && (group.dirty || group.touched || this.submitted);
  }


  ///// ACTIONS
  sortir() {
    this.router.navigate(['/' + ROUTES.ADMINISTRATION + '/' + ROUTES.ORGANISMES]);
  }

  // Sauvegarde
  save() {
    this.submitted = true;
    if (this.modelForm.invalid) {
      if (window !== undefined) { window.scroll(0, 0); }
      return false;
    }
    this.submitting = true;
    this.modelForm.get('adresse').get('pays').setValue(this.paysFrance);
    this.organismeService.saveWithCallback(
      new Organisme(this.modelForm.value),
      (error: any) => { this.submitting = false; }
    ).subscribe((org: Organisme) => {
      if (window !== undefined) { window.scroll(0, 0); }
      this.loading = true;
      this.toasterService.pop({
        type: TYPE_TOAST.SUCCES, body: `Enregistrement réalisé avec succès.`
      });
      if (this.createMode) { // Si on était en mode création, on modifie l'URL
        const url = this.router.createUrlTree([org.uuid], {relativeTo: this.route}).toString();
        this.location.go(url);
      }
      this.cleanForm();
      this.prepareFormulaire(org);
    });
  }


  /** IPreventNavigation + IFilAriane */
  get canNavigate(): boolean { return !this.modelForm.dirty; }

  initFilAriane() {
    this.filAriane = [
      new FilArianeItem('Administration', undefined),
      new FilArianeItem('Organismes', '/' + ROUTES.ADMINISTRATION + '/' + ROUTES.ORGANISMES)
    ];
  }
  localInitFilAriane(nomOrga: string) {
    this.filAriane.push(new FilArianeItem((this.createMode) ? `Création d'un organisme` : nomOrga, undefined));
  }
  getFilAriane(): FilArianeItem[] {
    return this.filAriane;
  }

}
