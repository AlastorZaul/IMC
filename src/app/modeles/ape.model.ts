import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Ape')
export class Ape {
    @JsonProperty('id', Number)
    id: number = undefined;
    @JsonProperty('code', String)
    code: string = undefined;
    @JsonProperty('intitule', String)
    intitule: string = undefined;

}


