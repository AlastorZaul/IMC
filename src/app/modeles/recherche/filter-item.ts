// CLASSES DTO "RECHERCHE"

export enum FILTRE_OPERATEUR { LIKE = ':', EGAL = ':', SUPERIEUR = '>', INFERIEUR = '<' }

export class FilterItem {
    propriete: string = undefined;
    valeur: string = undefined;
    operateur: FILTRE_OPERATEUR = FILTRE_OPERATEUR.LIKE;

    constructor(propriete: string, valeur: string, operateur?: FILTRE_OPERATEUR) {
        this.propriete = propriete;
        this.valeur = valeur;
        this.operateur = (operateur !== undefined) ? operateur : this.findOperateurParDefaut(valeur);
    }

    private findOperateurParDefaut(valeur: string): FILTRE_OPERATEUR {
        switch (typeof valeur) {
            case 'string':
                return FILTRE_OPERATEUR.LIKE;
            case 'number' || 'boolean':
                return FILTRE_OPERATEUR.EGAL;
            default:
                return FILTRE_OPERATEUR.EGAL;
        }
    }
}
