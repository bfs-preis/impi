import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';

// Oblique imports
import {ObAlertModule, ObButtonModule, ObErrorMessagesModule, ObIconModule, ObInputClearModule, ObNotificationModule, ObSpinnerModule} from '@oblique/oblique';

// Angular Material (for dialogs - compatible with Oblique)
import {MatDialogModule} from '@angular/material/dialog';
import {MatSelectModule} from '@angular/material/select';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatTooltipModule} from '@angular/material/tooltip';

// Routing
import {AnonymizerRoutingModule} from './anonymizer-routing.module';

// Components
import {MainComponent} from './components/main/main.component';
import {DbSelectorComponent} from './components/db-selector/db-selector.component';
import {CsvSelectorComponent} from './components/csv-selector/csv-selector.component';
import {OutputSelectorComponent} from './components/output-selector/output-selector.component';
import {FilePickerComponent} from './components/shared/file-picker/file-picker.component';

// Services
import {ProcessingService} from './services/processing.service';

@NgModule({
	imports: [
		CommonModule,
		FormsModule,
		ReactiveFormsModule,
		AnonymizerRoutingModule,
		TranslateModule,
		// Oblique modules
		ObButtonModule,
		ObIconModule,
		ObInputClearModule,
		ObErrorMessagesModule,
		ObNotificationModule,
		ObSpinnerModule,
		ObAlertModule,
		// Material (for dialogs and some form elements)
		MatDialogModule,
		MatSelectModule,
		MatFormFieldModule,
		MatInputModule,
		MatProgressBarModule,
		MatIconModule,
		MatButtonModule,
		MatTooltipModule,
		// Standalone components
		DbSelectorComponent,
		FilePickerComponent,
		CsvSelectorComponent,
		OutputSelectorComponent,
		MainComponent
	],
	providers: [
		ProcessingService
	]
})
export class AnonymizerModule {}
