import { JsonObject, JsonProperty } from 'json2typescript';

// CLASSES DTO "REMUNERATION"
@JsonObject('Remuneration')
export class Remuneration {
    @JsonProperty('id', Number, true)
    id: number = undefined;
    @JsonProperty('anciennete', Number, true)
    anciennete: number = undefined;
    @JsonProperty('indemnite', Number, true)
    indemnite: number = undefined;
    @JsonProperty('indemniteConventionnelle', Number, true)
    indemniteConventionnelle: Number = undefined;
    @JsonProperty('indemniteLegale', Number, true)
    indemniteLegale: number = undefined;
    @JsonProperty('moisDernierMois', Number, true)
    moisDernierMois: number = undefined;
    @JsonProperty('anneeDernierMois', Number, true)
    anneeDernierMois: number = undefined;

    @JsonProperty('mois1Valeur', Number, true)
    mois1Valeur: number = undefined;
    @JsonProperty('mois10Valeur', Number, true)
    mois10Valeur: number = undefined;
    @JsonProperty('mois11Valeur', Number, true)
    mois11Valeur: number = undefined;
    @JsonProperty('mois12Valeur', Number, true)
    mois12Valeur: number = undefined;
    @JsonProperty('mois2Valeur', Number, true)
    mois2Valeur: number = undefined;
    @JsonProperty('mois3Valeur', Number, true)
    mois3Valeur: number = undefined;
    @JsonProperty('mois4Valeur', Number, true)
    mois4Valeur: number = undefined;
    @JsonProperty('mois5Valeur', Number, true)
    mois5Valeur: number = undefined;
    @JsonProperty('mois6Valeur', Number, true)
    mois6Valeur: number = undefined;
    @JsonProperty('mois7Valeur', Number, true)
    mois7Valeur: number = undefined;
    @JsonProperty('mois8Valeur', Number, true)
    mois8Valeur: number = undefined;
    @JsonProperty('mois9Valeur', Number, true)
    mois9Valeur: number = undefined;

    @JsonProperty('moyenneRemunerationMensuelle', Number, true)
    moyenneRemunerationMensuelle: number = undefined;
    @JsonProperty('prime', Number, true)
    prime: number = undefined;

    @JsonProperty('commentaire', String, true)
    commentaire: string = undefined;

    public constructor(init?: Partial<Remuneration>) {
        Object.assign(this, init);
    }

}
