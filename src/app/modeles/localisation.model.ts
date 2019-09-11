import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Localisation')
export class Localisation {
    @JsonProperty('id', Number, true)
    id: number;
    @JsonProperty('codePostal', String)
    codePostal: string;
    @JsonProperty('commune', String)
    commune: string;
    @JsonProperty('numeroInsee', String)
    numeroInsee: string;

    constructor() {
        this.id = undefined;
        this.codePostal = undefined;
        this.commune = undefined;
        this.numeroInsee = undefined;
    }
}
