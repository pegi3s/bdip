import { AfterViewInit, Component, inject } from "@angular/core";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { ViewportScroller } from "@angular/common";
import dockerfiles from '../../assets/contents.json';

@Component({
  selector: 'app-search-list',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './search-list.component.html',
  styleUrl: './search-list.component.css'
})
export class SearchListComponent implements AfterViewInit {
  private activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private viewportScroller: ViewportScroller = inject(ViewportScroller);

  isLeftEnd = true;
  isRightEnd = false;

  containers = new Map<string, Dockerfile[]>();
  constructor() {
    dockerfiles.forEach((element) => {
      if (!this.containers.has(element.category)) {
        this.containers.set(element.category, [element])
      } else {
        this.containers.get(element.category)?.push(element);
      }
    });
    this.activatedRoute.fragment.subscribe(fragment => {
      if (fragment) {
        this.viewportScroller.setOffset([0, 180]);
        this.viewportScroller.scrollToAnchor(fragment);
      }
    });
  }

  ngAfterViewInit() {
    const headings = Array.from(document.querySelectorAll('.categories + div > h2'));
    const tocAnchors = Array.from(document.querySelectorAll('.category-list > a'));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = headings.indexOf(entry.target as HTMLHeadingElement);
            tocAnchors.forEach((tab) => tab.classList.remove("active"));
            if (index !== -1) {
              tocAnchors[index].classList.add("active");
            }
          }
        });
      },
      { threshold: 1.0 }
    );

    headings.forEach((hTwo) => observer.observe(hTwo));
  }

  scrollLeft() {
    document.getElementsByClassName('category-list')[0]?.scrollBy({ left: -200, behavior: 'smooth' });
    setTimeout(() => {
      this.checkScrollPosition();
    }, 300);
  }

  scrollRight() {
    document.getElementsByClassName('category-list')[0]?.scrollBy({ left: 200, behavior: 'smooth' });
    setTimeout(() => {
      this.checkScrollPosition();
    }, 400);
  }

  checkScrollPosition() {
    const element = document.getElementsByClassName('category-list')[0];
    this.isLeftEnd = element.scrollLeft === 0;
    this.isRightEnd = element.scrollLeft + element.clientWidth === element.scrollWidth;
  }
}

interface Dockerfile {
  category: string;
  name: string;
  description: string;
  docs: string;
}
