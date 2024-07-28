// Define expLevels such that each entry indicates the EXP required to reach the next level
export const expLevels = [
    { level: 1, exp: 100 },
    { level: 2, exp: 100 },
    { level: 3, exp: 100 },
    { level: 4, exp: 200 },
    { level: 5, exp: 200 },
  ];
  
  export const calculateLevel = (totalExp) => {
    let accumulatedExp = 0;
    let level = 1;
  
    for (let i = 0; i < expLevels.length; i++) {
      accumulatedExp += expLevels[i].exp;
      if (totalExp < accumulatedExp) {
        return i + 1; // Return the level number
      }
    }
  
    return expLevels[expLevels.length - 1].level; // Return the max level if EXP exceeds all defined levels
  };
  
  export const calculateExpWithinLevel = (totalExp) => {
    let accumulatedExp = 0;
    let nextLevelExp = 0;
  
    for (let i = 0; i < expLevels.length; i++) {
      nextLevelExp = expLevels[i].exp;
      if (totalExp < accumulatedExp + nextLevelExp) {
        return {
          currentLevelExp: totalExp - accumulatedExp,
          nextLevelExp: nextLevelExp,
        };
      }
      accumulatedExp += nextLevelExp;
    }
  
    // In case the user has maxed out the level range defined in expLevels
    return {
      currentLevelExp: totalExp - accumulatedExp,
      nextLevelExp: nextLevelExp,
    };
  };
  