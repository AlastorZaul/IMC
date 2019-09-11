// Modules
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from 'src/app/shared.module';
import { AdministrationRoutingModule } from './administration-routing.module';
import { ToasterModule } from 'angular2-toaster';
import { QuillModule } from 'ngx-quill';
import { ImageCropperModule } from 'ngx-image-cropper';
// Components
import { OrganismesRechercheComponent } from './organismes-recherche/organismes-recherche.component';
import { OrganismesGestionComponent } from './organismes-gestion/organismes-gestion.component';
  import { OrgOngletInfosComponent } from './organismes-gestion/org-onglet-infos/org-onglet-infos.component';
  import { OrgOngletFilsComponent } from './organismes-gestion/org-onglet-fils/org-onglet-fils.component';
    import { AjoutEnfantModaleComponent } from './organismes-gestion/org-onglet-fils/ajout-enfant-modale/ajout-enfant-modale.component';
  import { OrgOngletSignaturesComponent } from './organismes-gestion/org-onglet-signatures/org-onglet-signatures.component';
    import { OrgSignModaleComponent } from './organismes-gestion/org-onglet-signatures/org-sign-modale/org-sign-modale.component';
  import { OrgOngletJcComponent } from './organismes-gestion/org-onglet-jc/org-onglet-jc.component';
import { JoursChomesListeComponent } from './jours-chomes-liste/jours-chomes-liste.component';
  import { JourChomeModaleComponent } from './jours-chomes-liste/jour-chome-modale/jour-chome-modale.component';
import { RegionsDepartementsListeComponent } from './regions-departements-liste/regions-departements-liste.component';
  import { ListeAccordeonsItemComponent } from './regions-departements-liste/liste-accordeons-item/liste-accordeons-item.component';
  import { RegionModaleComponent } from './regions-departements-liste/region-modale/region-modale.component';
  import { DepartementModaleComponent } from './regions-departements-liste/departement-modale/departement-modale.component';
import { ComptesUtilisateursListeComponent } from './comptes-utilisateurs-liste/comptes-utilisateurs-liste.component';
  import { CompteModaleComponent } from './comptes-utilisateurs-liste/compte-modale/compte-modale.component';
import { ParametresGestionComponent } from './parametres-gestion/parametres-gestion.component';
  import { MessageInformationComponent } from './parametres-gestion/message-information/message-information.component';
// Services + Guards
import { OrganismeGuard } from 'src/app/guards/organisme.guard';



@NgModule({
  declarations: [
    OrganismesRechercheComponent,
    OrganismesGestionComponent,
      OrgOngletInfosComponent,
      OrgOngletFilsComponent,
        AjoutEnfantModaleComponent,
      OrgOngletSignaturesComponent,
        OrgSignModaleComponent,
      OrgOngletJcComponent,
    JoursChomesListeComponent,
      JourChomeModaleComponent,
    RegionsDepartementsListeComponent,
      ListeAccordeonsItemComponent,
      RegionModaleComponent,
      DepartementModaleComponent,
    ComptesUtilisateursListeComponent,
      CompteModaleComponent,
    ParametresGestionComponent,
      MessageInformationComponent,
  ],
  imports: [
    CommonModule,
    SharedModule,
    ToasterModule.forChild(),
    AdministrationRoutingModule,
    QuillModule,
    ImageCropperModule
  ],
  providers: [
    OrganismeGuard,
  ],
  entryComponents: [
    // Organismes
    AjoutEnfantModaleComponent,
    OrgSignModaleComponent,
    // Autres
    JourChomeModaleComponent,
    RegionModaleComponent,
    DepartementModaleComponent,
    CompteModaleComponent,
  ]
})
export class AdministrationModule { }
