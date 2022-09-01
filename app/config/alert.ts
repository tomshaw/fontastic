export const AlertTimeout = 5e3;

export const AlertProps = {
  type: '',
  message: '',
  icon: '',
  class: '',
  keep: false,
  timeout: 10e3
}

export const AlertTypes: any[] = [{
  type: 'info',
  icon: 'check_circle',
  class: 'app-alert-info',
}, {
  type: 'success',
  icon: 'done',
  class: 'app-alert-success',
}, {
  type: 'error',
  icon: 'error',
  class: 'app-alert-error',
}, {
  type: 'warning',
  icon: 'warning',
  class: 'app-alert-warning',
}, {
  type: 'danger',
  icon: 'error_outline',
  class: 'app-alert-danger',
}];