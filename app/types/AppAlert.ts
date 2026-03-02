export interface AppAlert {
  type: string;
  message: string;
  icon: string;
  class: string;
  keep: boolean;
  timeout: number;
}
