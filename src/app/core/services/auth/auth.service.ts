import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthUser } from '@main/types';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  _authUser = new BehaviorSubject<AuthUser>(null);
  watchAuthUser$ = this._authUser.asObservable();

  constructor() { }

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
