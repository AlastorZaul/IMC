import { JsonObject, JsonProperty } from 'json2typescript';
import { Region } from '../region.model';

@JsonObject('DepartementOrgaMedDto')
export class DepartementOrgaMedDto {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('code', String)
    code: string = undefined;
    @JsonProperty('intitule', String)
    intitule: string = undefined;
    @JsonProperty('region', Region, true)
    region: Region = undefined;

    public constructor(init?: Partial<DepartementOrgaMedDto>) {
        Object.assign(this, init);
    }
}


