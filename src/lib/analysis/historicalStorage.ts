import type { StorageData, HistoricalDraw } from '@/types/analysis';

const STORAGE_KEY = 'lottery_historical_data';
const CURRENT_VERSION = 1;

/**
 * Historical data storage management using localStorage
 */
export const historicalStorage = {
  /**
   * Load all stored data
   */
  load(): StorageData {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return this.getEmptyData();
      }
      return this.migrate(raw);
    } catch (error) {
      console.error('Failed to load historical data:', error);
      return this.getEmptyData();
    }
  },

  /**
   * Save data to localStorage
   */
  save(data: StorageData): boolean {
    try {
      const toSave = {
        ...data,
        version: CURRENT_VERSION
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        console.error('localStorage quota exceeded');
        return false;
      }
      console.error('Failed to save historical data:', error);
      return false;
    }
  },

  /**
   * Add a new draw
   */
  addDraw(draw: HistoricalDraw): boolean {
    const data = this.load();
    data.draws.push(draw);
    return this.save(data);
  },

  /**
   * Remove a draw by id
   */
  removeDraw(id: string): boolean {
    const data = this.load();
    data.draws = data.draws.filter(d => d.id !== id);
    return this.save(data);
  },

  /**
   * Clear all draws
   */
  clearAll(): boolean {
    const data = this.load();
    data.draws = [];
    return this.save(data);
  },

  /**
   * Set persistence enabled flag
   */
  setEnabled(enabled: boolean): boolean {
    const data = this.load();
    data.enabled = enabled;
    return this.save(data);
  },

  /**
   * Get empty storage data structure
   */
  getEmptyData(): StorageData {
    return {
      version: CURRENT_VERSION,
      enabled: true,
      draws: []
    };
  },

  /**
   * Migrate data from older versions
   */
  migrate(rawData: string): StorageData {
    try {
      const parsed = JSON.parse(rawData);
      const version = parsed.version || 0;

      let data = parsed;

      // Apply migrations sequentially
      for (let v = version + 1; v <= CURRENT_VERSION; v++) {
        data = this.runMigration(data, v);
      }

      return data as StorageData;
    } catch (error) {
      console.error('Failed to migrate data, resetting:', error);
      return this.getEmptyData();
    }
  },

  /**
   * Run a single migration step
   */
  runMigration(data: any, toVersion: number): any {
    switch (toVersion) {
      case 1:
        // Ensure version field exists and structure is correct
        return {
          version: 1,
          enabled: data.enabled ?? true,
          draws: Array.isArray(data.draws) ? data.draws : []
        };
      default:
        return data;
    }
  }
};
