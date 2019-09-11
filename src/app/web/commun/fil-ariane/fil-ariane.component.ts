import { Component, OnInit, Input } from '@angular/core';
import { FilArianeItem } from 'src/app/modeles/utils/fil-ariane-item.model';

@Component({
  selector: 'app-fil-ariane',
  template:
  `<div class="filariane-container">
    <div *ngIf="accueilVisible" class="filariane-item">
      <a routerLink="/accueil">Accueil</a>
      <i *ngIf="filAriane?.length > 0" class="material-icons">chevron_right</i>
    </div>
    <div *ngFor="let item of filAriane; let last = last" class="filariane-item">
      <a *ngIf="item.url !== undefined" routerLink="{{item.url}}">{{item.nom}}</a>
      <a *ngIf="item.url === undefined">{{item.nom}}</a>
      <i *ngIf="!last" class="material-icons">chevron_right</i>
    </div>
  </div>`
})
export class FilArianeComponent implements OnInit {
  @Input() filAriane: FilArianeItem[];
  @Input() accueilVisible = true;
  constructor() { }
  ngOnInit() {
    if (this.filAriane === undefined) {
      this.filAriane = [];
    }
  }
}
