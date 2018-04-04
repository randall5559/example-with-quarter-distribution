import { InjectionToken } from '@angular/core';
import { DistributedRatio, DistributedRatioConfig } from '../../../../quarter-distribution-ratio-service/src';

// export the quarter distribution package
export * from '../../../../quarter-distribution-ratio-service/src';

// export the token
export const DistributedRatioServiceToken = new InjectionToken<string>('DistributedRatioService');

// export the factory
export function DistributedRatioFactory() {
  return new DistributedRatio(<DistributedRatioConfig>{
    numberOfQtrs: 6,
    qtrDefaults: [.10, .20, .20, .20, .20, .10],
    qtrValKey: 'value',
    remainderStrategy: 'floor'
  });
}
