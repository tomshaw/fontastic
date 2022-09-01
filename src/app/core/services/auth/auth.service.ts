import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ConfigService } from '../config/config.service';
import { AuthUser } from '@app/core/interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  _authUser = new BehaviorSubject<AuthUser>(null);
  watchAuthUser$ = this._authUser.asObservable();

  constructor(
    private configService: ConfigService
  ) {
    const user = this.configService.getAuthUser();
    if (user.status === 'ok') {
      this.setAuthUser(user);
    }
  }

  get authUserValue(): AuthUser {
    return this._authUser.value;
  }

  setAuthUser(data: AuthUser): void {
    this._authUser.next(data);
  }

  getAuthUser(): AuthUser {
    return this._authUser.getValue();
  }

  logout(): void {
    this._authUser.next(null);
  }
}
