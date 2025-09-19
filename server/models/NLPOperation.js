import supabase from '../config/database.js';

export class NLPOperation {
  static async create({
    userId,
    type,
    inputText,
    outputText,
    metadata = {},
    processingTime = 0,
    modelVersion = 'v1.0'
  }) {
    try {
      const { data, error } = await supabase
        .from('nlp_operations')
        .insert([
          {
            user_id: userId,
            type,
            input_text: inputText,
            output_text: outputText,
            metadata,
            processing_time: processingTime,
            model_version: modelVersion
          }
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to create NLP operation: ${error.message}`);
    }
  }

  static async findByUserId(userId, { limit = 50, offset = 0, type = null } = {}) {
    try {
      let query = supabase
        .from('nlp_operations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (type) {
        query = query.eq('type', type);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data;
    } catch (error) {
      throw new Error(`Failed to fetch NLP operations: ${error.message}`);
    }
  }

  static async deleteByUserId(userId) {
    try {
      const { error } = await supabase
        .from('nlp_operations')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return true;
    } catch (error) {
      throw new Error(`Failed to delete NLP operations: ${error.message}`);
    }
  }

  static async getStats(userId) {
    try {
      const { data, error } = await supabase
        .from('nlp_operations')
        .select('type')
        .eq('user_id', userId);

      if (error) throw error;

      const stats = {
        total: data.length,
        translation: data.filter(op => op.type === 'translation').length,
        summarization: data.filter(op => op.type === 'summarization').length,
        'speech-to-text': data.filter(op => op.type === 'speech-to-text').length,
        'text-to-speech': data.filter(op => op.type === 'text-to-speech').length
      };

      return stats;
    } catch (error) {
      throw new Error(`Failed to get NLP operation stats: ${error.message}`);
    }
  }
}