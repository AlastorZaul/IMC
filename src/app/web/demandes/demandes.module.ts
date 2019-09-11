import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared.module';
import { DemandesRoutingModule } from './demandes-routing.module';
import { ToasterModule } from 'angular2-toaster';
// Components
import { DemandesRechercheComponent } from './demandes-recherche/demandes-recherche.component';
import { DemandesGestionComponent } from './demandes-gestion/demandes-gestion.component';
import { RapportsComponent } from './rapports/rapports.component';
import { EtapeService } from 'src/app/services/crud/etape.service';
import { StatutService } from 'src/app/services/crud/statut.service';
import { VerrouService } from 'src/app/services/crud/verrou.service';
import { DemandesConsultationRestreinteComponent } from './demandes-consultation-restreinte/demandes-consultation-restreinte.component';
import { DemOngletGestionComponent } from './demandes-gestion/dem-onglet-gestion/dem-onglet-gestion.component';
import { DemOngletEmployeurComponent } from './demandes-gestion/dem-onglet-employeur/dem-onglet-employeur.component';
import { DemOngletSalarieComponent } from './demandes-gestion/dem-onglet-salarie/dem-onglet-salarie.component';
import { DemOngletCalculComponent } from './demandes-gestion/dem-onglet-calcul/dem-onglet-calcul.component';
import { DemOngletCalendrierComponent } from './demandes-gestion/dem-onglet-calendrier/dem-onglet-calendrier.component';
import { DemOngletDecisionComponent } from './demandes-gestion/dem-onglet-decision/dem-onglet-decision.component';
import { DecAccepterModaleComponent } from './demandes-gestion/dem-onglet-decision/dec-accepter-modale/dec-accepter-modale.component';
import { DemOngletCourrierComponent } from './demandes-gestion/dem-onglet-courrier/dem-onglet-courrier.component';
import { DemOngletCommunComponent } from './demandes-gestion/dem-onglet-commun/dem-onglet-commun.component';
import { TransfertModaleComponent } from './demandes-gestion/dem-onglet-gestion/transfert-modale/transfert-modale.component';
// Guards
import { DemandeGuard } from 'src/app/guards/demande.guard';
import { NettoyageVerrouGuard } from 'src/app/guards/nettoyage-verrou.guard';
import { DemOngletControleComponent } from './demandes-gestion/dem-onglet-controle/dem-onglet-controle.component';
import { ListeDemandesModaleComponent } from './demandes-gestion/dem-onglet-controle/liste-demandes-modale/liste-demandes-modale.component';



@NgModule({
  declarations: [
    DemandesRechercheComponent,
    DemandesGestionComponent,
    RapportsComponent,
    DemandesConsultationRestreinteComponent,
    DemOngletGestionComponent,
    DemOngletEmployeurComponent,
    DemOngletSalarieComponent,
    DemOngletCalculComponent,
    DemOngletCalendrierComponent,
    DemOngletDecisionComponent,
    DecAccepterModaleComponent,
    DemOngletCourrierComponent,
    DemOngletCommunComponent,
    TransfertModaleComponent,
    DemOngletControleComponent,
    ListeDemandesModaleComponent,
  ],
  providers: [
    EtapeService,
    StatutService,
    VerrouService,
    DemandeGuard, NettoyageVerrouGuard
  ],
  imports: [
    CommonModule,
    SharedModule,
    DemandesRoutingModule,
    ToasterModule.forChild()
  ],
  entryComponents: [
    DemandesConsultationRestreinteComponent,
    DecAccepterModaleComponent,
    TransfertModaleComponent,
    ListeDemandesModaleComponent
  ]
})
export class DemandesModule { }
