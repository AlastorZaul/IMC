import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { SessionUtilisateurService } from '../session-utilisateur.service';
import { Observable } from 'rxjs';
import { ConfigurationService } from '../configuration.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(
    private auth: SessionUtilisateurService,
    private env: ConfigurationService,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.env.getEnvironment()) {
      return next.handle(request);
    }
    let headers = request.headers;
    if (request.url.startsWith(this.env.getEnvironment().socleBaseUrl)) {
      if (this.auth.isConnected()) {
        headers = headers.set('Authorization', `Bearer ${this.auth.getIdToken()}`);
      }
    }
    request = request.clone({ headers });
    return next.handle(request);
  }
}
