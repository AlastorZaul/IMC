import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Parametre')
export class Parametre {
    @JsonProperty('id', Number)
    id: number;
    @JsonProperty('code', String)
    code: string;
    @JsonProperty('intitule', String)
    intitule: string;
    @JsonProperty('valeur', String)
    valeur: string;

    constructor() {
        this.id = undefined;
        this.code = undefined;
        this.intitule = undefined;
        this.valeur = undefined;
    }
}
