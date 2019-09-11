import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { Demande } from 'src/app/modeles/demande.model';
import { ETAPE } from 'src/app/constantes/referentiel/etape.enum';
import { STATUT } from 'src/app/constantes/referentiel/statut.enum';
import { DemandeRechercheDtoService } from 'src/app/services/crud/mini-dto/demande-recherche-dto-service';
import { SearchRequestDto } from 'src/app/modeles/recherche/search-request.dto';
import { FilterItem } from 'src/app/modeles/recherche/filter-item';

@Component({
  selector: 'app-liste-demandes-modale',
  templateUrl: './liste-demandes-modale.component.html'
})
export class ListeDemandesModaleComponent implements OnInit {

  public listeDemSimilaires: Demande[] = [];
  public isDemandesEtablissement = true;
  // export
  @ViewChild('downloadLinkControle') private downloadLink: ElementRef;
  isExporting = false;

  constructor(
    public dialogRef: MatDialogRef<ListeDemandesModaleComponent>,
    private demandeService: DemandeRechercheDtoService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { }

  ngOnInit() {
    // Listes
    if (this.data.listeDemSimilairesEtab) {
      this.listeDemSimilaires = this.data.listeDemSimilairesEtab;
      this.isDemandesEtablissement = true;
    }
    if (this.data.listeDemSimilairesEntre) {
      this.listeDemSimilaires = this.data.listeDemSimilairesEntre;
      this.isDemandesEtablissement = false;
    }
  }

  /// VALIDATION PARTICULIERES ///
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

  ///// ACTIONS
  // Ferme la pop-up sans rien faire
  close() {
    this.dialogRef.close();
  }

  // Exporter
  export() {
    this.isExporting = true;
    const searchRequestItem = new SearchRequestDto();
    let filter = '';
    let firstParam = true;
    this.listeDemSimilaires.forEach((dem) => {
      if (!firstParam) { filter += '|'; }
      filter += dem.numero;
      firstParam = false;
    });
    searchRequestItem.updateTris('numero');
    searchRequestItem.filtres.push(new FilterItem('numero', filter));
    this.demandeService.exportXLS(searchRequestItem, this.downloadLink, 'export-demandes-controle.xls',
    (() => {this.isExporting = false; }));
  }
}
