import { JsonObject, JsonProperty } from 'json2typescript';
import { DepartementOrgaMedDto } from './departement-orga-med.model';

// CLASSES DTO "MINI"
@JsonObject('OrganismeMiniDto')
export class OrganismeMiniDto {
    @JsonProperty('id', Number)
    id: number = undefined;
    @JsonProperty('uuid', String, true)
    uuid: string = undefined;
    @JsonProperty('nomCourt', String)
    nomCourt: string = undefined;
    @JsonProperty('nom', String)
    nom: string = undefined;
    @JsonProperty('departement', DepartementOrgaMedDto, true)
    departement: DepartementOrgaMedDto = undefined;

    constructor() {
        this.id = undefined;
        this.nomCourt = undefined;
        this.nom = undefined;
        this.uuid = undefined;
        this.departement = undefined;
    }
}
