import { Injectable } from "@angular/core";
import { gsap, Power3 } from 'gsap';

@Injectable({ providedIn: 'root' })
export class UtilsService {

  resizeHandlers: any[] = [];

  constructor() { }

  expandEntities = (arr: any[] = [], parentId: any = false) => {
    let tree = []
    for (let i in arr) {
      if (arr[i].parent_id == parentId) {
        let children = this.expandEntities(arr, arr[i].id)
        arr[i].children = (children.length) ? children : [];
        tree.push(arr[i])
      }
    }
    return tree;
  }

  randomString(length: number): string {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * Revert camlecase back to normal string. Used in aside component.
   * https://stackoverflow.com/questions/4149276/how-to-convert-camelcase-to-camel-case
   * @param str 
   */
  normalizeCamelCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2');
    //return str.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => { return str.toUpperCase(); })
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  scrollTo(element: Element, offset: number = 0) {
    gsap.to(element, {
      scrollTo: {
        y: offset,
        autoKill: true,
      },
      duration: 1,
      ease: Power3.easeOut
    });
  }

  removeStyles() {
    return new Promise((resolve, reject) => {
      const el = document.getElementById("fm");
      if (el) {
        resolve(el.remove());
      } else {
        resolve(true);
      }
    })
  }

  appendStyles(data: any[], next: any) {
    if (!data.length) return;
    let css = ``;
    data.forEach((item: any) => {
      item.font_family = item.file_name.replace(/\.[^/.]+$/, "");
      css += `
        @font-face {
          font-family: ${item.font_family};
          src: url("${item.file_path.replace(/\\/g, "/")}");
        }`;
    });
    let head = document.getElementsByTagName("head")[0];
    let style = document.createElement("style")
    style.setAttribute("type", "text/css");
    style.setAttribute("id", "fm");
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
    next();
  }

  filterFileType(item: string): string {
    if (item == 'font/otf') {
      return 'OpenType';
    } else if (item == 'font/ttf') {
      return 'TrueType';
    } else {
      return '-';
    }
  }

}
