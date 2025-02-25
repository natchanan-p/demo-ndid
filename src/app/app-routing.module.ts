import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';
import {AuthGuard} from './auth.guard';

const routes: Routes = [
  { path: '',      redirectTo: 'sign-in', pathMatch: 'full' },
  {
    path: 'sign-in',
    loadChildren: () => import('./module/sign-in/sign-in.module').then(m => m.SignInModule)
  },
  {
    path: 'account-info',
    canActivate: [AuthGuard],
    loadChildren: () => import('./module/account-info/account-info.module').then(m => m.AccountInfoModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
