import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { IFilAriane } from 'src/app/interfaces/IFilAriane';
import { FilArianeItem } from 'src/app/modeles/utils/fil-ariane-item.model';
import { IPageRecherche } from 'src/app/interfaces/IPageRecherche';
import { SearchResponseDto } from 'src/app/modeles/recherche/search-response.dto';
import { SearchRequestDto } from 'src/app/modeles/recherche/search-request.dto';
import { ROUTES } from 'src/app/constantes/routes';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { JourChome } from 'src/app/modeles/jour-chome.model';
import { ToasterService } from 'angular2-toaster';
import { JourChomeService } from 'src/app/services/crud/jour-chome.service';
import { JourChomeModaleComponent } from './jour-chome-modale/jour-chome-modale.component';
import { RemoveModaleComponent } from '../../commun/modales/remove-modale.component';



@Component({
  selector: 'app-jours-chomes-liste',
  templateUrl: './jours-chomes-liste.component.html'
})
export class JoursChomesListeComponent implements OnInit, IFilAriane, IPageRecherche {

  filAriane: FilArianeItem[];
  // Recherche
  searchRequestItem: SearchRequestDto;
  joursChomes: JourChome[];
  // Loaders
  loading = true;
  loadingListe = true;

  constructor(
    private dialog: MatDialog,
    private toasterService: ToasterService,
    private jcService: JourChomeService
  ) { }

  ngOnInit() {
    this.searchRequestItem = new SearchRequestDto();
    this.initFilAriane();
    this.searchRequestItem.updateTris('intitule');
    this.rechargeGrille();
  }
  public rechargeGrille() {
    this.loadingListe = true;
    this.jcService.search(this.searchRequestItem).subscribe((searchResponse: SearchResponseDto) => {
      this.joursChomes = searchResponse.content as [JourChome];
      this.searchRequestItem.updatePagerFromSearchResponseDto(searchResponse);
      this.loading = false;
      this.loadingListe = false;
    });
  }

  /** RECHERCHE et EXPORT **/
  //// TRIS
  public triColonne(nomColonneTri: string): void {
    this.searchRequestItem.updateTris(nomColonneTri);
    this.rechargeGrille();
  }
  public getSortIconName(nomColonneTri: string): string {
    return this.searchRequestItem.getSortIconNameByNomColonneTri(nomColonneTri);
  }

  /// RECHERCHE
  public rechercher(backToFirstPage = false) {
    this.rechargeGrille();
  }


  /** ACTIONS D'EDITION */
  ajoutJourChome() {
    this.dialog.open(JourChomeModaleComponent, {
      disableClose : true, data : { }
    }).afterClosed().subscribe((jc: JourChome) => {
      if (jc !== undefined) { // S'il y a un ajout
        this.rechargeGrille();
      }
    });
  }

  modifJourChome(jourChome: JourChome) {
    if (jourChome.systeme) { return; }
    this.dialog.open(JourChomeModaleComponent, {
      disableClose : true,
      data : { jourChome: jourChome }
    }).afterClosed().subscribe((jc: JourChome) => {
      if (jc !== undefined) { // S'il y a une modif
        this.rechargeGrille();
      }
    });
  }

  supprJourChome(jourChome: JourChome) {
    if (jourChome.systeme) { return; }
    this.dialog.open(RemoveModaleComponent, {
      disableClose : true,
      data: {
        titre: `Supprimer un jour chômé`,
        contenu: `Ce jour chômé sera automatiquement dissocié des organismes auxquels il est attaché.<br/>
        Confirmer la suppression du jour chômé ?`,
        elementASupprimer: jourChome,
        service: this.jcService,
      }
    }).afterClosed().subscribe(res => {
      if (res) { // S'il y a eu une suppression
        this.rechargeGrille();
      }
    });
  }

  changerEtatJourChome(jourChome: JourChome, newState: boolean) {
    this.loadingListe = true;
    jourChome.actif = newState;
    this.jcService.saveWithCallback(jourChome,
      (error: any) => { this.loadingListe = false; }
    ).subscribe((jc: JourChome) => {
      this.toasterService.pop({
        type: TYPE_TOAST.SUCCES, body: `Le jour chômé "${jc.intitule}" a été ${newState ? 'activé' : 'désactivé' } avec succès.`
      });
      this.loadingListe = false;
    });
  }

  /** Gestion du fil d'Ariane */
  initFilAriane(): void {
    this.filAriane = [
      new FilArianeItem('Administration', undefined, false),
      new FilArianeItem('Jours chômés', '/' + ROUTES.ADMINISTRATION + '/' + ROUTES.JOURSCHOMES)
    ];
  }
  getFilAriane(): FilArianeItem[] {
    return this.filAriane;
  }

}
