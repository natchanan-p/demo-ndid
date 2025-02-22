import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {AccountInfoPageComponent} from './component/account-info-page/account-info-page.component';

const routes: Routes = [
  {path: '', component: AccountInfoPageComponent, }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountInfoRoutingModule { }
