import { ErrorHandler, Injectable, NgZone} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ToasterService } from 'angular2-toaster';
import { TYPE_TOAST } from 'src/app/constantes/type-toast.enum';
import { CODE_HTTP } from 'src/app/constantes/code-http.enum';

@Injectable()
export class SircErrorsHandler implements ErrorHandler {

  constructor(
    private toasterService: ToasterService,
    private ngZone: NgZone) {
  }

  handleError(error: Error): void {
    // NgZone : nécessaire pour le bon fonctionnement du ToasterService
    this.ngZone.run(() => {
      let titreMessageErreur = 'Une erreur est survenue';
      let messageErreur = 'Une erreur est survenue.';
      console.error(error);
      // Erreur Serveur/connexion
      if (error instanceof HttpErrorResponse) {
        messageErreur = `Une erreur est survenue. Veuillez réessayer ultérieurement (Code ${error.status}).`;
        if (!navigator.onLine) { // Erreur hors-ligne
          messageErreur = 'Aucune connection Internet';
          console.error('ERREUR : ' + error.message);
        } else {
          switch (error.status) {
            case CODE_HTTP.CODE_NOT_FOUND :
              messageErreur = `La ressource demandée n'a pas été trouvée.`;
              break;
            case CODE_HTTP.CODE_ERREUR_MAITRISEE :
              messageErreur = `Une erreur est survenue. ${error.error}.`;
              break;
            case CODE_HTTP.CODE_ERREUR_VALIDATION :
              titreMessageErreur = `Votre saisie n'est pas valide`;
              messageErreur = `${error.error}`;
              break;
            case CODE_HTTP.CODE_ERREUR_SERVEUR_INCONNUE :
              messageErreur = `Une erreur est survenue. ${error.error}`;
              break;
            default :
              messageErreur = `Une erreur inconnue est survenue.`;
          }
          titreMessageErreur += ` (${error.status})`;
          console.error(`ERREUR SERVEUR, code ${error.status} - ${error.message} - ${error.error}`);
        }
      } else {
        console.error('Une erreur Client est survenue:', error.message);
      }
      this.toasterService.pop({
        type: TYPE_TOAST.ERREUR,
        title: titreMessageErreur,
        body: messageErreur
      });
    });
  }
}
