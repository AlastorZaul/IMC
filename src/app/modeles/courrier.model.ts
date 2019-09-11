import { JsonObject, JsonProperty } from 'json2typescript';
import { OPERATION_COURRIER } from 'src/app/constantes/referentiel/operation-courrier.enum';
import { TypeCourrier } from 'src/app/modeles/type-courrier.model';
import { DateConverter } from 'src/app/modeles/utils/custom-converters';

@JsonObject('Courrier')
export class Courrier {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('date', DateConverter, true)
    date: Date = new Date();
    @JsonProperty('destinataires', String, true)
    destinataires: string = undefined;
    @JsonProperty('identifiantExpediteur', String, true)
    identifiantExpediteur: string = undefined;
    @JsonProperty('typeCourrier', TypeCourrier)
    typeCourrier: TypeCourrier = undefined;
    @JsonProperty('operation', String)
    operation = OPERATION_COURRIER.COURRIEL;
    @JsonProperty('courrielEmployeur', String, true)
    courrielEmployeur: string = undefined;
    @JsonProperty('courrielSalarie', String, true)
    courrielSalarie: string = undefined;
    @JsonProperty('signatureId', Number, true)
    signatureId: number = undefined;
    @JsonProperty('lrar', Boolean, true)
    lrar: boolean = undefined;

    public constructor(init?: Partial<Courrier>) {
        Object.assign(this, init);
    }
}
