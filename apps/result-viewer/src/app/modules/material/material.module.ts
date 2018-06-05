
import { NgModule } from '@angular/core';
import {
  MatExpansionModule,
  MatListModule,
  MatButtonModule,
  MatChipsModule,
  MatCardModule,
  MatTabsModule,
  MatGridListModule
} from '@angular/material';

@NgModule({
    imports: [
      MatExpansionModule,
      MatListModule,
      MatButtonModule,
      MatChipsModule,
      MatCardModule,
      MatTabsModule,
      MatGridListModule
    ],
    exports: [
      MatExpansionModule,
      MatListModule,
      MatButtonModule,
      MatChipsModule,
      MatCardModule,
      MatTabsModule,
      MatGridListModule
    ],
})
export class MaterialModule { }
