import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProfilGuard } from 'src/app/guards/profil.guard';
import { ROUTES } from 'src/app/constantes/routes';
import { PROFILS } from 'src/app/constantes/referentiel/profils.enum';
// Components
import { GlobalViewComponent } from './web/commun/global-view/global-view.component';
import { AccueilComponent } from './web/accueil.component';
import { EspaceDocumentaireComponent } from './web/commun/espace-documentaire/espace-documentaire.component';
import { StillAuthGuard } from './guards/still-auth.guard';
import { InitAuthGuard } from './guards/init-auth.guard';


// Groupes de profils
const tousProfils = [PROFILS.OBSERVATEUR, PROFILS.GESTIONNAIRE, PROFILS.ADMINISTRATEUR_FONCTIONNEL, PROFILS.ADMINISTRATEUR_NATIONAL];
const gestProfils = [PROFILS.GESTIONNAIRE, PROFILS.ADMINISTRATEUR_FONCTIONNEL, PROFILS.ADMINISTRATEUR_NATIONAL];
const adminProfils = [PROFILS.ADMINISTRATEUR_FONCTIONNEL, PROFILS.ADMINISTRATEUR_NATIONAL];


const routes: Routes = [
  { path: '', redirectTo: ROUTES.ACCUEIL, pathMatch: 'full' },
  { path: '', component: GlobalViewComponent, canActivate: [InitAuthGuard], canActivateChild: [StillAuthGuard],
    children: [
      { path: ROUTES.ACCUEIL, component: AccueilComponent,  },
      { path: ROUTES.ESPACE_DOCUMENTAIRE + '/:id', component: EspaceDocumentaireComponent },
      { path: ROUTES.DEMANDES, loadChildren: 'src/app/web/demandes/demandes.module#DemandesModule'},
      {
        path: ROUTES.ADMINISTRATION, canActivate: [ProfilGuard], data: {profils: adminProfils},
        loadChildren: 'src/app/web/administration/administration.module#AdministrationModule'
      }
    ]
  },
  { path: '**', redirectTo: ROUTES.ACCUEIL }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
