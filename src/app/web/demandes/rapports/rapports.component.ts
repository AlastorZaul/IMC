import { Component, OnInit } from '@angular/core';
import { forkJoin } from 'rxjs';
import { IFilAriane } from 'src/app/interfaces/IFilAriane';
import { FilArianeItem } from 'src/app/modeles/utils/fil-ariane-item.model';
import { ROUTES } from 'src/app/constantes/routes';
import { CODE_PARAMETRES } from 'src/app/constantes/referentiel/code-parametres.enum';
import { ParametresService } from 'src/app/services/crud/parametre.service';
import { Parametre } from 'src/app/modeles/parametre.model';



@Component({
  selector: 'app-rapports',
  templateUrl: './rapports.component.html'
})
export class RapportsComponent implements OnInit, IFilAriane {

  filAriane: FilArianeItem[];
  // Loaders
  loading = true;
  messageInfo: Parametre;
  urlPortail: Parametre;


  constructor(
    private service: ParametresService
  ) { }

  ngOnInit() {
    const rqstMessageInfo = this.service.getByCode(CODE_PARAMETRES.CODE_P_MESSAGE_INFO_RAPPORT);
    const rqstUrlPortail = this.service.getByCode(CODE_PARAMETRES.CODE_P_LIEN_PORTAIL_DECISIONNEL);
    forkJoin([rqstMessageInfo, rqstUrlPortail]).subscribe((results: [Parametre, Parametre]) => {
      this.messageInfo = results[0];
      this.urlPortail = results[1];
      this.initFilAriane();
      this.loading = false;
    });
  }

  redirectPortail() {
    if (window) {
      window.open(this.urlPortail.valeur, '_blank');
    }
  }

  /** Gestion du fil d'Ariane */
  initFilAriane() {
    this.filAriane = [new FilArianeItem('Rapports', '/' + ROUTES.DEMANDES + '/' + ROUTES.RAPPORTS)];
  }
  getFilAriane(): FilArianeItem[] {
    return this.filAriane;
  }

}
