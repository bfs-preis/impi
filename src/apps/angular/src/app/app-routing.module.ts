import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HomeComponent} from './home/home.component';

const routes: Routes = [
	{path: '', redirectTo: 'home', pathMatch: 'full'},
	{path: 'home', component: HomeComponent},
	{
		path: 'anonymizer',
		loadChildren: () => import('./anonymizer/anonymizer.module').then(m => m.AnonymizerModule)
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes, {anchorScrolling: 'enabled'})],
	exports: [RouterModule]
})
export class AppRoutingModule {}
