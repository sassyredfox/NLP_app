import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supabase from '../config/database.js';

export class User {
  static async create({ email, password, fullName }) {
    try {
      const passwordHash = await bcrypt.hash(password, 12);
      
      const { data, error } = await supabase
        .from('users')
        .insert([
          {
            email,
            password_hash: passwordHash,
            full_name: fullName
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  static async findByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  static async findById(id) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, full_name, avatar_url, created_at, updated_at')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to find user: ${error.message}`);
    }
  }

  static async validatePassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  static generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  static async createSession(userId, token) {
    try {
      const tokenHash = await bcrypt.hash(token, 10);
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

      const { data, error } = await supabase
        .from('user_sessions')
        .insert([
          {
            user_id: userId,
            token_hash: tokenHash,
            expires_at: expiresAt.toISOString()
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to create session: ${error.message}`);
    }
  }

  static async deleteSession(userId, token) {
    try {
      // Get all sessions for the user
      const { data: sessions, error: fetchError } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', userId);

      if (fetchError) throw fetchError;

      // Find the matching session by comparing token hashes
      let sessionToDelete = null;
      for (const session of sessions) {
        const isMatch = await bcrypt.compare(token, session.token_hash);
        if (isMatch) {
          sessionToDelete = session;
          break;
        }
      }

      if (sessionToDelete) {
        const { error: deleteError } = await supabase
          .from('user_sessions')
          .delete()
          .eq('id', sessionToDelete.id);

        if (deleteError) throw deleteError;
      }

      return true;
    } catch (error) {
      throw new Error(`Failed to delete session: ${error.message}`);
    }
  }
}