import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Pays')
export class Pays {
    @JsonProperty('id', Number)
    id: number = undefined;
    @JsonProperty('code', String)
    code: string = undefined;
    @JsonProperty('intitule', String)
    intitule: string = undefined;
    @JsonProperty('indicatifTel', String)
    indicatifTel: string = undefined;
    @JsonProperty('ordre', Number)
    ordre: number = undefined;

    public constructor(init?: Partial<Pays>) {
        Object.assign(this, init);
    }
}
