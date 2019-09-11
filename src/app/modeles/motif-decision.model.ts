import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('MotifDecision')
export class MotifDecision {
    @JsonProperty('id', Number)
    id: number;
    @JsonProperty('actif', Boolean)
    actif: boolean;
    @JsonProperty('intitule', String)
    intitule: string;
    @JsonProperty('ordre', Number)
    ordre: number;
    @JsonProperty('typeMotif', String)
    typeMotif: string;

    constructor() {
        this.id = undefined;
        this.actif = undefined;
        this.intitule = undefined;
        this.ordre = undefined;
        this.typeMotif = undefined;
    }
}
