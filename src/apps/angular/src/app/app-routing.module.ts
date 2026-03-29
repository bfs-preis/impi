import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';

const routes: Routes = [
	{path: '', redirectTo: 'anonymizer', pathMatch: 'full'},
	{
		path: 'anonymizer',
		loadChildren: () => import('./anonymizer/anonymizer.module').then(m => m.AnonymizerModule)
	},
	{
		path: 'result-viewer',
		loadChildren: () => import('./result-viewer/result-viewer.module').then(m => m.ResultViewerModule)
	}
];

@NgModule({
	imports: [RouterModule.forRoot(routes, {useHash: true, anchorScrolling: 'enabled'})],
	exports: [RouterModule]
})
export class AppRoutingModule {}
