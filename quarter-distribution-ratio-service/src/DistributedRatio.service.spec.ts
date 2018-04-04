import { DistributedRatio } from './DistributedRatio.service';

describe(`DistributedRatio Class/Service`, () => {

  let qtrs = [], service: DistributedRatio, value;

  beforeEach(() => {
    qtrs = null;
    service = null;
    value = null;
  });


  describe(`constructor`, () => {

    it(`uses a default configuration: .25 ratio for 4 quarters and the quarter "value" property is "value"`, () => {
      qtrs = [{value: 0, fake: 99},{value: 0, fake: 67},{value: 0, fake: 33},{value: 0, fake: 28}];
      value = 240;
      service = new DistributedRatio();

      let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
      expect(newQtrs).toEqual([
        {value: 60, fake: 99},
        {value: 60, fake: 67},
        {value: 60, fake: 33},
        {value: 60, fake: 28}
      ]);
    });

    it(`allows you to specify a custom number of quarters`, () => {
      qtrs = [{value: 0},{value: 0},{value: 0},{value: 0},{value: 0},{value: 0},{value: 0}];
      value = 240;
      service = new DistributedRatio({
        numberOfQtrs: 7
      });

      let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
      expect(newQtrs).toEqual([
        {value: 34},
        {value: 34},
        {value: 34},
        {value: 34},
        {value: 34},
        {value: 34},
        {value: 34}
      ]);
    });

    it(`allows you to specify a custom number of quarters and with custom ratios`, () => {
      qtrs = [{value: 0},{value: 0},{value: 0},{value: 0},{value: 0},{value: 0}];
      value = 240;
      service = new DistributedRatio({
        numberOfQtrs: 6,
        qtrDefaults: [0, .25, .25, .25, .25, 0]
      });

      let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
      expect(newQtrs).toEqual([
        {value: 0},
        {value: 60},
        {value: 60},
        {value: 60},
        {value: 60},
        {value: 0}
      ]);
    });

    it(`allows you to specify a custom property name for your quarter objects`, () => {
      qtrs = [{value: 0, _fake: 0},{value: 0, _fake: 0},{value: 0, _fake: 0},{value: 0, _fake: 0}];
      value = 240;
      service = new DistributedRatio({
        qtrValKey: '_fake'
      });

      let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
      expect(newQtrs).toEqual([
        {value: 0, _fake: 60},
        {value: 0, _fake: 60},
        {value: 0, _fake: 60},
        {value: 0, _fake: 60},
      ]);
    });

    it('throws an error when there is a mismatch between quarters and default ratios', () => {
      expect(function() { 
        new DistributedRatio({
          qtrValKey: '_fake',
          numberOfQtrs: 4,
          qtrDefaults: [.1, .1, .1, .1, .5]
        });
      })
        .toThrowError('DistributedRatio Service -> The default ratios defined do not match the number of quarters defined.');
      
    });

  });


  describe(`#mapQuarterValuesFromTotalValue`, () => {

    describe(`simple, evenly distributed values`, () => {

      it(`splits the total across all quarters using the default ratios and default quarters`,  () => {
        qtrs = [{value: 0},{value: 0},{value: 0},{value: 0}];
        value = 240;
        service = new DistributedRatio();

        let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(newQtrs).toEqual([
          {value: 60},
          {value: 60},
          {value: 60},
          {value: 60}
        ]);
      });

      it(`splits the total across all quarters with existing values`, () => {
        qtrs = [{value: 1},{value: 1},{value: 1},{value: 1}];
        value = 100;
        service = new DistributedRatio();

        let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(newQtrs).toEqual([
          {value: 25},
          {value: 25},
          {value: 25},
          {value: 25}
        ]);
      });

      it(`splits the total across 2 quarters with existing values`, () => {
        qtrs = [{value: 1},{value: 0},{value: 1},{value: 0}];
        value = 60;
        service = new DistributedRatio();

        let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(newQtrs).toEqual([
          {value: 30},
          {value: 0},
          {value: 30},
          {value: 0}
        ]);
      });

      it(`applies the value to a single quarter`, () => {
        qtrs = [{value: 1},{value: 0},{value: 0},{value: 0}];
        value = 105;
        service = new DistributedRatio();

        let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(newQtrs).toEqual([
          {value: 105},
          {value: 0},
          {value: 0},
          {value: 0}
        ]);
      });

      it(`uses the default ratio values when the values are all zero`, () => {
        qtrs = [{value: 0},{value: 0},{value: 0},{value: 0}];
        value = 104;
        service = new DistributedRatio();

        let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(newQtrs).toEqual([
          {value: 26},
          {value: 26},
          {value: 26},
          {value: 26}
        ]);
      });

    });


    describe(`remainder strategy`, () => {

      it(`floors the values for each quarter (default strategy)`, () => {
        qtrs = [{value: 1},{value: 1},{value: 1},{value: 1}];
        value = 103;
        service = new DistributedRatio();

        let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(newQtrs).toEqual([
          {value: 25},
          {value: 25},
          {value: 25},
          {value: 25}
        ]);
      });
      
      it(`floors the values for each quarter (explicitly defined)`, () => {
        qtrs = [{value: 1},{value: 1},{value: 1},{value: 1}];
        value = 103;
        service = new DistributedRatio({remainderStrategy: 'floor'});

        let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(newQtrs).toEqual([
          {value: 25},
          {value: 25},
          {value: 25},
          {value: 25}
        ]);
      });
      
      it(`rounds the values for each quarter`, () => {
        qtrs = [{value: 1},{value: 1},{value: 1},{value: 1}];
        value = 105;
        service = new DistributedRatio({remainderStrategy: 'round'});

        let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(newQtrs).toEqual([
          {value: 26},
          {value: 26},
          {value: 26},
          {value: 26}
        ]);
      });
      
      it(`ceil the values for each quarter`, () => {
        qtrs = [{value: 34},{value: 132},{value: 11},{value: 91}];
        value = 435;
        service = new DistributedRatio({remainderStrategy: 'ceil'});

        let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(newQtrs).toEqual([
          {value: 56},
          {value: 215},
          {value: 18},
          {value: 148}
        ]);
      });

      it(`apply no rounding for each quarter`, () => {
        qtrs = [{value: 1},{value: 1},{value: 1},{value: 1}];
        value = 106;
        service = new DistributedRatio({remainderStrategy: 'none'});

        let newQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(newQtrs).toEqual([
          {value: 26.5},
          {value: 26.5},
          {value: 26.5},
          {value: 26.5}
        ]);
      });

    });

    it('sets all quarters to 0', () => {
      qtrs = [{value: 34},{value: 132},{value: 11},{value: 91}];
      value = 0;
      service = new DistributedRatio();

      let newQtrs = qtrs
        .map(service.mapQuarterValuesFromTotalValue(value));

      expect(newQtrs).toEqual([
        {value: 0},
        {value: 0},
        {value: 0},
        {value: 0}
      ]);
      expect(newQtrs.reduce((acc: number, qtr: any) => acc + qtr.value, 0)).toEqual(value);
    });

  });


  describe(`#mapRemainderToQuarters`, () => {

    it('does not mutate the oirginal collection', () => {
      qtrs = [{value: 0},{value: 0},{value: 0},{value: 0}];
      value = 242;
      service = new DistributedRatio();

      let newQtrs = qtrs
        .map(service.mapQuarterValuesFromTotalValue(value))
        .map(service.mapRemainderToQuarters(value));

      expect(newQtrs).toEqual([
        {value: 61},
        {value: 61},
        {value: 60},
        {value: 60}
      ]);
      expect(newQtrs.reduce((acc: number, qtr: any) => acc + qtr.value, 0)).toEqual(value);
      expect(qtrs).toEqual([{value: 0},{value: 0},{value: 0},{value: 0}]);
    });

    it(`distributes the remainder value (simple)`, () => {
      qtrs = [{value: 0},{value: 0},{value: 0},{value: 0}];
      value = 242;
      service = new DistributedRatio();

      let newQtrs = qtrs
        .map(service.mapQuarterValuesFromTotalValue(value))
        .map(service.mapRemainderToQuarters(value));

      expect(newQtrs).toEqual([
        {value: 61},
        {value: 61},
        {value: 60},
        {value: 60}
      ]);
      expect(newQtrs.reduce((acc: number, qtr: any) => acc + qtr.value, 0)).toEqual(value);
    });

    it(`distributes the remainder value across an odd number of active quarters`, () => {
      qtrs = [{value: 1},{value: 0},{value: 1},{value: 1}];
      value = 938;
      service = new DistributedRatio();

      let newQtrs = qtrs
        .map(service.mapQuarterValuesFromTotalValue(value))
        .map(service.mapRemainderToQuarters(value));

      expect(newQtrs).toEqual([
        {value: 313},
        {value: 0},
        {value: 313},
        {value: 312}
      ]);
      expect(newQtrs.reduce((acc: number, qtr: any) => acc + qtr.value, 0)).toEqual(value);
    });

    it(`complex case: custom property name, 7 quarters, some quarters are 0`, () => {
      qtrs = [{fake: 1},{fake: 0},{fake: 1},{fake: 1},{fake: 1},{fake: 0},{fake: 1}];
      value = 938;
      service = new DistributedRatio({
        numberOfQtrs: 7,
        qtrValKey: 'fake'
      });

      let newQtrs = qtrs
        .map(service.mapQuarterValuesFromTotalValue(value))
        .map(service.mapRemainderToQuarters(value));

      expect(newQtrs).toEqual([
        {fake: 188},
        {fake: 0},
        {fake: 188},
        {fake: 188},
        {fake: 187},
        {fake: 0},
        {fake: 187}
      ]);
      expect(newQtrs.reduce((acc: number, qtr: any) => acc + qtr.fake, 0)).toEqual(value);
    });

    it('sets all quarters to 0', () => {
      qtrs = [{value: 34},{value: 132},{value: 11},{value: 91}];
      value = 0;
      service = new DistributedRatio();

      let newQtrs = qtrs
        .map(service.mapQuarterValuesFromTotalValue(value))
        .map(service.mapRemainderToQuarters(value));

      expect(newQtrs).toEqual([
        {value: 0},
        {value: 0},
        {value: 0},
        {value: 0}
      ]);
      expect(newQtrs.reduce((acc: number, qtr: any) => acc + qtr.value, 0)).toEqual(value);
    });

    describe('using different remainderStrategies', () => {

      it(`using Math.ceil() with remainder logic`, () => {
        qtrs = [{value: 34},{value: 132},{value: 11},{value: 91}];
        value = 435;

        service = new DistributedRatio({remainderStrategy: 'none'});
        let rawQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(rawQtrs).toEqual([
          {value: 55.18656716417911},
          {value: 214.25373134328356},
          {value: 17.8544776119403},
          {value: 147.705223880597}
        ]);

        /** the values before applying the remainder logic */
        service = new DistributedRatio({remainderStrategy: 'ceil'});
        let preRemainderQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(preRemainderQtrs).toEqual([
          {value: 56},
          {value: 215},
          {value: 18},
          {value: 148}
        ]);
        expect(preRemainderQtrs.reduce((acc: number, qtr: any) => acc + qtr.value, 0)).toEqual(value + 2);

        /** the values after applying the remainder logic */
        let newQtrs = preRemainderQtrs.map(service.mapRemainderToQuarters(value));
        expect(newQtrs).toEqual([
          {value: 56},  // -0
          {value: 215}, // -0
          {value: 17},  // -1
          {value: 147}  // -1
        ]);
        expect(newQtrs.reduce((acc: number, qtr: any) => acc + qtr.value, 0)).toEqual(value);
      });

      it(`using Math.floor() with remainder logic`, () => {
        qtrs = [{value: 34},{value: 132},{value: 11},{value: 91}];
        value = 435;

        service = new DistributedRatio({remainderStrategy: 'none'});
        let rawQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(rawQtrs).toEqual([
          {value: 55.18656716417911},
          {value: 214.25373134328356},
          {value: 17.8544776119403},
          {value: 147.705223880597}
        ]);

        // /** the values before applying the remainder logic */
        service = new DistributedRatio({remainderStrategy: 'floor'});
        let preRemainderQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(preRemainderQtrs).toEqual([
          {value: 55},
          {value: 214},
          {value: 17},
          {value: 147}
        ]);
        expect(preRemainderQtrs.reduce((acc: number, qtr: any) => acc + qtr.value, 0)).toEqual(value - 2);

        // /** the values after applying the remainder logic */
        let newQtrs = preRemainderQtrs.map(service.mapRemainderToQuarters(value));
        expect(newQtrs).toEqual([
          {value: 56},  // +1
          {value: 215}, // +1
          {value: 17},  // +0
          {value: 147}  // +0
        ]);
        expect(newQtrs.reduce((acc: number, qtr: any) => acc + qtr.value, 0)).toEqual(value);
      });

      it(`using Math.round() with remainder logic`, () => {
        qtrs = [{value: 32.4},{value: 132},{value: 11},{value: 91}];
        value = 435;

        service = new DistributedRatio({remainderStrategy: 'none'});
        let rawQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(rawQtrs).toEqual([
          {value: 52.90540540540541},
          {value: 215.54054054054055},
          {value: 17.961711711711715},
          {value: 148.59234234234236}
        ]);

        /** the values before applying the remainder logic */
        service = new DistributedRatio({remainderStrategy: 'round'});
        let preRemainderQtrs = qtrs.map(service.mapQuarterValuesFromTotalValue(value));
        expect(preRemainderQtrs).toEqual([
          {value: 53},
          {value: 216},
          {value: 18},
          {value: 149}
        ]);
        expect(preRemainderQtrs.reduce((acc: number, qtr: any) => acc + qtr.value, 0)).toEqual(value + 1);

        /** the values after applying the remainder logic */
        let newQtrs = preRemainderQtrs.map(service.mapRemainderToQuarters(value));
        expect(newQtrs).toEqual([
          {value: 53},  // -0
          {value: 216}, // -0
          {value: 18},  // -0
          {value: 148}  // -1
        ]);
        expect(newQtrs.reduce((acc: number, qtr: any) => acc + qtr.value, 0)).toEqual(value);
      });

    });

  });
  
});