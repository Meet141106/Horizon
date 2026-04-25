import { formatLakhs } from './formatCurrency'

export function generateInsights(projectionData, milestones, currentAge) {
  const insights = []

  for (const milestone of milestones) {
    const point = projectionData.find(p => p.age === milestone.age)
    if (!point) continue

    if (point.shortfall && point.shortfall > 0) {
      // Calculate how much more savings needed
      const yearsToMilestone = milestone.age - currentAge;
      const extraMonthlyNeeded = yearsToMilestone > 0 
        ? Math.ceil(point.shortfall / (yearsToMilestone * 12)) 
        : point.shortfall;
        
      insights.push({
        type: 'warning',
        text: `You're ₹${formatLakhs(point.shortfall)} short at age ${milestone.age} for "${milestone.label}". Save ₹${extraMonthlyNeeded.toLocaleString('en-IN')} more/month.`,
      })
    } else {
      // Find how early they hit it
      const earlyPoint = projectionData.find(p => p.age < milestone.age && p.balance >= milestone.cost)
      insights.push({
        type: 'success',
        text: `"${milestone.label}" is fully funded${earlyPoint ? ` — you'll hit it ${milestone.age - earlyPoint.age} years early` : ''}.`,
      })
    }
  }

  // Global insight
  const finalBalance = projectionData[projectionData.length - 1]?.balance
  if (finalBalance > 0) {
    insights.push({
      type: 'info',
      text: `At this rate, you'll retire at 80 with ₹${formatLakhs(finalBalance)} in savings.`,
    })
  }

  return insights.slice(0, 5)
}
