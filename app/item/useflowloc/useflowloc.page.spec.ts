import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { UseflowlocPage } from './useflowloc.page';

describe('UseflowlocPage', () => {
  let component: UseflowlocPage;
  let fixture: ComponentFixture<UseflowlocPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UseflowlocPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(UseflowlocPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
