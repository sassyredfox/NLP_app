import React, { useState } from "react";
import { ArrowLeftRight, Copy, Volume2, Check } from "lucide-react";
import { useNLP } from "../contexts/NLPContext";
import LoadingSpinner from "../components/LoadingSpinner";

const Translation: React.FC = () => {
  const { state, addToHistory, setLoading } = useNLP();

  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("en");
  const [targetLang, setTargetLang] = useState("es");
  const [isCopied, setIsCopied] = useState(false);

  const languageOptions = [
    { code: "en", name: "English" },
    { code: "es", name: "Spanish" },
    { code: "fr", name: "French" },
    { code: "de", name: "German" },
    { code: "it", name: "Italian" },
    { code: "pt", name: "Portuguese" },
    { code: "ru", name: "Russian" },
    { code: "ja", name: "Japanese" },
    { code: "ko", name: "Korean" },
    { code: "zh", name: "Chinese" },
    { code: "ar", name: "Arabic" },
    { code: "hi", name: "Hindi" },
  ];

  const swapLanguages = () => {
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setSourceText(translatedText);
    setTranslatedText(sourceText);
  };

  const handleTranslate = async () => {
    if (!sourceText.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: sourceText,
          source_lang: sourceLang,
          target_lang: targetLang,
        }),
      });

      if (!res.ok) throw new Error("API request failed");

      const data = await res.json();
      setTranslatedText(data.translation);

      addToHistory({
        type: "translation",
        input: sourceText,
        output: data.translation,
        metadata: {
          fromLang: languageOptions.find((l) => l.code === sourceLang)?.name,
          toLang: languageOptions.find((l) => l.code === targetLang)?.name,
        },
      });
    } catch (err) {
      console.error("Translation error:", err);
      setTranslatedText("⚠️ Unable to translate. Please try again.");
    }

    setLoading(false);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(translatedText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const speak = (text: string, lang: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    speechSynthesis.speak(utterance);
  };

  const renderLangSelect = (
    value: string,
    onChange: (val: string) => void
  ) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg 
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 
                 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
    >
      {languageOptions.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Heading */}
      <div className="text-center space-y-4">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r 
                       from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Text Translation
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">
          Translate text between multiple languages with high accuracy
        </p>
      </div>

      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-xl 
                      p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        {/* Language selectors */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {renderLangSelect(sourceLang, setSourceLang)}

          <button
            onClick={swapLanguages}
            className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 
                       text-gray-600 dark:text-gray-300 hover:bg-gray-200 
                       dark:hover:bg-gray-600 transition-colors duration-200"
          >
            <ArrowLeftRight className="w-5 h-5" />
          </button>

          {renderLangSelect(targetLang, setTargetLang)}
        </div>

        {/* Text areas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Source */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {languageOptions.find((l) => l.code === sourceLang)?.name}
              </h3>
              {sourceText && (
                <button
                  onClick={() => speak(sourceText, sourceLang)}
                  className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 
                             text-blue-600 dark:text-blue-400 hover:bg-blue-200 
                             dark:hover:bg-blue-900/70 transition-colors duration-200"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              )}
            </div>
            <textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              placeholder="Enter text to translate..."
              className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 
                         dark:text-gray-100 focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent resize-none"
            />
          </div>

          {/* Translated */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {languageOptions.find((l) => l.code === targetLang)?.name}
              </h3>
              {translatedText && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => speak(translatedText, targetLang)}
                    className="p-2 rounded-lg bg-green-100 dark:bg-green-900/50 
                               text-green-600 dark:text-green-400 hover:bg-green-200 
                               dark:hover:bg-green-900/70 transition-colors duration-200"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/50 
                               text-purple-600 dark:text-purple-400 hover:bg-purple-200 
                               dark:hover:bg-purple-900/70 transition-colors duration-200"
                  >
                    {isCopied ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              )}
            </div>
            <textarea
              value={translatedText}
              readOnly
              placeholder="Translation will appear here..."
              className="w-full h-40 p-4 border border-gray-300 dark:border-gray-600 
                         rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 
                         dark:text-gray-100 resize-none"
            />
          </div>
        </div>

        {/* Translate button */}
        <div className="flex justify-center mt-6">
          <button
            onClick={handleTranslate}
            disabled={!sourceText.trim() || state.isLoading}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 
                       text-white rounded-lg font-medium hover:from-blue-600 
                       hover:to-purple-700 disabled:opacity-50 
                       disabled:cursor-not-allowed transition-all duration-200 
                       transform hover:scale-105 flex items-center space-x-2"
          >
            {state.isLoading ? <LoadingSpinner /> : <span>Translate</span>}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Translation;
