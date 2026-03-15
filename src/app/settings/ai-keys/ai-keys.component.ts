import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from '../../core/services';

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
    const [anthropic, google, openai] = await Promise.all([
      this.message.safeRetrieve('secure.ai.anthropic'),
      this.message.safeRetrieve('secure.ai.google'),
      this.message.safeRetrieve('secure.ai.openai'),
    ]);
    if (anthropic) this.anthropicKey.set(anthropic);
    if (google) this.googleKey.set(google);
    if (openai) this.openaiKey.set(openai);
  }

  async onSave() {
    await Promise.all([
      this.message.safeStore('secure.ai.anthropic', this.anthropicKey()),
      this.message.safeStore('secure.ai.google', this.googleKey()),
      this.message.safeStore('secure.ai.openai', this.openaiKey()),
    ]);
    this.saveStatus.set('saved');
    setTimeout(() => this.saveStatus.set('idle'), 2000);
  }
}
