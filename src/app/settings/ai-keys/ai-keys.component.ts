import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../core/services';
import { StorageType } from '@main/enums';

interface AiKeys {
  anthropic: string;
  google: string;
  openai: string;
}

@Component({
  selector: 'app-settings-ai-keys',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './ai-keys.component.html',
})
export class SettingsAiKeysComponent implements OnInit {
  private readonly message = inject(MessageService);

  readonly anthropicKey = signal('');
  readonly googleKey = signal('');
  readonly openaiKey = signal('');
  readonly saveStatus = signal<'idle' | 'saved'>('idle');

  async ngOnInit() {
    const keys = (await this.message.get(StorageType.AiKeys, null)) as AiKeys | null;
    if (keys) {
      this.anthropicKey.set(keys.anthropic ?? '');
      this.googleKey.set(keys.google ?? '');
      this.openaiKey.set(keys.openai ?? '');
    }
  }

  async onSave() {
    await this.message.set(StorageType.AiKeys, {
      anthropic: this.anthropicKey(),
      google: this.googleKey(),
      openai: this.openaiKey(),
    });
    this.saveStatus.set('saved');
    setTimeout(() => this.saveStatus.set('idle'), 2000);
  }
}
