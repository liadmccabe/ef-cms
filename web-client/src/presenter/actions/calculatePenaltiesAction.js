import { state } from 'cerebral';

/**
 * Calculates penalties from the current calculate penalties modal
 *
 * @param {object} providers the providers object
 * @param {object} providers.get the cerebral get function to retrieve state values
 * @returns {number} total computed value from penalty values
 */
export const calculatePenaltiesAction = ({ get }) => {
  let { penalties, subkey: penaltyAmountType } = get(state.modal);

  penalties = penalties.filter(penality => penality.name);

  const parseCurrency = value => Number(value).toFixed(2);

  const penaltyAggregator = (sum, penalty) =>
    Number(sum) + Number(penalty[penaltyAmountType]);

  const total = parseCurrency(penalties.reduce(penaltyAggregator, 0));

  return {
    penalties,
    totalPenalties: total,
  };
};
