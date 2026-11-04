/**
 * DeliverIQ Driver Voice Assistant (Web Speech API)
 * High-clarity spoken audio prompts in Marathi, Hindi & English
 * Designed specifically for low-literacy drivers at industrial gates.
 */

export type VoiceLanguage = 'mr' | 'hi' | 'en';

export interface SpokenPromptMap {
  takePhotoGuide: string;
  analyzingPhoto: string;
  successVerified: string;
  stampMissingRetake: string;
  blurryRetake: string;
  shortageNoted: string;
  retakeLimitReached: string;
  offlineSaved: string;
}

export const VOICE_PROMPTS: Record<VoiceLanguage, SpokenPromptMap> = {
  mr: {
    takePhotoGuide: 'कृपया पावतीचा स्वच्छ फोटो घ्या. वरचा शिक्का आणि स्वाक्षरी स्पष्ट दिसली पाहिजे.',
    analyzingPhoto: 'पावती तपासत आहे, कृपया थोडा वेळ थांबा.',
    successVerified: 'छान! पावती स्वीकारली गेली आहे. धन्यवाद, तुम्ही आता निघू शकता.',
    stampMissingRetake: 'कृपया पुन्हा फोटो काढा: पावतीवर ग्राहकाचा शिक्का स्पष्ट दिसत नाही.',
    blurryRetake: 'फोटो अस्पष्ट आला आहे. मोबाईल न हलवता स्वच्छ प्रकाशात पुन्हा फोटो काढा.',
    shortageNoted: 'मालाची तूट किंवा नुकसानीची नोंद झाली आहे. मुख्य कार्यालयाकडे तपासणीसाठी पाठवले आहे.',
    retakeLimitReached: 'फोटो स्वीकारला गेला आहे. पुढील तपासणी बिलिंग टीम करेल. तुम्ही पुढे जाऊ शकता.',
    offlineSaved: 'इंटरनेट नाही. फोटो मोबाईलमध्ये सुरक्षित ठेवला आहे, नेटवर्क आल्यावर आपोआप पाठवला जाईल.',
  },
  hi: {
    takePhotoGuide: 'कृपया रसीद की साफ़ फ़ोटो लें। मुहर और हस्ताक्षर साफ़ दिखने चाहिए।',
    analyzingPhoto: 'रसीद की जांच हो रही है, कृपया प्रतीक्षा करें।',
    successVerified: 'बहुत बढ़िया! रसीद स्वीकार कर ली गई है। धन्यवाद, आप प्रस्थान कर सकते हैं।',
    stampMissingRetake: 'कृपया दोबारा फ़ोटो लें: पार्टी की मुहर साफ़ नहीं दिख रही है।',
    blurryRetake: 'फ़ोटो धुंधली आई है। हाथ स्थिर रखकर अच्छी रोशनी में दोबारा खींचें।',
    shortageNoted: 'माल में कमी या नुक़सान की टिप्पणी दर्ज की गई है। बिलिंग अधिकारी समीक्षा करेंगे।',
    retakeLimitReached: 'फ़ोटो ले ली गई है। बिलिंग टीम इसकी जांच करेगी। आप आगे जा सकते हैं।',
    offlineSaved: 'इंटरनेट नहीं है। फ़ोटो सुरक्षित कर ली गई है, नेटवर्क आते ही अपलोड हो जाएगी।',
  },
  en: {
    takePhotoGuide: 'Please take a clear photo of the delivery receipt. Ensure stamp and signature are in frame.',
    analyzingPhoto: 'Verifying delivery receipt with AI, please wait.',
    successVerified: 'Great! Proof of delivery verified and approved. You are good to go.',
    stampMissingRetake: 'Please retake photo: Consignee rubber stamp is missing or faint.',
    blurryRetake: 'Photo is blurry. Please hold steady in good lighting and retake.',
    shortageNoted: 'Shortage or damage remark noted. Escalated to billing executive.',
    retakeLimitReached: 'Photo accepted and routed to billing team for verification. You may leave the gate.',
    offlineSaved: 'Offline mode active. POD stored locally, will auto-sync when online.',
  },
};

export function speakPrompt(
  promptKey: keyof SpokenPromptMap,
  lang: VoiceLanguage = 'mr'
): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any active speech

    const text = VOICE_PROMPTS[lang][promptKey];
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate voice code
    if (lang === 'mr') {
      utterance.lang = 'mr-IN';
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = 0.95; // Slightly slower for crisp clarity over truck engine noise
    utterance.pitch = 1.0;

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
  }
}
