/**
 * @description : Interface à implémenter pour structurer les composants souhaitant utiliser les verrous
 */
export interface IPageVerrou {
    intervalVerrou: NodeJS.Timer;
    initMecaniqueVerrous(): void;
    genererVerrou(): void;
    getUuidDonneePourVerrou(): string;
}
