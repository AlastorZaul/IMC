import { JsonObject, JsonProperty } from 'json2typescript';
import { OPERATION_COURRIER } from 'src/app/constantes/referentiel/operation-courrier.enum';
import { TypeCourrier } from 'src/app/modeles/type-courrier.model';
import { DateConverter } from 'src/app/modeles/utils/custom-converters';

@JsonObject('TraceSuppression')
export class TraceSuppression {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('dateDecision', DateConverter)
    dateDecision: Date = new Date();
    @JsonProperty('dateTentativeSuppression', DateConverter)
    dateTentativeSuppression: Date = new Date();
    @JsonProperty('decision', String)
    decision: string = undefined;
    @JsonProperty('infoTraitement', String)
    infoTraitement: string = undefined;
    @JsonProperty('numDemande', String)
    numDemande: string = undefined;
    @JsonProperty('suppressionRealisee', Boolean)
    suppressionRealisee: boolean  = undefined;
}
