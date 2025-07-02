import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.scss'],
})
export class Home {
  protected title = 'Front-End-Net';
  showContent = true;

  constructor(private router: Router) {}

  goTo(path: string) {
    this.showContent = false;
    this.router.navigate(["/home/",path]);
  }
}
