import {JsonObject, JsonProperty} from 'json2typescript';
import { Adresse } from 'src/app/modeles/adresse.model';
import { CIVILITE } from 'src/app/constantes/referentiel/civilite.enum';
import { ConventionCollective } from 'src/app/modeles/convention-collective.model';
import { DateConverter } from 'src/app/modeles/utils/custom-converters';
import { Qualification } from 'src/app/modeles/qualification.model';

@JsonObject('Salarie')
export class Salarie {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('civilite', String, true)
    civilite: CIVILITE = undefined;
    @JsonProperty('conventionCollective', ConventionCollective, true)
    conventionCollective: ConventionCollective = undefined;
    @JsonProperty('courriel', String, true)
    courriel: string = undefined;
    @JsonProperty('dateNaissance', DateConverter, true)
    dateNaissance: Date = undefined;
    @JsonProperty('emploi', String, true)
    emploi: string = undefined;
    @JsonProperty('nom', String, true)
    nom: string = undefined;
    @JsonProperty('prenom', String, true)
    prenom: string = undefined;
    @JsonProperty('qualification', Qualification, true)
    qualification: Qualification = undefined;
    @JsonProperty('telephone', String, true)
    telephone: string = undefined;
    @JsonProperty('adresse', Adresse, true)
    adresse: Adresse = undefined;

    public constructor(init?: Partial<Salarie>) {
        Object.assign(this, init);
        if (this.adresse) {
            this.adresse = new Adresse(this.adresse);
        }
    }
}
