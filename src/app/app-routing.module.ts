import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

const routes: Routes = [
  { path: '',      loadChildren: () => import('./module/sign-in/sign-in.module').then(m => m.SignInModule)},
  {
    path: 'sign-in',
    loadChildren: () => import('./module/sign-in/sign-in.module').then(m => m.SignInModule)
  },
  {
    path: 'account-info',
    loadChildren: () => import('./module/account-info/account-info.module').then(m => m.AccountInfoModule)
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
