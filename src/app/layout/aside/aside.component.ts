import { Component, inject } from '@angular/core';
import { DatabaseService } from '../../core/services';
import { CollapsiblePanelComponent } from '../../shared/components/collapsible-panel/collapsible-panel.component';
import type { Store } from '@main/database/entity/Store.schema';
import type { FontMetrics } from '@main/types';

interface DetailField {
  label: string;
  icon: string;
  value: (store: Store) => string;
}

interface MetricField {
  label: string;
  icon: string;
  value: (metrics: FontMetrics) => string | number;
}

@Component({
  selector: 'app-aside',
  standalone: true,
  imports: [CollapsiblePanelComponent],
  templateUrl: './aside.component.html',
})
export class AsideComponent {
  readonly db = inject(DatabaseService);

  readonly fields: DetailField[] = [
    { label: 'Name', icon: 'badge', value: (s) => s.full_name || s.file_name },
    { label: 'Family', icon: 'group', value: (s) => s.font_family },
    { label: 'Pref. Family', icon: 'group', value: (s) => s.preferred_family },
    { label: 'Style', icon: 'format_italic', value: (s) => s.font_subfamily },
    { label: 'Pref. Style', icon: 'format_italic', value: (s) => s.preferred_sub_family },
    { label: 'Full Name', icon: 'label', value: (s) => s.compatible_full_name },
    { label: 'PostScript', icon: 'code', value: (s) => s.post_script_name },
    { label: 'Unique ID', icon: 'fingerprint', value: (s) => s.unique_id },
    { label: 'Version', icon: 'history', value: (s) => s.version },
    { label: 'Format', icon: 'description', value: (s) => s.file_type },
    { label: 'Description', icon: 'info', value: (s) => s.description },
    { label: 'Sample Text', icon: 'text_snippet', value: (s) => s.sample_text },
    { label: 'Designer', icon: 'brush', value: (s) => s.designer },
    { label: 'Designer URL', icon: 'link', value: (s) => s.designer_url },
    { label: 'Manufacturer', icon: 'factory', value: (s) => s.manufacturer },
    { label: 'Manufacturer URL', icon: 'link', value: (s) => s.manufacturer_url },
    { label: 'Copyright', icon: 'copyright', value: (s) => s.copyright },
    { label: 'Trademark', icon: 'verified', value: (s) => s.trademark },
    { label: 'License', icon: 'gavel', value: (s) => s.license },
    { label: 'License URL', icon: 'link', value: (s) => s.license_url },
    { label: 'File Size', icon: 'straighten', value: (s) => s.file_size_pretty },
    { label: 'File', icon: 'folder_open', value: (s) => s.file_path },
  ];

  readonly metricFields: MetricField[] = [
    { label: 'Glyphs', icon: 'text_fields', value: (m) => m.numGlyphs },
    { label: 'Units Per Em', icon: 'grid_4x4', value: (m) => m.unitsPerEm },
    { label: 'Ascent', icon: 'arrow_upward', value: (m) => m.ascent },
    { label: 'Descent', icon: 'arrow_downward', value: (m) => m.descent },
    { label: 'Line Gap', icon: 'format_line_spacing', value: (m) => m.lineGap },
  ];
}
