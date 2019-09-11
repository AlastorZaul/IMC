import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { BehaviorSubject, Observable, ReplaySubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Utilisateur } from '../modeles/dto/utilisateur.dto';
import { ConfigurationService } from './configuration.service';
import { JsonConverterService } from './json-converter.service';
import { StorageService } from './storage.service';
import { SESSION_CLES } from '../constantes/session-cles';
import { ROUTES_API } from '../constantes/routes-api';


/** @description: Service ayant la charge de la gestion de la session utilisateur (stockage du user dans le storage, redirections...) */
@Injectable({ providedIn: 'root' })
export class SessionUtilisateurService {
  private isAuthenticatedSubject$ = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject$.asObservable();
  private isUserInStorageSubject$ = new BehaviorSubject<boolean>(false);
  public isUserInStorage$ = this.isUserInStorageSubject$.asObservable();
  private isDoneLoadingSubject$ = new ReplaySubject<boolean>();
  public isDoneLoading$ = this.isDoneLoadingSubject$.asObservable();

  constructor(
    private http: HttpClient,
    private oauth: OAuthService,
    private conf: ConfigurationService,
    private jsonConvSvc: JsonConverterService,
    private storageSvc: StorageService,
  ) {
    this.oauth.events.subscribe( event => {
      this.isAuthenticatedSubject$.next(this.oauth.hasValidAccessToken());
      this.isUserInStorageSubject$.next(this.checkIfUserIsInStorage());

      if (event.type === 'token_expires') {
        if (!this.oauth.hasValidAccessToken()) {
          this.logIn();
        }
        return;
      }
      if (event.type === 'token_validation_error') {
        this.logIn(); return;
      }
      if (event.type === 'session_terminated' || event.type === 'session_error') {
        this.logIn(); return;
      }
      if (event.type === 'token_received') {
        if (!this.oauth.hasValidAccessToken()) {
          this.logIn(); return;
        }
        this.whoIAm().subscribe(data => {
          this.setStorableUser(data);
          this.isUserInStorageSubject$.next(true);
        }, error => {
          this.isUserInStorageSubject$.next(false);
          this.oauth.logOut();
        });
        return;
      }
    });
    this.oauth.setupAutomaticSilentRefresh();
  }


  public runInitialLoginSequence(): Promise<void> {
    return this.oauth.loadDiscoveryDocumentAndTryLogin()
      .then(() => {
        if (this.oauth.hasValidAccessToken()) { return Promise.resolve(); }
      })
      .then(() => { this.isDoneLoadingSubject$.next(true); })
      .catch(() => { this.isDoneLoadingSubject$.next(true); });
  }



  logIn() {
    this.removeStorableUser();
    this.oauth.initImplicitFlow('', {});
    this.oauth.tryLogin();
  }

  logOut() {
    this.removeStorableUser();
    this.isUserInStorageSubject$.next(false);
    this.oauth.logOut();
  }

  whoIAm(): Observable<Utilisateur> {
    const _url = this.conf.getEnvironment().socleBaseUrl + ROUTES_API.SCHEMA_METIER + ROUTES_API.COMPTE_UTILISATEUR + '/quisuisje';
    return this.http.get<Utilisateur>(_url, {observe: 'response'}).pipe(
      map((response: any) => {
        try {
          const user: Utilisateur = this.jsonConvSvc.getInstance().deserialize(response.body, Utilisateur);
          if (!this.setStorableUser(user)) {
            throw new HttpErrorResponse({
              error: new Error('Réponse inattendue : aucun compte utilisateur rattaché à votre session.'),
              status: response.status, statusText: response.statusText, url: _url
            });
          }
          return user;
        } catch (e) {
          throw (<Error>e);
        }
      }),
      catchError(error => throwError(error))
    );
  }

  /** FONCTIONS UTILITAIRES */
  getAccessToken() { return this.oauth.getAccessToken(); }
  getIdToken() { return this.oauth.getIdToken(); }
  checkIfUserIsInStorage() {
    return this.storageSvc.getItemStorage(SESSION_CLES.COMPTE_UTILISATEUR_CONNECTE) !== null;
  }
  isConnected() {
    return this.oauth.hasValidIdToken();
  }
  stillConnected() {
    return this.oauth.hasValidIdToken() && this.oauth.hasValidAccessToken();
  }

  getStorableUser(): Utilisateur {
    if (!this.isConnected()) { return null; }
    const jsonUtilisateur = this.storageSvc.getItemStorage(SESSION_CLES.COMPTE_UTILISATEUR_CONNECTE);
    return this.jsonConvSvc.getInstance().deserialize(jsonUtilisateur, Utilisateur);
  }

  setStorableUser (utilisateur: Utilisateur): boolean {
    if (!utilisateur) {
      this.removeStorableUser();
      return false;
    } else {
      this.storageSvc.setItemStorage(SESSION_CLES.COMPTE_UTILISATEUR_CONNECTE,
        (utilisateur) ? this.jsonConvSvc.getInstance().serialize(utilisateur) : null
      );
      return true;
    }
  }

  removeStorableUser(): void {
    this.storageSvc.removeItemStorage(SESSION_CLES.COMPTE_UTILISATEUR_CONNECTE);
  }

}
