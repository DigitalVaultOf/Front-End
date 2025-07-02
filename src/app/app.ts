import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
})
export class App {
  protected title = 'Front-End-Net';
  showContent = true;

  constructor(private router: Router) {}

  goTo(path: string) {
    this.showContent = false;
    this.router.navigate([path]);
  }
}
