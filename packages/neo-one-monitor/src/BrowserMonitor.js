/* @flow */
import type { Counter, Gauge, Histogram, LogLevel, Summary } from './types';
import MonitorBase, {
  type Logger,
  type MetricConstruct,
  type MetricsFactory,
  type NowMS,
  type RawLabels,
  type Tracer,
} from './MonitorBase';

class BaseMetric {
  // eslint-disable-next-line
  constructor(options: MetricConstruct) {}
}

class BrowserCounter extends BaseMetric implements Counter {
  // eslint-disable-next-line
  inc(countOrLabels?: number | RawLabels, count?: number): void {}
}

class BrowserGauge extends BaseMetric implements Gauge {
  // eslint-disable-next-line
  inc(countOrLabels?: number | RawLabels, count?: number): void {}

  // eslint-disable-next-line
  dec(countOrLabels?: number | RawLabels, count?: number): void {}

  // eslint-disable-next-line
  set(countOrLabels?: number | RawLabels, count?: number): void {}
}

class BrowserHistogram extends BaseMetric implements Histogram {
  // eslint-disable-next-line
  observe(countOrLabels?: number | RawLabels, count?: number): void {}
}

class BrowserSummary extends BaseMetric implements Summary {
  // eslint-disable-next-line
  observe(countOrLabels?: number | RawLabels, count?: number): void {}
}

class BrowserMetricsFactory implements MetricsFactory {
  createCounter(options: MetricConstruct): Counter {
    return new BrowserCounter(options);
  }

  createGauge(options: MetricConstruct): Gauge {
    return new BrowserGauge(options);
  }

  createHistogram(options: MetricConstruct): Histogram {
    return new BrowserHistogram(options);
  }

  createSummary(options: MetricConstruct): Summary {
    return new BrowserSummary(options);
  }
}

type BrowserMonitorCreate = {|
  namespace: string,
  logger: Logger,
  tracer?: Tracer,
  nowMS?: NowMS,
  metricsLogLevel?: LogLevel,
  spanLogLevel?: LogLevel,
|};

export default class BrowserMonitor extends MonitorBase {
  static create({
    namespace,
    logger,
    tracer,
    nowMS,
    metricsLogLevel,
    spanLogLevel,
  }: BrowserMonitorCreate): BrowserMonitor {
    return new BrowserMonitor({
      namespace,
      logger,
      tracer,
      metricsFactory: new BrowserMetricsFactory(),
      nowMS,
      metricsLogLevel,
      spanLogLevel,
    });
  }
}