import RAGService from './RAGService';
import * as DatabaseService from './DatabaseService';

// ---------------- CONFIG ----------------

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

class ChatbotEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.userId = null;
    this.state = 'IDLE'; 
    this.context = {
      name: '',
      gender: 'both',
      symptoms: '',
      days: 0,
      pain: 0, // 1 to 10 stars
      urgency: 'LOW',
      queryNumber: '',
    };
    this.ragResults = [];
  }

  setUser(userId) {
    this.userId = userId;
  }

  _generateQueryID() {
    const num = Math.floor(100000 + Math.random() * 900000); 
    return `QRY-${num}`;
  }

  // ---------------------------------------------------------
  // 🛡️ GUARDRAILS: IMMEDIATE EMERGENCY CHECKS
  // ---------------------------------------------------------

  _checkImmediateEmergencies(text) {
    const t = text.toLowerCase();

    // 1. Critical Keywords (Red Flags)
    const criticalFlags = [
      "vomiting blood", "blood in stool", "unconscious", "fainted", 
      "seizure", "cant breathe", "can't breathe", "chest pain", 
      "heart attack", "paralysis", "slurred speech", "suicide"
    ];

    if (criticalFlags.some(flag => t.includes(flag))) {
      return "HIGH";
    }

    // 2. Respiratory Distress
    if (t.includes("breath") && (t.includes("hard") || t.includes("stuck") || t.includes("heavy"))) {
        return "HIGH";
    }

    return null; // Safe to proceed
  }

  // ---------------------------------------------------------
  // ⚖️ LOGIC: RURAL URGENCY MATRIX (Case 1, 2, 3)
  // ---------------------------------------------------------

  _calculateMatrixUrgency(days, stars) {
    // Case 3: High Duration (> 4 days) -> ALWAYS HIGH
    if (days > 4) return "HIGH";

    // Case 2: Medium Duration (3-4 days)
    if (days >= 3 && days <= 4) {
        if (stars <= 3) return "LOW";       // 1-3 Stars
        if (stars <= 7) return "MEDIUM";    // 4-7 Stars
        return "HIGH";                      // 8-10 Stars
    }

    // Case 1: Low Duration (1-2 days)
    if (days >= 1 && days <= 2) {
        if (stars <= 3) return "LOW";       // 1-3 Stars
        if (stars <= 7) return "MEDIUM";    // 4-7 Stars
        return "HIGH";                      // 8-10 Stars
    }

    return "MEDIUM"; // Fallback
  }

  _getActionMessage(urgency) {
    switch (urgency) {
        case "LOW":
            return "✅ **Action Required:** Please record/upload a video or send a voice message with an image.";
        case "MEDIUM":
            return "⚠️ **Action Required:** Go to your nearest e-clinic for a live video consultation.";
        case "HIGH":
            return "🚨 **Action Required:** Please visit the nearest Civil Hospital immediately (Call for appointment).";
        default:
            return "";
    }
  }

  // ---------------------------------------------------------
  // 🧠 CONSERVATIVE AI SORTING
  // ---------------------------------------------------------

  /**
   * Re-ranks diseases to avoid recommending rare/scary conditions 
   * if the user's symptoms are actually mild (Low Matrix Urgency).
   */
  _sortConservative(results, matrixUrgency) {
    if (!results || results.length === 0) return [];

    return results.sort((a, b) => {
        // Assign weights based on severity hint in metadata
        // We assume your JSON has 'severity_hint': 'low', 'medium', 'high', 'emergency'
        const severityWeight = { 'low': 1, 'medium': 2, 'high': 3, 'emergency': 4 };
        
        const weightA = severityWeight[a.metadata?.severity_hint || 'medium'];
        const weightB = severityWeight[b.metadata?.severity_hint || 'medium'];

        // If User Matrix says LOW, punish HIGH severity diseases
        if (matrixUrgency === 'LOW') {
            // If disease A is 'high/emergency' but B is 'low', prefer B even if A score is slightly better
            if (weightA > 2 && weightB <= 2) return 1; // Push A down
            if (weightB > 2 && weightA <= 2) return -1; // Push B down
        }

        // Default: Sort by Vector Score (original order)
        return 0; 
    });
  }

  // ---------------------------------------------------------
  // 🚀 MAIN INPUT HANDLER (STATE MACHINE)
  // ---------------------------------------------------------

  async handleInput(userInput) {
    const cleanInput = userInput ? userInput.trim() : "";

    // 1. Warmup Check
    if (!RAGService.session) {
      const success = await RAGService.loadModel();
      if (!success) return { text: "⚠️ AI System initializing... Please check internet and try again.", type: 'chat' };
    }

    // 2. State Machine
    switch (this.state) {
      case 'IDLE':
        this.reset();
        this.state = 'ASK_NAME';
        return { text: "👋 Namaste! I am Aarogya Connect.\nTo help you, I need to ask a few questions.\n\nWhat is your name?", type: 'chat' };

      case 'ASK_NAME':
        this.context.name = cleanInput;
        this.state = 'ASK_GENDER';
        return { text: `Hi ${this.context.name}. Are you Male or Female?`, type: 'option', options: GENDER_OPTIONS };

      case 'ASK_GENDER':
        const g = cleanInput.toLowerCase();
        if (!['male', 'female', 'other'].includes(g)) return { text: "Please select a valid gender.", type: 'option', options: GENDER_OPTIONS };
        this.context.gender = g;
        this.state = 'ASK_SYMPTOMS';
        return { text: "Please describe your symptoms (e.g., fever, stomach pain).", type: 'chat' };

      case 'ASK_SYMPTOMS':
        if (cleanInput.length < 3) return { text: "Please provide more detail about your symptoms.", type: 'chat' };
        this.context.symptoms = cleanInput;

        // 🔥 IMMEDIATE SHORT-CIRCUIT: Check for Emergencies NOW
        const riskLevel = this._checkImmediateEmergencies(cleanInput);
        if (riskLevel === 'HIGH') {
            // Skip Days/Pain questions. Go straight to High Urgency protocol.
            this.context.days = 1; // Dummy value
            this.context.pain = 10; // Max pain assumed
            this.context.urgency = 'HIGH';
            return await this._processConsultation(true); // true = forced emergency
        }

        this.state = 'ASK_DAYS';
        return { text: "How many days have you been experiencing this? (Please enter a number)", type: 'chat' };

      case 'ASK_DAYS':
        const d = parseInt(cleanInput);
        if (isNaN(d) || d < 0) return { text: "Please enter a valid number of days.", type: 'chat' };
        this.context.days = d;
        this.state = 'ASK_PAIN';
        return { text: "On a scale of 1 to 10 stars (10 being worst), how much discomfort/pain are you in?", type: 'chat' };

      case 'ASK_PAIN':
        const p = parseInt(cleanInput);
        if (isNaN(p) || p < 1 || p > 10) return { text: "Please enter a number between 1 and 10.", type: 'chat' };
        this.context.pain = p;
        return await this._processConsultation(false);

      case 'COMPLETED':
        this.reset();
        this.state = 'ASK_NAME';
        return { text: "Starting new consultation... Name?", type: 'chat' };

      default:
        return { text: "Error. Resetting.", type: 'chat' };
    }
  }

  // ---------------------------------------------------------
  // 🧠 PROCESSOR: RAG + MATRIX + DATABASE
  // ---------------------------------------------------------

  async _processConsultation(forcedEmergency = false) {
    this.context.queryNumber = this._generateQueryID();

    try {
      // 1. Calculate Urgency (Matrix or Forced)
      let urgency = 'HIGH';
      if (!forcedEmergency) {
          urgency = this._calculateMatrixUrgency(this.context.days, this.context.pain);
      }
      this.context.urgency = urgency;

      // 2. AI Analysis (RAG)
      // FIX: Only send symptoms to the AI to avoid confusing the vector search.
      // Gender is passed as the second argument for filtering.
      const aiPrompt = this.context.symptoms; 
      let rawResults = await RAGService.getDiseases(aiPrompt, this.context.gender);

      // 3. Conservative Filtering
      // If user urgency is LOW/MEDIUM, push down "Emergency" diseases from top results
      // unless it was a Forced Emergency.
      if (!forcedEmergency) {
          this.ragResults = this._sortConservative(rawResults, urgency);
      } else {
          this.ragResults = rawResults;
      }

      // 4. Format Output Text
      let diseasesList = "General Symptoms Detected";
      let specialist = "General Physician";

      if (this.ragResults.length > 0) {
        // Take top result
        diseasesList = this.ragResults[0].disease; 
        specialist = this.ragResults[0].doctor;
        
        // Add second option if close match
        if (this.ragResults[1] && this.ragResults[1].score > 0.6) {
            diseasesList += ` or ${this.ragResults[1].disease}`;
        }
      }

      const actionMsg = this._getActionMessage(urgency);
      
      const responseText = 
        `📊 **Analysis Complete**\n` +
        `Query No: **${this.context.queryNumber}**\n\n` +
        `🩺 **Possible Condition:** ${diseasesList}\n` +
        `👨‍⚕️ **Recommended Doctor:** ${specialist}\n\n` +
        `🚨 **Urgency Level:** ${urgency}\n` +
        `${actionMsg}\n\n` +
        (urgency === 'LOW' 
            ? "👇 Please upload your media below." 
            : "I hope you're satisfied with my response. I'll be happy to help you again.");

      // 5. Save to Offline DB
      await DatabaseService.saveConsultation(
        this.userId || "Guest",
        this.context.symptoms,
        this.context.days,
        this.context.pain,
        urgency,
        this.ragResults,
        this.context.queryNumber
      );

      // 6. Determine UI Action Trigger
      let uiAction = 'ACKNOWLEDGE'; // Standard "Okay"
      if (urgency === 'LOW') uiAction = 'REQUEST_MEDIA'; // Trigger camera

      this.state = 'COMPLETED';

      return { 
        text: responseText, 
        type: 'chat', 
        action: uiAction,
        urgency: urgency 
      };

    } catch (error) {
      console.error(error);
      return { text: "System Error. Please try again.", type: 'chat' };
    }
  }
}

export default new ChatbotEngine();