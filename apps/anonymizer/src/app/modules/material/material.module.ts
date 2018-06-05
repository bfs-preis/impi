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
    MatListModule
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
        MatListModule
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
        MatListModule
    ],
})
export class MaterialModule { }
