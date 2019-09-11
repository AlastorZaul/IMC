import { JsonObject, JsonProperty } from 'json2typescript';
import { OrganismeMiniDto } from './organisme-mini-dto.dto';

// Classe utilisée uniquement sur la page d'accueil
@JsonObject('AccueilTuileDto')
export class AccueilTuileDto {
    @JsonProperty('organisme', OrganismeMiniDto)
    organisme: OrganismeMiniDto = undefined;
    @JsonProperty('nbrAInstruire', Number)
    nbrAInstruire: number = undefined;
    @JsonProperty('nbrInstruits', Number)
    nbrInstruits: number = undefined;

    public constructor(init?: Partial<AccueilTuileDto>) {
        Object.assign(this, init);
    }
}
