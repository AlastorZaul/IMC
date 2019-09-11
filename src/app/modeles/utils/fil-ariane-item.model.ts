export class FilArianeItem {
    nom: string;
    url: string;
    actif: boolean;
    constructor(nom: string, url: string, actif: boolean = true) {
        this.nom = nom;
        this.url = url;
        this.actif = actif;
    }
}
