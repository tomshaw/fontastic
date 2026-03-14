import { Component, inject, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DatabaseService, MessageService, PresentationService } from '../../core/services';
import { CollapsiblePanelComponent } from '../../shared/components/collapsible-panel/collapsible-panel.component';
import { ContextMenuComponent, ContextMenuItem } from '../../shared/components/context-menu/context-menu.component';
import { RuleBuilderComponent } from '../../shared/components';
import { AutofocusDirective } from '../../shared/directives/autofocus/autofocus.directive';
import { LibraryComponent } from './library/library.component';
import { NewsStatsComponent } from './stats/stats.component';
import type { Collection } from '@main/database/entity/Collection.schema';
import type { SmartCollection } from '@main/database/entity/SmartCollection.schema';
import type { SmartCollectionRule } from '@main/types';
import { ChannelType } from '@main/enums';

export interface TreeNode {
  collection: Collection;
  children: TreeNode[];
}

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CollapsiblePanelComponent,
    ContextMenuComponent,
    RuleBuilderComponent,
    AutofocusDirective,
    LibraryComponent,
    NewsStatsComponent,
  ],
  templateUrl: './navigation.component.html',
})
export class NavigationComponent implements OnInit, OnDestroy {
  readonly db = inject(DatabaseService);
  private message = inject(MessageService);
  private presentation = inject(PresentationService);

  private menuToggleListener = (_event: any, panel: string) => {
    if (panel === 'expand-collections') {
      this.expandAll();
    } else if (panel === 'collapse-collections') {
      this.collapseAll();
    }
  };

  ngOnInit() {
    this.message.on(ChannelType.IPC_TOGGLE_PANEL, this.menuToggleListener);
  }

  ngOnDestroy() {
    this.message.removeListener(ChannelType.IPC_TOGGLE_PANEL, this.menuToggleListener);
  }

  readonly tree = computed<TreeNode[]>(() => {
    const all = this.db.collections();
    const buildChildren = (parentId: number): TreeNode[] =>
      all.filter((c) => c.parent_id === parentId).map((c) => ({ collection: c, children: buildChildren(c.id) }));
    return buildChildren(0);
  });

  readonly totalFonts = computed(() => this.db.collections().reduce((sum, c) => sum + (c.count ?? 0), 0));

  readonly parentCount = computed(() => this.db.collections().filter((c) => c.parent_id === 0).length);

  contextMenuItems: ContextMenuItem[] = [];
  contextMenu: { x: number; y: number; collection: Collection } | null = null;
  editingId: number | null = null;
  editingTitle = '';
  allExpanded = false;

  isCreating = false;
  creatingTitle = '';
  pendingParentId: number | null = null;

  // Smart Collection state
  showRuleBuilder = false;
  editingSmartCollection: SmartCollection | null = null;
  smartContextMenu: { x: number; y: number; smartCollection: SmartCollection } | null = null;
  smartContextMenuItems: ContextMenuItem[] = [];

  // Drag state
  draggedNode: TreeNode | null = null;
  dropTargetId: number | null = null;
  dropAsRoot = false;
  dropPosition: 'before' | 'after' | 'into' = 'into';

  onDragStart(event: DragEvent, node: TreeNode) {
    event.stopPropagation();
    this.draggedNode = node;
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/plain', String(node.collection.id));
  }

  onDragOver(event: DragEvent, targetId: number) {
    if (!this.draggedNode || this.draggedNode.collection.id === targetId) return;
    if (targetId !== 0 && this.isDescendant(this.draggedNode, targetId)) return;
    event.preventDefault();
    event.stopPropagation();
    event.dataTransfer!.dropEffect = 'move';

    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    const localX = event.clientX - rect.left;

    // If cursor is in the left 28px zone, treat as "move to root"
    if (targetId !== 0 && localX < 28) {
      this.dropAsRoot = true;
      this.dropTargetId = 0;
      this.dropPosition = 'into';
      return;
    }

    this.dropAsRoot = false;

    // Check if dragged item and target are siblings (same parent)
    // Use three zones: top edge = reorder before, bottom edge = reorder after, middle = move into
    if (targetId !== 0) {
      const target = this.db.collections().find((c) => c.id === targetId);
      if (target && target.parent_id === this.draggedNode.collection.parent_id) {
        const localY = event.clientY - rect.top;
        const edgeZone = Math.min(8, rect.height / 4);
        if (localY < edgeZone) {
          this.dropPosition = 'before';
          this.dropTargetId = targetId;
          return;
        } else if (localY > rect.height - edgeZone) {
          this.dropPosition = 'after';
          this.dropTargetId = targetId;
          return;
        }
      }
    }

    // Middle zone or non-sibling: treat as "move into" the target
    this.dropPosition = 'into';
    this.dropTargetId = targetId;
  }

  onDragLeave(event: DragEvent, targetId: number) {
    const related = event.relatedTarget as HTMLElement | null;
    const current = event.currentTarget as HTMLElement;
    if (related && current.contains(related)) return;
    if (this.dropTargetId === targetId || (this.dropAsRoot && this.dropTargetId === 0)) {
      this.dropTargetId = null;
      this.dropAsRoot = false;
      this.dropPosition = 'into';
    }
  }

  async onDrop(event: DragEvent, targetId: number) {
    event.preventDefault();
    event.stopPropagation();

    if (!this.draggedNode) return;

    const draggedNode = this.draggedNode;
    const collectionId = draggedNode.collection.id;
    const draggedParentId = draggedNode.collection.parent_id;
    const effectiveTargetId = this.dropAsRoot ? 0 : targetId;
    const position = this.dropPosition;

    // Check for sibling reorder
    const isSiblingReorder =
      !this.dropAsRoot &&
      targetId !== 0 &&
      position !== 'into' &&
      this.db.collections().find((c) => c.id === targetId)?.parent_id === draggedParentId;

    // Dropping on the root zone when item is already at root = move to end
    const isRootZoneReorder = !this.dropAsRoot && targetId === 0 && draggedParentId === 0;

    this.draggedNode = null;
    this.dropTargetId = null;
    this.dropAsRoot = false;
    this.dropPosition = 'into';

    if (isSiblingReorder || isRootZoneReorder) {
      // Reorder within the same parent
      const siblings = this.db
        .collections()
        .filter((c) => c.parent_id === draggedParentId && c.id !== collectionId)
        .sort((a, b) => a.orderby - b.orderby);

      let newIndex: number;
      if (isRootZoneReorder) {
        // Dropped on root zone = move to end
        newIndex = siblings.length;
      } else {
        const targetIndex = siblings.findIndex((c) => c.id === targetId);
        newIndex = position === 'before' ? targetIndex : targetIndex + 1;
      }

      try {
        await this.db.collectionMove(collectionId, draggedParentId, newIndex);
      } catch (err) {
        console.error('[drag] reorder error:', err);
      }
      return;
    }

    // Move to a new parent
    const newParentId = effectiveTargetId;

    if (collectionId === newParentId) return;
    if (newParentId !== 0 && this.isDescendant(draggedNode, newParentId)) return;

    // Optimistic update
    const updated = this.db.collections().map((c) => (c.id === collectionId ? { ...c, parent_id: newParentId } : c));
    this.db.collections.set(updated);

    if (newParentId !== 0) {
      this.presentation.expandNavigationId(newParentId);
    }

    try {
      await this.db.collectionMove(collectionId, newParentId, 0);
    } catch (err) {
      console.error('[drag] move error:', err);
    }
  }

  onDragEnd() {
    this.draggedNode = null;
    this.dropTargetId = null;
    this.dropAsRoot = false;
    this.dropPosition = 'into';
  }

  private isDescendant(draggedNode: TreeNode, targetId: number): boolean {
    const check = (nodes: TreeNode[]): boolean => nodes.some((n) => n.collection.id === targetId || check(n.children));
    return check(draggedNode.children);
  }

  onContextMenu(event: MouseEvent, collection: Collection) {
    event.preventDefault();
    event.stopPropagation();

    this.contextMenuItems = [
      { label: 'Add Collection', action: 'add-collection', icon: 'create_new_folder' },
      { label: 'Add Fonts', action: 'add-fonts', icon: 'list_alt' },
      { label: 'Rename', action: 'rename', icon: 'edit', separator: true },
      { label: 'Delete', action: 'delete', icon: 'delete', separator: true },
    ];

    this.contextMenu = { x: event.clientX, y: event.clientY, collection };
  }

  onContextMenuSelect(action: string) {
    if (!this.contextMenu) return;
    const collection = this.contextMenu.collection;
    this.contextMenu = null;

    switch (action) {
      case 'add-collection':
        this.pendingParentId = collection.id;
        this.isCreating = true;
        this.creatingTitle = '';
        this.presentation.expandNavigationId(collection.id);
        break;
      case 'add-fonts':
        this.handleAddFonts(collection);
        break;
      case 'rename':
        this.editingId = collection.id;
        this.editingTitle = collection.title;
        break;
      case 'delete':
        this.db.collectionDelete(collection.id);
        break;
    }
  }

  openCreateRootCollection() {
    this.pendingParentId = 0;
    this.isCreating = true;
    this.creatingTitle = '';
  }

  saveCreating() {
    const title = this.creatingTitle.trim();
    if (title) {
      this.db.collectionCreate({ title, parentId: this.pendingParentId });
      if (this.pendingParentId) {
        this.presentation.expandNavigationId(this.pendingParentId);
      }
    }
    this.cancelCreating();
  }

  cancelCreating() {
    this.isCreating = false;
    this.creatingTitle = '';
    this.pendingParentId = null;
  }

  async handleAddFonts(collection: Collection) {
    const collectionId = collection.id;

    const response = await this.message.showMessageBox({
      type: 'question',
      buttons: ['Cancel', 'Select files', 'Select folders'],
      defaultId: 2,
      title: 'Select Fonts',
      message: 'Do you want to select files or folders?',
    });

    if (!response?.response) return;

    const isFiles = response.response === 1;

    const options = isFiles
      ? {
          properties: ['openFile', 'multiSelections'],
          filters: [{ name: 'Fonts', extensions: ['ttf', 'otf', 'woff', 'woff2', 'ttc', 'dfont'] }],
        }
      : { properties: ['openDirectory', 'multiSelections'] };

    const dialog = await this.message.showOpenDialog(options);
    if (!dialog.filePaths?.length) return;

    this.presentation.startLoading();
    try {
      if (isFiles) {
        await this.message.scanFiles({ files: dialog.filePaths, collectionId });
      } else {
        await this.message.scanFolders({ folders: dialog.filePaths, collectionId });
      }

      await this.db.collectionUpdateCount(collectionId);

      if (this.db.collectionId() === collectionId) {
        this.db.currentPage.set(1);
        await this.db.storeFetch({ collectionId, skip: 0, take: this.db.pageSize() });
      }
    } finally {
      this.presentation.stopLoading();
    }
  }

  isExpanded(id: number): boolean {
    return this.presentation.isNavigationExpanded(id);
  }

  toggleExpand(event: Event, id: number) {
    event.stopPropagation();
    this.presentation.toggleNavigationExpanded(id);
  }

  expandAll() {
    const allIds: number[] = [];
    const collectIds = (nodes: TreeNode[]) => {
      for (const node of nodes) {
        allIds.push(node.collection.id);
        collectIds(node.children);
      }
    };
    collectIds(this.tree());
    this.presentation.setAllNavigationExpanded(allIds);
    this.allExpanded = true;
  }

  collapseAll() {
    this.presentation.clearAllNavigationExpanded();
    this.allExpanded = false;
  }

  isSelected(collection: Collection): boolean {
    return this.db.collectionId() === collection.id && !this.db.activeFilter();
  }

  selectCollection(collection: Collection) {
    if (collection.parent_id === 0) {
      this.db.selectParent(collection.id);
    } else {
      this.db.selectChild(collection);
    }
  }

  closeContextMenu() {
    this.contextMenu = null;
  }

  saveEditing(id: number) {
    const title = this.editingTitle.trim();
    if (title) {
      this.db.collectionUpdate(id, { title });
    }
    this.cancelEditing();
  }

  cancelEditing() {
    this.editingId = null;
    this.editingTitle = '';
  }

  // Smart Collection methods

  selectSmartCollection(sc: SmartCollection) {
    this.db.selectSmartCollection(sc.id);
  }

  isSmartSelected(sc: SmartCollection): boolean {
    return this.db.activeSmartCollectionId() === sc.id;
  }

  openCreateSmartCollection() {
    this.editingSmartCollection = null;
    this.showRuleBuilder = true;
  }

  editSmartCollection(sc: SmartCollection) {
    this.editingSmartCollection = sc;
    this.showRuleBuilder = true;
  }

  onSmartContextMenu(event: MouseEvent, sc: SmartCollection) {
    event.preventDefault();
    event.stopPropagation();

    this.smartContextMenuItems = [
      { label: 'Edit Rules', action: 'edit-rules', icon: 'tune' },
      { label: 'Delete', action: 'delete', icon: 'delete', separator: true },
    ];

    this.smartContextMenu = { x: event.clientX, y: event.clientY, smartCollection: sc };
  }

  onSmartContextMenuSelect(action: string) {
    if (!this.smartContextMenu) return;
    const sc = this.smartContextMenu.smartCollection;
    this.smartContextMenu = null;

    switch (action) {
      case 'edit-rules':
        this.editingSmartCollection = sc;
        this.showRuleBuilder = true;
        break;
      case 'delete':
        this.db.smartCollectionDelete(sc.id);
        break;
    }
  }

  closeSmartContextMenu() {
    this.smartContextMenu = null;
  }

  onRuleBuilderSaved(data: { title: string; rules: SmartCollectionRule[]; match_type: string }) {
    const rulesJson = JSON.stringify(data.rules);
    if (this.editingSmartCollection) {
      this.db.smartCollectionUpdate(this.editingSmartCollection.id, {
        title: data.title,
        rules: rulesJson,
        match_type: data.match_type,
      });
    } else {
      this.db.smartCollectionCreate({
        title: data.title,
        rules: rulesJson,
        match_type: data.match_type,
      });
    }
    this.showRuleBuilder = false;
    this.editingSmartCollection = null;
  }

  onRuleBuilderCancelled() {
    this.showRuleBuilder = false;
    this.editingSmartCollection = null;
  }

  findRootParentId(collection: Collection): number {
    const all = this.db.collections();
    let current = collection;
    while (current.parent_id !== 0) {
      const parent = all.find((c) => c.id === current.parent_id);
      if (!parent) break;
      current = parent;
    }
    return current.id;
  }
}
