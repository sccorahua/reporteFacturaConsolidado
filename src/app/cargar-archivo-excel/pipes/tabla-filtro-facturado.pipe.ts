import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'tablaFiltroFacturado',
  standalone: true
})
export class TablaFiltroFacturadoPipe implements PipeTransform {

  transform(items: any[], searchText: string, propertiesToSearch: string[]): any[] {
    if (!items || !searchText || !propertiesToSearch || propertiesToSearch.length === 0) {
      return items;
    }

    searchText = searchText.toLowerCase();

    return items.filter(item => {
      for (const prop of propertiesToSearch) {
        if (item.hasOwnProperty(prop) && item[prop] !== null && item[prop] !== undefined) {
          if (String(item[prop]).toLowerCase().includes(searchText)) {
            return true;
          }
        }
      }
      return false;
    });
  }

}
