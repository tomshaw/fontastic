import { Injectable } from '@angular/core';
import { gsap, Power3 } from 'gsap';

@Injectable({ providedIn: 'root' })
export class UtilsService {

  delay = (time: number) => (result: any) => new Promise(resolve => setTimeout(() => resolve(result), time));

  expandEntities(arr: any[] = [], parentId: number = 0) {
    const tree = [];
    for (const i in arr) {
      if (arr[i].parent_id === parentId) {
        const children = this.expandEntities(arr, arr[i].id);
        arr[i].children = (children.length) ? children : [];
        tree.push(arr[i]);
      }
    }
    return tree;
  }

  randomString(length: number): string {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  /**
   * Revert camlecase back to normal string. Used in aside component.
   * https://stackoverflow.com/questions/4149276/how-to-convert-camelcase-to-camel-case
   * 
   * @param str 
   */
  normalizeCamelCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1 $2');
  }

  capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  isEmptyObject(obj: any): boolean {
    return (
      Object.getPrototypeOf(obj) === Object.prototype &&
      Object.getOwnPropertyNames(obj).length === 0 &&
      Object.getOwnPropertySymbols(obj).length === 0
    );
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

  appendStyles(css: string, id: string = 'fontmanager') {
    const head = document.getElementsByTagName('head')[0];
    const style = document.createElement('style');
    style.setAttribute('type', 'text/css');
    style.setAttribute('id', id);
    style.appendChild(document.createTextNode(css));
    head.appendChild(style);
  }

  removeStyles(id: string) {
    return new Promise((resolve, reject) => {
      const el = document.getElementById(id);
      if (el) {
        resolve(el.remove());
      } else {
        reject(true);
      }
    });
  }

  createFontStyles(data: any[], next: any) {
    let css = ``;
    data.forEach((item: any) => {
      try {
        const fontFamily = (item.file_name?.length) ? item.file_name.replace(/\.[^/.]+$/, '') : item.file_name;
        const filePath = (item.file_path.length) ? item.file_path.replace(/\\/g, '/') : item.file_path;
        css += `
          @font-face {
            font-family: ${fontFamily};
            src: url("${filePath}");
          }
        `;
      } catch (error) {
        console.warn('create-font-styles-error:', error as Error);
      }
    });
    next(css);
  }
}
