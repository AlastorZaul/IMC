import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'booleanPipe' })
export class BooleanPipe implements PipeTransform {
    transform(value: boolean): string {
        return value === true ? 'Oui' : 'Non';
    }
}
