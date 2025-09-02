(function(){
  const G = (typeof globalThis !== 'undefined') ? globalThis : (typeof window !== 'undefined') ? window : this;

  const SYLL_MAP = {
    'ju': {r: 1/27, dim:2}, 'schu': {r:1/9, dim:2}, 'fu':{r:1/3, dim:2},
    'ah': {r:1, dim:2}, 'chy':{r:3, dim:2}, 'scy':{r:9, dim:2}, 'xcy':{r:27, dim:2},
    'sru': {r:1/25, dim:3}, 'su':{r:1/5, dim:3}, 'ly':{r:5, dim:3}, 'dry':{r:25, dim:3},
    'pru': {r:1/49, dim:4}, 'pu':{r:1/7, dim:4}, 'my':{r:7, dim:4}, 'mry':{r:49, dim:4},
    'kru': {r:1/121, dim:5}, 'tschu':{r:1/11, dim:5}, 'zy':{r:11, dim:5}, 'zry':{r:121, dim:5}
  };
  const SHORT_MAP = { 's': {r:1/5, dim:3}, 'k': {r:1/11, dim:5} };
  const ALL_KEYS = Object.keys(SYLL_MAP).concat(Object.keys(SHORT_MAP)).sort((a,b)=>b.length-a.length);

  function normalizeToken(tok){
    if(typeof tok !== 'string') tok = String(tok);
    let s = tok.trim();
    s = s.replace(/tsch(?![aeiou])/gi,'k'); // tsch->k except before vowels
    return s.toLowerCase();
  }

  function parseCombined(token){
    let remaining = normalizeToken(token);
    let factor = 1;
    let maxDim = 2;
    while(remaining.length>0){
      let matched = false;
      for(const k of ALL_KEYS){
        if(remaining.startsWith(k)){
          const info = SYLL_MAP[k] || SHORT_MAP[k];
          factor *= info.r;
          if(info.dim > maxDim) maxDim = info.dim;
          remaining = remaining.slice(k.length);
          matched = true;
          break;
        }
      }
      if(!matched){
        if(remaining === 'u'){ remaining = ''; break; }
        remaining = remaining.slice(1); // permissive salvage
      }
    }
    return {factor, maxDim};
  }

  function fitToRange(freq, baseFreq, dim){
    let lower, upper;
    if(dim === 5){ lower = baseFreq/8; upper = baseFreq*8; }
    else if(dim === 4){ lower = baseFreq/4; upper = baseFreq*4; }
    else { lower = baseFreq/2; upper = baseFreq*2; }
    while(freq > upper) freq /= 2;
    while(freq < lower) freq *= 2;
    return freq;
  }

  function shasavFreqValue(token, baseFreq){
    baseFreq = (typeof baseFreq === 'number' && !isNaN(baseFreq)) ? baseFreq : 100;
    const parsed = parseCombined(token);
    let freq = baseFreq * parsed.factor;
    freq = fitToRange(freq, baseFreq, parsed.maxDim);
    return freq;
  }

  function splitChordTokens(chordStr){
    chordStr = String(chordStr || '').trim();
    const tokens = chordStr.match(/[A-Z][a-z0-9]*/g) || [];
    return tokens;
  }

  function shasavChordFreqArray(chordName, baseFreq){
    baseFreq = (typeof baseFreq === 'number' && !isNaN(baseFreq)) ? baseFreq : 100;
    let chordStr = String(chordName);
    let localBase = baseFreq;

    if(chordStr.indexOf('-') !== -1){
      const parts = chordStr.split('-',2);
      const transRoot = parts[0];
      chordStr = parts[1];
      localBase = shasavFreqValue(transRoot, baseFreq);
    }

    let inversion = null;
    if(chordStr.indexOf('/') !== -1){
      const parts = chordStr.split('/',2);
      inversion = parts[0];
      chordStr = parts[1];
    }

    const tokens = splitChordTokens(chordStr);
    const tokensSafe = (tokens.length===0) ? [chordStr] : tokens;
    let freqs = tokensSafe.map(t => shasavFreqValue(t, localBase));

    if(inversion){
      let idx = -1;
      for(let i=0;i<tokensSafe.length;i++){
        if(tokensSafe[i].toLowerCase() === String(inversion).toLowerCase()){ idx = i; break; }
      }
      if(idx >= 0){
        let invFreq = freqs[idx];
        const others = freqs.filter((_,i)=>i!==idx);
        const otherMin = (others.length>0) ? Math.min(...others) : invFreq;
        while(invFreq > otherMin) invFreq /= 2;
        freqs[idx] = invFreq;
      }
    }

    return freqs.map(v => +v.toFixed(6));
  }

  function freqToMidiDecimal(freq){
    return 69 + 12 * Math.log2(freq/440);
  }
  function shasavChordMidiArray(chordName, baseFreq){
    const arr = shasavChordFreqArray(chordName, baseFreq);
    return arr.map(f => +freqToMidiDecimal(f).toFixed(6));
  }

  // Expose to global scope for REPL usage
  G.shasavFreqValue = shasavFreqValue;
  G.shasavChordFreqArray = shasavChordFreqArray;
  G.shasavChordMidiArray = shasavChordMidiArray;

  return (typeof silence !== 'undefined') ? silence : (typeof mini !== 'undefined' ? mini() : undefined);
})();

