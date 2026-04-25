/**
 * Forward-simulate savings from currentAge to 80.
 * Correctly handles sequential capital drawdowns —
 * each milestone reduces the compounding base for all future years.
 *
 * @returns Array of { age, balance, milestones, shortfall }
 */
export function simulateProjection({
  currentAge,
  netWorth,
  monthlySavings,
  annualInterestRate,
  inflationRate = 0,
  milestones = [],
}) {
  const results = []
  let balance = netWorth

  for (let age = 20; age <= 80; age++) {
    // Inflation-adjusted savings (only from currentAge onward)
    const yearsFromNow = Math.max(0, age - currentAge)
    const adjustedMonthly = monthlySavings * Math.pow(1 + inflationRate, yearsFromNow)
    const annualSavings = age >= currentAge ? adjustedMonthly * 12 : 0

    // Compound interest on existing balance
    balance = balance * (1 + annualInterestRate) + annualSavings

    // Process milestones at this age
    const milestonesAtAge = milestones.filter(m => m.age === age)
    let shortfall = null

    for (const milestone of milestonesAtAge) {
      if (balance < milestone.cost) {
        shortfall = milestone.cost - balance
      }
      balance -= milestone.cost // drawdown regardless (goes negative = shortfall)
    }

    results.push({
      age,
      balance: Math.round(balance),
      milestones: milestonesAtAge,
      shortfall,
    })
  }

  return results
}
