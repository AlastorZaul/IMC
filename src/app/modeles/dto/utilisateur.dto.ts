import { JsonObject, JsonProperty } from 'json2typescript';
import { OrganismeMiniDto } from '../dto/organisme-mini-dto.dto';
import { Profil } from '../profil.model';
import { PROFILS } from '../../constantes/referentiel/profils.enum';

@JsonObject('Utilisateur')
export class Utilisateur {
    @JsonProperty('id', Number)
    id: number = undefined;
    @JsonProperty('identifiant', String)
    identifiant: string = undefined;
    @JsonProperty('nom', String)
    nom: string = undefined;
    @JsonProperty('prenom', String)
    prenom: string = undefined;
    @JsonProperty('courriel', String)
    courriel: string = undefined;
    @JsonProperty('profil', Profil)
    profil: Profil = undefined;
    @JsonProperty('organisme', OrganismeMiniDto)
    organisme: OrganismeMiniDto = undefined;

    get identite() { return this.nom + ' ' + this.prenom; }

    public constructor(init?: Partial<Utilisateur>) {
        Object.assign(this, init);
    }

    is (profilCode: PROFILS) {
        return (this.profil.code === profilCode);
    }
}
