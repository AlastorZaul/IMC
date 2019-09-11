import {JsonObject, JsonProperty} from 'json2typescript';
import { Adresse } from 'src/app/modeles/adresse.model';
import { Ape } from 'src/app/modeles/ape.model';

@JsonObject('Employeur')
export class Employeur {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('ape', Ape, true)
    ape: Ape = undefined;
    @JsonProperty('courriel', String, true)
    courriel: string = undefined;
    @JsonProperty('effectif', Number, true)
    effectif: Number = undefined;
    @JsonProperty('nomSignataire', String, true)
    nomSignataire: string = undefined;
    @JsonProperty('raisonSociale', String, true)
    raisonSociale: string = undefined;
    @JsonProperty('siret', String, true)
    siret: string = undefined;
    @JsonProperty('telephone', String, true)
    telephone: string = undefined;
    @JsonProperty('urssaf', String, true)
    urssaf: string = undefined;
    @JsonProperty('adresse', Adresse, true)
    adresse: Adresse = undefined;
    @JsonProperty('adresseCorrespondance', Adresse, true)
    adresseCorrespondance: Adresse = undefined;

    public constructor(init?: Partial<Employeur>) {
        Object.assign(this, init);
        if (this.adresse) {
            this.adresse = new Adresse(this.adresse);
        }
        if (this.adresseCorrespondance) {
            this.adresseCorrespondance = new Adresse(this.adresseCorrespondance);
        }
    }

}
