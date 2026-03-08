import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatabaseService, PresentationService } from '../../../core/services';
import type { Collection } from '@main/database/entity/Collection.schema';

const FILE_TYPES = [
  { label: 'TrueType (.ttf)', value: 'font/ttf' },
  { label: 'OpenType (.otf)', value: 'font/otf' },
  { label: 'WOFF (.woff)', value: 'font/woff' },
  { label: 'WOFF2 (.woff2)', value: 'font/woff2' },
];

const SEARCH_FIELDS = [
  { label: 'Font Name', value: 'full_name' },
  { label: 'Font Family', value: 'font_family' },
  { label: 'Font Subfamily', value: 'font_subfamily' },
  { label: 'PostScript Name', value: 'post_script_name' },
  { label: 'Designer', value: 'designer' },
  { label: 'Manufacturer', value: 'manufacturer' },
  { label: 'Copyright', value: 'copyright' },
  { label: 'License', value: 'license' },
  { label: 'Description', value: 'description' },
  { label: 'Trademark', value: 'trademark' },
  { label: 'File Name', value: 'file_name' },
  { label: 'Version', value: 'version' },
];

const SORT_OPTIONS = [
  { label: 'Name (A-Z)', column: 'full_name', direction: 'ASC' },
  { label: 'Name (Z-A)', column: 'full_name', direction: 'DESC' },
  { label: 'Family (A-Z)', column: 'font_family', direction: 'ASC' },
  { label: 'Family (Z-A)', column: 'font_family', direction: 'DESC' },
  { label: 'File Name (A-Z)', column: 'file_name', direction: 'ASC' },
  { label: 'File Name (Z-A)', column: 'file_name', direction: 'DESC' },
  { label: 'File Size (Smallest)', column: 'file_size', direction: 'ASC' },
  { label: 'File Size (Largest)', column: 'file_size', direction: 'DESC' },
  { label: 'Date Added (Newest)', column: 'created', direction: 'DESC' },
  { label: 'Date Added (Oldest)', column: 'created', direction: 'ASC' },
  { label: 'Date Updated (Newest)', column: 'updated', direction: 'DESC' },
  { label: 'Date Updated (Oldest)', column: 'updated', direction: 'ASC' },
  { label: 'Designer (A-Z)', column: 'designer', direction: 'ASC' },
  { label: 'Designer (Z-A)', column: 'designer', direction: 'DESC' },
];

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search.component.html',
})
export class SearchComponent {
  readonly db = inject(DatabaseService);
  readonly presentation = inject(PresentationService);

  readonly fileTypes = FILE_TYPES;
  readonly searchFields = SEARCH_FIELDS;
  readonly sortOptions = SORT_OPTIONS;

  searchTerm = '';
  selectedFileTypes: string[] = [];
  selectedSearchFields: string[] = [];

  // Status filters
  favoritesOnly = false;
  systemOnly = false;
  installedOnly = false;

  // Collection filter
  selectedCollectionId: number | null = null;

  // Designer/Manufacturer filter
  designerFilter = '';
  manufacturerFilter = '';

  // Font subfamily filter
  subfamilyFilter = '';

  // File size range (KB)
  fileSizeMin: number | null = null;
  fileSizeMax: number | null = null;

  // Date range
  dateFrom = '';
  dateTo = '';

  // Sort
  selectedSortIndex: number | null = null;

  readonly hasSearched = signal(false);

  get collections(): Collection[] {
    return this.db.collections();
  }

  toggleFileType(value: string) {
    const idx = this.selectedFileTypes.indexOf(value);
    if (idx >= 0) {
      this.selectedFileTypes.splice(idx, 1);
    } else {
      this.selectedFileTypes.push(value);
    }
  }

  isFileTypeSelected(value: string): boolean {
    return this.selectedFileTypes.includes(value);
  }

  toggleSearchField(value: string) {
    const idx = this.selectedSearchFields.indexOf(value);
    if (idx >= 0) {
      this.selectedSearchFields.splice(idx, 1);
    } else {
      this.selectedSearchFields.push(value);
    }
  }

  isSearchFieldSelected(value: string): boolean {
    return this.selectedSearchFields.includes(value);
  }

  onSearch() {
    const where: { key: string; value: any }[] = [];

    if (this.searchTerm.trim()) {
      where.push({ key: 'term', value: this.searchTerm.trim() });
    }

    if (this.selectedSearchFields.length > 0) {
      where.push({ key: 'search_fields', value: [...this.selectedSearchFields] });
    }

    if (this.selectedFileTypes.length > 0) {
      where.push({ key: 'file_type', value: [...this.selectedFileTypes] });
    }

    if (this.favoritesOnly) {
      where.push({ key: 'favorite', value: 1 });
    }

    if (this.systemOnly) {
      where.push({ key: 'system', value: 1 });
    }

    if (this.installedOnly) {
      where.push({ key: 'installable', value: 1 });
    }

    if (this.selectedCollectionId !== null) {
      where.push({ key: 'collection_id', value: this.selectedCollectionId });
    }

    if (this.designerFilter.trim()) {
      where.push({ key: 'designer', value: this.designerFilter.trim() });
    }

    if (this.manufacturerFilter.trim()) {
      where.push({ key: 'manufacturer', value: this.manufacturerFilter.trim() });
    }

    if (this.subfamilyFilter.trim()) {
      where.push({ key: 'font_subfamily', value: this.subfamilyFilter.trim() });
    }

    if (this.fileSizeMin !== null && this.fileSizeMin > 0) {
      where.push({ key: 'file_size_min', value: this.fileSizeMin * 1024 });
    }

    if (this.fileSizeMax !== null && this.fileSizeMax > 0) {
      where.push({ key: 'file_size_max', value: this.fileSizeMax * 1024 });
    }

    if (this.dateFrom) {
      where.push({ key: 'date_from', value: this.dateFrom });
    }

    if (this.dateTo) {
      where.push({ key: 'date_to', value: this.dateTo });
    }

    if (where.length === 0) {
      return;
    }

    const order =
      this.selectedSortIndex !== null
        ? {
            column: this.sortOptions[this.selectedSortIndex].column,
            direction: this.sortOptions[this.selectedSortIndex].direction,
          }
        : undefined;

    this.hasSearched.set(true);
    this.db.selectSearch(where, order);
  }

  onReset() {
    this.searchTerm = '';
    this.selectedFileTypes = [];
    this.selectedSearchFields = [];
    this.favoritesOnly = false;
    this.systemOnly = false;
    this.installedOnly = false;
    this.selectedCollectionId = null;
    this.designerFilter = '';
    this.manufacturerFilter = '';
    this.subfamilyFilter = '';
    this.fileSizeMin = null;
    this.fileSizeMax = null;
    this.dateFrom = '';
    this.dateTo = '';
    this.selectedSortIndex = null;
    this.hasSearched.set(false);
    this.db.clearSearch();
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSearch();
    }
  }
}
