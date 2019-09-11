import { FilArianeItem } from '../modeles/utils/fil-ariane-item.model';

/**
 * @description : Interface à implémenter pour structurer les composants souhaitant utiliser le fil d'Ariane
 */
export interface IFilAriane {
    filAriane: FilArianeItem[];
    initFilAriane(): void;
    getFilAriane(): FilArianeItem[];
}
