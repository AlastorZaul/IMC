import { Component } from '@angular/core';
import { OAuthService, AuthConfig } from 'angular-oauth2-oidc';
import { JwksValidationHandler } from 'angular-oauth2-oidc';
import { ToasterConfig, IToasterConfig } from 'angular2-toaster/angular2-toaster';
import { ConfigurationService } from './services/configuration.service';
import { SessionUtilisateurService } from './services/session-utilisateur.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'sirc-intra-front';

  constructor(
    private oauthService: OAuthService,
    private conf: ConfigurationService,
    private sessionSvc: SessionUtilisateurService
  ) {
    this.initAuthentificationConfiguration();
  }

  // Configuration de base pour les Toasts
  public appConfig: IToasterConfig = new ToasterConfig({
    animation: 'fade', newestOnTop: true,
    positionClass: 'toast-top-right',
    toastContainerId: 1,
    timeout: {success: 4000, info: 0, error: 0, warning: 0 },
    showCloseButton: true,
    mouseoverTimerStop: true
  });

  private initAuthentificationConfiguration() {
    const config: AuthConfig  = new AuthConfig();
    config.issuer = this.conf.getEnvironment().oauth2_oidc.issuer;
    config.redirectUri = window.location.origin + this.conf.getEnvironment().oauth2_oidc.redirectUri;
    config.silentRefreshRedirectUri = window.location.origin + '/silent-refresh.html';
    config.clientId = this.conf.getEnvironment().oauth2_oidc.clientId;
    config.scope = this.conf.getEnvironment().oauth2_oidc.scope;
    config.showDebugInformation = this.conf.getEnvironment().oauth2_oidc.showDebugInformation;
    config.strictDiscoveryDocumentValidation = false;

    // config.timeoutFactor = 0.002;
    this.oauthService.configure(config);
    this.oauthService.oidc = true;
    this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    this.oauthService.setupAutomaticSilentRefresh();
    this.sessionSvc.runInitialLoginSequence();
  }
}
