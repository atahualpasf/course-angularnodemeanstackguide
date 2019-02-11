import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
    isLoading = false;
    private authStatusSub: Subscription;

    ngOnInit() {
        this.authStatusSub = this.authService.getAuthStatusListener().subscribe(
            authStatus => {
                this.isLoading = false;
            }
        );
    }

    constructor(public authService: AuthService) {}

    onLogin(form: NgForm) {
        if (form.invalid) {
            return;
        }
        this.isLoading = true;
        this.authService.loginUser(form.value.email, form.value.password);
    }

    ngOnDestroy() {
        this.authStatusSub.unsubscribe();
    }
}