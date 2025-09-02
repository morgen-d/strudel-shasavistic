# strudel-shasavistic
Translates the Shasavistic system of music theory (by LΛMPLIGHT) into functions appropriate for Strudel.

Explanation in video: www.youtube.com/playlist?list=PLUPfWiftqUrIy3dMXdcpaYpGt6vZAeW5a

------------------Explanation of the System------------------------

This is a simple, but a relatively new, system that ends up being microtonal.
Going from lowest to highest frequency relationship from the root note, second-dimension syllabaries are ju (f/3/3/3) schu (f/3/3) fu (f/3) ah (f) chy (f*3) scy (f*3*3) xcy (f*3*3*3).
Third-dimension syllabaries are sru (f/5/5) su (f/5) ah (f) ly (f*5) dry (f*5*5). Fourth-dimension syllabaries are pru (f/7/7) pu (f/7) ah (f) my (f*7) mry (f*7*7). Fifth dimension syllabaries are kru (f/11/11) tschu (f/11) ah (f) zy (f*11) zry (f*11*11).

Any note that goes outside the range (f/2 <= u <= f*2) is multiplied or divided to fit. So if f is 100hz, ly evaluates to 100*5/2/2, or 125hz. Fourth dimensions and fifth dimensions should be given an increasingly broader limit of (f/4 <= u <= f*4) for fourth dimension and (f/8 <= u <= f*8) for the fifth.

It is possible to combine these pitch relationships, and their order in the word determines what is added or subtracted to produce the final singular pitch. For example, the pitch Chyli is (f*(3*5)), which when limited by the octave rule becomes 1500/2/2/2 = 187.5 hz in f=100. Fuli is (f/3*5), or 166.67hz. 

There are naming rules for this convention: the final ‘u’, if present, must be removed. Fu and Su make Fus, for instance ((f/3/5) evaluates to 53.333 when fitting the octave rule). Finally, ‘tsch’ becomes ‘k’ except before a vowel - so when combining Chy and Tschu and removing the ‘u’ from ‘tschu’ it becomes Chyk (f*3/11, evaluates to 27.27hz (not adjusted as fifth dimension relationships are allowed wider bounds).

For chords:
Capital letters denote new pitches. AhChyScy with f = 100 is [100, 150, 112.5] following aforementioned rules. AhChyChysScys is [100, 150, 60, 180]. There are naming conventions due to the order of the syllables that is not relevant here.
For inversions, a slash is written. Inversions make the inverted note the lowest through use of octaves just like in traditional music theory. Scy/AhChyScy is then [100, 150, 56.25].

Finally, the chord denotation system uses a shorthand for pitch relationships which allows transposition of chords. This is indicated by a hyphen ‘-’. An example: Chy-AhChyLy actually temporarily turns ‘Chy’ into the fundamental frequency and does pitch calculations based on this -- if f still is 100hz, temporarily f=150 (Chy) and an AhChyLy chord is calculated which evaluates to [150, 225, 187.5]. Note how this temporarily also breaks the bounding octave rule, because our new accepted range is (150/2 <= u <= 150*2). 

------------------Implementation in Strudel-----------------------

In the REPL: 

await (async () => { const res = await fetch('https://raw.githubusercontent.com/morgen-d/strudel-shasavistic/main/strudel-shasavistic-helper.js'); 
  const blob = await res.blob(); 
  const objURL = URL.createObjectURL(blob); 
  const script = document.createElement('script'); 
  script.src = objURL; 
  document.head.appendChild(script);
  
  while (typeof shasavFreqValue === 'undefined') { await new Promise(r => setTimeout(r, 100)); }
  
  console.log('shasavFreqValue is now available'); })();
  
  console.log(...shasavChordFreqArray("AhChyScy", 100))
  freq(...shasavChordFreqArray("AhChyScy", 100))
    console.log('shasavFreqValue is now available');
})();

freq(...shasavChordFreqArray("AhChyScy", 100)).s("piano")
