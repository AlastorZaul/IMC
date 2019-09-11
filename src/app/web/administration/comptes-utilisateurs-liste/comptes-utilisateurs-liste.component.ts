import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { forkJoin } from 'rxjs';
import { MatDialog } from '@angular/material';
import { FormControl, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { IFilAriane } from 'src/app/interfaces/IFilAriane';
import { FilArianeItem } from 'src/app/modeles/utils/fil-ariane-item.model';
import { IPageRecherche } from 'src/app/interfaces/IPageRecherche';
import { SearchResponseDto } from 'src/app/modeles/recherche/search-response.dto';
import { SearchRequestDto } from 'src/app/modeles/recherche/search-request.dto';
import { ROUTES } from 'src/app/constantes/routes';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { Utilisateur } from 'src/app/modeles/dto/utilisateur.dto';
import { CompteUtilisateur } from 'src/app/modeles/compte-utilisateur.model';
import { Profil } from 'src/app/modeles/profil.model';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { CompteUtilisateurService } from 'src/app/services/crud/compte-utilisateur.service';
import { ProfilService } from 'src/app/services/crud/profil.service';
import { OrganismeMiniDtoService } from 'src/app/services/crud/mini-dto/organisme-mini-dto.service';
import { ToasterService } from 'angular2-toaster';
import { CompteModaleComponent } from './compte-modale/compte-modale.component';
import { RemoveModaleComponent } from '../../commun/modales/remove-modale.component';
import { SessionUtilisateurService } from 'src/app/services/session-utilisateur.service';



@Component({
  selector: 'app-comptes-utilisateurs-liste',
  templateUrl: './comptes-utilisateurs-liste.component.html'
})
export class ComptesUtilisateursListeComponent implements OnInit, IFilAriane, IPageRecherche {

  filAriane: FilArianeItem[];
  currentUser: Utilisateur;
  // Recherche
  searchRequestItem: SearchRequestDto;
  profils: Profil[];
  organismes: OrganismeMiniDto[];
  comptes: CompteUtilisateur[];
  // Loaders
  loading = true;
  loadingListe = true;
  // Formulaire filtres
  filtresForm: FormGroup;
  // export
  @ViewChild('downloadLink') private downloadLink: ElementRef;
  isExporting = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private toasterService: ToasterService,
    private compteService: CompteUtilisateurService,
    private profilService: ProfilService,
    private sessionUtilisateurSvc: SessionUtilisateurService,
    private organismeMiniService: OrganismeMiniDtoService
  ) { }


  ngOnInit() {
    this.searchRequestItem = new SearchRequestDto();
    this.initFilAriane();
    this.filtresForm = this.fb.group({
      identite: ['', [Validators.maxLength(250)]],
      identifiant: ['', [Validators.maxLength(250)]],
      'profil.id': [undefined],
      'organisme.id': [undefined]
    });
    this.searchRequestItem.updateTris('identite');
    this.chargerReferentielFiltres(); // Appelle rechargeListeComptes() en cascade
  }
  private chargerReferentielFiltres() {
    this.loading = true;
    forkJoin([this.organismeMiniService.getAutorises(), this.profilService.getAll()]).subscribe(results => {
      this.organismes = results[0] as OrganismeMiniDto[];
      if (this.organismes.length === 1) { // Un seul organisme, on le sélectionne tout de suite.
        this.filtresForm.patchValue({'organisme.id': this.organismes[0].id});
        this.organisme.disable();
      }
      this.profils = results[1] as Profil[];
      this.searchRequestItem.updateFiltresWithFormGroup(this.filtresForm, false);
      this.rechargeGrille();
    });
  }
  public rechargeGrille() {
    this.loadingListe = true;
    this.compteService.search(this.searchRequestItem).subscribe((searchResponse: SearchResponseDto) => {
      this.comptes = searchResponse.content as [CompteUtilisateur];
      this.searchRequestItem.updatePagerFromSearchResponseDto(searchResponse);
      this.loading = false;
      this.loadingListe = false;
    });
  }


  ///// FORMULAIRE - GETTERS
  get identite(): FormControl { return this.filtresForm.get('identite') as FormControl; }
  get identifiant(): FormControl { return this.filtresForm.get('identifiant') as FormControl; }
  get profil(): FormControl { return this.filtresForm.controls['profil.id'] as FormControl; }
  get organisme(): FormControl { return this.filtresForm.controls['organisme.id'] as FormControl; }
  hasError(control: FormControl): Boolean {
    return control.invalid && (control.dirty || control.touched);
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

  /// AUTRES
  public compteIsCurrentUser(usr: CompteUtilisateur) {
    if (!this.currentUser) { this.currentUser = this.sessionUtilisateurSvc.getStorableUser(); }
    return this.currentUser.id === usr.id;
  }

  public exporter() {
    this.isExporting = true;
    this.compteService.exportXLS(
      this.searchRequestItem, this.downloadLink, 'export-comptes-utilisateur.xls',
      (() => {this.isExporting = false; }));
  }


  /** ACTIONS D'EDITION */
  ajoutCompte() {
    this.dialog.open(CompteModaleComponent, {
      disableClose : true,
      data : { listeProfils: this.profils, listeOrganismes: this.organismes }
    }).afterClosed().subscribe((cmpt: CompteUtilisateur) => {
      if (cmpt !== undefined) { // S'il y a un ajout
        this.rechargeGrille();
      }
    });
  }

  modifCompte(compte: CompteUtilisateur) {
    this.dialog.open(CompteModaleComponent, {
      disableClose : true,
      data : { compte: compte, listeProfils: this.profils, listeOrganismes: this.organismes }
    }).afterClosed().subscribe((cmpt: CompteUtilisateur) => {
      if (cmpt !== undefined) { // S'il y a une modif
        this.rechargeGrille();
      }
    });
  }

  supprCompte(compte: CompteUtilisateur) {
    if (this.compteIsCurrentUser(compte)) { return; }
    this.dialog.open(RemoveModaleComponent, {
      disableClose : true,
      data: {
        titre: `Supprimer un compte`,
        contenu: `Ce compte va être supprimé.<br/>Confirmer la suppression ?`,
        elementASupprimer: compte,
        service: this.compteService,
      }
    }).afterClosed().subscribe(res => {
      if (res) { // S'il y a eu une suppression
        this.rechargeGrille();
      }
    });
  }


  /** Gestion du fil d'Ariane */
  initFilAriane(): void {
    this.filAriane = [
      new FilArianeItem('Administration', undefined, false),
      new FilArianeItem('Comptes utilisateurs', '/' + ROUTES.ADMINISTRATION + '/' + ROUTES.UTILISATEURS)
    ];
  }
  getFilAriane(): FilArianeItem[] {
    return this.filAriane;
  }

}
