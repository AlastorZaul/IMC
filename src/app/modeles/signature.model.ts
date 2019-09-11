import {JsonObject, JsonProperty } from 'json2typescript';

@JsonObject('Signature')
export class Signature {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('contenu', String, true)
    contenu: string  = undefined;
    @JsonProperty('nom', String)
    nom: string  = undefined;
    @JsonProperty('principale', Boolean)
    principale: boolean  = undefined;

    public constructor(init?: Partial<Signature>) {
        Object.assign(this, init);
    }
}


