
export type Lang = "en" | "hi" | "pa";
type SectionStrings = {
  sectionIssues: string;
};
export const STRINGS: Record<Lang, any> = {
  en: {
    sectionIssues: "Common Health Issues",
    healthAwareness: "Health Awareness",
  },
  hi: {
    sectionIssues: "सामान्य स्वास्थ्य समस्याएँ",
    healthAwareness: "स्वास्थ्य जागरूकता",
  },
  pa: {
    sectionIssues: "ਆਮ ਸਿਹਤ ਸਮੱਸਿਆਵਾਂ",
    healthAwareness: "ਸਿਹਤ ਜਾਗਰੂਕਤਾ",
  },
};

export const COMMON_HEALTH_ISSUES: Record<
  Lang,
  {
    title: string;
    desc: string;
    emoji: string;
    color: string;
    tips: string;
  }[]
> = {
  en: [
    {
      title: "Headache",
      desc: "Pain due to stress or fatigue.",
      emoji: "🤕",
      color: "#1D4ED8",
      tips: "Take rest and drink water.",
    },
    {
      title: "Stomach Pain",
      desc: "Gas or indigestion.",
      emoji: "🤢",
      color: "#047857",
      tips: "Eat light food and avoid oily meals.",
    },
    {
      title: "Fever",
      desc: "Indicates infection.",
      emoji: "🤒",
      color: "#B45309",
      tips: "Drink fluids and rest.",
    },
    {
      title: "Cough & Cold",
      desc: "Runny nose and sore throat.",
      emoji: "🤧",
      color: "#7C3AED",
      tips: "Steam inhalation helps.",
    },
    {
      title: "BP / Sugar",
      desc: "Chronic condition.",
      emoji: "🩺",
      color: "#DC2626",
      tips: "Take medicines regularly.",
    },
  ],

  hi: [
    {
      title: "सिर दर्द",
      desc: "तनाव या थकान के कारण।",
      emoji: "🤕",
      color: "#1D4ED8",
      tips: "आराम करें और पानी पिएँ।",
    },
    {
      title: "पेट दर्द",
      desc: "गैस या बदहज़मी।",
      emoji: "🤢",
      color: "#047857",
      tips: "हल्का भोजन करें।",
    },
    {
      title: "बुखार",
      desc: "संक्रमण का संकेत।",
      emoji: "🤒",
      color: "#B45309",
      tips: "तरल पदार्थ पिएँ और आराम करें।",
    },
    {
      title: "खांसी / जुकाम",
      desc: "नाक बहना, गले में खराश।",
      emoji: "🤧",
      color: "#7C3AED",
      tips: "भाप लें।",
    },
    {
      title: "बीपी / शुगर",
      desc: "पुरानी बीमारी।",
      emoji: "🩺",
      color: "#DC2626",
      tips: "दवा समय पर लें।",
    },
  ],

  pa: [
    {
      title: "ਸਿਰ ਦਰਦ",
      desc: "ਥਕਾਵਟ ਜਾਂ ਤਣਾਅ ਕਾਰਨ।",
      emoji: "🤕",
      color: "#1D4ED8",
      tips: "ਆਰਾਮ ਕਰੋ ਅਤੇ ਪਾਣੀ ਪੀਓ।",
    },
    {
      title: "ਪੇਟ ਦਰਦ",
      desc: "ਗੈਸ ਜਾਂ ਬਦਹਜ਼ਮੀ।",
      emoji: "🤢",
      color: "#047857",
      tips: "ਹਲਕਾ ਖਾਣਾ ਖਾਓ।",
    },
    {
      title: "ਬੁਖਾਰ",
      desc: "ਇੰਫੈਕਸ਼ਨ ਦਾ ਸੰਕੇਤ।",
      emoji: "🤒",
      color: "#B45309",
      tips: "ਆਰਾਮ ਕਰੋ।",
    },
    {
      title: "ਖਾਂਸੀ / ਜੁਕਾਮ",
      desc: "ਗਲਾ ਖਰਾਬ।",
      emoji: "🤧",
      color: "#7C3AED",
      tips: "ਭਾਪ ਲਓ।",
    },
    {
      title: "ਬੀਪੀ / ਸ਼ੂਗਰ",
      desc: "ਪੁਰਾਣੀ ਸਮੱਸਿਆ।",
      emoji: "🩺",
      color: "#DC2626",
      tips: "ਦਵਾਈ ਨਿਯਮਿਤ ਲਓ।",
    },
  ],
};



//how to use 

type HowToStep = {
  step: string;
  title: string;
  desc: string;
};
export const HOW_TO_USE_STEPS = {
  en: [
    {
      step: "1",
      title: "Open the App",
      desc: "Open the app and choose your language.",
    },
    {
      step: "2",
      title: "Tell Your Problem",
      desc: "Select issues like headache, cough, or fever.",
    },
    {
      step: "3",
      title: "Read Simple Guidance",
      desc: "Understand what to do in simple language.",
    },
    {
      step: "4",
      title: "Visit Nearby Govt Hospital",
      desc: "If needed, visit the nearest government hospital.",
    },
  ],

  hi: [
    {
      step: "1",
      title: "ऐप खोलें",
      desc: "ऐप खोलें और अपनी भाषा चुनें।",
    },
    {
      step: "2",
      title: "समस्या बताएं",
      desc: "सर दर्द, खांसी, बुखार जैसी दिक्कत चुनें।",
    },
    {
      step: "3",
      title: "सरल सलाह पढ़ें",
      desc: "सरल भाषा में समझें क्या करना है।",
    },
    {
      step: "4",
      title: "नज़दीकी सरकारी अस्पताल जाएँ",
      desc: "ज़रूरत हो तो सरकारी अस्पताल में जाँच करवाएँ।",
    },
  ],

  pa: [
    {
      step: "1",
      title: "ਐਪ ਖੋਲ੍ਹੋ",
      desc: "ਐਪ ਖੋਲ੍ਹੋ ਅਤੇ ਆਪਣੀ ਭਾਸ਼ਾ ਚੁਣੋ।",
    },
    {
      step: "2",
      title: "ਸਮੱਸਿਆ ਦੱਸੋ",
      desc: "ਸਿਰ ਦਰਦ, ਖੰਘ ਜਾਂ ਬੁਖਾਰ ਚੁਣੋ।",
    },
    {
      step: "3",
      title: "ਸੌਖੀ ਸਲਾਹ ਪੜ੍ਹੋ",
      desc: "ਸੌਖੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸਮਝੋ।",
    },
    {
      step: "4",
      title: "ਨਜ਼ਦੀਕੀ ਸਰਕਾਰੀ ਹਸਪਤਾਲ ਜਾਓ",
      desc: "ਲੋੜ ਪਏ ਤਾਂ ਹਸਪਤਾਲ ਜਾਓ।",
    },
  ],
};
export default function CommonHealthIssuesRoute(): JSX.Element | null {
  return null;
}