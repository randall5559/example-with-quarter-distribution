import { TestBed, async, ComponentFixture } from '@angular/core/testing';

import { DistributedRatioFactory, DistributedRatioServiceToken } from './services/example-quarter-ratio.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let component: AppComponent;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        AppComponent
      ],
      providers: [
        { provide: DistributedRatioServiceToken, useFactory: DistributedRatioFactory }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should call LifeCycle Hook - OnInit() ', () => {
    expect(component.totalValues).toEqual(100);
  });

  it('should handle total quarter changes - onTotalQuarter()', () => {
    component.onTotalChange({
      currentTarget: {
        id: 'total',
        value: 140
      }
    });

    expect(component.someFakeValues).toEqual([
      { value: 14 },
      { value: 28 },
      { value: 28 },
      { value: 28 },
      { value: 28 },
      { value: 14 }
    ]);
  });
});
