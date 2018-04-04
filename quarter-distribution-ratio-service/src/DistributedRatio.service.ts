import { DistributedRatioConfig } from './DistributedRatioConfig.interface';


/**
 * A Class/Service to standradize the distribution of a total value across quarters
 * 
 * @export
 * @class DistributedRatio
 */
export class DistributedRatio {

  /**
   * Creates an instance of DistributedRatio.
   * 
   * @param {DistributedRatioConfig} [config] 
   * 
   * @memberOf DistributedRatio
   */
  constructor(
    private config?: DistributedRatioConfig
  ) {
    this.config = Object.assign({}, <DistributedRatioConfig>{
      numberOfQtrs: 4,
      qtrDefaults: null,
      qtrValKey: 'value',
      remainderStrategy: 'floor'
    }, this.config);
    
    // we should determine the default quarter ratios from the number of quarters supplied
    // when the user hasn;t supplied the default ratios
    if (this.config.qtrDefaults === null) {
      this.config.qtrDefaults = Array.apply(null, Array(this.config.numberOfQtrs)).map(qtr => (1/this.config.numberOfQtrs));
    }
    // if the user has a mismatch with the number of quarters and the supplied default ratios, we should let them know
    if (this.config.numberOfQtrs !== this.config.qtrDefaults.length) {
      throw new Error('DistributedRatio Service -> The default ratios defined do not match the number of quarters defined.');
    }
  }




  /***************************************************************************************************
   * 
   * PUBLIC METHODS
   * 
   ***************************************************************************************************/


  /**
   * Method to be used with Array.map()
   *
   * Takes the new total value and returns a function to use with the map() method.
   * It's important to note that it generates the ratio values from the current total
   * not the new total.
   *
   * @param {number} total - the new total value
   *
   * @returns {(qtr: Object, index: number, allQtrs: Object[]) => Object} - callback for map method
   *
   * @memberOf DistributedRatio
   */
  public mapQuarterValuesFromTotalValue(total: number): (qtr: Object, index: number, allQtrs: Object[]) => Object {
    let useDefaults = null;
    return (qtr: Object, index: number, allQtrs: Object[]): Object => {
      if (useDefaults === null) { useDefaults = this.useDefaults(allQtrs); } 
      return Object.assign({}, qtr, {
        [this.config.qtrValKey]: this.remainderHandler(total * getRatio.call(this, qtr, index, allQtrs, useDefaults)) 
      });
    }


    /**
     * Get Ratio value
     * 
     * @param {Object} qtr 
     * @param {number} index 
     * @param {Object[]} allQtrs 
     * @param {boolean} isUsingDefaults 
     * @returns 
     */
    function getRatio(qtr: Object, index: number, allQtrs: Object[], isUsingDefaults: boolean) {
      if (isUsingDefaults) {
        return this.config.qtrDefaults[index];
      } else {
        return this.calculateRatio(
          this.calculateTotal(allQtrs),
          qtr[this.config.qtrValKey]
        );
      }
    }

  }


  /**
   * Map the remainder values to the new values
   * 
   * @param {number} total - the new total
   * @returns {(qtr: Object, index: number, allQtrs: Object[]) => Object} 
   * 
   * @memberOf DistributedRatio
   */
  public mapRemainderToQuarters(total: number): (qtr: Object, index: number, allQtrs: Object[]) => Object {
    let remainders = null;
    let remainder = null
    return (qtr: Object, index: number, allQtrs: Object[]) => {
      // set these once per instance
      if (remainder === null) { remainder = total - this.calculateTotal(allQtrs); }
      if (remainders === null) { remainders = splitRemainder.call(this, remainder, allQtrs.slice(0)); }


      // return the new values
      return Object.assign({}, qtr, {
        [this.config.qtrValKey]: qtr[this.config.qtrValKey] + remainders[index]
      });
    }


    /**
     * Create an array of remainder values to mirror the quarters collection
     * 
     * @param {number} remainder - the difference between the new total and the sum of the quarters
     * @param {Object[]} allQtrs - the quarter collection
     * 
     * @returns {number[]} 
     */
    
    function splitRemainder(remainder: number, allQtrs: Object[]): number[] {

      // quarters with values, aka active quarters
      const qtrsWithValues = allQtrs.filter(_qtr => _qtr[this.config.qtrValKey] > 0).length;

      // create a collection of remainder values based on the remainder pased in
      const remainders = Array.apply(null, Array(Math.abs(remainder))).map(() => remainder < 0 ? -1 : 1);

      // we could have a situation where there is a spare remainder when we can't apply evenly
      // we'll want this to be applied to the first active quarter
      let extraRemainder = remainder > qtrsWithValues ? qtrsWithValues % remainder : 0;
      
      // return the collection of remainder, based on the remainder being negative or positive
      let output;
      if (remainder < 0) {
        // when the remainder is negative, we should apply them from the bottom up
        output = allQtrs.slice(0).reverse().map(applyRemainders.bind(this)).reverse();
      } else {
        // when the remainder is >= 0, then we add them from the top down 
        output = allQtrs.slice(0).map(applyRemainders.bind(this));
      }
      return output;


      /**
       * Apply the remainder values
       * 
       * @param {Object} _qtr 
       * @param {number} _index 
       * @returns 
       */
      function applyRemainders(_qtr: Object, _index: number) {
        // don't bother, return 0 and move on
        if (remainders.length === 0 || _qtr[this.config.qtrValKey] < 1 ) {
          return 0;
        }

        // if the qtr has a value greater than 0
        // if the remainders collection has anything to give
        let output = remainders.shift() + extraRemainder;
        extraRemainder = 0; // once you apply it, wipe it to zero
        return output;
      }

    }
    
  }

  


  /***************************************************************************************************
   * 
   * PRIVATE METHODS
   * 
   ***************************************************************************************************/


  /**
   * Determines if we should be using the defaults defined on the constructor
   * The logic here checks to see if all the values are 0, if true then we use the defaults
   *
   * @private
   * @param {Object[]} qtrs
   * @returns
   *
   * @memberOf DistributedRatio
   */
  private useDefaults(qtrs: Object[]) {
    return !qtrs.some(qtr => qtr[this.config.qtrValKey] > 0);
  }


  /**
   * Calculate the total from an array of quarter objects
   *
   * @private
   * @param {Object[]} allQtrs
   * @returns
   *
   * @memberOf DistributedRatio
   */
  private calculateTotal(allQtrs: Object[]) {
    return allQtrs
      .reduce((total: number, qtr: Object) => {
        const _qtr = Object.assign({}, qtr);
        return total + _qtr[this.config.qtrValKey];
      }, 0);
  }


  /**
   * Determines the ratio value
   *
   * This is a safe method — it should stop a divide by user or divide by undefined value etc
   * and return a 0 if that happens
   *
   * @private
   * @param {number} total
   * @param {number} part
   * @returns
   *
   * @memberOf DistributedRatio
   */
  private calculateRatio(total: number, part: number) {
    if (Number.isNaN(Number(total)) || total === null || total === 0) {
      return 0;
    }
    if (Number.isNaN(Number(part)) || part === null) {
      return 0;
    }
    return part / total;
  }


  /**
   * The method for handling remainders
   * 
   * @private
   * @param {number} value 
   * @returns 
   * 
   * @memberOf DistributedRatio
   */
  private remainderHandler(value: number) {
    switch (this.config.remainderStrategy) {
      case 'floor': 
        return Math.floor(value);
      case 'ceil': 
        return Math.ceil(value);
      case 'round': 
        return Math.round(value);
      case 'none': 
        return value;
    }
  }

}