import { userService, type User } from './userService';
import Cookies from 'js-cookie';

export interface UserDataSnapshot {
  timestamp: string;
  chats: any[];
  apiKeys: Record<string, string>;
  settings: any;
  tokens: any;
  files: any;
  snapshots: any;
  supabaseConnections: any;
  localStorage: Record<string, any>;
}

class UserDataIntegration {
  private currentUser: User | null = null;

  setCurrentUser(user: User | null) {
    this.currentUser = user;
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Save all user data to their file
  async saveAllUserData(): Promise<void> {
    if (!this.currentUser) {
      console.warn('No current user to save data for');
      return;
    }

    try {
      const userData = await this.collectAllUserData();
      await userService.updateUserData(this.currentUser.id, userData);
      console.log('All user data saved successfully');
    } catch (error) {
      console.error('Failed to save user data:', error);
    }
  }

  // Load all user data from their file
  async loadAllUserData(): Promise<void> {
    if (!this.currentUser) {
      console.warn('No current user to load data for');
      return;
    }

    try {
      const userData = await userService.getUserData(this.currentUser.id);
      if (userData) {
        await this.restoreAllUserData(userData);
        console.log('All user data loaded successfully');
      }
    } catch (error) {
      console.error('Failed to load user data:', error);
    }
  }

  // Collect all current user data from various sources
  private async collectAllUserData(): Promise<UserDataSnapshot> {
    const snapshot: UserDataSnapshot = {
      timestamp: new Date().toISOString(),
      chats: await this.getChatsData(),
      apiKeys: this.getApiKeysData(),
      settings: this.getSettingsData(),
      tokens: this.getTokensData(),
      files: this.getFilesData(),
      snapshots: this.getSnapshotsData(),
      supabaseConnections: this.getSupabaseData(),
      localStorage: this.getLocalStorageData()
    };

    return snapshot;
  }

  // Restore all user data to various sources
  private async restoreAllUserData(userData: any): Promise<void> {
    if (userData.chats) {
      await this.restoreChatsData(userData.chats);
    }
    if (userData.apiKeys) {
      this.restoreApiKeysData(userData.apiKeys);
    }
    if (userData.settings) {
      this.restoreSettingsData(userData.settings);
    }
    if (userData.tokens) {
      this.restoreTokensData(userData.tokens);
    }
    if (userData.files) {
      this.restoreFilesData(userData.files);
    }
    if (userData.snapshots) {
      this.restoreSnapshotsData(userData.snapshots);
    }
    if (userData.supabaseConnections) {
      this.restoreSupabaseData(userData.supabaseConnections);
    }
    if (userData.localStorage) {
      this.restoreLocalStorageData(userData.localStorage);
    }
  }

  // Chat data methods
  private async getChatsData(): Promise<any[]> {
    try {
      // Get chats from IndexedDB
      const { openDatabase } = await import('~/lib/persistence/db');
      const db = await openDatabase();
      if (db) {
        const { getAllChats } = await import('~/lib/persistence/chats');
        return await getAllChats(db);
      }
    } catch (error) {
      console.error('Failed to get chats data:', error);
    }
    return [];
  }

  private async restoreChatsData(chats: any[]): Promise<void> {
    try {
      const { openDatabase } = await import('~/lib/persistence/db');
      const db = await openDatabase();
      if (db) {
        const { saveChat } = await import('~/lib/persistence/chats');
        for (const chat of chats) {
          await saveChat(db, chat);
        }
      }
    } catch (error) {
      console.error('Failed to restore chats data:', error);
    }
  }

  // API Keys data methods
  private getApiKeysData(): Record<string, string> {
    try {
      const storedApiKeys = Cookies.get('apiKeys');
      return storedApiKeys ? JSON.parse(storedApiKeys) : {};
    } catch (error) {
      console.error('Failed to get API keys data:', error);
      return {};
    }
  }

  private restoreApiKeysData(apiKeys: Record<string, string>): void {
    try {
      Cookies.set('apiKeys', JSON.stringify(apiKeys));
    } catch (error) {
      console.error('Failed to restore API keys data:', error);
    }
  }

  // Settings data methods
  private getSettingsData(): any {
    const settings: any = {};
    try {
      // Get settings from localStorage
      const settingsKeys = [
        'isLatestBranch',
        'autoSelectTemplate', 
        'contextOptimizationEnabled',
        'isEventLogsEnabled',
        'promptId',
        'isDeveloperMode'
      ];
      
      settingsKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          try {
            settings[key] = JSON.parse(value);
          } catch {
            settings[key] = value;
          }
        }
      });
    } catch (error) {
      console.error('Failed to get settings data:', error);
    }
    return settings;
  }

  private restoreSettingsData(settings: any): void {
    try {
      Object.entries(settings).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    } catch (error) {
      console.error('Failed to restore settings data:', error);
    }
  }

  // Tokens data methods
  private getTokensData(): any {
    try {
      const tokenUsage = localStorage.getItem('tokenUsage');
      const hourlyTokens = localStorage.getItem('hourlyTokens');
      const claimCodeRedeemed = localStorage.getItem('claimCodeRedeemed');
      
      return {
        tokenUsage: tokenUsage ? JSON.parse(tokenUsage) : null,
        hourlyTokens: hourlyTokens ? parseInt(hourlyTokens) : null,
        claimCodeRedeemed: claimCodeRedeemed === 'true'
      };
    } catch (error) {
      console.error('Failed to get tokens data:', error);
      return {};
    }
  }

  private restoreTokensData(tokens: any): void {
    try {
      if (tokens.tokenUsage) {
        localStorage.setItem('tokenUsage', JSON.stringify(tokens.tokenUsage));
      }
      if (tokens.hourlyTokens) {
        localStorage.setItem('hourlyTokens', tokens.hourlyTokens.toString());
      }
      if (tokens.claimCodeRedeemed) {
        localStorage.setItem('claimCodeRedeemed', 'true');
      }
    } catch (error) {
      console.error('Failed to restore tokens data:', error);
    }
  }

  // Files data methods
  private getFilesData(): any {
    try {
      const deletedPaths = localStorage.getItem('bolt-deleted-paths');
      const lockedFiles = localStorage.getItem('bolt-locked-files');
      
      return {
        deletedPaths: deletedPaths ? JSON.parse(deletedPaths) : [],
        lockedFiles: lockedFiles ? JSON.parse(lockedFiles) : []
      };
    } catch (error) {
      console.error('Failed to get files data:', error);
      return {};
    }
  }

  private restoreFilesData(files: any): void {
    try {
      if (files.deletedPaths) {
        localStorage.setItem('bolt-deleted-paths', JSON.stringify(files.deletedPaths));
      }
      if (files.lockedFiles) {
        localStorage.setItem('bolt-locked-files', JSON.stringify(files.lockedFiles));
      }
    } catch (error) {
      console.error('Failed to restore files data:', error);
    }
  }

  // Snapshots data methods
  private getSnapshotsData(): any {
    try {
      const snapshots: any = {};
      const snapshotKeys = Object.keys(localStorage).filter(key => key.startsWith('snapshot:'));
      snapshotKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          snapshots[key] = JSON.parse(value);
        }
      });
      return snapshots;
    } catch (error) {
      console.error('Failed to get snapshots data:', error);
      return {};
    }
  }

  private restoreSnapshotsData(snapshots: any): void {
    try {
      Object.entries(snapshots).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    } catch (error) {
      console.error('Failed to restore snapshots data:', error);
    }
  }

  // Supabase data methods
  private getSupabaseData(): any {
    try {
      const supabaseData: any = {};
      const supabaseKeys = Object.keys(localStorage).filter(key => key.startsWith('supabase-'));
      supabaseKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value) {
          supabaseData[key] = JSON.parse(value);
        }
      });
      return supabaseData;
    } catch (error) {
      console.error('Failed to get Supabase data:', error);
      return {};
    }
  }

  private restoreSupabaseData(supabaseData: any): void {
    try {
      Object.entries(supabaseData).forEach(([key, value]) => {
        localStorage.setItem(key, JSON.stringify(value));
      });
    } catch (error) {
      console.error('Failed to restore Supabase data:', error);
    }
  }

  // LocalStorage data methods
  private getLocalStorageData(): Record<string, any> {
    try {
      const data: Record<string, any> = {};
      const relevantKeys = [
        'selectedModel',
        'selectedProvider',
        'cachedPrompt',
        'bolt_chat_history'
      ];
      
      relevantKeys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value !== null) {
          try {
            data[key] = JSON.parse(value);
          } catch {
            data[key] = value;
          }
        }
      });
      
      return data;
    } catch (error) {
      console.error('Failed to get localStorage data:', error);
      return {};
    }
  }

  private restoreLocalStorageData(data: Record<string, any>): void {
    try {
      Object.entries(data).forEach(([key, value]) => {
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      });
    } catch (error) {
      console.error('Failed to restore localStorage data:', error);
    }
  }

  // Auto-save functionality
  startAutoSave(intervalMs: number = 30000): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.autoSaveInterval = setInterval(() => {
      this.saveAllUserData();
    }, intervalMs);
  }

  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  private autoSaveInterval: NodeJS.Timeout | null = null;
}

export const userDataIntegration = new UserDataIntegration(); 