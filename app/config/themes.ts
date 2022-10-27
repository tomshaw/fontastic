export const AppThemes: any[] = [{
  key: 'default',
  title: 'Default Theme',
  description: 'The default system theme.',
}, {
  key: 'dashboard',
  title: 'Dashboard',
  description: 'A modern Dashboard inspired system theme.',
}, {
  key: 'euphoria',
  title: 'Eurphoria',
  description: 'Eurphoria system theme.',
}, {
  key: 'midnight',
  title: 'Midnight',
  description: 'A pure black dark mode theme.',
}, {
  key: 'mellow',
  title: 'Yellow Mellow',
  description: 'A Modern Yellow inspired system theme.',
}, {
  key: 'swiss',
  title: 'Swiss Design',
  description: 'A Swiss Design inspired system theme.',
}, {
  key: 'passion',
  title: 'Purple Passion',
  description: 'Purple Passion system theme.',
}];

export const ThemeColors = new Map();
ThemeColors.set('midnight', { color: '#ffffff', background: '#000000' });
ThemeColors.set('euphoria', { color: '#f4b903', background: '#23121c' });
ThemeColors.set('dashboard', { color: '#ffffff', background: '#14202a' });
ThemeColors.set('mellow', { color: '#252525', background: '#ffdf00' });
ThemeColors.set('swiss', { color: '#ffffff', background: '#ed1b24' });
ThemeColors.set('passion', { color: '#ffffff', background: '#620f72' });
ThemeColors.set('default', { color: '#3e4245', background: '#ffffff' });
