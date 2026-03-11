import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SmartCollection } from '@main/database/entity/SmartCollection.schema';
import type { SmartCollectionRule } from '@main/types';

interface FieldOption {
  value: string;
  label: string;
  type: 'text' | 'boolean' | 'numeric' | 'enum' | 'date';
  options?: { value: string; label: string }[];
}

const FIELD_OPTIONS: FieldOption[] = [
  { value: 'font_family', label: 'Font Family', type: 'text' },
  { value: 'font_subfamily', label: 'Font Subfamily', type: 'text' },
  { value: 'full_name', label: 'Full Name', type: 'text' },
  { value: 'designer', label: 'Designer', type: 'text' },
  { value: 'manufacturer', label: 'Manufacturer', type: 'text' },
  { value: 'copyright', label: 'Copyright', type: 'text' },
  { value: 'license', label: 'License', type: 'text' },
  { value: 'version', label: 'Version', type: 'text' },
  { value: 'post_script_name', label: 'PostScript Name', type: 'text' },
  { value: 'file_name', label: 'File Name', type: 'text' },
  {
    value: 'file_type',
    label: 'File Type',
    type: 'enum',
    options: [
      { value: 'font/ttf', label: 'TrueType (TTF)' },
      { value: 'font/otf', label: 'OpenType (OTF)' },
      { value: 'font/woff', label: 'WOFF' },
      { value: 'font/woff2', label: 'WOFF2' },
    ],
  },
  { value: 'favorite', label: 'Favorite', type: 'boolean' },
  { value: 'system', label: 'System Font', type: 'boolean' },
  { value: 'installable', label: 'Installable', type: 'boolean' },
  { value: 'file_size', label: 'File Size (bytes)', type: 'numeric' },
  { value: 'created', label: 'Date Added', type: 'date' },
];

const OPERATORS_BY_TYPE: Record<string, { value: string; label: string }[]> = {
  text: [
    { value: 'contains', label: 'contains' },
    { value: 'equals', label: 'equals' },
    { value: 'starts_with', label: 'starts with' },
    { value: 'ends_with', label: 'ends with' },
  ],
  boolean: [
    { value: 'is', label: 'is' },
    { value: 'is_not', label: 'is not' },
  ],
  numeric: [
    { value: 'greater_than', label: 'greater than' },
    { value: 'less_than', label: 'less than' },
    { value: 'equals', label: 'equals' },
  ],
  enum: [{ value: 'equals', label: 'equals' }],
  date: [
    { value: 'greater_than', label: 'after' },
    { value: 'less_than', label: 'before' },
  ],
};

@Component({
  selector: 'app-rule-builder',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './rule-builder.component.html',
})
export class RuleBuilderComponent implements OnInit {
  @Input() smartCollection: SmartCollection | null = null;
  @Output() saved = new EventEmitter<{ title: string; rules: SmartCollectionRule[]; match_type: string }>();
  @Output() cancelled = new EventEmitter<void>();

  title = '';
  matchType: string = 'AND';
  rules: SmartCollectionRule[] = [];

  readonly fieldOptions = FIELD_OPTIONS;

  ngOnInit(): void {
    if (this.smartCollection) {
      this.title = this.smartCollection.title;
      this.matchType = this.smartCollection.match_type;
      this.rules = JSON.parse(this.smartCollection.rules);
    } else {
      this.rules = [{ field: 'font_family', operator: 'contains', value: '' }];
    }
  }

  getOperators(fieldValue: string): { value: string; label: string }[] {
    const field = FIELD_OPTIONS.find((f) => f.value === fieldValue);
    return OPERATORS_BY_TYPE[field?.type ?? 'text'] ?? OPERATORS_BY_TYPE['text'];
  }

  getFieldType(fieldValue: string): string {
    return FIELD_OPTIONS.find((f) => f.value === fieldValue)?.type ?? 'text';
  }

  getEnumOptions(fieldValue: string): { value: string; label: string }[] {
    return FIELD_OPTIONS.find((f) => f.value === fieldValue)?.options ?? [];
  }

  onFieldChange(rule: SmartCollectionRule): void {
    const operators = this.getOperators(rule.field);
    rule.operator = operators[0]?.value ?? 'contains';
    const type = this.getFieldType(rule.field);
    if (type === 'boolean') {
      rule.value = 1;
    } else if (type === 'enum') {
      const options = this.getEnumOptions(rule.field);
      rule.value = options[0]?.value ?? '';
    } else {
      rule.value = '';
    }
  }

  addRule(): void {
    this.rules.push({ field: 'font_family', operator: 'contains', value: '' });
  }

  removeRule(index: number): void {
    this.rules.splice(index, 1);
  }

  save(): void {
    const trimmedTitle = this.title.trim();
    if (!trimmedTitle || this.rules.length === 0) return;
    this.saved.emit({ title: trimmedTitle, rules: this.rules, match_type: this.matchType });
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
