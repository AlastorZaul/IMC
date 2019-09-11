import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Pager } from 'src/app/modeles/recherche/pager';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-pager',
  template: `
  <div *ngIf="pager">
    <div class="sirc-pager pager-desktop row no-gutters align-items-center p-1 d-none d-sm-flex">
      <div class="pager-result-infos col-12 col-md-5 col-lg-3 mb-1 mb-md-0" [ngSwitch]="pager.getNoResult()"
        [ngClass]="{'pager-btn-disabled': inactif}">
        <span *ngSwitchCase="false">{{pager.getStartIndex()}} - {{pager.getLastIndex()}} sur {{pager.totalElements}} résultats</span>
        <span *ngSwitchCase="true">Aucun résultat</span>
      </div>

      <div class="pager-select-rows col-3 d-none d-lg-block">
        <select [formControl]="sizeField" (change)="changePageSize()">
          <option [ngValue]="10">10 par page</option>
          <option [ngValue]="20">20 par page</option>
          <option [ngValue]="50">50 par page</option>
          <option [ngValue]="100">100 par page</option>
        </select>
      </div>

      <div class="pager-pages col-12 col-md-7 col-lg-6 align-items-center justify-content-center d-flex">
        <div class="pager-first pager-arrow mr-1 ml-0">
          <a (click)="!inactif && !pager.first ? firstPage():false"
              [ngClass]="{'pager-btn-disabled': inactif || pager.first }">
            <i class="material-icons">first_page</i>
          </a>
        </div>
        <div class="pager-prev pager-arrow mr-1">
          <a (click)="!inactif && pager.havePrevious() ? previous():false"
              [ngClass]="{'pager-btn-disabled': inactif || !pager.havePrevious() }">
            <i class="material-icons">chevron_left</i>
          </a>
        </div>
        <div class="pager-infos d-flex ">
          <div class="pager-infos-page d-flex align-items-center " *ngFor="let page of pager.getNearPages()">
            <a class="pager-page" (click)="!inactif?navigateToPage(page):false"
              [ngClass]="{'pager-page-actived': page === pager.getCurrentPage(), 'pager-btn-disabled': inactif}">{{page + 1}}</a>
            <i class="pager-dot material-icons">lens</i>
          </div>
        </div>
        <div class="pager-next pager-arrow mr-1">
          <a (click)="!inactif&&pager.haveNext()?next():false" [ngClass]="{'pager-btn-disabled': inactif || !pager.haveNext() }">
            <i class="material-icons">chevron_right</i>
          </a>
        </div>
        <div class="pager-last pager-arrow">
          <a (click)="!inactif&&!pager.last ? lastPage():false" [ngClass]="{'pager-btn-disabled': inactif || pager.last }">
            <i class="material-icons">last_page</i>
          </a>
        </div>
      </div>
    </div>

    <div class="sirc-pager pager-mobile align-items-center justify-content-between p-1 d-flex d-sm-none">
      <div class="pager-prev pager-arrow">
        <a (click)="!inactif && pager.havePrevious() ? previous():false"
          [ngClass]="{'pager-btn-disabled': inactif || !pager.havePrevious() }">
          <i class="material-icons">chevron_left</i>
        </a>
      </div>
      <div class="pager-result-infos" [ngSwitch]="pager.getNoResult()" [ngClass]="{'pager-btn-disabled': inactif}">
        <span *ngSwitchCase="false">{{pager.getStartIndex()}} - {{pager.getLastIndex()}} / {{pager.totalElements}}</span>
        <span *ngSwitchCase="true">Aucun résultat</span>
      </div>
      <div class="pager-next pager-arrow">
        <a (click)="!inactif&&pager.haveNext()?next():false" [ngClass]="{'pager-btn-disabled': inactif || !pager.haveNext() }">
          <i class="material-icons">chevron_right</i>
        </a>
      </div>
    </div>
  </div>`
})

export class PagerComponent implements OnInit {

  @Input() pager: Pager;
  @Input() inactif = false;
  @Output() navigateCallback = new EventEmitter();
  sizeField: FormControl;

  constructor() { }

  ngOnInit() {
    this.sizeField = new FormControl({value: this.pager.size, disabled: this.inactif});
  }

  firstPage(): void {
    if (this.inactif) { return; }
    this.pager.firstPage();
    if (this.navigateCallback) {
      this.navigateCallback.next();
    }
  }

  previous(): void {
    if (this.inactif) { return; }
    this.pager.previous();
    if (this.navigateCallback) {
      this.navigateCallback.next();
    }
  }

  next(): void {
    if (this.inactif) { return; }
    this.pager.next();
    if (this.navigateCallback) {
      this.navigateCallback.next();
    }
  }

  lastPage(): void {
    if (this.inactif) { return; }
    this.pager.lastPage();
    if (this.navigateCallback) {
      this.navigateCallback.next();
    }
  }

  navigateToPage(pageIndex: number) {
    if (this.inactif) { return; }
    this.pager.navigateToPage(pageIndex);
    if (this.navigateCallback) {
      this.navigateCallback.next();
    }
  }

  changePageSize(): void {
    if (this.inactif) { return; }
    this.pager.pageNumber = this.pager.getFirstPage();
    this.pager.size = this.sizeField.value;
    if (this.navigateCallback) { this.navigateCallback.next(); }
  }
}
