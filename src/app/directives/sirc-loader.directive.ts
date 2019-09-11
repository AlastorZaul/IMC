import { Directive, Input, TemplateRef, ViewContainerRef, ComponentFactoryResolver, ComponentFactory, ComponentRef } from '@angular/core';
import { LoaderComponent } from '../web/commun/loader/loader.component';

@Directive({
  selector: '[appSircLoader]'
})
export class SircLoaderDirective {
  loaderFactory: ComponentFactory<LoaderComponent>;
  loaderComponent: ComponentRef<LoaderComponent>;

  constructor(private templateRef: TemplateRef<any>,
    private vcRef: ViewContainerRef,
    private componentFactoryResolver: ComponentFactoryResolver
  ) {
    this.loaderFactory = this.componentFactoryResolver.resolveComponentFactory(LoaderComponent);
  }

  @Input()
  set appSircLoader(loading: boolean) {
    this.vcRef.clear();
    if (loading) {
      this.loaderComponent = this.vcRef.createComponent(this.loaderFactory);
    } else {
      this.vcRef.createEmbeddedView(this.templateRef);
    }
  }

}
