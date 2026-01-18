import knowledge from "./knowledge.json";

type Severity = "BASIC" | "MEDIUM" | "EMERGENCY";

type Step =
    | "INTRO"
    | "ASK_NAME"
    | "ASK_GENDER"   // ✅ ADD
    | "ASK_PROBLEM"
    | "ASK_DAYS"
    | "ASK_PAIN"
    | "ASK_FOLLOWUP"
    | "DONE";


type Disease = {
    id: string;
    category: string;
    guard_keywords: string[];
    primary_symptoms: string[];
    secondary_symptoms: string[];
    possible_disease: string;
    doctor_type: string;
    gender_specific?: "female" | "male";
};

// ---------------- UI OPTIONS ----------------

export const GENDER_OPTIONS = [
    { label: "Male", value: "male" },
    { label: "Female", value: "female" },
    { label: "Other", value: "other" },
];

export const DAYS_OPTIONS = [
    { label: "1 day", value: 1 },
    { label: "2 days", value: 2 },
    { label: "3 days", value: 3 },
    { label: "4–5 days", value: 5 },
    { label: "6–7 days", value: 7 },
    { label: "8–10 days", value: 10 },
];

export const PAIN_OPTIONS = [
    { label: "Mild (1–3)", value: 2 },
    { label: "Moderate (4–6)", value: 5 },
    { label: "Severe (7–10)", value: 8 },
];

let state = {
    step: "INTRO" as Step,
    name: "",
    gender: "" as "male" | "female" | "other" | "",
    userText: "",
    days: 0,
    pain: 0,
    followUpAsked: false,
    queryNo: "",
};


// ---------------- SYMPTOM ALIASES ----------------

const symptomAliases: Record<string, string[]> = {
    "runny nose": ["runny_nose", "running nose", "nose running"],
    "loose motion": ["loose_motion", "diarrhea"],
    "body pain": ["body_pain"],
    "sore throat": ["sore_throat"],
    "high fever": ["high_fever"],
    "burning urine": ["burning_urination"],
};

function expandWithAliases(text: string): string {
    let expanded = text.toLowerCase();

    Object.entries(symptomAliases).forEach(([key, variants]) => {
        // check main key
        if (expanded.includes(key)) {
            expanded += " " + variants.join(" ");
        }

        // 🔥 check variants also
        variants.forEach(v => {
            if (expanded.includes(v)) {
                expanded += " " + key;
            }
        });
    });

    return expanded;
}


// ---------------- HELPERS ----------------

const normalize = (t: string) =>
    t
        .toLowerCase()
        .replace(/_/g, " ")   // ✅ ADD THIS LINE
        .replace(/[^a-z\s]/g, "")
        .trim();

function generateShortQueryNo(): string {
    const num = Date.now() % 10000;
    return `QRY-${num.toString().padStart(4, "0")}`;
}


const MEDICAL_DISCLAIMER =
    "\n\n⚠️ Disclaimer: This is not a medical diagnosis. " +
    "This information is for guidance only. " +
    "Always consult a qualified doctor for confirmation.";


// ---------------- MAIN CHAT ENGINE ----------------

export function chatbotReply(
    input: string
): {
    text: string;
    severity?: Severity;
    options?: { label: string; value: any }[];
} {
    const clean = input.trim();

    switch (state.step) {
        case "INTRO":
            state.step = "ASK_NAME";
            return {
                text:
                    "👋 Hello! I am Aarogya Assistant.\n" +
                    "I will ask a few questions to understand your health issue.\n\n" +
                    "What is your name?",
            };

        case "ASK_NAME":
            state.name = clean;
            state.step = "ASK_GENDER";
            return {
                text: "Please select your gender:",
                options: GENDER_OPTIONS,
            };

        case "ASK_GENDER": {
            const g = clean.toLowerCase();
            if (!["male", "female", "other"].includes(g)) {
                return {
                    text: "Please select your gender:",
                    options: GENDER_OPTIONS,
                };
            }
            state.gender = g as any;
            state.step = "ASK_PROBLEM";
            return { text: "What health problem are you facing?" };
        }

        case "ASK_PROBLEM":
            state.userText = clean;
            state.step = "ASK_DAYS";
            return {
                text: "How many days have you had this problem?",
                options: DAYS_OPTIONS,
            };

        case "ASK_DAYS":
            state.days = Number(clean);
            state.step = "ASK_PAIN";
            return {
                text: "How severe is your pain?",
                options: PAIN_OPTIONS,
            };

        case "ASK_PAIN":
            state.pain = Number(clean);
            state.queryNo = generateShortQueryNo();
            state.step = "DONE";
            return finalResponse();

        case "ASK_FOLLOWUP":
            state.userText += " " + clean;
            state.step = "DONE";
            return finalResponse();

        case "DONE":
            return { text: "Your query has already been generated." };
    }
}



// ---------------- RESET ----------------

export function resetChatbot() {
    state = {
        step: "INTRO",
        name: "",
        userText: "",
        days: 0,
        pain: 0,
        followUpAsked: false,
        queryNo: "",
        gender: "" as any,
    };
}

// ---------------- FOLLOW-UP LOGIC ----------------

function needsFollowUpQuestion(problem: string): boolean {
    const t = normalize(problem);
    return (
        t.includes("chest") ||
        t.includes("fever") ||
        t.includes("cough") ||
        t.includes("breath") ||
        t.includes("stomach")
    );
}

function getFollowUpQuestion(problem: string): string {
    const t = normalize(problem);

    if (t.includes("chest")) {
        return "Do you also feel breathlessness, sweating, or left arm pain?";
    }
    if (t.includes("fever")) {
        return "Do you also have cough, cold, rash, or joint pain?";
    }
    if (t.includes("cough") || t.includes("breath")) {
        return "Is your cough dry or with mucus? Any wheezing?";
    }
    if (t.includes("stomach")) {
        return "Do you have vomiting, gas, acidity, or loose motion?";
    }
    return "Can you describe one more symptom?";
}


// ---------------- RESPIRATORY EDGE CASES (ADDED) ----------------

function respiratoryEdgeCheck(): { text: string; severity: Severity } | null {
    const t = normalize(state.userText);

    if (t.includes("breathlessness") && t.includes("wheezing")) {
        return {
            severity: "EMERGENCY",
            text:
                "🚨 Severe breathing difficulty detected.\n" +
                "Possible asthma attack.\nSeek emergency care.",
        };
    }

    if (t.includes("cough") && t.includes("mucus")) {
        return {
            severity: "MEDIUM",
            text:
                "🫁 Symptoms suggest Bronchitis.\n" +
                "Rest, fluids, and doctor consultation advised.",
        };
    }

    return null;
}

// ---------------- DOCTOR CHAT CTA ----------------

function attachDoctorChatCTA(
    text: string,
    severity: Severity
): { text: string; severity: Severity } {
    return {
        severity,
        text:
            text +
            MEDICAL_DISCLAIMER +
            `\n\n📄 Query Number: ${state.queryNo}\n` +
            "💬 You can chat with a doctor in the app.\n" +
            "👉 Enter this Query Number in the Doctor Chat Form.",
    };
}




// ---------------- RED FLAG CHECK ----------------

function redFlagCheck(): { text: string; severity: Severity } | null {
    const t = normalize(state.userText);

    const flags = [
        "vomiting blood",
        "blood in stool",
        "blood in urine",
        "loss of consciousness",
        "confusion",
        "paralysis",
        "seizure",
        "slurred speech",
    ];

    if (flags.some(f => t.includes(f))) {
        return {
            severity: "EMERGENCY",
            text:
                "🚨 Dangerous symptoms detected.\n" +
                "Immediate medical attention is required.",
        };
    }

    if (t.includes("fever") && state.days >= 3 && state.pain >= 6) {
        return {
            severity: "EMERGENCY",
            text:
                "🚨 High-risk fever detected.\n" +
                "Please visit a hospital immediately.",
        };
    }

    return null;
}

// ---------------- LOCATION BASED CHECK ----------------

function locationCheck(): { text: string; severity: Severity } | null {
    const t = normalize(state.userText);

    if (
        t.includes("chest") &&
        (
            t.includes("pressure") ||
            t.includes("tight") ||
            t.includes("left") ||
            t.includes("sweating") ||
            t.includes("breath") ||
            t.includes("arm") ||
            t.includes("jaw")
        )
    ) {
        return {
            severity: "EMERGENCY",
            text:
                "🚨 Chest pain with cardiac warning signs detected.\n" +
                "This could be heart-related.\n" +
                "Go to the nearest hospital immediately.",
        };
    }


    if (t.includes("lower right") && t.includes("abdomen")) {
        return {
            severity: "EMERGENCY",
            text:
                "🚨 Lower right abdominal pain detected.\n" +
                "Possible appendicitis.\n" +
                "Immediate medical attention required.",
        };
    }

    if (t.includes("upper abdomen") && t.includes("back")) {
        return {
            severity: "EMERGENCY",
            text:
                "🚨 Upper abdominal pain radiating to back detected.\n" +
                "Possible pancreatitis.\n" +
                "Visit hospital immediately.",
        };
    }

    if (t.includes("leg") && t.includes("swelling")) {
        return {
            severity: "EMERGENCY",
            text:
                "🚨 Painful swollen leg detected.\n" +
                "Possible blood clot.\n" +
                "Immediate medical care required.",
        };
    }

    return null;
}

// ---------------- HEADACHE LOGIC ----------------

function headacheLogic(): { text: string; severity: Severity } {
    const t = normalize(state.userText);

    // 🚨 Emergency headache
    if (t.includes("sudden") || t.includes("worst")) {
        return {
            severity: "EMERGENCY",
            text:
                "🚨 Sudden severe headache detected.\n" +
                "Possible neurological emergency.\n" +
                "Please visit the nearest hospital immediately.",
        };
    }

    // 🧠 Migraine (pain-aware)
    if (
        state.pain >= 5 ||                 // ✅ KEY FIX
        t.includes("one side") ||
        t.includes("throbbing") ||
        t.includes("light") ||
        t.includes("noise")
    ) {
        return {
            severity: "MEDIUM",
            text:
                "🧠 Symptoms suggest Migraine.\n" +
                "Avoid bright light and noise.\n" +
                "Consult a doctor if frequent.",
        };
    }

    // 🤧 Sinus headache
    if (t.includes("sinus") || t.includes("nose")) {
        return {
            severity: "MEDIUM",
            text:
                "🤧 Symptoms suggest Sinus Headache.\n" +
                "Steam inhalation may help.",
        };
    }

    // 😓 Tension headache (ONLY mild cases)
    return {
        severity: "BASIC",
        text:
            "😓 Likely Tension Headache.\n" +
            "Rest, hydration, and stress reduction advised.",
    };
}


// ---------------- FEVER LOGIC ----------------

function feverLogic(): { text: string; severity: Severity } {
    const t = normalize(state.userText);

    // 🚨 Severe / risky fever
    if (state.days >= 3 && state.pain >= 6) {
        return {
            severity: "EMERGENCY",
            text:
                "🚨 Severe fever detected.\n" +
                "Hospital evaluation recommended.",
        };
    }

    const hasCough = t.includes("cough");
    const hasCold = t.includes("cold");
    const hasBodyPain =
        t.includes("body pain") ||
        t.includes("fatigue") ||
        t.includes("chills");

    // 🤧 Influenza ONLY if additional symptoms present
    if ((hasCold || hasCough) && hasBodyPain && state.pain >= 3) {
        return {
            severity: "MEDIUM",
            text:
                "🤧 Symptoms suggest Influenza (Flu).\n" +
                "Rest and hydration advised.",
        };
    }

    // 🦠 Default early / mild fever
    return {
        severity: "BASIC",
        text:
            "🦠 Likely Viral Fever.\n" +
            "Rest, fluids, and monitoring advised.",
    };
}


// ---------------- MATCHING ----------------

function matchDiseases(text: string) {
    const t = normalize(text);

    return (knowledge as Disease[])
        .filter(d => {
            if (!d.gender_specific) return true;
            return d.gender_specific === state.gender;
        })
        .map(d => {
            let score = 0;
            d.primary_symptoms.forEach(s => t.includes(normalize(s)) && (score += 5));
            d.secondary_symptoms.forEach(s => t.includes(normalize(s)) && (score += 2));
            d.guard_keywords.forEach(g => t.includes(normalize(g)) && (score += 1));
            return score > 0 ? { disease: d, score } : null;
        })
        .filter(Boolean)
        .sort((a: any, b: any) => b.score - a.score);
}




// ---------------- FINAL RESPONSE ----------------

function finalResponse(): { text: string; severity: Severity } {
    const problem = normalize(expandWithAliases(state.userText));


    // 1️⃣ ABSOLUTE RED FLAGS (highest priority)
    const redFlag = redFlagCheck();
    if (redFlag) {
        return attachDoctorChatCTA(redFlag.text, redFlag.severity);
    }

    // 2️⃣ LOCATION-BASED EMERGENCIES
    const location = locationCheck();
    if (location) {
        return attachDoctorChatCTA(location.text, location.severity);
    }

    // 3️⃣ RESPIRATORY EMERGENCY CASES
    const respiratory = respiratoryEdgeCheck();
    if (respiratory) {
        return attachDoctorChatCTA(respiratory.text, respiratory.severity);
    }

    // 4️⃣ FOLLOW-UP QUESTION (only once)
    if (
        needsFollowUpQuestion(problem) &&
        !state.followUpAsked &&
        state.step === "DONE"
    ) {
        state.followUpAsked = true;
        state.step = "ASK_FOLLOWUP";
        return {
            severity: "MEDIUM",
            text: getFollowUpQuestion(problem),
        };
    }

    // 5️⃣ HEADACHE-SPECIFIC LOGIC
    if (problem.includes("headache") || problem.includes("head")) {
        const h = headacheLogic();
        return attachDoctorChatCTA(h.text, h.severity);
    }

    // 6️⃣ FEVER-SPECIFIC LOGIC
    if (problem.includes("fever")) {
        const f = feverLogic();
        return attachDoctorChatCTA(f.text, f.severity);
    }

    // 7️⃣ DATASET MATCHING (DEFAULT PATH)
    const matched = matchDiseases(problem);

    if (matched.length === 0) {
        return attachDoctorChatCTA(
            "I could not determine a specific condition.\nPlease consult a doctor.",
            "MEDIUM"
        );
    }

    const best = matched[0].disease;

    let severity: Severity = "MEDIUM";
    if (state.days > 3 && state.pain > 5) severity = "EMERGENCY";
    else if (state.days <= 2 && state.pain <= 2) severity = "BASIC";

    const text =
        `🩺 Possible Condition: ${best.possible_disease}\n` +
        `👨‍⚕️ Recommended Doctor: ${best.doctor_type}\n\n` +
        (severity === "EMERGENCY"
            ? "🚨 Please visit a hospital immediately.\n"
            : severity === "BASIC"
                ? "✅ This seems mild. Rest and monitor.\n"
                : "⚠️ Please consult a doctor if symptoms persist.\n");

    return attachDoctorChatCTA(text, severity);
}

