class WordPieceTokenizer {
  constructor(vocab) {
    this.vocab = vocab;
    this.clsId = vocab["[CLS]"] || 101;
    this.sepId = vocab["[SEP]"] || 102;
    this.unkId = vocab["[UNK]"] || 100;
    this.padId = vocab["[PAD]"] || 0;
  }

  tokenize(text) {
    // ✅ FIX: Replace punctuation with spaces instead of deleting them.
    // This ensures "fever/cold" becomes "fever cold" instead of "fevercold".
    const cleanText = text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ") // Replace non-alphanumeric with space
      .replace(/\s+/g, " ")         // Collapse multiple spaces into one
      .trim();

    const words = cleanText.split(" ");
    let tokenIds = [this.clsId];

    for (let word of words) {
      if (!word) continue;

      let start = 0;
      let hasUnknown = false; // Flag to track if we hit a dead end

      while (start < word.length) {
        let end = word.length;
        let curSubId = null;

        // Greedy Longest-Match-First Algorithm
        while (start < end) {
          let substr = (start === 0) ? word.substring(start, end) : "##" + word.substring(start, end);
          
          if (this.vocab.hasOwnProperty(substr)) {
            curSubId = this.vocab[substr];
            break;
          }
          end--;
        }

        if (curSubId === null) {
          // If we can't tokenize a part of the word, mark the whole word as UNK
          // and move to the next word.
          tokenIds.push(this.unkId);
          hasUnknown = true;
          break;
        }

        tokenIds.push(curSubId);
        start = end;
      }
      
      if (hasUnknown) continue; // If word had unknown parts, we already pushed UNK, so continue
    }

    tokenIds.push(this.sepId);
    return tokenIds;
  }
}

export default WordPieceTokenizer;