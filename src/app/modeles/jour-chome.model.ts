import {JsonObject, JsonProperty} from 'json2typescript';

@JsonObject('JourChome')
export class JourChome {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('actif', Boolean)
    actif: boolean = undefined;
    @JsonProperty('code', String)
    code: string = undefined;
    @JsonProperty('intitule', String)
    intitule: string = undefined;
    @JsonProperty('jour', Number)
    jour: number = undefined;
    @JsonProperty('mois', Number)
    mois: number = undefined;
    @JsonProperty('national', Boolean)
    national: boolean = undefined;
    @JsonProperty('systeme', Boolean)
    systeme: boolean = undefined;

    public constructor(init?: Partial<JourChome>) {
        Object.assign(this, init);
    }
}
