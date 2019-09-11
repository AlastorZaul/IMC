import { JsonObject, JsonProperty } from 'json2typescript';
import { Pays } from './pays.model';
import { Localisation } from './localisation.model';

@JsonObject('Adresse')
export class Adresse {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('voie', String, true)
    voie: string = undefined;
    @JsonProperty('complement', String, true)
    complement: string = undefined;
    @JsonProperty('infosEtranger', String, true)
    infosEtranger: string = undefined;
    @JsonProperty('pays', Pays, true)
    pays: Pays = undefined;
    @JsonProperty('localisation', Localisation, true)
    localisation: Localisation = undefined;
    @JsonProperty('bp', String, true)
    bp: string = undefined;

    public constructor(init?: Partial<Adresse>) {
        Object.assign(this, init);
    }
}
