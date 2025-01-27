"use client";

import React, { useState, ChangeEvent, useEffect, useRef } from "react";
import Drawer from "./components/Drawer";
import Settings from "./components/Settings";

interface BibleVerse {
  pk: number;
  verse: number;
  text: string;
}

interface ParsedReference {
  book: string;
  chapter: number;
  verses: number[];
}

const parseVerseReference = (reference: string): ParsedReference | null => {
  // First try to match specific verse pattern like "James 1:1-5"
  let match = reference.match(/^(\d?\s*[A-Za-z]+)\s*(\d+):(.+)$/);
  
  if (match) {
    const [, book, chapter, verseSection] = match;
    const verses = new Set<number>();

    // Split by comma to handle multiple ranges/numbers
    verseSection.split(',').forEach(part => {
      part = part.trim();
      if (part.includes('-')) {
        // Handle ranges like "1-5"
        const [start, end] = part.split('-').map(Number);
        for (let i = start; i <= end; i++) {
          verses.add(i);
        }
      } else {
        // Handle single verses
        verses.add(Number(part));
      }
    });

    return {
      book: book.trim(),
      chapter: parseInt(chapter),
      verses: Array.from(verses).sort((a, b) => a - b)
    };
  }

  // Try to match whole chapter pattern like "Revelation 10"
  match = reference.match(/^(\d?\s*[A-Za-z]+)\s*(\d+)$/);
  if (match) {
    const [, book, chapter] = match;
    return {
      book: book.trim(),
      chapter: parseInt(chapter),
      verses: [] // Empty array indicates whole chapter
    };
  }

  return null;
};

const filterVerses = (verses: BibleVerse[], selectedVerses: number[]): BibleVerse[] => {
  return verses.filter(verse => selectedVerses.includes(verse.verse));
};

const combineVerses = (verses: BibleVerse[], selectedVerses?: number[]): string => {
  let versesToProcess = verses;
  if (selectedVerses && selectedVerses.length > 0) {
    versesToProcess = filterVerses(verses, selectedVerses);
  }
  
  return versesToProcess
    .sort((a, b) => a.verse - b.verse)
    .map(verse => verse.text.replace(/<[^>]*>/g, ''))
    .join(' ');
};

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T) => void] => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      if (typeof window === 'undefined') {
        return initialValue;
      }
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.log(error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.log(error);
    }
  };

  return [storedValue, setValue];
};

const Home = () => {
  const [bibleRef, setBibleRef] = useState<string>("");
  const [actualText, setActualText] = useState<string>("");
  const [status, setStatus] = useState<string>("No text loaded.");
  const [userText, setUserText] = useState<string>("");
  const [isCommuter, setIsCommuter] = useState<boolean>(false);
  const [translation, setTranslation] = useLocalStorage<string>('preferredTranslation', 'NKJV');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [helpCounter, setHelpCounter] = useState(0);
  const filterChars = /[.,\/#!?“”$%\^&\*;:{}=_`~()]/g;
  const verseInputRef = useRef<HTMLTextAreaElement>(null);

  // Handle hydration and localStorage
  useEffect(() => {
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (hasHydrated) {
      setTranslation(translation);
    }
  }, [translation, hasHydrated]);

  useEffect(() => {
    // Remove fetchBible call since we'll fetch directly when needed
    // fetchBible();
  }, []);

  useEffect(() => {
    if (isCommuter) {
      const lc = userText.toLowerCase();
      if (lc.includes("memory go back")) {
        revertToActual(false);
        return;
      }

      if (lc.includes("memory help")) {
        revertToActual(true);
        return;
      }
    }
  }, [userText])

  const bookIds: { [key: string]: number } = {
    "GENESIS": 1, "GEN": 1,
    "EXODUS": 2, "EXO": 2,
    "LEVITICUS": 3, "LEV": 3,
    "NUMBERS": 4, "NUM": 4,
    "DEUTERONOMY": 5, "DEUT": 5,
    "JOSHUA": 6, "JOSH": 6,
    "JUDGES": 7, "JUDG": 7,
    "RUTH": 8,
    "1 SAMUEL": 9, "1SAM": 9,
    "2 SAMUEL": 10, "2SAM": 10,
    "1 KINGS": 11, "1KGS": 11,
    "2 KINGS": 12, "2KGS": 12,
    "1 CHRONICLES": 13, "1CHR": 13,
    "2 CHRONICLES": 14, "2CHR": 14,
    "EZRA": 15,
    "NEHEMIAH": 16, "NEH": 16,
    "ESTHER": 17, "EST": 17,
    "JOB": 18,
    "PSALMS": 19, "PS": 19,
    "PROVERBS": 20, "PROV": 20,
    "ECCLESIASTES": 21, "ECCL": 21,
    "SONG OF SOLOMON": 22, "SONG": 22,
    "ISAIAH": 23, "ISA": 23,
    "JEREMIAH": 24, "JER": 24,
    "LAMENTATIONS": 25, "LAM": 25,
    "EZEKIEL": 26, "EZEK": 26,
    "DANIEL": 27, "DAN": 27,
    "HOSEA": 28, "HOS": 28,
    "JOEL": 29,
    "AMOS": 30,
    "OBADIAH": 31, "OBAD": 31,
    "JONAH": 32,
    "MICAH": 33, "MIC": 33,
    "NAHUM": 34, "NAH": 34,
    "HABAKKUK": 35, "HAB": 35,
    "ZEPHANIAH": 36, "ZEPH": 36,
    "HAGGAI": 37, "HAG": 37,
    "ZECHARIAH": 38, "ZECH": 38,
    "MALACHI": 39, "MAL": 39,
    "MATTHEW": 40, "MATT": 40,
    "MARK": 41,
    "LUKE": 42,
    "JOHN": 43,
    "ACTS": 44,
    "ROMANS": 45, "ROM": 45,
    "1 CORINTHIANS": 46, "1COR": 46,
    "2 CORINTHIANS": 47, "2COR": 47,
    "GALATIANS": 48, "GAL": 48,
    "EPHESIANS": 49, "EPH": 49,
    "PHILIPPIANS": 50, "PHIL": 50,
    "COLOSSIANS": 51, "COL": 51,
    "1 THESSALONIANS": 52, "1THESS": 52,
    "2 THESSALONIANS": 53, "2THESS": 53,
    "1 TIMOTHY": 54, "1TIM": 54,
    "2 TIMOTHY": 55, "2TIM": 55,
    "TITUS": 56,
    "PHILEMON": 57, "PHLM": 57,
    "HEBREWS": 58, "HEB": 58,
    "JAMES": 59, "JAS": 59,
    "1 PETER": 60, "1PET": 60,
    "2 PETER": 61, "2PET": 61,
    "1 JOHN": 62, "1JN": 62,
    "2 JOHN": 63, "2JN": 63,
    "3 JOHN": 64, "3JN": 64,
    "JUDE": 65,
    "REVELATION": 66, "REV": 66
  };

  const fetchChapter = async () => {
    try {
      // Clear the user text and mistake count before loading new passage
      setUserText("");
      setMistakeCount(0);
      
      const reference = parseVerseReference(bibleRef);
      if (!reference) {
        setStatus("Please enter a valid reference (e.g., 'JOHN 3:1-5')");
        return;
      }

      // Check if we have a valid book ID
      const bookId = bookIds[reference.book.toUpperCase()];
      if (!bookId) {
        setStatus("Invalid book name. Please check the spelling.");
        return;
      }

      const response = await fetch(`https://bolls.life/get-text/${translation}/${bookId}/${reference.chapter}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status ${response.status}`);
      }
      const data = await response.json();
      if (Array.isArray(data) && data.length > 0) {
        let combinedText = combineVerses(data, reference.verses);
        const cleanedText = cleanText(combinedText);
        setActualText(cleanedText);
        setStatus("");
        // Focus the verse input after loading
        setTimeout(() => {
          verseInputRef.current?.focus();
        }, 100);
      } else {
        setStatus("No text found for this reference");
      }
    } catch (error) {
      console.error('Error:', error);
      setStatus("Error loading text. Please try again.");
    }
  };

  const populateActual = () => {
    setUserText(actualText);
  };

  const revertToActual = (help: boolean) => {
    if (!actualText) return;
    
    // Increment the help counter if help is true
    if (help) {
      setHelpCounter(prev => prev + 1);
    }

    // split the current response into words
    const actualWords = cleanText(actualText).split(" ");
    
    // Only show help if we haven't completed the verse
    if (userText) {
      const userWords = cleanText(userText).split(" ");
      if (userWords.length >= actualWords.length) {
        return;
      }
    }

    if (!userText) {
      if (help) setUserText(actualWords[0]);
      return;
    }

    // find the first word that doesn't match
    let userInputWords = cleanText(userText).split(" ");
    let i = 0;
    while (i < userInputWords.length && userInputWords[i] === actualWords[i]) {
      i++;
    }
    userInputWords = userInputWords.slice(0, i);
    
    if (help) {
      const nextWord = actualWords[userInputWords.length];
      if (isCommuter) {
        let msg = new SpeechSynthesisUtterance();
        msg.text = nextWord;
        window.speechSynthesis.speak(msg);
      }
      setUserText(userInputWords.concat([nextWord]).join(" "));
    } else {
      setUserText(userInputWords.join(" "));
    }
  }

  const checkText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newText = event.target.value;
    setUserText(newText);

    // Only check for mistakes if we have actual text to compare against
    if (actualText && newText.endsWith(" ")) {
      const userWords = newText.trim().split(" ");
      const actualWords = actualText.split(" ");
      const lastUserWord = userWords[userWords.length - 1];
      const actualWord = actualWords[userWords.length - 1];
      
      if (lastUserWord && actualWord) {
        const cleanUserWord = cleanText(lastUserWord);
        const cleanActualWord = cleanText(actualWord);
        
        // Count as mistake if words don't match at all
        if (!cleanActualWord.startsWith(cleanUserWord) && !cleanUserWord.startsWith(cleanActualWord)) {
          setMistakeCount(prev => prev + 1);
        }
      }
    }

    // Synchronize scroll position
    const textarea = event.target;
    const overlay = textarea.nextElementSibling as HTMLElement;
    if (overlay) {
      overlay.scrollTop = textarea.scrollTop;
    }
  };

  const handleScroll = (event: React.UIEvent<HTMLTextAreaElement>) => {
    const textarea = event.target as HTMLTextAreaElement;
    const overlay = textarea.nextElementSibling as HTMLElement;
    if (overlay) {
      overlay.scrollTop = textarea.scrollTop;
    }
  };

  const getBorderColor = () => {
    if (!actualText || !userText) return "gray";

    const cleanedUserText = cleanText(userText);
    if (actualText.startsWith(cleanedUserText)) {
      return "green";
    } else {
      return "red";
    }
  };

  const cleanText = (input: string) => {
    let text = input.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
    text = text
      .replace(filterChars, "")
      .replace(/—/g, " ")
      .replace(/\s{2,}/g, " ");
    return text.toLowerCase().trimStart().trimEnd();
  };

  const calculateProgress = () => {
    if (!actualText || !userText) return 0;
    
    const userWords = cleanText(userText).split(" ");
    const actualWords = cleanText(actualText).split(" ");
    let correctWords = 0;
    
    userWords.forEach((word, index) => {
      if (index < actualWords.length && cleanText(word) === actualWords[index]) {
        correctWords++;
      }
    });
    
    return Math.round((correctWords / actualWords.length) * 100);
  };

  const endOfContentRef = React.useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endOfContentRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [userText]);

  const handleCommuterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCommuter(event.target.checked);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Remember Your Sword</h1>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="p-3 rounded-lg hover:bg-gray-100"
          aria-label="Open settings"
        >
          <svg
            className="h-7 w-7 text-gray-600"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      <div className="space-y-8">
        <div>
          <div className="flex gap-3 items-stretch">
            <input
              type="text"
              value={bibleRef}
              onChange={(e) => setBibleRef(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  fetchChapter();
                }
              }}
              placeholder="Enter Bible reference (e.g., John 3:16)"
              className="flex-1 p-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="w-28 p-3 text-base border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              <option value="ESV">ESV</option>
              <option value="KJV">KJV</option>
              <option value="NKJV">NKJV</option>
              <option value="NIV">NIV</option>
              <option value="NASB">NASB</option>
              <option value="NLT">NLT</option>
              <option value="CSB">CSB</option>
              <option value="ASV">ASV</option>
              <option value="NRSV">NRSV</option>
              <option value="RSV">RSV</option>
            </select>
            <button
              onClick={fetchChapter}
              className="px-6 bg-blue-600 text-white text-base rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Load Verse
            </button>
          </div>
        </div>

        {status !== "No text loaded." && (
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="verseInput" className="text-base font-medium text-gray-700">
                  Enter the verse from memory:
                </label>
                <div className="space-x-4">
                  <button
                    onClick={() => revertToActual(true)}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
                    title="Press Enter for the next word"
                  >
                    Help Me
                    <span className="text-gray-500 text-xs border border-gray-300 rounded px-1">⏎</span>
                  </button>
                  <button
                    onClick={populateActual}
                    className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    Show Full Text
                  </button>
                </div>
              </div>
              {actualText && (
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-600 transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="text-gray-600 tabular-nums">
                      {calculateProgress()}%
                    </div>
                    <div className="text-red-600 tabular-nums flex items-center gap-1" title="Number of mistakes">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      {mistakeCount}
                    </div>
                    <div className="text-blue-600 tabular-nums flex items-center gap-1" title="Number of times help was used">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-4.42-2.79-8.59-7-9.719z" />
                      </svg>
                      {helpCounter}
                    </div>
                  </div>
                </div>
              )}
              <div className="relative">
                <textarea
                  id="verseInput"
                  ref={verseInputRef}
                  value={userText}
                  onChange={checkText}
                  onScroll={handleScroll}
                  onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          revertToActual(true);
                        }
                    }}
                    placeholder="Start typing the verse..."
                    className="w-full min-h-[10rem] max-h-[10rem] p-3 text-base rounded-lg shadow-sm bg-transparent resize-none overflow-auto whitespace-pre-wrap break-words"
                    style={{ caretColor: 'black', color: 'black', boxShadow: `0 0 0 2px ${getBorderColor()}`}} 
                />
              </div>
            </div>

            <div className="text-base text-gray-600 flex items-center justify-between">
              <div>{status}</div>
              <a 
                href="https://bolls.life/api/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-gray-400 hover:text-gray-600 hover:underline"
              >
                Bible text via bolls.life
              </a>
            </div>
          </div>
        )}
      </div>

      <Drawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        <Settings
          isCommuter={isCommuter}
          setIsCommuter={setIsCommuter}
        />
      </Drawer>
    </main>
  );
};

export default Home;
