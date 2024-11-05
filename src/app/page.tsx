"use client";

import React, { useState, ChangeEvent, useEffect } from "react";

const Home = () => {
  const [bible, setBible] = useState<any>();
  const [bibleRef, setBibleRef] = useState<string>("");
  const [actualText, setActualText] = useState<string>("");
  const [status, setStatus] = useState<string>("No text loaded.");
  const [userText, setUserText] = useState<string>("");
  const [isCommuter, setIsCommuter] = useState<boolean>(false);
  const filterChars = /[.,\/#!?“”$%\^&\*;:{}=_`~()]/g;

  // const [fail, setFail] = useState<boolean>(false);
  // const failSound = new Audio('/fail.mp3');

  useEffect(() => {
    fetchBible();
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

  const fetchBible = async () => {
    try {
      const indexResponse = await fetch("/bible.json");
      if (!indexResponse.ok) {
        throw new Error(`HTTP error! status ${indexResponse.status}`);
      }
      await indexResponse.json().then((result: any) => {
        setBible(result);
      });
    } catch (error) {
      console.error("An error occurred.", error);
      setBible(undefined);
    }
  };

  const fetchChapter = () => {
    if (
      bible != undefined &&
      Object.keys(bible).includes(bibleRef.toUpperCase())
    ) {
      const rawText = bible[bibleRef.toUpperCase()];
      const cleanedText = cleanText(rawText);

      setActualText(cleanedText);
      setStatus(`Text from ${bibleRef.toUpperCase()} loaded`);
    } else {
      setStatus("Reference not found.");
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
    return text.toLowerCase();
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
        1. Enter a book and chapter to work on, e.g. James 1 <br />
        2. Start typing from memory
        <br />
        <br />
        Notes:
        <br />
        - The text changes color to grade success
        <br />- Ignores most punctuation / capitalization
        <br />- Press Enter key for help with current / next word
        </span>
        <input
            type="text"
            value={bibleRef}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setBibleRef(e.target.value)
            }
            className="w-full p-2 mb-4 rounded border border-blue-300 text-black"
            style={{ marginTop: "16px" }}
            placeholder="Enter Bible reference..."
        />

        <button
            onClick={fetchChapter}
            className="w-full p-2 mb-4 rounded bg-blue-500 text-white"
        >
          Load
        </button>

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
