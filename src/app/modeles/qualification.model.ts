import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Qualification')
export class Qualification {
    @JsonProperty('id', Number)
    id: number = undefined;
    @JsonProperty('code', String)
    code: string = undefined;
    @JsonProperty('intitule', String)
    intitule: string = undefined;

    constructor() {
        this.id = undefined;
        this.code = undefined;
        this.intitule = undefined;
    }
}


