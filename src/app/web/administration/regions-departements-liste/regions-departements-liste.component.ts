import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material';
import { ROUTES } from 'src/app/constantes/routes';
import { IFilAriane } from 'src/app/interfaces/IFilAriane';
import { FilArianeItem } from 'src/app/modeles/utils/fil-ariane-item.model';
import { Region } from 'src/app/modeles/region.model';
import { Departement } from 'src/app/modeles/departement.model';
import { RegionService } from 'src/app/services/crud/region.service';
import { DepartementService } from 'src/app/services/crud/departement.service';
import { RegionModaleComponent } from './region-modale/region-modale.component';
import { DepartementModaleComponent } from './departement-modale/departement-modale.component';
import { Organisme } from 'src/app/modeles/organisme.model';
import { OrganismeMiniDto } from 'src/app/modeles/dto/organisme-mini-dto.dto';
import { OrganismeMiniDtoService } from 'src/app/services/crud/mini-dto/organisme-mini-dto.service';



@Component({
  selector: 'app-regions-departements-liste',
  templateUrl: './regions-departements-liste.component.html'
})
export class RegionsDepartementsListeComponent implements OnInit, IFilAriane {

  regions: Region[];
  organismes: OrganismeMiniDto[];
  filAriane: FilArianeItem[];
  parentChangeAccordeon: Subject<boolean> = new Subject();
  // Loaders
  loading = true;

  constructor(
    private dialog: MatDialog,
    private regionService: RegionService,
    private organismeService: OrganismeMiniDtoService,
    private dptService: DepartementService
  ) { }

  ngOnInit() {
    this.initFilAriane();
    this.chargeListeOrganisme(); // => Appelle rechargeListe();
  }

  public chargeListeOrganisme() {
    this.loading = true;
    this.organismeService.getAll().subscribe((orgasResult: [Organisme]) => {
        this.organismes = orgasResult;
        this.rechargeListe();
    });
  }
  public rechargeListe() {
    this.loading = true;
    this.regionService.getAll().subscribe((regionsResult: [Region]) => {
      this.dptService.getAll().subscribe((results2: [Departement]) => {
        this.regions = regionsResult;
        results2.forEach((dpt) => {
          const regId = dpt.region.id;
          const currRegion = this.regions.find((reg) => {
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
      });
    });
  }


  /** ACTIONS D'EDITION */
  ajoutRegion() {
    this.dialog.open(RegionModaleComponent, {
      disableClose : true, data: { }
    }).afterClosed().subscribe((reg: Region) => {
      if (reg !== undefined) { // S'il y a un ajout
        this.rechargeListe();
      }
    });
  }

  ajoutDepartement() {
    this.dialog.open(DepartementModaleComponent, {
      disableClose : true, data: {listeRegions: this.regions, listeOrganismes: this.organismes }
    }).afterClosed().subscribe((dpt: Departement) => {
      if (dpt !== undefined) { // S'il y a un ajout
        this.rechargeListe();
      }
    });
  }

  /** ACCORDEONS */
  changeTousAccordeons(etat: boolean) { this.parentChangeAccordeon.next(etat); }

  /** Gestion du fil d'Ariane */
  initFilAriane() {
    this.filAriane = [
      new FilArianeItem('Administration', undefined, false),
      new FilArianeItem('Régions et départements', '/' + ROUTES.ADMINISTRATION + '/' + ROUTES.REGIONSDEPTS)
    ];
  }
  getFilAriane(): FilArianeItem[] {
    return this.filAriane;
  }

}
