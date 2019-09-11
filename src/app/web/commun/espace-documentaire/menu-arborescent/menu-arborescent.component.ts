import { Component, OnInit, Input } from '@angular/core';
import { Article } from 'src/app/modeles/article.model';
import { ROUTES } from 'src/app/constantes/routes';

@Component({
  selector: 'app-menu-arborescent',
  templateUrl: './menu-arborescent.component.html'
})
export class MenuArborescentComponent implements OnInit {

  @Input() article: Article;
  ROUTES: any;

  constructor() { }

  ngOnInit() {
    this.ROUTES = ROUTES;
  }

}
