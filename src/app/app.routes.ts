import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { UserComponent } from './user/user.component';
import { LoginComponent } from './user/login/login.component';
import { RegistrationComponent } from './user/registration/registration.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { authGuard } from './Shared/auth.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    {
        path: '', component: UserComponent,
        children: [
            {path: 'login', component: LoginComponent},
            {path: 'signup', component: RegistrationComponent }
        ]
    },
    {
        path: 'dashboard', component: AppLayout,
        children: [
            {path: '', component: DashboardComponent, canActivate: [authGuard]}
        ]
    }
];
