import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { RegionDtoDepartement } from 'src/app/modeles/dto/region-departement.dto';
import { Subject } from 'rxjs';
import { MatDialog } from '@angular/material';
import { RemoveModaleComponent } from 'src/app/web/commun/modales/remove-modale.component';
import { RegionModaleComponent } from '../region-modale/region-modale.component';
import { DepartementModaleComponent } from '../departement-modale/departement-modale.component';
import { Region } from 'src/app/modeles/region.model';
import { Departement } from 'src/app/modeles/departement.model';
import { Organisme } from 'src/app/modeles/organisme.model';
import { RegionService } from 'src/app/services/crud/region.service';
import { DepartementService } from 'src/app/services/crud/departement.service';


@Component({
  selector: 'app-liste-accordeons-item',
  templateUrl: './liste-accordeons-item.component.html'
})
export class ListeAccordeonsItemComponent implements OnInit {

  @Input() region: RegionDtoDepartement;
  @Input() regions: RegionDtoDepartement[];
  @Input() organismes: Organisme[];
  @Input() parentChangeAccordeon: Subject<boolean>;
  @Output() rechargeListe: EventEmitter<any> = new EventEmitter();

  private itemOuvert = false;

  constructor(
    private dialog: MatDialog,
    private regionService: RegionService,
    private departementService: DepartementService
  ) { }

  ngOnInit() {
    if (this.parentChangeAccordeon) {
      this.parentChangeAccordeon.subscribe(etat => {
        this.changeAccordeon(etat);
    });
    }
  }


  /** ACTIONS D'EDITION */
  // Régions
  modifRegion() {
    this.dialog.open(RegionModaleComponent, {
      disableClose : true,
      data : { region: this.region }
    }).afterClosed().subscribe((reg: Region) => {
      if (reg !== undefined) { // S'il y a un ajout
        this.rechargeListe.emit();
      }
    });
  }
  supprRegion() {
    this.dialog.open(RemoveModaleComponent, {
      disableClose : true,
      data: {
        titre: `Supprimer une région`,
        contenu: `Cette région ainsi que tous ses départements vont être supprimés.<br/>Confirmer la suppression ?`,
        elementASupprimer: this.region,
        service: this.regionService,
      }
    }).afterClosed().subscribe(res => {
      if (res) { // S'il y a eu une suppression
        this.rechargeListe.emit();
      }
    });
  }

  // Départements
  ajoutDepartementDansRegion() {
    this.dialog.open(DepartementModaleComponent, {
      disableClose : true,
      data : { region: this.region, listeRegions: this.regions, listeOrganismes: this.organismes }
    }).afterClosed().subscribe((dpt: Departement) => {
      if (dpt !== undefined) { // S'il y a un ajout
        this.rechargeListe.emit();
      }
    });
  }
  modifDepartement(departement: Departement, ndx: number) {
    this.dialog.open(DepartementModaleComponent, {
      disableClose : true,
      data : { departement: departement, listeRegions: this.regions, listeOrganismes: this.organismes }
    }).afterClosed().subscribe((dpt: Departement) => {
      if (dpt !== undefined) { // S'il y a modification
        this.rechargeListe.emit();
      }
    });
  }
  supprDepartement(dpt: Departement, ndx: number) {
    this.dialog.open(RemoveModaleComponent, {
      disableClose : true,
      data: {
        titre: `Supprimer un département`,
        contenu: `Ce département va être supprimé. Confirmer la suppression ?`,
        elementASupprimer: dpt,
        service: this.departementService,
      }
    }).afterClosed().subscribe(res => {
      if (res) { // S'il y a eu une suppression
        this.rechargeListe.emit();
      }
    });
  }

  /** ACCORDEONS */
  changeAccordeon(etat: boolean) { this.itemOuvert = etat; }
  isOuvert() { return this.itemOuvert; }

}
