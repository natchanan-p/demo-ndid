import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SignInRoutingModule } from './sign-in-routing.module';
import {SignInPageComponent} from "./component/sign-in-page/sign-in-page.component";
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NzContentComponent, NzFooterComponent, NzHeaderComponent, NzLayoutComponent} from 'ng-zorro-antd/layout';
import {NzBreadCrumbComponent, NzBreadCrumbItemComponent} from 'ng-zorro-antd/breadcrumb';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent, NzFormModule} from 'ng-zorro-antd/form';
import {NzInputDirective, NzInputGroupComponent, NzInputModule} from 'ng-zorro-antd/input';
import {NzButtonModule} from 'ng-zorro-antd/button';
import {NzCheckboxModule} from 'ng-zorro-antd/checkbox';
import { NzIconModule } from 'ng-zorro-antd/icon';
import {NzModalModule} from 'ng-zorro-antd/modal';
import {NzSpinComponent} from 'ng-zorro-antd/spin';
import {NzAlertComponent} from 'ng-zorro-antd/alert';


@NgModule({
  declarations: [ SignInPageComponent],
  imports: [
    CommonModule,
    SignInRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NzLayoutComponent,
    NzHeaderComponent,
    NzContentComponent,
    NzBreadCrumbComponent,
    NzBreadCrumbItemComponent,
    NzFooterComponent,
    NzFormDirective,
    NzFormItemComponent,
    NzFormControlComponent,
    NzInputGroupComponent,
    NzInputDirective,
    NzButtonModule,
    NzCheckboxModule,
    NzFormModule,
    NzInputModule,
    NzIconModule,
    NzModalModule,
    NzSpinComponent,
    NzAlertComponent
  ],
  exports: [ SignInPageComponent],
  providers: [],
})

export class SignInModule { }
