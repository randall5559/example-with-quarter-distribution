export interface DistributedRatioConfig {
  numberOfQtrs?: number;
  qtrDefaults?: number[];
  remainderStrategy?: 'floor' | 'round' | 'ceil' | 'none';
  qtrValKey?: string;
}