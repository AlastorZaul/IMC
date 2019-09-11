import { Injectable } from '@angular/core';
import { SESSION_CLES } from '../constantes/session-cles';

/** @description: Service permettant de manipuler le localStorage. S'appuie sur les clés de l'enum SESSION_CLES */
@Injectable({ providedIn: 'root' })
export class StorageService {

    constructor() {}

    ///////// LOCAL STORAGE
    /**
     * L'interface localStorage mémorise les données sans limite de durée de vie.
     * Contrairement à sessionStorage, elles ne sont pas effacées lors de la fermeture d'un onglet ou du navigateur.
     * La portée de localStorage est de facto plus large : il est possible de l'exploiter à travers plusieurs onglets
     * ouverts pour le même domaine ou plusieurs fenêtres ; à partir du moment où il s'agit bien sûr du même navigateur.
     */
    setItemStorage(cle: SESSION_CLES, valeur: any) {
        localStorage.setItem(cle, JSON.stringify(valeur));
    }
    getItemStorage(cle: SESSION_CLES): any {
        let valeur = localStorage.getItem(cle);
        if (valeur !== undefined) {
            valeur = JSON.parse(valeur);
        }
        return valeur;
    }
    isItemInStorage(cle: SESSION_CLES): boolean {
        return (cle in localStorage);
    }
    removeItemStorage(cle: string) {
        localStorage.removeItem(cle);
    }
    clearStorage(): void {
        localStorage.clear();
    }
    lengthStorage(): number {
        return localStorage.length;
    }


    ///////// SESSION STORAGE
    /**
     * L'interface sessionStorage mémorise les données sur la durée d'une session de navigation,
     * et sa portée est limitée à la fenêtre ou l'onglet actif. Lors de sa fermeture, les données sont effacées.
     * Contrairement au cookies,  il n'y a pas d'interférence. Chaque stockage de session est limité à un domaine.
    */
    setItemSessionStorage(cle: SESSION_CLES, valeur: any) {
        sessionStorage.setItem(cle, JSON.stringify(valeur));
    }
    getItemSessionStorage(cle: SESSION_CLES): any {
        let valeur = sessionStorage.getItem(cle);
        if (valeur !== undefined) {
            valeur = JSON.parse(valeur);
        }
        return valeur;
    }
    isItemInSessionStorage(cle: SESSION_CLES): boolean {
        return (cle in sessionStorage);
    }
    removeItemSessionStorage(cle: string) {
        sessionStorage.removeItem(cle);
    }
    clearSessionStorage(): void {
        sessionStorage.clear();
    }
    lengthSessionStorage(): number {
        return sessionStorage.length;
    }

}
