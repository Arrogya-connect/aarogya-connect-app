import { InferenceSession, Tensor } from 'onnxruntime-react-native';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { Platform, InteractionManager, LogBox } from 'react-native';
import diseaseData from '../assets/disease_vectors.json';
import vocab from '../assets/model/vocab.json'; 
import WordPieceTokenizer from './WordPieceTokenizer';

LogBox.ignoreLogs(['Method getInfoAsync']);

const SYNONYMS = {
  "tummy": "stomach", "belly": "stomach", "gut": "stomach",
  "head": "headache", "sir": "headache",
  "chest": "chest", "heart": "cardiac",
  "throat": "throat", "gala": "throat",
  "poop": "stool", "motion": "stool", "latrine": "stool",
  "pee": "urine", "susu": "urine", "toilet": "urine",
  "hurt": "pain", "aching": "pain", "ache": "pain", "dard": "pain",
  "puke": "vomiting", "throwing up": "vomiting", "ulti": "vomiting",
  "hot": "fever", "warm": "fever", "temp": "fever", "bukhaar": "fever",
  "shiver": "chills", "kapkapi": "chills",
  "tired": "fatigue", "weak": "fatigue", "kamzori": "fatigue",
  "cant breathe": "breathlessness", "gasping": "breathlessness", "saans": "breathlessness",
  "runny": "discharge", "blocked": "congestion",
  "itch": "itching", "khujli": "itching",
  "spot": "rash", "redness": "rash", "daane": "rash",
  "sugar": "diabetes", "bp": "hypertension", "loose": "diarrhea"
};

// 🛡️ STRICT CATEGORY MAPPING
// Based on your knowledge.json structure
const CATEGORY_RULES = {
  dental: {
    keywords: ["tooth", "teeth", "gum", "gums", "jaw", "cavity", "molar", "dentist", "mouth ulcer"],
    allowed_categories: ["dental"] 
  },
  skin: {
    keywords: ["skin", "rash", "itch", "itching", "pimple", "acne", "boil", "hives", "spots", "ringworm", "fungus"],
    // We allow both dermatological and fungal because Ringworm (fungal) is a skin issue
    allowed_categories: ["dermatological", "fungal"] 
  },
  eyes: {
    keywords: ["eye", "eyes", "vision", "seeing", "blind", "blur"],
    allowed_categories: ["ophthalmological"]
  }
};

class RAGService {
  session = null;
  tokenizer = new WordPieceTokenizer(vocab);
  isInitializing = false;

  async getModelPath() {
    try {
      console.log("🔍 [RAGService] Requesting Asset...");
      const asset = Asset.fromModule(require('../assets/model/minilm.onnx'));
      
      await asset.downloadAsync();
      
      if (!asset.localUri) {
        console.error("❌ [RAGService] Asset downloaded but localUri is NULL.");
        return null;
      }

      const destination = `${FileSystem.documentDirectory}minilm.onnx`;
      
      const fileInfo = await FileSystem.getInfoAsync(destination);
      if (!fileInfo.exists) {
         console.log("🚚 [RAGService] Copying model to safe sandbox...");
         await FileSystem.copyAsync({
           from: asset.localUri,
           to: destination
         });
      }

      let finalUri = destination;
      if (Platform.OS === 'android' && finalUri.startsWith('file://')) {
        finalUri = finalUri.replace('file://', '');
      }

      return finalUri;

    } catch (error) {
      console.error("❌ [RAGService] Path Resolution Error:", error);
      return null;
    }
  }

  async loadModel() {
    if (this.session) return true;
    if (this.isInitializing) return false;

    this.isInitializing = true;
    try {
      console.log("🚀 [RAGService] Starting Initialization...");
      const modelUri = await this.getModelPath();
      
      if (!modelUri) {
          console.warn("⚠️ [RAGService] Model URI invalid.");
          return false;
      }
      
      return new Promise((resolve) => {
        InteractionManager.runAfterInteractions(async () => {
            try {
                this.session = await InferenceSession.create(modelUri);
                console.log("✅ [RAGService] AI Engine Online");
                resolve(true);
            } catch (nativeError) {
                console.error("💥 [RAGService] ONNX Native Crash:", nativeError);
                resolve(false);
            }
        });
      });

    } catch (e) {
      console.error("❌ [RAGService] General Error:", e);
      return false;
    } finally {
      this.isInitializing = false;
    }
  }

  preprocess(text) {
    if (!text) return "";
    const cleaned = text.toLowerCase().replace(/[^a-z0-9 ]/g, "");
    let words = cleaned.split(" ");
    let expanded = [...words];
    words.forEach(w => { if (SYNONYMS[w]) expanded.push(SYNONYMS[w]); });
    return expanded.join(" ");
  }

  tokenize(text) {
    const tokens = this.tokenizer.tokenize(text);
    const input_ids = new Array(128).fill(0);
    const attention_mask = new Array(128).fill(0);
    const token_type_ids = new Array(128).fill(0); 

    tokens.forEach((id, i) => {
      if (i < 128) {
        input_ids[i] = Number(id);
        attention_mask[i] = 1;
      }
    });

    return { input_ids, attention_mask, token_type_ids };
  }

  /**
   * 🕵️ DETECT RESTRICTIONS
   * Checks if user used a 'guard' word like 'skin' or 'teeth'
   * Returns an array of allowed categories, or NULL if no restriction.
   */
  _detectCategoryFilter(text) {
    const t = text.toLowerCase();
    
    // Check Dental
    if (CATEGORY_RULES.dental.keywords.some(k => t.includes(k))) {
        return CATEGORY_RULES.dental.allowed_categories;
    }
    
    // Check Skin (Dermat + Fungal)
    if (CATEGORY_RULES.skin.keywords.some(k => t.includes(k))) {
        return CATEGORY_RULES.skin.allowed_categories;
    }

    // Check Eyes
    if (CATEGORY_RULES.eyes.keywords.some(k => t.includes(k))) {
        return CATEGORY_RULES.eyes.allowed_categories;
    }

    return null; // No restriction
  }

  async getDiseases(userSymptomText, userGender = 'both') {
    if (!this.session) {
      console.log("⚠️ [RAGService] Session not ready, attempting load...");
      const success = await this.loadModel();
      if (!success) return [];
    }
    
    try {
      console.log(`📝 [RAGService] Original Input: "${userSymptomText}"`);
      
      const processedText = this.preprocess(userSymptomText);
      console.log(`🔧 [RAGService] Processed: "${processedText}"`);

      // 1. CHECK FOR CATEGORY RESTRICTIONS
      const allowedCategories = this._detectCategoryFilter(processedText);
      if (allowedCategories) {
          console.log(`🔒 [RAGService] Restricted to categories: ${allowedCategories.join(', ')}`);
      }

      // 2. RUN INFERENCE
      const { input_ids, attention_mask, token_type_ids } = this.tokenize(processedText);
      const bigIntInput = input_ids.map(i => BigInt(i));
      const bigIntMask = attention_mask.map(i => BigInt(i));
      const bigIntTypes = token_type_ids.map(i => BigInt(i));

      const feeds = {
        input_ids: new Tensor('int64', new BigInt64Array(bigIntInput), [1, 128]),
        attention_mask: new Tensor('int64', new BigInt64Array(bigIntMask), [1, 128]),
        token_type_ids: new Tensor('int64', new BigInt64Array(bigIntTypes), [1, 128]),
      };

      const output = await this.session.run(feeds);
      const outputKey = Object.keys(output)[0];
      const queryVector = Array.from(output[outputKey].data).slice(0, 384);

      if (!queryVector || queryVector.length === 0) return [];

      // 3. FILTER AND SORT
      const allMatches = diseaseData
        .filter(item => {
            // A. Gender Filter
            if (item.metadata.gender && item.metadata.gender !== 'both') {
                if (userGender !== 'both' && item.metadata.gender !== userGender) {
                    return false;
                }
            }

            // B. Category Filter (The new logic)
            if (allowedCategories) {
                // If a restriction exists, the disease category MUST be in the allowed list
                // Ensure your disease_vectors.json actually has item.metadata.category!
                if (!allowedCategories.includes(item.metadata.category)) {
                    return false;
                }
            }

            return true;
        })
        .map(item => {
          const score = this.cosineSimilarity(queryVector, item.vector);
          return { ...item, score };
        })
        .sort((a, b) => b.score - a.score);

      console.log("📊 [RAGService] Top 3 Scores:");
      allMatches.slice(0, 3).forEach(m => 
        console.log(`   - ${m.metadata.disease} (${m.metadata.category}): ${m.score.toFixed(4)}`)
      );

      return allMatches
        .filter(item => item.score > 0.05) 
        .slice(0, 3)
        .map(item => ({
          disease: item.metadata.disease,
          doctor: item.metadata.doctor,
          metadata: item.metadata
        }));

    } catch (err) {
      console.error("❌ [RAGService] Inference Error:", err);
      return [];
    }
  }

  cosineSimilarity(vecA, vecB) {
    let dotProduct = 0, mA = 0, mB = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += vecA[i] * vecB[i];
      mA += vecA[i] * vecA[i];
      mB += vecB[i] * vecB[i];
    }
    const magnitude = Math.sqrt(mA) * Math.sqrt(mB);
    return magnitude === 0 ? 0 : dotProduct / magnitude;
  }
}

export default new RAGService();