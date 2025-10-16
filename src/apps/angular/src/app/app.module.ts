import {LOCALE_ID, NgModule} from '@angular/core';
import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {OB_BANNER, ObButtonModule, ObExternalLinkModule, ObHttpApiInterceptor, ObMasterLayoutModule, provideObliqueConfiguration} from '@oblique/oblique';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {registerLocaleData} from '@angular/common';
import localeDECH from '@angular/common/locales/de-CH';
import localeFRCH from '@angular/common/locales/fr-CH';
import localeITCH from '@angular/common/locales/it-CH';
import {TranslateModule} from '@ngx-translate/core';
import {HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi} from '@angular/common/http';
import {environment} from '../environments/environment';
import {HomeComponent} from './home/home.component';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';

registerLocaleData(localeDECH);
registerLocaleData(localeFRCH);
registerLocaleData(localeITCH);

@NgModule({
	declarations: [AppComponent, HomeComponent],
	imports: [
		AppRoutingModule,
		ObMasterLayoutModule,
		BrowserAnimationsModule,
		ObButtonModule,
		TranslateModule,
		MatButtonModule,
		MatCardModule,
		MatIconModule,
		ObExternalLinkModule
	],
	providers: [
		{provide: LOCALE_ID, useValue: 'de-CH'},
		provideObliqueConfiguration({
			accessibilityStatement: {
				createdOn: new Date('2025-10-15'),
				applicationName: 'anonymizer.Main.Title',
				conformity: 'none',
				applicationOperator: 'Replace me with the name and address of the federal office that exploit this application, HTML is permitted',
				contact: [{email: ''}, {phone: ''}]
			},
			icon: {registerObliqueIcons: true}
		}),
		{provide: HTTP_INTERCEPTORS, useClass: ObHttpApiInterceptor, multi: true},
		provideHttpClient(withInterceptorsFromDi()),
		{provide: OB_BANNER, useValue: environment.banner}
	],
	bootstrap: [AppComponent]
})
export class AppModule {}
