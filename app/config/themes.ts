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
  title: 'Mellow Yellow',
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

export const ThemeColors = new Map(); // #00a0be/#3e4245
ThemeColors.set('default', { color: '#3e4245', background: '#ffffff', border: '#808080', fill: '#808080', stroke: '#000000' });
ThemeColors.set('dashboard', { color: '#ffffff', background: '#14202b', border: '#0e161f', fill: '#637785', stroke: '#ffffff' });
ThemeColors.set('euphoria', { color: '#deb431', background: '#23121c', border: '#3a1f32', fill: '#c10156', stroke: '#deb431' });
ThemeColors.set('mellow', { color: '#252525', background: '#ffdf00', border: '#252525', fill: '#3e4245', stroke: '#252525' });
ThemeColors.set('midnight', { color: '#ffffff', background: '#000000', border: '#ffffff', fill: '#777777', stroke: '#ffffff' });
ThemeColors.set('passion', { color: '#ffffff', background: '#620f72', border: '#fe1963', fill: '#ffffff', stroke: '#fe1963' });
ThemeColors.set('swiss', { color: '#ffffff', background: '#ed1b24', border: '#ffcccc', fill: '#3e4245', stroke: '#ffffff' });
