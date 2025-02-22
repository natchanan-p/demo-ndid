import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountInfoRoutingModule } from './account-info-routing.module';
import {AccountInfoPageComponent} from './component/account-info-page/account-info-page.component';
import {NzContentComponent, NzFooterComponent, NzHeaderComponent, NzLayoutComponent} from 'ng-zorro-antd/layout';
import {NzAvatarModule} from 'ng-zorro-antd/avatar';
import {NzColDirective, NzRowDirective} from 'ng-zorro-antd/grid';
import {NzListModule} from 'ng-zorro-antd/list';
import {NzTypographyComponent} from 'ng-zorro-antd/typography';
import {NzFormControlComponent, NzFormDirective, NzFormItemComponent} from 'ng-zorro-antd/form';
import {NzInputDirective, NzInputGroupComponent} from 'ng-zorro-antd/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NzButtonComponent, NzButtonModule} from 'ng-zorro-antd/button';
import {NzWaveDirective} from 'ng-zorro-antd/core/wave';



@NgModule({
  declarations: [ AccountInfoPageComponent],
  imports: [
    CommonModule,
    AccountInfoRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NzLayoutComponent,
    NzHeaderComponent,
    NzContentComponent,
    NzFooterComponent,
    NzAvatarModule,
    NzColDirective,
    NzRowDirective,
    NzListModule,
    NzTypographyComponent,
    NzFormControlComponent,
    NzFormItemComponent,
    NzInputDirective,
    NzInputGroupComponent,
    ReactiveFormsModule,
    NzFormDirective,
    NzFormItemComponent,
    NzFormControlComponent,
    NzButtonComponent,
    NzWaveDirective,
  ],
  exports: [AccountInfoPageComponent],
  providers: [],
})
export class AccountInfoModule { }
