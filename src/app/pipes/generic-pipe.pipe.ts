import { PipeTransform, Pipe } from '@angular/core';

@Pipe({
    name: 'gpipe',
    pure: false
})
export class GenericPipe implements PipeTransform {
    transform(items: any[], callback: (item: any) => boolean): any {
        if (!items || !callback) {
            return items;
        }
        return items.filter(item => callback(item));
    }
}
