import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('ConventionCollective')
export class ConventionCollective {
    @JsonProperty('id', Number)
    id: number;
    @JsonProperty('actif', Boolean)
    actif: boolean;
    @JsonProperty('codeIdcc', String)
    codeIdcc: string;
    @JsonProperty('intitule', String)
    intitule: string;
    @JsonProperty('motsCles', String)
    motsCles: string;

    constructor() {
        this.id = undefined;
        this.actif = undefined;
        this.intitule = undefined;
        this.codeIdcc = undefined;
        this.motsCles = undefined;
    }
}


