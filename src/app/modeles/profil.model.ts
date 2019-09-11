import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Profil')
export class Profil {
    @JsonProperty('id', Number)
    id: number;
    @JsonProperty('code', String)
    code: string;
    @JsonProperty('intitule', String)
    intitule: string;

    constructor() {
        this.id = undefined;
        this.code = undefined;
        this.intitule = undefined;
    }
}
