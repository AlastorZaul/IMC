import { JsonObject, JsonProperty } from 'json2typescript';
import { Departement } from '../departement.model';

// CLASSES DTO "Autres"
@JsonObject('RegionDtoDepartement')
export class RegionDtoDepartement {
    @JsonProperty('id', Number)
    id: number;
    @JsonProperty('code', String)
    code: string;
    @JsonProperty('intitule', String)
    intitule: string;
    @JsonProperty('departements', [Departement])
    departements: Departement[];

    constructor() {
        this.id = undefined;
        this.code = undefined;
        this.intitule = undefined;
        this.departements = undefined;
    }
}
