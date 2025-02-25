import { Component, NgZone} from '@angular/core';
import {Router} from '@angular/router';
import {DataService} from '../../../../service/data-service/data-service.service';

@Component({
  selector: 'app-account-info-page',
  templateUrl: './account-info-page.component.html',
  styleUrl: './account-info-page.component.css'
})
export class AccountInfoPageComponent {

  username: string = '';
  constructor(
    private dataService: DataService,
    private router: Router,
    private ngZone: NgZone,
  ) {
      this.username = this.dataService.get('currentUser');
      console.log(this.username);

    this.ngZone.runOutsideAngular(() => {
      window.addEventListener('beforeunload', () => this.logout() );
    });
  }

  logout() {
    this.dataService.clear()
    this.router.navigate(['sign-in']);
  }

}
