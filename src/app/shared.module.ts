// Modules
import { NgModule, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ReactiveFormsModule  } from '@angular/forms';
import { ToasterModule } from 'angular2-toaster';
import {
    MatDialogModule, MatTabsModule,
    MatButtonModule, MatInputModule, MatRadioModule, MatCheckboxModule, MatSelectModule,
    MatProgressBarModule, MatDatepickerModule, MatDateFormats, MatNativeDateModule,  MAT_DATE_LOCALE,
    MatTooltipModule, MatAutocompleteModule
    /* MatIconModule, MatIconRegistry,
    MatButtonToggleModule, MatCardModule, MatChipsModule,
    MatExpansionModule, MatGridListModule, MatListModule, MatMenuModule,
    MatPaginatorModule, , MatProgressSpinnerModule, MatRippleModule, MatSidenavModule,
    MatSliderModule, MatSlideToggleModule, MatSnackBarModule, MatSortModule, MatTableModule, MatToolbarModule,
    , MatStepperModule, MAT_DATE_LOCALE, DateAdapter,
    MAT_DATE_FORMATS, MatPaginatorIntl */
} from '@angular/material';

// Components
import { HeaderComponent } from './web/commun/global-view/header/header.component';
import { GlobalViewComponent } from './web/commun/global-view/global-view.component';
import { FooterComponent } from './web/commun/global-view/footer/footer.component';
import { FilArianeComponent } from './web/commun/fil-ariane/fil-ariane.component';
import { LoaderComponent } from './web/commun/loader/loader.component';
import { ConfirmModaleComponent } from './web/commun/modales/confirm-modale.component';
import { RemoveModaleComponent } from './web/commun/modales/remove-modale.component';
import { LoadingModaleComponent } from './web/commun/modales/loading-modale.component';
  import {
    ModaleDemandeParNumeroComponent
  } from './web/commun/actions-rapides/modale-demande-par-numero/modale-demande-par-numero.component';
  import { ModaleDemandePapierComponent } from './web/commun/actions-rapides/modale-demande-papier/modale-demande-papier.component';
  import { ModaleDemandeTeleRCComponent } from './web/commun/actions-rapides/modale-demande-tele-rc/modale-demande-tele-rc.component';
import { PagerComponent } from './web/commun/recherche/pager.component';

// Services
import { ConfigurationService } from './services/configuration.service';
import { DemandeService } from './services/crud/demande.service';
import { DemandeRechercheDtoService } from 'src/app/services/crud/mini-dto/demande-recherche-dto-service';
import { OrganismeService } from './services/crud/organisme.service';
import { OrganismeMiniDtoService } from './services/crud/mini-dto/organisme-mini-dto.service';
import { JourChomeService } from './services/crud/jour-chome.service';
import { RegionService } from './services/crud/region.service';
import { DepartementService } from './services/crud/departement.service';
import { CompteUtilisateurService } from './services/crud/compte-utilisateur.service';
import { ProfilService } from './services/crud/profil.service';
import { ParametresService } from './services/crud/parametre.service';
import { PaysService } from './services/crud/pays.service';
import { LocalisationService } from 'src/app/services/crud/localisation.service';
import { MessageInfoService } from './services/crud/message-info.service';
import { ApeService } from 'src/app/services/crud/ape.service';
import { QualificationService } from 'src/app/services/crud/qualification.service';
import { ConventionCollectiveService } from 'src/app/services/crud/convention-collective.service';
import { QualiteAssistantService } from 'src/app/services/crud/qualite-assistant.service';
import { MotifDecisionService } from 'src/app/services/crud/motif-decision.service';
import { TypeCourrierService } from 'src/app/services/crud/type-courrier.service';
import { TokenInterceptor } from './services/interceptors/token.interceptor';

// Guards + Handler + Directives + Pipes
import { ProfilGuard } from './guards/profil.guard';
import { PreventNavigationGuard } from './guards/prevent-navigation.guard';
import { SircErrorsHandler } from './services/sirc-errors-handler';
import { SircLoaderDirective } from './directives/sirc-loader.directive';
import { NumberToMonthPipe } from './pipes/number-to-month.pipe';
import { GenericPipe } from './pipes/generic-pipe.pipe';
import { BooleanPipe } from 'src/app/pipes/boolean-pipe.pipe';
import { TypeCourrierPipe } from 'src/app/pipes/type-courrier-pipe.pipe';


@NgModule({
    exports: [
        GlobalViewComponent, HeaderComponent, FooterComponent,
        FilArianeComponent, LoaderComponent, SircLoaderDirective,
        ConfirmModaleComponent, RemoveModaleComponent, LoadingModaleComponent,
        ModaleDemandeParNumeroComponent, ModaleDemandePapierComponent, ModaleDemandeTeleRCComponent,
        PagerComponent,
        GenericPipe, NumberToMonthPipe, BooleanPipe, TypeCourrierPipe,
        ReactiveFormsModule, ToasterModule,
        // Material
        MatDialogModule, MatButtonModule, MatInputModule, MatSelectModule, MatRadioModule, MatCheckboxModule,
        MatTooltipModule, MatProgressBarModule, MatTabsModule,
        MatNativeDateModule, MatDatepickerModule,
        MatAutocompleteModule
    ],
    declarations: [
        GlobalViewComponent,  HeaderComponent, FooterComponent,
        FilArianeComponent, LoaderComponent, SircLoaderDirective,
        ConfirmModaleComponent, RemoveModaleComponent, LoadingModaleComponent,
        ModaleDemandeParNumeroComponent, ModaleDemandePapierComponent, ModaleDemandeTeleRCComponent,
        PagerComponent,
        GenericPipe, NumberToMonthPipe, BooleanPipe, TypeCourrierPipe
    ],
    imports: [
        CommonModule, HttpClientModule, RouterModule,
        ReactiveFormsModule,
        ToasterModule.forChild(),
        // Material
        MatDialogModule, MatButtonModule, MatInputModule, MatSelectModule, MatRadioModule, MatCheckboxModule,
        MatTooltipModule, MatNativeDateModule, MatDatepickerModule,
        MatProgressBarModule, MatTabsModule,
        MatAutocompleteModule
    ],
    providers: [
        { provide: MAT_DATE_LOCALE, useValue: 'fr-FR' },
        ProfilGuard, PreventNavigationGuard,
        { provide: APP_INITIALIZER, useFactory: initializer, multi: true, deps: [ConfigurationService]},
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true },
        { provide: ErrorHandler, useClass: SircErrorsHandler },
        OrganismeService, OrganismeMiniDtoService, DemandeService, DemandeRechercheDtoService,
        JourChomeService, RegionService, DepartementService, CompteUtilisateurService, ProfilService,
        MessageInfoService, ParametresService, PaysService, LocalisationService, ApeService,
        QualificationService, ConventionCollectiveService, QualiteAssistantService,
        MotifDecisionService, TypeCourrierService
    ],
    entryComponents: [
        LoaderComponent,
        ConfirmModaleComponent, RemoveModaleComponent, LoadingModaleComponent,
        ModaleDemandeParNumeroComponent, ModaleDemandePapierComponent, ModaleDemandeTeleRCComponent,
    ]
})
export class SharedModule {
}

// Initialise la configuration externalisée de l'application
export function initializer(config: ConfigurationService): () => Promise<any> {
    return (): Promise<any> => {
      return new Promise(async (resolve, reject) => {
        try {
          // Configuration de l'APP
          await config.load();
          resolve();
        } catch (error) {
          console.error(`ERREUR - une erreur critique est survenue lors du chargement de la configuration de l'application.`);
          reject(error);
        }
      });
    };
  }
