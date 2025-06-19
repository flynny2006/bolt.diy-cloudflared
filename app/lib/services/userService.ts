import fs from 'fs';
import path from 'path';

export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  lastLogin: string;
  password: string;
}

export interface UserData {
  profile: User;
  chats: any[];
  settings: any;
  tokens: any;
}

class UserService {
  private usersDir = path.join(process.cwd(), 'users');

  constructor() {
    this.ensureUsersDirectory();
  }

  private ensureUsersDirectory() {
    if (!fs.existsSync(this.usersDir)) {
      fs.mkdirSync(this.usersDir, { recursive: true });
    }
  }

  private getUserDir(userId: string): string {
    return path.join(this.usersDir, userId);
  }

  private getUserFilePath(userId: string, filename: string): string {
    return path.join(this.getUserDir(userId), filename);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLogin'>): Promise<User> {
    const userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    const user: User = {
      ...userData,
      id: userId,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };

    // Create user directory
    const userDir = this.getUserDir(userId);
    fs.mkdirSync(userDir, { recursive: true });

    // Create user files
    const userDataStructure: UserData = {
      profile: user,
      chats: [],
      settings: {
        theme: 'dark',
        language: 'en',
        notifications: true
      },
      tokens: {
        hourlyTokensUsed: 0,
        lastResetHour: new Date().toISOString().slice(0, 13)
      }
    };

    // Save profile
    fs.writeFileSync(
      this.getUserFilePath(userId, 'profile.json'),
      JSON.stringify(user, null, 2)
    );

    // Save user data
    fs.writeFileSync(
      this.getUserFilePath(userId, 'userdata.json'),
      JSON.stringify(userDataStructure, null, 2)
    );

    // Add to users list
    const usersList = this.getAllUsers();
    usersList.push(user);
    fs.writeFileSync(
      path.join(this.usersDir, 'users.json'),
      JSON.stringify(usersList, null, 2)
    );

    return user;
  }

  async authenticateUser(usernameOrEmail: string, password: string): Promise<User | null> {
    const users = this.getAllUsers();
    const user = users.find(u => 
      (u.username === usernameOrEmail || u.email === usernameOrEmail) && 
      u.password === password
    );

    if (user) {
      // Update last login
      user.lastLogin = new Date().toISOString();
      this.updateUser(user);
      return user;
    }

    return null;
  }

  async getUserById(userId: string): Promise<User | null> {
    try {
      const profilePath = this.getUserFilePath(userId, 'profile.json');
      if (fs.existsSync(profilePath)) {
        const profileData = fs.readFileSync(profilePath, 'utf-8');
        return JSON.parse(profileData);
      }
    } catch (error) {
      console.error('Error reading user profile:', error);
    }
    return null;
  }

  async getUserData(userId: string): Promise<UserData | null> {
    try {
      const userDataPath = this.getUserFilePath(userId, 'userdata.json');
      if (fs.existsSync(userDataPath)) {
        const userDataContent = fs.readFileSync(userDataPath, 'utf-8');
        return JSON.parse(userDataContent);
      }
    } catch (error) {
      console.error('Error reading user data:', error);
    }
    return null;
  }

  async updateUser(user: User): Promise<void> {
    try {
      // Update profile
      fs.writeFileSync(
        this.getUserFilePath(user.id, 'profile.json'),
        JSON.stringify(user, null, 2)
      );

      // Update in users list
      const users = this.getAllUsers();
      const userIndex = users.findIndex(u => u.id === user.id);
      if (userIndex !== -1) {
        users[userIndex] = user;
        fs.writeFileSync(
          path.join(this.usersDir, 'users.json'),
          JSON.stringify(users, null, 2)
        );
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  }

  async saveUserChat(userId: string, chat: any): Promise<void> {
    try {
      const userData = await this.getUserData(userId);
      if (userData) {
        userData.chats.push(chat);
        fs.writeFileSync(
          this.getUserFilePath(userId, 'userdata.json'),
          JSON.stringify(userData, null, 2)
        );
      }
    } catch (error) {
      console.error('Error saving user chat:', error);
    }
  }

  async updateUserSettings(userId: string, settings: any): Promise<void> {
    try {
      const userData = await this.getUserData(userId);
      if (userData) {
        userData.settings = { ...userData.settings, ...settings };
        fs.writeFileSync(
          this.getUserFilePath(userId, 'userdata.json'),
          JSON.stringify(userData, null, 2)
        );
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
    }
  }

  async updateUserTokens(userId: string, tokens: any): Promise<void> {
    try {
      const userData = await this.getUserData(userId);
      if (userData) {
        userData.tokens = { ...userData.tokens, ...tokens };
        fs.writeFileSync(
          this.getUserFilePath(userId, 'userdata.json'),
          JSON.stringify(userData, null, 2)
        );
      }
    } catch (error) {
      console.error('Error updating user tokens:', error);
    }
  }

  async updateUserData(userId: string, data: any): Promise<void> {
    try {
      const userData = await this.getUserData(userId);
      if (userData) {
        // Merge the new data with existing user data
        const updatedUserData = {
          ...userData,
          ...data,
          // Preserve the profile data
          profile: userData.profile
        };
        
        fs.writeFileSync(
          this.getUserFilePath(userId, 'userdata.json'),
          JSON.stringify(updatedUserData, null, 2)
        );
      } else {
        // Create new user data if it doesn't exist
        const newUserData = {
          profile: await this.getUserById(userId),
          ...data
        };
        
        fs.writeFileSync(
          this.getUserFilePath(userId, 'userdata.json'),
          JSON.stringify(newUserData, null, 2)
        );
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  }

  private getAllUsers(): User[] {
    try {
      const usersPath = path.join(this.usersDir, 'users.json');
      if (fs.existsSync(usersPath)) {
        const usersData = fs.readFileSync(usersPath, 'utf-8');
        return JSON.parse(usersData);
      }
    } catch (error) {
      console.error('Error reading users list:', error);
    }
    return [];
  }

  async userExists(usernameOrEmail: string): Promise<boolean> {
    const users = this.getAllUsers();
    return users.some(u => u.username === usernameOrEmail || u.email === usernameOrEmail);
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      const userDir = this.getUserDir(userId);
      if (fs.existsSync(userDir)) {
        fs.rmSync(userDir, { recursive: true, force: true });
      }

      // Remove from users list
      const users = this.getAllUsers();
      const filteredUsers = users.filter(u => u.id !== userId);
      fs.writeFileSync(
        path.join(this.usersDir, 'users.json'),
        JSON.stringify(filteredUsers, null, 2)
      );
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  }
}

export const userService = new UserService(); 