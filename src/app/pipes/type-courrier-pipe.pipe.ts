import { Pipe, PipeTransform } from '@angular/core';

import { TypeCourrier } from './../modeles/type-courrier.model';
import { TYPE_COURRIER } from './../constantes/referentiel/type-courrier.enum';
import { STATUT } from './../constantes/referentiel/statut.enum';
import { ETAPE } from './../constantes/referentiel/etape.enum';

@Pipe({ name: 'courrierAutorise' })
export class TypeCourrierPipe implements PipeTransform {

  transform(listeTypeCourrier: TypeCourrier[], codeStatut: String, codeEtape: String, datetransfert: Date ) {
      const isTransfert = !!(datetransfert);
    return listeTypeCourrier !== undefined ?
    listeTypeCourrier.filter(tc => ( (tc.code === this.equivalent(codeStatut, codeEtape)) ||
     (isTransfert && tc.code === TYPE_COURRIER.TCOUR_TSF_CODE)) || (tc.code === this.isAccuseReception(codeStatut))) : undefined;
  }

  equivalent(codeStatut: String, codeEtape: String): String {
    if (codeStatut === STATUT.STT_ACCE_CODE) { // Courrier d'acoord exprès
        return TYPE_COURRIER.TCOUR_ACC_CODE;
    } else if ((codeStatut === STATUT.STT_ACCIA_CODE || codeStatut === STATUT.STT_ACCIM_CODE) &&
                codeEtape === ETAPE.ETP_CLO_CODE) { // Courrier de demande d'attestation
        return TYPE_COURRIER.TCOUR_ATT_CODE;
    } else if (codeStatut === STATUT.STT_IRR_CODE) { // Courrier d'irrecevabilité
        return TYPE_COURRIER.TCOUR_IRR_CODE;
    } else if (codeStatut === STATUT.STT_REF_CODE) { // Courrier de refus
        return TYPE_COURRIER.TCOUR_REF_CODE;
    } else { return ''; }
  }

  isAccuseReception(codeStatut: String): String {
     return codeStatut !== STATUT.STT_IRR_CODE ? TYPE_COURRIER.TCOUR_RPT_CODE : '';
  }
}
