// Performance monitoring and optimization utilities
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.config = {
      enableDetailedMetrics: true,
      enableUserTiming: true,
      enableResourceTiming: true,
      enableNavigationTiming: true,
      sampleRate: 1.0, // Monitor 100% of sessions
    };
    
    this.initializeObservers();
    this.startMonitoring();
  }

  // Initialize performance observers
  initializeObservers() {
    // Core Web Vitals Observer
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint
        const lcpObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('LCP', entry.startTime, {
              element: entry.element?.tagName,
              url: entry.url,
              size: entry.size,
            });
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
        this.observers.set('lcp', lcpObserver);

        // First Input Delay
        const fidObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordMetric('FID', entry.processingStart - entry.startTime, {
              eventType: entry.name,
              target: entry.target?.tagName,
            });
          }
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
        this.observers.set('fid', fidObserver);

        // Cumulative Layout Shift
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.recordMetric('CLS', clsValue, {
                sources: entry.sources?.map(s => s.node?.tagName),
              });
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
        this.observers.set('cls', clsObserver);

        // Resource timing
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            this.recordResourceMetric(entry);
          }
        });
        resourceObserver.observe({ entryTypes: ['resource'] });
        this.observers.set('resource', resourceObserver);

      } catch (error) {
        console.warn('Some performance observers not supported:', error);
      }
    }
  }

  // Start basic monitoring
  startMonitoring() {
    // Monitor navigation timing
    if (performance.navigation) {
      this.recordNavigationMetrics();
    }

    // Monitor memory usage (if available)
    if (performance.memory) {
      this.monitorMemoryUsage();
    }

    // Monitor React component performance
    this.monitorReactPerformance();

    // Monitor API call performance
    this.monitorAPIPerformance();

    // Send metrics periodically
    setInterval(() => this.sendMetrics(), 30000); // Every 30 seconds
  }

  // Record navigation metrics
  recordNavigationMetrics() {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0];
        if (navigation) {
          this.recordMetric('DNS_Lookup', navigation.domainLookupEnd - navigation.domainLookupStart);
          this.recordMetric('TCP_Connection', navigation.connectEnd - navigation.connectStart);
          this.recordMetric('Server_Response', navigation.responseEnd - navigation.requestStart);
          this.recordMetric('DOM_Processing', navigation.domContentLoadedEventEnd - navigation.responseEnd);
          this.recordMetric('Page_Load_Complete', navigation.loadEventEnd - navigation.navigationStart);
          this.recordMetric('Time_To_Interactive', navigation.domInteractive - navigation.navigationStart);
        }
      }, 0);
    });
  }

  // Monitor memory usage
  monitorMemoryUsage() {
    const recordMemory = () => {
      if (performance.memory) {
        this.recordMetric('Memory_Used', performance.memory.usedJSHeapSize / 1024 / 1024, { unit: 'MB' });
        this.recordMetric('Memory_Limit', performance.memory.jsHeapSizeLimit / 1024 / 1024, { unit: 'MB' });
        this.recordMetric('Memory_Total', performance.memory.totalJSHeapSize / 1024 / 1024, { unit: 'MB' });
      }
    };

    recordMemory();
    setInterval(recordMemory, 10000); // Every 10 seconds
  }

  // Monitor React component performance
  monitorReactPerformance() {
    // Hook into React DevTools profiling if available
    if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const reactHook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      
      const originalOnCommitFiberRoot = reactHook.onCommitFiberRoot;
      reactHook.onCommitFiberRoot = (id, root, ...args) => {
        // Measure component render time
        const startTime = performance.now();
        const result = originalOnCommitFiberRoot.call(this, id, root, ...args);
        const endTime = performance.now();
        
        this.recordMetric('React_Render_Time', endTime - startTime, {
          component: root.current?.type?.name || 'Unknown',
        });
        
        return result;
      };
    }
  }

  // Monitor API call performance
  monitorAPIPerformance() {
    // Intercept fetch calls
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0];
      
      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        
        this.recordMetric('API_Call_Duration', endTime - startTime, {
          url: url.toString(),
          status: response.status,
          method: args[1]?.method || 'GET',
          success: response.ok,
        });
        
        return response;
      } catch (error) {
        const endTime = performance.now();
        
        this.recordMetric('API_Call_Duration', endTime - startTime, {
          url: url.toString(),
          method: args[1]?.method || 'GET',
          success: false,
          error: error.message,
        });
        
        throw error;
      }
    };
  }

  // Record custom metric
  recordMetric(name, value, metadata = {}) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.pathname,
      userAgent: navigator.userAgent,
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
      } : null,
      ...metadata,
    };

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    this.metrics.get(name).push(metric);

    // Log performance issues
    this.detectPerformanceIssues(name, value, metadata);
  }

  // Record resource metric
  recordResourceMetric(entry) {
    const duration = entry.responseEnd - entry.startTime;
    const size = entry.transferSize || entry.encodedBodySize || 0;
    
    this.recordMetric('Resource_Load_Time', duration, {
      name: entry.name,
      type: this.getResourceType(entry.name),
      size: size,
      cached: entry.transferSize === 0 && entry.decodedBodySize > 0,
    });

    // Check for slow resources
    if (duration > 2000) { // > 2 seconds
      console.warn(`🐌 Slow resource detected: ${entry.name} (${duration.toFixed(2)}ms)`);
    }
  }

  // Get resource type from URL
  getResourceType(url) {
    if (url.includes('/api/')) return 'api';
    if (url.match(/\.(js|jsx|ts|tsx)$/)) return 'script';
    if (url.match(/\.(css|scss|less)$/)) return 'stylesheet';
    if (url.match(/\.(png|jpg|jpeg|gif|svg|webp)$/)) return 'image';
    if (url.match(/\.(woff|woff2|ttf|otf)$/)) return 'font';
    return 'other';
  }

  // Detect performance issues
  detectPerformanceIssues(name, value, metadata) {
    const thresholds = {
      'LCP': 2500, // 2.5 seconds
      'FID': 100,  // 100ms
      'CLS': 0.1,  // 0.1
      'API_Call_Duration': 3000, // 3 seconds
      'React_Render_Time': 16, // 16ms (60fps)
      'Memory_Used': 100, // 100MB
    };

    if (thresholds[name] && value > thresholds[name]) {
      console.warn(`⚠️ Performance issue detected: ${name} = ${value}`, metadata);
      
      // Record performance issue
      this.recordMetric('Performance_Issue', 1, {
        issue: name,
        value: value,
        threshold: thresholds[name],
        ...metadata,
      });
    }
  }

  // Get performance summary
  getPerformanceSummary() {
    const summary = {};
    
    for (const [name, metrics] of this.metrics.entries()) {
      const values = metrics.map(m => m.value);
      summary[name] = {
        count: values.length,
        average: values.reduce((a, b) => a + b, 0) / values.length,
        min: Math.min(...values),
        max: Math.max(...values),
        p50: this.percentile(values, 50),
        p95: this.percentile(values, 95),
        p99: this.percentile(values, 99),
      };
    }
    
    return summary;
  }

  // Calculate percentile
  percentile(values, p) {
    const sorted = values.slice().sort((a, b) => a - b);
    const index = (p / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    return sorted[lower] * (upper - index) + sorted[upper] * (index - lower);
  }

  // Send metrics to backend
  async sendMetrics() {
    if (this.metrics.size === 0) return;

    try {
      const payload = {
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        metrics: Object.fromEntries(this.metrics),
        summary: this.getPerformanceSummary(),
      };

      // Use sendBeacon for better reliability
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/performance', JSON.stringify(payload));
      } else {
        fetch('/api/analytics/performance', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }).catch(error => {
          console.warn('Failed to send performance metrics:', error);
        });
      }

      // Clear sent metrics
      this.metrics.clear();
    } catch (error) {
      console.warn('Error sending performance metrics:', error);
    }
  }

  // Manual performance timing
  startTiming(label) {
    if (this.config.enableUserTiming && performance.mark) {
      performance.mark(`${label}-start`);
    }
    return Date.now();
  }

  endTiming(label, startTime) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    if (this.config.enableUserTiming && performance.mark && performance.measure) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);
    }
    
    this.recordMetric('Custom_Timing', duration, { label });
    return duration;
  }

  // Get real-time performance metrics
  getRealTimeMetrics() {
    return {
      connection: navigator.connection ? {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
      } : null,
      memory: performance.memory ? {
        used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      } : null,
      timing: performance.now(),
      timestamp: Date.now(),
    };
  }

  // Cleanup
  destroy() {
    // Remove all observers
    for (const [name, observer] of this.observers.entries()) {
      try {
        observer.disconnect();
      } catch (error) {
        console.warn(`Error disconnecting ${name} observer:`, error);
      }
    }
    this.observers.clear();
    this.metrics.clear();
  }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Export for use in components
export default performanceMonitor;

// Utility functions for components
export const measureComponentPerformance = (componentName) => {
  return {
    start: () => performanceMonitor.startTiming(`Component-${componentName}`),
    end: (startTime) => performanceMonitor.endTiming(`Component-${componentName}`, startTime),
  };
};

export const measureAsyncOperation = async (operationName, asyncFn) => {
  const startTime = performanceMonitor.startTiming(operationName);
  try {
    const result = await asyncFn();
    performanceMonitor.endTiming(operationName, startTime);
    return result;
  } catch (error) {
    performanceMonitor.endTiming(operationName, startTime);
    performanceMonitor.recordMetric('Async_Operation_Error', 1, {
      operation: operationName,
      error: error.message,
    });
    throw error;
  }
};

// React Hook for component performance
export const usePerformanceMonitoring = (componentName) => {
  const startTime = React.useRef(null);
  
  React.useEffect(() => {
    startTime.current = performanceMonitor.startTiming(`Component-${componentName}-Mount`);
    
    return () => {
      if (startTime.current) {
        performanceMonitor.endTiming(`Component-${componentName}-Mount`, startTime.current);
      }
    };
  }, [componentName]);
  
  const measureRender = React.useCallback(() => {
    const renderStart = performance.now();
    return () => {
      const renderEnd = performance.now();
      performanceMonitor.recordMetric('Component_Render_Time', renderEnd - renderStart, {
        component: componentName,
      });
    };
  }, [componentName]);
  
  return { measureRender };
};
