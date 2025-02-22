import {ChangeDetectorRef, Component, NgZone} from '@angular/core';
import { ACCOUNT_INFO } from '../../../../shared/constant/labels.constant'
import { ERROR_MESSAGES } from '../../../../shared/constant/error-message.constant';
import {Router} from '@angular/router';
import {DataService} from '../../../../service/data-service/data-service.service';

@Component({
  selector: 'app-account-info-page',
  templateUrl: './account-info-page.component.html',
  styleUrl: './account-info-page.component.css'
})
export class AccountInfoPageComponent {

  protected readonly ACCOUNT_INFO = ACCOUNT_INFO;
  protected readonly ERROR_MESSAGES = ERROR_MESSAGES;

  username: string = '';
  constructor(
    private dataService: DataService,
    private router: Router,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {
    console.log(this.dataService.get('token'))
    if (this.dataService.get('token') === undefined) {
      this.router.navigate(['sign-in']);
    } else {
      this.username = this.dataService.get('currentUser');
      console.log(this.username);
      // this.cdr.detectChanges();
    }

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('beforeunload', () => this.logout() );
    });
  }

  logout() {
    this.dataService.clear()
    this.router.navigate(['sign-in']);
  }

}
