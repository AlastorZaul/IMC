/**
 * Interface à implémenter pour les composants souhaitant utiliser le Guard "PreventNavigation"
 */
export interface IPreventNavigation {
    canNavigate: boolean;
    textModalConfirm: string;
}
