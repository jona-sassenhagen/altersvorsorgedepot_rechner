import { simulateHousehold } from "./app.js";

function computeSimulationResult({ bootstrapSeries, household, options }) {
  return simulateHousehold(household, bootstrapSeries, options);
}

if (typeof self !== "undefined") {
  self.addEventListener("message", (event) => {
    const { bootstrapSeries, household, options, requestId } = event.data ?? {};

    try {
      const result = computeSimulationResult({ bootstrapSeries, household, options });
      self.postMessage({ requestId, result });
    } catch (error) {
      self.postMessage({
        error: error instanceof Error ? error.message : String(error),
        requestId,
      });
    }
  });
}

export { computeSimulationResult };
