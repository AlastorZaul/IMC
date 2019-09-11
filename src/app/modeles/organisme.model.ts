import { JsonObject, JsonProperty } from 'json2typescript';
import { Departement } from './departement.model';
import { Adresse } from './adresse.model';
import { Signature } from './signature.model';
import { JourChome } from './jour-chome.model';

@JsonObject('Organisme')
export class Organisme {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('uuid', String)
    uuid: string = undefined;
    @JsonProperty('nomCourt', String)
    nomCourt: string = undefined;
    @JsonProperty('nom', String)
    nom: string = undefined;
    @JsonProperty('infosService', String)
    infosService: string = undefined;
    @JsonProperty('infosComplementaires', String)
    infosComplementaires: string = undefined;
    @JsonProperty('notificationTeletransmission', Boolean)
    notificationTeletransmission: boolean = undefined;
    @JsonProperty('telephone', String)
    telephone: string = undefined;
    @JsonProperty('fax', String)
    fax: string = undefined;
    @JsonProperty('telephoneService', String)
    telephoneService: string = undefined;
    @JsonProperty('adresse', Adresse)
    adresse: Adresse = undefined;
    @JsonProperty('courriel', String)
    courriel: string = undefined;
    @JsonProperty('departement', Departement)
    departement: Departement = undefined;

    @JsonProperty('enfants', [Organisme], true)
    enfants: Organisme[] = undefined;

    @JsonProperty('signatures', [Signature], true)
    signatures: Signature[] = undefined;

    @JsonProperty('jourChome', [JourChome])
    joursChomes: JourChome[] = undefined;

    public constructor(init?: Partial<Organisme>) {
        Object.assign(this, init);
        if (this.adresse !== undefined && this.adresse !== null) {
            this.adresse = new Adresse(this.adresse);
        }
    }
}
