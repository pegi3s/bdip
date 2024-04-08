import { Component, HostListener, ElementRef, Renderer2 } from '@angular/core';
import { NavigationEnd, RouterLink, Router } from '@angular/router';
import { SearchGuidedComponent } from "../../search-guided/search-guided.component";
import { Location } from '@angular/common';

@Component({
    selector: 'app-header',
    standalone: true,
    templateUrl: './header.component.html',
    styleUrl: './header.component.css',
    imports: [RouterLink, SearchGuidedComponent]
})
export class HeaderComponent {
  /* Disable transitions on first load to prevent the header from sliding in */
  protected enableTransitions = false;

  private firstScrollHandled = false;
  private touchStartY = 0;
  protected scrolled = true;
  protected isOverflowing = false;

  constructor(
    private el: ElementRef,
    private renderer: Renderer2,
    private router: Router,
    private location: Location
  ) {
  }

  ngOnInit() {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.scrolled = this.router.url !== '/';
        this.firstScrollHandled = this.router.url !== '/';
      }
    });
  }

  ngAfterViewInit() {
    const header = this.el.nativeElement.querySelector('header');

    /*TODO: Fix*/
    console.log(this.location.path());
    if (this.location.path() !== '') {
      this.scrolled = true;
      this.firstScrollHandled = true;
    }

    //TODO: FIX
    this.renderer.listen(header, 'click', (event) => {
      if (event.target.tagName.toLowerCase() === 'a') {
        return;
      }

      if (this.firstScrollHandled) {
        window.scrollTo(0, 0);
        this.scrolled = false;
        this.firstScrollHandled = false;
      }
    });

    this.checkOverflow();
    setTimeout(() => {
      this.enableTransitions = true;
    }, 1000);
  }

  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent) {
    if (!this.firstScrollHandled && event.deltaY > 0) {
      if (this.router.url === '/')
        this.router.navigate(['/about']);
      this.scrolled = true;
      this.firstScrollHandled = true;
    }
  }

  /*@HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent) {
    this.touchStartY = event.touches[0].clientY;
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const touchEndY = event.changedTouches[0].clientY;
    if (this.touchStartY > touchEndY && !this.firstScrollHandled) {
      if (this.router.url === '/')
        this.router.navigate(['/about']);
      this.scrolled = true;
      this.firstScrollHandled = true;
    }
  }*/

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.checkOverflow();
  }

  checkOverflow() {
    const nav = this.el.nativeElement.querySelector('.nav-links-bottom');
    this.isOverflowing = nav.scrollWidth > nav.clientWidth;
  }
}
