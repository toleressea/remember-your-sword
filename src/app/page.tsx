"use client";

import React, { useState, ChangeEvent, useEffect } from "react";

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

const Home = () => {
  const [bibleRef, setBibleRef] = useState<string>("");
  const [actualText, setActualText] = useState<string>("");
  const [status, setStatus] = useState<string>("No text loaded.");
  const [userText, setUserText] = useState<string>("");
  const [isCommuter, setIsCommuter] = useState<boolean>(false);
  const [translation, setTranslation] = useState<string>("ESV");
  const filterChars = /[.,\/#!?“”$%\^&\*;:{}=_`~()]/g;

  // const [fail, setFail] = useState<boolean>(false);
  // const failSound = new Audio('/fail.mp3');

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

  // useEffect(() => {
  //   if (fail) failSound.play();
  // }, [fail])

  // Book name to ID mapping for bolls.life API
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
        setStatus(`Text from ${bibleRef.toUpperCase()} (${translation}) loaded`);
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

  const revertToActual = (addNext: boolean) => {
    if (!actualText) return;

    // split the current response into words
    let actualWords = actualText.split(" ");

    if (!userText) {
      if (addNext) setUserText(actualWords[0]);
      return;
    }

    // split the user input into words
    let userInputWords = cleanText(userText).split(" ");
    let i = 0;
    while (i < userInputWords.length && userInputWords[i].toLowerCase() == actualWords[i].toLowerCase() && i < actualWords.length) {
      i++;
    }
    userInputWords = userInputWords.slice(0, i);
    
    if (addNext) {
      const nextWord = actualWords[userInputWords.length];
      if (isCommuter) {
        let msg = new SpeechSynthesisUtterance();
        msg.text = nextWord;
        window.speechSynthesis.speak(msg);
      }
      userInputWords.push(nextWord);
    }

    setUserText(userInputWords.join(" "));
  }

  const checkText = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserText(event.target.value);
  };

  const colorWord = (word: string, index: number) => {
    let actualWords = actualText.split(" ");
    if (index >= actualWords.length) return "text-red-500";
    return word.toLowerCase() === actualWords[index].toLowerCase()
      ? "text-green-600"
      : actualWords[index].toLowerCase().includes(word.toLowerCase())
      ? "text-yellow-600"
      : "text-red-500";
  };

  const cleanText = (input: string) => {
    let text = input.replace(/<\/?[^>]+(>|$)/g, ""); // Remove HTML tags
    text = text
      .replace(filterChars, "")
      .replace(/—/g, " ")
      .replace(/\s{2,}/g, " ");
    return text.toLowerCase().trimStart().trimEnd();
  };

  const endOfContentRef = React.useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    endOfContentRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [userText]);

  const handleCommuterChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsCommuter(event.target.checked);
  };

  return (
      <div
          className="p-4 bg-blue-100 rounded-lg shadow-md m-auto max-w-xl"
          style={{ marginTop: "16px" }}
      >
        <h3 className="p-4" style={{ color: "black", textAlign: "center" }}>
          NKJV Bible Memory Helper
        </h3>
        <span style={{ whiteSpace: "pre-line", color: "black" }}>
        1. Enter a book and chapter to work on, e.g. James 1:1-5 <br />
        2. Start typing from memory
        <br />
        <br />
        Notes:
        <br />
        - The text changes color to grade success
        <br />- Ignores most punctuation / capitalization
        <br />- Press Enter key for help with current / next word
        </span>
        <div className="flex space-x-2">
          <input
            type="text"
            value={bibleRef}
            onChange={(e) => setBibleRef(e.target.value)}
            placeholder="Enter bible reference (e.g., JOHN 3:1-5)"
            className="flex-grow p-2 border rounded text-black"
          />
          <select
            value={translation}
            onChange={(e) => setTranslation(e.target.value)}
            className="p-2 border rounded bg-white text-black"
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
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Load
          </button>
        </div>

        {actualText && (
            <>
              <button
                  onClick={populateActual}
                  className="w-full p-2 mb-4 rounded bg-blue-500 text-white"
              >
                See Full Text
              </button>
              <textarea
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      revertToActual(true);
                    }
                  }}
                  value={userText}
                  onChange={checkText}
                  className="w-full py-2 px-2 mb-0 rounded border border-blue-300 text-black"
                  placeholder="Type from memory..."
              />
            </>
        )}

        <hr
            style={{
              border: "none",
              height: "2px",
              backgroundColor: "black",
              marginTop: "8px",
              marginBottom: "8px",
            }}
        />

        {actualText && (
            <>
              <div className="space-x-1 overflow-auto max-h-64">
                {cleanText(userText)
                    .split(" ")
                    .map((word, wordIndex) => {
                      return (
                          <span
                              key={wordIndex}
                              className={"inline-block " + colorWord(word, wordIndex)}
                          >
                    {word}
                  </span>
                      );
                    })}
                <div ref={endOfContentRef} />
              </div>
            </>
        )}

        <hr
            style={{
              border: "none",
              height: "2px",
              backgroundColor: "black",
              marginTop: "8px",
            }}
        />
        <div style={{ textAlign: "center", marginTop: "8px" }}>
          <span style={{ color: "black" }}>{status}</span>
        </div>

        <hr
            style={{
              border: "none",
              height: "2px",
              backgroundColor: "black",
              marginTop: "8px",
            }}
        />

        <label style={{ color: "black" }}>
          <input
              type="checkbox"
              checked={isCommuter}
              onChange={handleCommuterChange}
          />
          {" "}Commuter
        </label>
        <span style={{ whiteSpace: "pre-line", color: "black" }}>
        <br />Check the box if you're commuting to gain access to the following voice commands:
        <br />- "memory go back" to undo a mistake
        <br />- "memory help" to add the next word
        </span>
      </div>
  );
};

export default Home;
