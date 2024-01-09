import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { ForgotidPage } from './forgotid.page';

describe('ForgotidPage', () => {
  let component: ForgotidPage;
  let fixture: ComponentFixture<ForgotidPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotidPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(ForgotidPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
