import os from "os";

export const average = () => {
  let totalIdle = 0;
  let totalTick = 0;
  let cpus = os.cpus();

  for (let i = 0, len = cpus.length; i < len; i++) {
    let cpu = cpus[i];
    for (let type in cpu.times) {
      totalTick += cpu.times[type];
    }
    totalIdle += cpu.times.idle;
  }

  return {
    totalIdle: totalIdle,
    totalTick: totalTick,
    avgIdle: (totalIdle / cpus.length),
    avgTotal: (totalTick / cpus.length)
  };
};

export const cpuUsage = async (interval?: number) => {
  if (!interval) {
    interval = 1000;
  }

  return new Promise(function (resolve) {
    if (typeof interval !== "number") {
      throw new TypeError("interval must be a number!");
    }

    let startMeasure = average();

    setTimeout(function () {
      let endMeasure = average();
      let idleDifference = endMeasure.avgIdle - startMeasure.avgIdle;
      let totalDifference = endMeasure.avgTotal - startMeasure.avgTotal;
      let cpuPercentage = (10000 - Math.round(10000 * idleDifference / totalDifference)) / 100;

      return resolve(cpuPercentage);
    }, interval);
  });
};
