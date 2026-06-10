import {LOCALE_ID, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {OB_BANNER, ObButtonModule, ObExternalLinkModule, ObHttpApiInterceptor, ObMasterLayoutConfig, ObMasterLayoutModule, provideObliqueConfiguration} from '@oblique/oblique';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule} from '@angular/forms';
import {registerLocaleData} from '@angular/common';
import localeDECH from '@angular/common/locales/de-CH';
import localeFRCH from '@angular/common/locales/fr-CH';
import localeITCH from '@angular/common/locales/it-CH';
import {TranslateModule} from '@ngx-translate/core';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {environment} from '../environments/environment';
import {ElectronService} from './anonymizer/services/electron.service';
import {ElectronMockService} from './anonymizer/services/electron-mock.service';
import {ElectronIpcService} from './anonymizer/services/electron-ipc.service';
import {SettingsDialogComponent} from './anonymizer/dialogs/settings/settings.component';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatDialogModule} from '@angular/material/dialog';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';

registerLocaleData(localeDECH);
registerLocaleData(localeFRCH);
registerLocaleData(localeITCH);

@NgModule({
	declarations: [AppComponent, SettingsDialogComponent],
	imports: [
		AppRoutingModule,
		ObMasterLayoutModule,
		BrowserAnimationsModule,
		ObButtonModule,
		FormsModule,
		TranslateModule,
		MatButtonModule,
		MatCardModule,
		MatDialogModule,
		MatFormFieldModule,
		MatIconModule,
		MatInputModule,
		MatSelectModule,
		ObExternalLinkModule
	],
	providers: [
		{provide: LOCALE_ID, useValue: 'de-CH'},
		provideObliqueConfiguration({
			accessibilityStatement: undefined as any,
			icon: {registerObliqueIcons: true}
		}),
		{provide: HTTP_INTERCEPTORS, useClass: ObHttpApiInterceptor, multi: true},
		provideHttpClient(withInterceptorsFromDi()),
		{provide: OB_BANNER, useValue: environment.banner},
		{
			provide: ElectronService,
			useClass: typeof window !== 'undefined' && (window as any).electron
				? ElectronIpcService
				: ElectronMockService
		},
		{
			provide: ObMasterLayoutConfig,
			useFactory: () => {
				const config = new ObMasterLayoutConfig();
				config.locale.disabled = false;
				config.locale.locales = ['de-CH', 'fr-CH', 'it-CH', 'en'];
				config.layout.hasMainNavigation = true;
				config.showAccessibilityTitle = false;
				config.homePageRoute = '/anonymizer';
				return config;
			}
		}
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
