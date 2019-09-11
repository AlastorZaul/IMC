import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Statut')
export class Statut {
    @JsonProperty('id', Number)
    id: number = undefined;
    @JsonProperty('code', String)
    code: string = undefined;
    @JsonProperty('intitule', String)
    intitule: string = undefined;
}


