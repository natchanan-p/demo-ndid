import {RouterModule, Routes} from '@angular/router';
import {NgModule} from '@angular/core';

const routes: Routes = [
  // { path: '', component: HomeComponent },
  {
    path: 'sign-in',
    loadChildren: () => import('./module/sign-in/sign-in.module').then(m => m.SignInModule)},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
