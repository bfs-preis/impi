import { NgModule } from '@angular/core';
import {
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatDialogModule,
    MatTooltipModule,
    MatCardModule,
    MatSelectModule,
    MatInputModule,
    MatProgressBarModule,
    MatListModule,
    MatChipsModule,
    MatProgressSpinnerModule
} from '@angular/material';

@NgModule({
    imports: [
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule,
        MatCardModule,
        MatSelectModule,
        MatInputModule,
        MatProgressBarModule,
        MatListModule,
        MatChipsModule,
        MatProgressSpinnerModule
    ],
    exports: [
        MatButtonModule,
        MatCheckboxModule,
        MatIconModule,
        MatDialogModule,
        MatTooltipModule,
        MatCardModule,
        MatSelectModule,
        MatInputModule,
        MatProgressBarModule,
        MatListModule,
        MatChipsModule,
        MatProgressSpinnerModule
    ],
})
export class MaterialModule { }
