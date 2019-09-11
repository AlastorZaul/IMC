import { Component, OnInit, Input } from '@angular/core';
import { FormGroupDirective, ControlContainer } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { Demande } from 'src/app/modeles/demande.model';
import { ListeDemandesModaleComponent
} from 'src/app/web/demandes/demandes-gestion/dem-onglet-controle/liste-demandes-modale/liste-demandes-modale.component';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-dem-onglet-controle',
  templateUrl: './dem-onglet-controle.component.html',
  viewProviders: [
    { provide: ControlContainer, useExisting: FormGroupDirective }
  ]
})
export class DemOngletControleComponent implements OnInit {

  @Input() parentIsConsultation: Subject<boolean>;
  public listeDemSimilairesEtab: Demande[] = [];
  public listeDemSimilairesEntre: Demande[] = [];
  public messagesAlerte = [];
  public loaderEtab = false;
  public loaderEntre = false;
  public operationEtabOk = false;
  public operationEntrepriseOk = false;
  public noCalculEntreprise = false;
  private consultation = false; // Synchronisé avec celui du parent

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    if (this.parentIsConsultation) {
      this.parentIsConsultation.subscribe(consult => {
        this.consultation = consult;
      });
    }
  }

  reinitOngletControle() {
    this.operationEtabOk = false;
    this.operationEntrepriseOk = false;
    this.loaderEtab = false;
    this.loaderEntre = false;
    this.listeDemSimilairesEntre = [];
    this.listeDemSimilairesEtab = [];
    this.messagesAlerte = [];
    this.noCalculEntreprise = false;
  }

  messageInfoVisible() {
    return !this.operationEtabOk && !this.operationEntrepriseOk && !this.loaderEtab && !this.loaderEntre
      && (this.listeDemSimilairesEtab.length === 0 && this.listeDemSimilairesEntre.length === 0);
  }
  existeResultatsEtablissement() {
    return this.operationEtabOk && !this.loaderEtab
    && (this.listeDemSimilairesEtab && this.listeDemSimilairesEtab.length > 0);
  }
  aucunResultatEtablissement() {
    return this.operationEtabOk && !this.loaderEtab
    && (this.listeDemSimilairesEtab && this.listeDemSimilairesEtab.length === 0);
  }
  existeResultatsEntreprise() {
    return this.operationEntrepriseOk && !this.loaderEntre
    && (this.listeDemSimilairesEntre && this.listeDemSimilairesEntre.length > 0);
  }
  aucunResultatEntreprise() {
    return this.operationEntrepriseOk && !this.loaderEntre
    && (this.listeDemSimilairesEntre && this.listeDemSimilairesEntre.length === 0);
  }

  /** BEFORE / AFTER PATCH PRINCIPAL FORM */
  beforePatchPrincipalForm(dem: Demande) {}
  afterPatchPrincipalForm(dem: Demande) {}
  // Méthodes de contrôle du formulaire
  isOngletValid(): boolean {
    return this.operationEntrepriseOk && this.operationEtabOk && !this.consultation;
  }
  isOngletWarn(): boolean {
    return (!this.operationEntrepriseOk || !this.operationEtabOk) || this.messagesAlerte.length > 0;
  }
  isOngletInvalid(): Boolean {
    return false;
  }

  /// ACTIONS ///
  showDemandesEtab(): void {
    this.dialog.open(ListeDemandesModaleComponent, {
      disableClose : true,
      data : { listeDemSimilairesEtab: this.listeDemSimilairesEtab}
    });
  }
  showDemandesEntre(): void {
    this.dialog.open(ListeDemandesModaleComponent, {
      disableClose : true,
      data : {listeDemSimilairesEntre: this.listeDemSimilairesEntre}
    });
  }

}
