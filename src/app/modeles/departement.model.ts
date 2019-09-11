import { JsonObject, JsonProperty } from 'json2typescript';
import { Region } from './region.model';
import { OrganismeMiniDto } from './dto/organisme-mini-dto.dto';

@JsonObject('Departement')
export class Departement {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('code', String)
    code: string = undefined;
    @JsonProperty('intitule', String)
    intitule: string = undefined;
    @JsonProperty('region', Region, true)
    region: Region = undefined;
    @JsonProperty('organismeReferent', OrganismeMiniDto, true)
    organismeReferent: OrganismeMiniDto = undefined;

    public constructor(init?: Partial<Departement>) {
        Object.assign(this, init);
    }
}


