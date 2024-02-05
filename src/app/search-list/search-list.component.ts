import { AfterViewInit, Component } from "@angular/core";
import dockerfiles from '../../assets/contents.json';

@Component({
  selector: 'app-search-list',
  standalone: true,
  imports: [],
  templateUrl: './search-list.component.html',
  styleUrl: './search-list.component.css'
})
export class SearchListComponent implements AfterViewInit {
  //containers = dockerfiles;

  /*constructor() {
    dockerfiles.forEach((element) => {
      if (element.type === 'dir') {
        this.containers.push(element.name);
      }
    });
  }*/

  containers = new Map<string, Dockerfile[]>();
  constructor() {
    dockerfiles.forEach((element) => {
      if (!this.containers.has(element.category)) {
        this.containers.set(element.category, [element])
      } else {
        this.containers.get(element.category)?.push(element);
      }
    });
  }

  ngAfterViewInit() {
    const headings = Array.from(document.querySelectorAll('.categories + div > h2'));
    const tocAnchors = Array.from(document.querySelectorAll('.categories > a'));

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
}

interface Dockerfile {
  category: string;
  name: string;
  description: string;
  docs: string;
  // include other properties as needed
}
