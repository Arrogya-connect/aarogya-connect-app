export type Lang = "en" | "hi" | "pa";

export const CHATBOT_TEXT: Record<Lang, any> = {
  en: {
    title: "Chatbot Submission",
    subtitle: "Enter the number given by chatbot and your details.",
    queryNumber: "Query Number (Required)",
    queryNumberPh: "Number received from chat",
    phone: "Mobile Number (Required)",
    phonePh: "10-digit number",
    summary: "Summary (Optional)",
    summaryPh: "e.g. Fever for 2 days",
    attachments: "Photos / Videos (Optional, max 3)",
    voice: "Voice Message (Optional)",
    addFile: "Add File",
    startRecording: "Record",
    stopRecording: "Stop",
    play: "Play",
    submit: "Send",
    successTitle: "Success",
    successMsg: "Your information has been sent.",

    errors: {
      queryNumber: "Please enter the chatbot query number.",
      phone: "Enter a valid 10-digit mobile number.",
      content: "Provide at least summary, attachment or voice.",
    },
  },

  hi: {
    title: "चैटबॉट सबमिशन",
    subtitle: "चैटबॉट से मिला नंबर और विवरण भरें।",
    queryNumber: "क्वेरी नंबर (अनिवार्य)",
    queryNumberPh: "चैट से मिला नंबर",
    phone: "मोबाइल नंबर (अनिवार्य)",
    phonePh: "10 अंकों का नंबर",
    summary: "संक्षेप (वैकल्पिक)",
    summaryPh: "जैसे: 2 दिन से बुखार",
    attachments: "फोटो / वीडियो (वैकल्पिक, अधिकतम 3)",
    voice: "वॉयस संदेश (वैकल्पिक)",
    addFile: "फ़ाइल जोड़ें",
    startRecording: "रिकॉर्ड करें",
    stopRecording: "रिकॉर्ड रोकें",
    play: "बजाएँ",
    submit: "भेजें",
    successTitle: "सफल",
    successMsg: "आपकी जानकारी भेज दी गई है।",

    errors: {
      queryNumber: "कृपया क्वेरी नंबर डालें।",
      phone: "सही 10 अंकों का मोबाइल नंबर डालें।",
      content: "संक्षेप, फ़ाइल या वॉयस में से एक दें।",
    },
  },

  pa: {
    title: "ਚੈਟਬੋਟ ਸਬਮਿਸ਼ਨ",
    subtitle: "ਚੈਟਬੋਟ ਤੋਂ ਮਿਲਿਆ ਨੰਬਰ ਅਤੇ ਵੇਰਵਾ ਭਰੋ।",
    queryNumber: "ਕੁਏਰੀ ਨੰਬਰ (ਲਾਜ਼ਮੀ)",
    queryNumberPh: "ਚੈਟ ਤੋਂ ਮਿਲਿਆ ਨੰਬਰ",
    phone: "ਮੋਬਾਈਲ ਨੰਬਰ (ਲਾਜ਼ਮੀ)",
    phonePh: "10 ਅੰਕਾਂ ਦਾ ਨੰਬਰ",
    summary: "ਸੰਖੇਪ (ਚੋਣਵਾਂ)",
    summaryPh: "ਜਿਵੇਂ: 2 ਦਿਨ ਤੋਂ ਬੁਖਾਰ",
    attachments: "ਫੋਟੋ / ਵੀਡੀਓ (ਚੋਣਵਾਂ, ਵੱਧ ਤੋਂ ਵੱਧ 3)",
    voice: "ਵੌਇਸ ਸੁਨੇਹਾ (ਚੋਣਵਾਂ)",
    addFile: "ਫਾਈਲ ਜੋੜੋ",
    startRecording: "ਰਿਕਾਰਡ ਕਰੋ",
    stopRecording: "ਰੋਕੋ",
    play: "ਚਲਾਓ",
    submit: "ਭੇਜੋ",
    successTitle: "ਸਫਲ",
    successMsg: "ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ ਭੇਜੀ ਗਈ ਹੈ।",

    errors: {
      queryNumber: "ਕਿਰਪਾ ਕਰਕੇ ਕੁਏਰੀ ਨੰਬਰ ਦਿਓ।",
      phone: "ਸਹੀ 10 ਅੰਕਾਂ ਦਾ ਨੰਬਰ ਦਿਓ।",
      content: "ਘੱਟੋ-ਘੱਟ ਸੰਖੇਪ, ਫਾਈਲ ਜਾਂ ਵੌਇਸ ਦਿਓ।",
    },
  },
};
export default function __chatbotTextRouteShim(): any {
  return null;
}
