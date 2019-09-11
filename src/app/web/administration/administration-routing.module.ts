import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfilGuard } from 'src/app/guards/profil.guard';
import { ROUTES } from 'src/app/constantes/routes';
import { PROFILS } from 'src/app/constantes/referentiel/profils.enum';
// Components
import { OrganismesRechercheComponent } from './organismes-recherche/organismes-recherche.component';
import { OrganismesGestionComponent } from './organismes-gestion/organismes-gestion.component';
import { JoursChomesListeComponent } from './jours-chomes-liste/jours-chomes-liste.component';
import { RegionsDepartementsListeComponent } from './regions-departements-liste/regions-departements-liste.component';
import { ComptesUtilisateursListeComponent } from './comptes-utilisateurs-liste/comptes-utilisateurs-liste.component';
import { ParametresGestionComponent } from './parametres-gestion/parametres-gestion.component';
// Guards
import { OrganismeGuard } from 'src/app/guards/organisme.guard';
import { PreventNavigationGuard } from 'src/app/guards/prevent-navigation.guard';

const routes: Routes = [
    { path: ROUTES.ORGANISMES, component: OrganismesRechercheComponent },
    { path: ROUTES.ORGANISMES + '/' + ROUTES.ACT_GESTION, component: OrganismesGestionComponent,
        canActivate: [ProfilGuard], data: {profils: [PROFILS.ADMINISTRATEUR_NATIONAL]}, canDeactivate: [PreventNavigationGuard]
    },
    { path: ROUTES.ORGANISMES + '/' + ROUTES.ACT_GESTION + '/:uuid',
        component: OrganismesGestionComponent, canActivate: [OrganismeGuard], canDeactivate: [PreventNavigationGuard],
    },
    { path: ROUTES.JOURSCHOMES, component: JoursChomesListeComponent,
        canActivate: [ProfilGuard], data: {profils: [PROFILS.ADMINISTRATEUR_NATIONAL]} },
    { path: ROUTES.REGIONSDEPTS, component: RegionsDepartementsListeComponent,
        canActivate: [ProfilGuard], data: {profils: [PROFILS.ADMINISTRATEUR_NATIONAL]} },
    { path: ROUTES.UTILISATEURS, component: ComptesUtilisateursListeComponent},
    { path: ROUTES.PARAMETRES, component: ParametresGestionComponent,
        canActivate: [ProfilGuard], canDeactivate: [PreventNavigationGuard],
        data: {profils: [PROFILS.ADMINISTRATEUR_NATIONAL]} },
    { path: '**',  redirectTo: ROUTES.ORGANISMES },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdministrationRoutingModule { }
