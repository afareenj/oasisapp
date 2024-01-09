import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TreasurePage } from './treasure.page';

describe('TreasurePage', () => {
  let component: TreasurePage;
  let fixture: ComponentFixture<TreasurePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasurePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TreasurePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
