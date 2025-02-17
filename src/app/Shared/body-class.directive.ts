import { Directive, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';

@Directive({
  selector: '[appBodyClass]'
})
export class BodyClassDirective implements OnInit, OnDestroy {

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.router.events.subscribe(() => {
      const isLogin = this.router.url === '/';
      document.body.classList.toggle('login-mode', isLogin);
      document.body.classList.toggle('app-mode', !isLogin);
    });
  }

  ngOnDestroy(): void {
    document.body.classList.remove('login-mode', 'app-mode');
  }
}

