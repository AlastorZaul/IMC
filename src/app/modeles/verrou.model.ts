import { JsonObject, JsonProperty } from 'json2typescript';
import { DateTimeConverter } from './utils/custom-converters';

@JsonObject('Verrou')
export class Verrou {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('uuidDonnee', String)
    uuidDonnee: string = undefined;
    @JsonProperty('idUtilisateur', Number)
    idUtilisateur: number = undefined;
    @JsonProperty('identiteUtilisateur', String)
    identiteUtilisateur: string = undefined;
    @JsonProperty('identifiantOrganisme', String)
    identifiantOrganisme: string = undefined;
    @JsonProperty('typeDonnee', String)
    typeDonnee: string = undefined;
    @JsonProperty('timestampAcces', DateTimeConverter)
    timestampAcces: Date = undefined;

    constructor() {
        this.id = undefined;
        this.uuidDonnee = undefined;
        this.idUtilisateur = undefined;
        this.identiteUtilisateur = undefined;
        this.identifiantOrganisme = undefined;
        this.typeDonnee = undefined;
        this.timestampAcces = undefined;
    }
}
