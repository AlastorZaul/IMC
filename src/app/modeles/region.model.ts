import { JsonObject, JsonProperty, Any } from 'json2typescript';

@JsonObject('Region')
export class Region {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('code', String)
    code: string = undefined;
    @JsonProperty('intitule', String)
    intitule: string = undefined;
    // N'est pas une JsonProperty
    departements: Any[] = [];

    public constructor(init?: Partial<Region>) {
        Object.assign(this, init);
    }
}
