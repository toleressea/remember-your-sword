"use client";

import React, { useState, ChangeEvent, useEffect } from "react";

const Home = () => {
  const [bible, setBible] = useState<any>();
  const [bibleRef, setBibleRef] = useState<string>("");
  const [actualText, setActualText] = useState<string>("");
  const [status, setStatus] = useState<string>("No text loaded.");
  const [userText, setUserText] = useState<string>("");

  useEffect(() => {
    fetchBible();
  }, []);

  const filterChars = /[.,\/#!?“”$%\^&\*;:{}=_`~()]/g;

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
      const cleanedText = cleanHTML(rawText);

      setActualText(cleanedText);
      setStatus(`Text from ${bibleRef.toUpperCase()} loaded`);
    } else {
      setStatus("Reference not found.");
    }
  };

  const populateActual = () => {
    setUserText(actualText);
  };

  const replaceWord = () => {
    if (!actualText) return;

    // split the current response into words
    let actualWords = actualText.split(" ");

    if (userText) {
      // split the user input into words
      let userInputWords = userText.split(" ");

      // replace the current word with the correct word from the 'response' array
      let userWord = userInputWords[userInputWords.length - 1];
      let actualWord = actualWords[userInputWords.length - 1];
      if (userWord == actualWord)
        userInputWords.push(actualWords[userInputWords.length]);
      else userInputWords[userInputWords.length - 1] = actualWord;

      setUserText(userInputWords.join(" ") + " ");
    } else setUserText(actualWords[0] + " ");
  };

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

  const cleanHTML = (input: string) => {
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
                replaceWord();
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
            {cleanHTML(userText)
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
    </div>
  );
};

export default Home;
