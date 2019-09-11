// Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared.module';
import { AppRoutingModule } from './app-routing.module';
import { OAuthModule } from 'angular-oauth2-oidc';
// Components
import { AppComponent } from './app.component';
import { AccueilComponent } from './web/accueil.component';
import { EspaceDocumentaireComponent } from './web/commun/espace-documentaire/espace-documentaire.component';
import { MenuArborescentComponent } from './web/commun/espace-documentaire/menu-arborescent/menu-arborescent.component';
// Services
import { ArticleService } from './services/crud/article.service';
import { ToasterService, ToasterModule } from 'angular2-toaster';




@NgModule({
  declarations: [
    AppComponent,
    AccueilComponent,
    EspaceDocumentaireComponent,
    MenuArborescentComponent,
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    ToasterModule.forRoot(),
    OAuthModule.forRoot(),
  ],
  providers: [
    ArticleService,
    ToasterService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
