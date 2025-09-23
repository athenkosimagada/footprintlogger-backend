const generateTip = (highestCategory, totalEmission) => {
  const tipsByCategory = {
    travel: [
      `Consider walking or cycling for short trips this week to cut ${totalEmission.toFixed(
        1
      )} kg CO2.`,
      `Try using public transport instead of driving to reduce around ${(
        totalEmission * 0.3
      ).toFixed(1)} kg CO2.`,
    ],
    food: [
      `Eat one plant-based meal a day to reduce your ${highestCategory} footprint by ${(
        totalEmission * 0.2
      ).toFixed(1)} kg CO2.`,
      `Try reducing meat consumption this week to cut approximately ${(
        totalEmission * 0.25
      ).toFixed(1)} kg CO2.`,
    ],
    energy: [
      `Turn off unused appliances and lights to save roughly ${(
        totalEmission * 0.15
      ).toFixed(1)} kg CO2.`,
      `Consider using energy-efficient bulbs or reducing heating/cooling for a ${(
        totalEmission * 0.2
      ).toFixed(1)} kg CO2 reduction.`,
    ],
    default: [
      `Focus on reducing activities in ${highestCategory} this week to lower your carbon footprint.`,
    ],
  };

  const categoryTips =
    tipsByCategory[highestCategory] || tipsByCategory.default;
  return categoryTips[Math.floor(Math.random() * categoryTips.length)];
};

export { generateTip };
