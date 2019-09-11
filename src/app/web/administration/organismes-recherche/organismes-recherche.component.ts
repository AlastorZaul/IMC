import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ROUTES } from 'src/app/constantes/routes';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { IFilAriane } from 'src/app/interfaces/IFilAriane';
import { FilArianeItem } from 'src/app/modeles/utils/fil-ariane-item.model';
import { SearchRequestDto } from 'src/app/modeles/recherche/search-request.dto';
import { SearchResponseDto } from 'src/app/modeles/recherche/search-response.dto';
import { Utilisateur } from 'src/app/modeles/dto/utilisateur.dto';
import { PROFILS } from 'src/app/constantes/referentiel/profils.enum';
import { ToasterService } from 'angular2-toaster';
import { RegionService } from 'src/app/services/crud/region.service';
import { DepartementService } from 'src/app/services/crud/departement.service';
import { RegionDtoDepartement } from 'src/app/modeles/dto/region-departement.dto';
import { Departement } from 'src/app/modeles/departement.model';
import { RemoveModaleComponent } from '../../commun/modales/remove-modale.component';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { OrganismeMiniDtoService } from 'src/app/services/crud/mini-dto/organisme-mini-dto.service';
import { OrganismeService } from 'src/app/services/crud/organisme.service';
import { SessionUtilisateurService } from 'src/app/services/session-utilisateur.service';


@Component({
  selector: 'app-organismes-recherche',
  templateUrl: './organismes-recherche.component.html'
})
export class OrganismesRechercheComponent implements OnInit, IFilAriane {

  user: Utilisateur = undefined;
  filAriane: FilArianeItem[];
  // Recherche
  searchRequestItem: SearchRequestDto;
  regionsDeptFiltre: RegionDtoDepartement[];
  selectedRegion: RegionDtoDepartement;
  organismes: OrganismeMiniDto[];
  // Loaders
  loading = true;
  loadingListe = true;
  // Formulaire filtres
  filtresForm: FormGroup;
  _ROUTES = ROUTES;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toasterService: ToasterService,
    private regionService: RegionService,
    private organismeMiniService: OrganismeMiniDtoService,
    private organismeService: OrganismeService,
    private sessionUtilisateurSvc: SessionUtilisateurService,
    private dptService: DepartementService,
    private router: Router
  ) { }

  ngOnInit() {
    this.searchRequestItem = new SearchRequestDto();
    this.getLoggedUser();
    this.initFilAriane();
    this.filtresForm = this.fb.group({
      'departement.region.id': [{value: [undefined], disabled: false}],
      'departement.id': [{value: [undefined], disabled: true}],
    });
    this.searchRequestItem.updateTris('departement.region.intitule');
    this.searchRequestItem.updateTris('departement.intitule');
    this.chargerReferentielFiltres(); // Appelle rechargeListeComptes() en cascade
  }
  private chargerReferentielFiltres() {
    this.loading = true;
    forkJoin([this.regionService.getAutorises(), this.dptService.getAutorises()]).subscribe(results => {
      this.regionsDeptFiltre = results[0] as RegionDtoDepartement[];
      const departementsResult = results[1] as Departement[];
      departementsResult.forEach((dpt) => {
        const regId = dpt.region.id;
        const currRegion = this.regionsDeptFiltre.find((reg) => {
          return reg.id === regId;
        });
        if (currRegion) {
          if (currRegion.departements === undefined) {
            currRegion.departements = ([] as Departement[]);
          }
          currRegion.departements.push(dpt);
        }
      });
      // RG de sélection/désactivation des filtres
      this.prepareForm();
      this.rechargeGrille();
    });
  }
  public rechargeGrille() {
    this.loadingListe = true;
    this.organismeMiniService.search(this.searchRequestItem).subscribe((searchResponse: SearchResponseDto) => {
      this.organismes = searchResponse.content as [OrganismeMiniDto];
      this.searchRequestItem.updatePagerFromSearchResponseDto(searchResponse);
      this.loading = false;
      this.loadingListe = false;
    });
  }

  ///// FORMULAIRE - GETTERS
  get region(): FormControl { return this.filtresForm.controls['departement.region.id'] as FormControl; }
  get departement(): FormControl { return this.filtresForm.controls['departement.id'] as FormControl; }

  /** RECHERCHE **/
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

  /// FILTRES
  public changeFiltreRegion() {
    this.selectedRegion = undefined;
    this.filtresForm.patchValue({'departement.id': undefined});
    if (this.region.value !== undefined && this.region.value !== null) {
      this.departement.enable();
      this.selectedRegion = this.regionsDeptFiltre.find((reg: RegionDtoDepartement) => {
        return reg.id === this.region.value;
      });
    } else {
      this.departement.disable();
    }
  }
  // RG de sélection/désactivation des filtres
  public prepareForm() {
    // Une seule région accessible, on la sélectionne tout de suite + désactivation
    if (this.regionsDeptFiltre.length === 1) {
      this.selectedRegion = this.regionsDeptFiltre[0];
      this.region.setValue(this.regionsDeptFiltre[0].id);
      this.region.disable();
      // Un seul dpt accessible, on le sélectionne tout de suite + désactivation
      if (this.selectedRegion.departements.length === 1) {
        this.departement.setValue(this.selectedRegion.departements[0].id);
        this.departement.disable();
      } else {
        this.departement.setValue(undefined);
        this.departement.enable();
      }
    } else {
      this.selectedRegion = undefined;
      this.departement.disable();
      this.filtresForm.reset();
    }
    this.searchRequestItem.updateFiltresWithFormGroup(this.filtresForm, false);
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
    this.searchRequestItem.updateFiltresWithFormGroup(this.filtresForm, backToFirstPage);
    this.rechargeGrille();
  }


  /** ACTIONS D'EDITION */
  modifOrganisme(org: OrganismeMiniDto) {
    this.loadingListe = true;
    this.router.navigate(
      ['/' + ROUTES.ADMINISTRATION + '/' + ROUTES.ORGANISMES + '/' + ROUTES.ACT_GESTION + '/' + org.uuid]
    ).then((value: boolean) => { // Retour du Guard "OrganismeGuard"
      if (!value) { this.loadingListe = false; }
    });
  }


  supprOrganisme(org: OrganismeMiniDto) {
    this.dialog.open(RemoveModaleComponent, {
      disableClose : true,
      data: {
        titre: `Supprimer un organisme`,
        contenu: `Cet organisme va être supprimé.<br/>Confirmer la suppression ?`,
        elementASupprimer: org,
        service: this.organismeService,
      }
    }).afterClosed().subscribe(res => {
      if (res) { // S'il y a eu une suppression
        this.rechargeGrille();
      }
    });
  }

  /** Gestion du fil d'Ariane */
  initFilAriane() {
    this.filAriane = [
      new FilArianeItem('Administration', undefined, false),
      new FilArianeItem('Organismes', '/' + ROUTES.ADMINISTRATION + '/' + ROUTES.ORGANISMES)
    ];
  }
  getFilAriane(): FilArianeItem[] {
    return this.filAriane;
  }

  getLoggedUser(): Utilisateur {
    if (!this.user) { this.user = this.sessionUtilisateurSvc.getStorableUser(); }
    return this.user;
  }

  userIsAdminNational() {
    return this.getLoggedUser().is(PROFILS.ADMINISTRATEUR_NATIONAL);
  }
}
