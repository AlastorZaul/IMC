import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ROUTES } from 'src/app/constantes/routes';
// Components
import { RapportsComponent } from './rapports/rapports.component';
import { DemandesRechercheComponent } from './demandes-recherche/demandes-recherche.component';
import { DemandesGestionComponent } from './demandes-gestion/demandes-gestion.component';
// Guards
import { PreventNavigationGuard } from 'src/app/guards/prevent-navigation.guard';
import { NettoyageVerrouGuard } from 'src/app/guards/nettoyage-verrou.guard';
import { DemandeGuard } from 'src/app/guards/demande.guard';
import { ProfilGuard } from 'src/app/guards/profil.guard';
import { PROFILS } from 'src/app/constantes/referentiel/profils.enum';

// Groupes de profils
const tousProfils = [PROFILS.OBSERVATEUR, PROFILS.GESTIONNAIRE, PROFILS.ADMINISTRATEUR_FONCTIONNEL, PROFILS.ADMINISTRATEUR_NATIONAL];
const gestProfils = [PROFILS.GESTIONNAIRE, PROFILS.ADMINISTRATEUR_FONCTIONNEL, PROFILS.ADMINISTRATEUR_NATIONAL];

const routes: Routes = [
    { path: '', component: DemandesRechercheComponent },
    { path: ROUTES.RAPPORTS, component: RapportsComponent, canActivate: [ProfilGuard], data: {profils: gestProfils}},
    // Formulaire "Demande"
    { path: ROUTES.ACT_GESTION, component: DemandesGestionComponent,
      canActivate: [ProfilGuard], data: {profils: gestProfils},
      canDeactivate: [PreventNavigationGuard]
    },
    { path: ROUTES.ACT_GESTION + '/:uuid', component: DemandesGestionComponent,
      canActivate: [ProfilGuard, DemandeGuard], data: {profils: gestProfils},
      canDeactivate: [PreventNavigationGuard, NettoyageVerrouGuard]
    },
    { path: ROUTES.ACT_CONSULTATION + '/:uuid', component: DemandesGestionComponent,
      canActivate: [ProfilGuard, DemandeGuard],  data: {profils: tousProfils},
      canDeactivate: [PreventNavigationGuard]
    },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DemandesRoutingModule { }
