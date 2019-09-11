import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ConfigurationService {

  private _environment: any = null;

  constructor(private http: HttpClient) {
    /** Configuration par défaut, pour les tests */
    this._environment = { 'socleBaseUrl': 'http://localhost:8080/api' };
  }

  /** @description : chargement du fichier "environment.json" pour la configuration initiale */
  public load(): Promise<any> {
    return this.http.get('/assets/config/environment.json').toPromise().then(data => {
      this._environment = data;
    }).catch((error) => {
      throw error;
    });
  }

  getEnvironment(): any {
    return this._environment;
  }
}
