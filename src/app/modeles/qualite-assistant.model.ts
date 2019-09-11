import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('QualiteAssistant')
export class QualiteAssistant {
    @JsonProperty('id', Number)
    id: number = undefined;
    @JsonProperty('code', String)
    code: string = undefined;
    @JsonProperty('intitule', String)
    intitule: string = undefined;
    @JsonProperty('typeQa', String)
    typeQa: string = undefined;
}


