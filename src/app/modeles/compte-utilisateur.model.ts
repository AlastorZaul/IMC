import { JsonObject, JsonProperty } from 'json2typescript';
import { OrganismeMiniDto } from './dto/organisme-mini-dto.dto';
import { Profil } from './profil.model';
import { PROFILS } from '../constantes/referentiel/profils.enum';

@JsonObject('CompteUtilisateur')
export class CompteUtilisateur {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('identifiant', String)
    identifiant: string = undefined;
    @JsonProperty('nom', String)
    nom: string = undefined;
    @JsonProperty('prenom', String)
    prenom: string = undefined;
    @JsonProperty('telephone', String)
    telephone: string = undefined;
    @JsonProperty('courriel', String)
    courriel: string = undefined;
    @JsonProperty('profil', Profil)
    profil: Profil = undefined;
    @JsonProperty('organisme', OrganismeMiniDto)
    organisme: OrganismeMiniDto = undefined;

    public constructor(init?: Partial<CompteUtilisateur>) {
        Object.assign(this, init);
    }

    is (profilCode: PROFILS) {
        return (this.profil.code === profilCode);
    }
}
