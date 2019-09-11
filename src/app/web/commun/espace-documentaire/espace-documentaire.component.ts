import { Component, OnInit } from '@angular/core';
import { IFilAriane } from 'src/app/interfaces/IFilAriane';
import { Article } from 'src/app/modeles/article.model';
import { ActivatedRoute } from '@angular/router';
import { ROUTES } from 'src/app/constantes/routes';
import { FilArianeItem } from 'src/app/modeles/utils/fil-ariane-item.model';
import { ArticleService } from 'src/app/services/crud/article.service';


@Component({
  selector: 'app-espace-documentaire',
  templateUrl: './espace-documentaire.component.html'
})
export class EspaceDocumentaireComponent implements OnInit, IFilAriane {

  id: number;
  article: Article;
  mainArticle: Article;
  ROUTES: any;
  filAriane: FilArianeItem[];
  // Loaders
  mainLoading = true;
  articleLoading = true;

  constructor(
    private route: ActivatedRoute,
    private service: ArticleService
  ) { }

  ngOnInit() {
    this.ROUTES = ROUTES;
    this.service.getFullArborescence().subscribe((mainArticle: Article) => {
      this.mainLoading = false;
      this.mainArticle = mainArticle;
      if (this.mainArticle) {
        this.route.params.subscribe(
          params => {
            this.articleLoading = true;
            const tmpId = +params['id'];
            this.id = (tmpId) ? +tmpId : this.mainArticle.id;
            this.changeArticle(this.id);
          }
        );
      }
    });
  }

  changeArticle(idArticle: number) {
    this.service.getById(idArticle).subscribe((article: Article) => {
      this.article = article;
      if (this.article) {
        this.findArticleInArborescence(this.mainArticle, undefined);
        this.initFilAriane();
        this.articleLoading = false;
      }
    });
  }

  findArticleInArborescence(currentArtArbo: Article, parentArt: Article): boolean {
    currentArtArbo.parent = parentArt;
    if (currentArtArbo.id === this.article.id) {
      this.article.parent = parentArt;
      this.article.enfants = currentArtArbo.enfants;
      return true;
    } else if (currentArtArbo.enfants !== undefined && currentArtArbo.enfants.length > 0) {
      let find = false;
      for (let i = 0; i < currentArtArbo.enfants.length; i++ ) {
        find = this.findArticleInArborescence(currentArtArbo.enfants[i], currentArtArbo);
        if (find) {
          break;
        }
      }
      return find;
    }
  }

  /** Gestion du fil d'Ariane */
  initFilAriane() {
    this.filAriane = [];
    this.recursiveInitFilAriane(this.article);
    this.filAriane.reverse();
  }
  recursiveInitFilAriane(art: Article) {
    if (art) {
      this.filAriane.push(new FilArianeItem(art.titre, '/espace-documentaire/' + art.id));
      if (art.parent) {
        this.recursiveInitFilAriane(art.parent);
      }
    }
  }
  getFilAriane(): FilArianeItem[] {
    return this.filAriane;
  }

}
