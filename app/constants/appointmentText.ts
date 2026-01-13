export type Lang = "en" | "hi" | "pa";

export const APPOINTMENT_TEXT = {
    en: {
        title: "Book an Appointment",
        subtitle:
            "Fill your name, problem and preferred time.\nA government doctor will contact you.",
        fullName: "Full Name",
        fullNamePh: "Enter your full name",
        mobile: "Mobile Number",
        mobilePh: "10-digit number",
        age: "Age",
        problem: "Health Problem",
        problemPh: "e.g. Fever and cough for 3 days",
        date: "Preferred Date",
        datePh: "DD/MM/YYYY",
        time: "Preferred Time",
        timePh: "10:30 AM",
        submit: "Request Appointment",

        errors: {
            name: "Please enter a valid name.",
            mobile: "Mobile number must be 10 digits.",
            age: "Please enter a valid age.",
            problem: "Please describe your problem briefly.",
            date: "Enter a valid date (DD/MM/YYYY).",
            time: "Enter a valid time (10:30 AM).",
        },
        successTitle: "Appointment Requested",
        successMsg: "Your appointment request has been submitted.",
    },

    hi: {
        title: "अपॉइंटमेंट बुक करें",
        subtitle:
            "अपना नाम, समस्या और समय भरें।\nसरकारी डॉक्टर आपसे संपर्क करेंगे।",
        fullName: "पूरा नाम",
        fullNamePh: "अपना पूरा नाम लिखें",
        mobile: "मोबाइल नंबर",
        mobilePh: "10 अंकों का नंबर",
        age: "उम्र",
        problem: "स्वास्थ्य समस्या",
        problemPh: "जैसे: 3 दिन से बुखार",
        date: "पसंदीदा तारीख",
        datePh: "DD/MM/YYYY",
        time: "पसंदीदा समय",
        timePh: "10:30 AM",
        submit: "अपॉइंटमेंट रिक्वेस्ट करें",

        errors: {
            name: "कृपया सही नाम दर्ज करें।",
            mobile: "मोबाइल नंबर 10 अंकों का होना चाहिए।",
            age: "कृपया सही उम्र दर्ज करें।",
            problem: "कृपया समस्या लिखें।",
            date: "सही तारीख लिखें (DD/MM/YYYY)।",
            time: "सही समय लिखें (10:30 AM)।",
        },
        successTitle: "अपॉइंटमेंट अनुरोधित",
        successMsg: "आपकी अपॉइंटमेंट रिक्वेस्ट सबमिट हो गई है।",
    },

    pa: {
        title: "ਮੁਲਾਕਾਤ ਬੁੱਕ ਕਰੋ",
        subtitle:
            "ਆਪਣਾ ਨਾਮ, ਸਮੱਸਿਆ ਅਤੇ ਸਮਾਂ ਭਰੋ।\nਸਰਕਾਰੀ ਡਾਕਟਰ ਸੰਪਰਕ ਕਰਨਗੇ।",
        fullName: "ਪੂਰਾ ਨਾਮ",
        fullNamePh: "ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਲਿਖੋ",
        mobile: "ਮੋਬਾਈਲ ਨੰਬਰ",
        mobilePh: "10 ਅੰਕਾਂ ਦਾ ਨੰਬਰ",
        age: "ਉਮਰ",
        problem: "ਸਿਹਤ ਸਮੱਸਿਆ",
        problemPh: "ਜਿਵੇਂ: 3 ਦਿਨ ਤੋਂ ਬੁਖਾਰ",
        date: "ਪਸੰਦੀਦਾ ਤਾਰੀਖ",
        datePh: "DD/MM/YYYY",
        time: "ਪਸੰਦੀਦਾ ਸਮਾਂ",
        timePh: "10:30 AM",
        submit: "ਮੁਲਾਕਾਤ ਦੀ ਬੇਨਤੀ ਕਰੋ",

        errors: {
            name: "ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਨਾਮ ਦਿਓ।",
            mobile: "ਮੋਬਾਈਲ ਨੰਬਰ 10 ਅੰਕਾਂ ਦਾ ਹੋਣਾ ਚਾਹੀਦਾ ਹੈ।",
            age: "ਸਹੀ ਉਮਰ ਦਿਓ।",
            problem: "ਕਿਰਪਾ ਕਰਕੇ ਸਮੱਸਿਆ ਲਿਖੋ।",
            date: "ਸਹੀ ਤਾਰੀਖ ਦਿਓ।",
            time: "ਸਹੀ ਸਮਾਂ ਦਿਓ।",
        },
        successTitle: "ਮੁਲਾਕਾਤ ਦੀ ਬੇਨਤੀ ਕੀਤੀ ਗਈ",
        successMsg: "ਤੁਹਾਡੀ ਮੁਲਾਕਾਤ ਦੀ ਬੇਨਤੀ ਦਰਜ ਕਰ ਦਿੱਤੀ ਗਈ ਹੈ।",
    },
};
export default function __appointmentTextRouteShim(): any {
  return null;
}