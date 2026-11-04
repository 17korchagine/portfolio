(() => {
  const MAX_WORDS = 10000;
  const PHI = (1 + Math.sqrt(5)) / 2;  // golden ratio
  const MAX_LEVEL = 9;                 // smallest size class: focus / φ⁹
  const IMG_MAX = 1 / 3;               // widest image: a third of the screen width
  const IMG_STEPS = 2;                 // image sizes: 1/3, 1/3φ, 1/3φ² of the width (smallest ≈ 13%)
  const IMG_TALL = 0.6;                // portrait images never exceed 60% of the height
  const IMG_AREA = 0.4;                // images together never cover more than 40% of the screen
  const COL_LEVEL = 3;                 // text at size class φ⁻³ and smaller breaks into newspaper columns
  const COL_WIDTH_EM = [10, 15, 24, 50];
  const COL_SIZE_STEPS = [7, 9.5, 13];
  const COL_MIN_W = 22;                // columns never get narrower than this (px)
  const IMG_COL_TALL = 0.3;            // a picture inside a column is at most 30% of the height
  const COL_CHARS_PER_IMG = 700;       // a column block takes a picture only with ≥ 700 characters per picture

  // Columns can be switched off (button, key C, or ?columns=off). Remembered per browser.
  let columnsOn = (() => {
    try {
      const q = new URLSearchParams(location.search).get('columns');
      if (q) return !/^(0|off|false|no)$/i.test(q);
      const v = localStorage.getItem('text-resize-columns');
      return v === null ? true : v === '1';
    } catch { return true; }
  })();

  // Size classes step down by φ. Each class holds φ² more items than the one
  // above (1, 3, 7, 18, 47, 123 … per side), so every class claims a similar share
  // of the screen and the mid sizes stay well represented.
  const LEVEL_AT = (() => {
    const out = [0];
    let L = 1, band = 1;
    for (let d = 1, left = 1; d <= 20000; d++) {
      out.push(L);
      if (--left === 0 && L < MAX_LEVEL) { L++; band *= PHI * PHI; left = Math.round(band); }
    }
    return out;
  })();

  const stage = document.getElementById('stage');
  const flow = document.getElementById('flow');
  const measure = document.getElementById('measure');
  const probe = document.getElementById('probe');
  const editor = document.getElementById('editor');
  const input = document.getElementById('input');
  const count = document.getElementById('count');
  const goBtn = document.getElementById('goBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  const editBtn = document.getElementById('editBtn');
  const colBtn = document.getElementById('colBtn');

  // top columns / middle / bottom columns, once for the measuring copy and once for the visible one
  const mkBands = parent => [0, 1, 2].map(k => {
    const d = document.createElement('div');
    d.className = k === 1 ? 'band' : 'band cols';
    return parent.appendChild(d);
  });
  const mBands = mkBands(measure), fBands = mkBands(flow);
  let order = [], groups = [[], [], []], bandOf = [], lastSizes = null;
  const colW = [0, 0, 0], colImgH = [0, 0, 0], bandCount = [1, 1, 1];
  // Balancing columns is the slowest thing the browser does here (~65 ms for a long text), so the
  // many measuring passes use a fixed column height found by a quick overflow check instead;
  // one balanced pass at the end confirms it (and redoes everything exactly if it doesn't fit).
  let fastBands = true, lastExtra = 0;
  const calib = [1, 1, 1];            // learned ratio between estimated and real column height
  const EST_CHAR_W = 0.52;            // average character width in em, for the height estimate
  const filesInput = document.getElementById('files');
  const thumbs = document.getElementById('thumbs');

  const images = new Map();   // n -> { src, aspect, name }
  let nextImage = 1;
  const TOKEN = /\[image (\d+)\]/gi;

  let items = [];
  let focus = 0;
  let flowSpans = [], measureSpans = [];
  let totalChars = 0;

  input.value = `This interview started at approximately 9:30 AM on Sunday, November 24, 1963. The interview was conducted in the office of Captain Will Fritz of the Homicide Bureau, Dallas Police. Present at the interview in addition to Oswald were Captain Fritz, Postal Inspector Holmes, SAIC Sorrels, Inspector Kelley and four members of the Homicide Squad. The interview had just begun when I arrived and Captain Fritz was again requesting Oswald to identify the place where the photograph of him holding the gun was taken. Captain Fritz indicated that it would save the Police a great deal of time if he would tell them where the place was located. Oswald refused to discuss the matter. Captain Fritz asked, “Are you a Communist?” Oswald answered, “No, I am a Marxist but I am not a Marxist Leninist”. Captain Fritz asked him what the difference was and Oswald said it would take too long to explain it to him. Oswald said that he became interested in the Fair Play for Cuba Committee while he was in New Orleans; that he wrote to the Committee’s Headquarters in New York and received some Committee literature and a letter signed by Alex Hidell. He stated that he began to distribute that literature in New Orleans and it was at that time that he got into an altercation with a group and he was arrested. He said his opinions concerning Fair Play for Cuba are well known; that he appeared on Bill Stukey’s television program in New Orleans on a number of occasions and was interviewed by the local press often. He denies knowing or ever seeing Hidell in New Orleans, said he believed in all of the tenets of the Fair Play for Cuba and the things which the Fair Play for Cuba Committee stood for which was free intercourse with Cuba and freedom for tourists of the both countries to travel within each other’s borders.

Among other things, Oswald said that Cuba should have folded full diplomatic relationship with the United States. I asked him if he thought that the President’s assassination would have any effect on the Fair Play for Cuba Committee. He said there would be no change in the attitude of the American people toward Cuba with President Johnson becoming President because they both belonged to the same political party and the one would follow pretty generally the policies of the other. He stated that he is an avid reader of Russian literature whether it is communistic or not; that he subscribes to “The Militant”, which, he says, is the weekly of the Socialist party in the United States (it is a copy of “The Militant” that Oswald is shown holding in the photograph taken from his effects at Irving Street). At that time he asked me whether I was an FBI Agent and I said that I was not that I was a member of the Secret Service. He said when he was standing in front of the Textbook Building and about to leave it, a young crew-cut man rushed up to him and said he was from the Secret Service, showed a book of identification, and asked him where the phone was. Oswald said he pointed toward the pay phone in the building and that he saw the man actually go to the phone before he left.

630 I asked Oswald whether as a Marxist he believed that religion was an opiate of the people and he said very definitely so that all organized religions tend to become monopolistic and are the causes of a great deal of class warfare. I asked him whether he considered the Catholic Church to be an enemy of the Communist philosophy and he said well, there was no Catholicism in Russia; that the closest to it is the Orthodox Churches but he said he would not further discuss his opinions of religion since this was an attempt to have him say something which could be construed as being anti-religious or anti Catholic.

Capt. Fritz displayed an Enco street map of Dallas which had been found among Oswald’s effects at the rooming house. Oswald was asked whether the map was his and whether he had put some marks on it. He said it was his and remarked “My God don’t tell me there’s a mark near where this thing happened”. The mark was pointed out to him and he said “What about the other marks on the map?—I put a number of marks on it. I was looking for work and marked the places where I went for jobs or where I heard there were jobs”.

Since it was obvious to Captain Fritz that Oswald was not going to be cooperative, he terminated the interview at that time.

I approached Oswald then and, out of the hearing of the others except perhaps one of Captain Fritz’s men, said that as a Secret Service agent, we are anxious to talk with him as soon as he had secured counsel; that we were responsible for the safety of the President; that the Dallas Police had charged him with the assassination of the President but that he had denied it; we were therefore very anxious to talk with him to make certain that the correct story was developing as it related to the assassination. He said that he would be glad to discuss this proposition with his attorney and that after he talked to one, we could either discuss it with him or discuss it with his attorney, if the attorney thought it was the wise thing to do, but that at the present time he had nothing more to say to me. Oswald was then handed some different clothing to put on. The clothing included a sweater. Captain Fritz made a number of telephone calls to ascertain whether the preparations he had placed into effect for transferring the prisoner to the County Jail were ready and upon being so advised, Captain Fritz and members of the Detective Bureau escorted Oswald from the Homicide Office on the third floor to the basement where Oswald was shot by Jack Ruby.

On the completion of the interview, SAIC Sorrels and I proceeded to the office of the Chief of Police on the third floor and were discussing the interview when we heard that Oswald had been shot. We both ran down the steps to the basement. I arrived in the ante-room where they had dragged Oswald. SAIC Sorrels located and interviewed Ruby. Someone was bending over Oswald with a stethoscope and he appeared to be unconscious in very serious condition at that time. I asked Captain Fritz what had happened and he said Oswald had been shot by one Jack “Rubio” whom the police knew as a tavern operator. Shortly thereafter a stretcher arrived and I accompanied the stretcher to the ambulance which had been hastily backed into the garage. I observed that during the transfer that Oswald was unconscious; when the ambulance drove away from the building, I attempted to board a cruiser that apparently was going to follow the ambulance but I was unable to get into the car before it pulled away. Special Agents Warner and Patterson had heard of the shooting on their radio, proceeded to Parkland Hospital where Oswald was being taken and arrived vary shortly after Oswald had arrived at the emergency entrance and was631 being taken into the emergency treatment room. One or the other of these agents was in close proximity to Oswald while he was being treated. When I arrived at the hospital, I rode up on the elevator with Dr. Shaw who had looked at Oswald as he had come in and was being recalled to the operating room where Oswald had been taken. While Oswald was in the operating room, no one other than medical personnel was present but a Dallas policeman who had accompanied Oswald in the ambulance was standing in the doorway of the operating room in operating room scrub clothes. No other investigating personnel were in the vicinity. In the immediate vicinity of the detective was Special Agent Warner. Oswald made no statements from the time he was shot until the time of his death. He was unconscious during the ambulance run to the hospital which I verified through Detective Daugherty, who accompanied him. He did not regain consciousness at any time during the treatment until he died. At the time of his death, myself, Detective Daugherty and Colonel Garrison of the Texas State Police were on the fifth floor of the hospital arranging a security room in which to take Oswald, in the event he survived the operating room treatment. It was never necessary to use this room and upon learning of his death, I proceeded to the morgue to arrange for his family to view the body. When the family heard of the death they were in the process of being interviewed by Special Agents Kunkel and Howard, and requested to be brought to the hospital. Oswald’s brother, Robert, who had also come to the hospital, was being interviewed by Special Agent Howlett. Before the post mortem was performed, Oswald’s family, with the exception of Robert, viewed the body. Robert arrived too late to view the body before the autopsy had started and was not permitted by hospital authorities to view the body. The family was accompanied during the viewing by the hospital chaplain.

After making arrangements through the chaplain and another clergyman for the burial of the body, the family was returned to a secluded spot under the protection of Special Agents Kunkel and Howard, and the Irving Texas police. Precaution was taken to insure their safety in view of the excitement caused by the killing of Oswald. Special Agents Howard and Kunkel did an excellent job in handling the security of this family detail and insuring their safety. Thereafter, I was called by SAIC Bouck who advised me that the President and the Attorney General were concerned about the safety of this family and instructed that all precautions should be taken to insure that no harm befell them. SAIC Bouck was advised that the family was presently under our protection; we would continue providing protection until further notice.

Later that same day, I was contacted by SA Robertson of the FBI who asked whether we had someone with the family. He was assured that we had. He requested to be advised where the family had been taken. Since their ultimate destination was unknown to me at the time, I assured him that when I learned of their whereabouts I would relay it to him. He said that they received instructions from the Attorney General and President Johnson that precaution should be taken to insure the family safety.

At 11 pm, Sunday, November 24th, I was advised of the location of the family and immediately notified Robertson and inquired whether they now wished to take over their protection. He said no they had no such instructions, they merely wished to be assured that someone was looking out for their safety. I assured them that632 adequate protection was being provided and that they were available for interviews by the FBI. He stated that they did not wish to interview the family at this time; that they merely wanted to make sure they were in safe hands.

TJK:VS

633
REPORT OF U.S. POSTAL INSPECTOR H. D. HOLMES

Dallas, Texas

December 17, 1963

MEMORANDUM OF INTERVIEW

Informal memorandum furnished by Postal Inspector H. D. Holmes, Dallas, Texas, of an interview he took part in with Lee H. Oswald on Sunday morning, November 24, 1963, between the approximate hours of 9:25 a.m. to 11:10 a.m. Those present, in addition to Inspector Holmes, were Captain Will Fritz, Dallas Police, Forrest V. Sorrels, Local Agent in Charge, Secret Service, and Thomas J. Kelly, Inspector, Secret Service. In addition, there were three Detectives who were apparently assigned to guarding Oswald as none of them took part in the interrogation.

Oswald at no time appeared confused or in doubt as to whether or not he should answer a question. On the contrary, he was quite alert and showed no hesitancy in answering those questions which he wanted to answer, and was quite skillful in parrying those questions which he did not want to answer. I got the impression that he had disciplined his mind and reflexes to a state where I personally doubted if he would ever have confessed. He denied, emphatically, having taken part in or having had any knowledge of the shooting of the policeman Tippitt or of the President, stating that so far as he is concerned the reason he was in custody was because he “popped a policeman in the nose in a theater on Jefferson Avenue.”

P. O. BOXES—He was questioned separately about the three boxes he had rented, and in each instance his answers were quick, direct and accurate as reflected on the box rental applications. He stated without prompting that he had rented Box 2915 at the Main Post Office for several months prior to his going to New Orleans, that this box was rented in his own name, Lee H. Oswald, and that he had taken out two keys to the box, and that when he had closed the box, he directed that his mail be forwarded to him at his street address in New Orleans.

He stated that no one received mail in this box other than himself, nor did he receive any mail under any other name than his own true name; that no one had access to the box other than himself nor did he permit anyone else to use this box. He stated it was possible that on rare occasions he may have handed one of the keys to his wife to go get his mail but certainly nobody else. He denied emphatically that he ever ordered a rifle under his name or any other name, nor permitted anyone else to order a rifle to be received in this box. Further, he denied that he had ever ordered any rifle by mail order or bought any money order for the purpose of paying for such a rifle. In fact, he claimed he owned no rifle and had not practiced or shot a rifle other than possibly a .22, small bore rifle, since his days with the Marine Corp. He stated that “How could I afford to order a rifle on my salary of $1.25 an hour when I can’t hardly feed myself on what I make.”

634

When asked if he had a post office box in New Orleans he stated that he did, for the reason that he subscribed to several publications, at least two of which were published in Russia, one being the hometown paper published in Minsk where he met and married his wife, and that he moved around so much that it was more practical to simply rent post office boxes and have his mail forwarded from one box to the next rather than going through the process of furnishing changes of address to the publishers. When asked if he permitted anyone other than himself to get mail in box 30061 at New Orleans, he stated that he did not. It will be recalled that on this box rent application he showed that both Marina Oswald and A. J. Hidell were listed under the caption “Persons entitled to receive mail through box”. After denying that anyone else was permitted to get mail in the box, he was reminded that this application showed the name Marina Oswald as being entitled to receive mail in the box and he replied “well so what, she was my wife and I see nothing wrong with that, and it could very well be that I did place her name on the application”. He was then reminded that the application also showed the name A. J. Hidell was also entitled to receive mail in the box, at which he simply shrugged his shoulders and stated “I don’t recall anything about that”.

He stated that when he came back to Dallas and after he had gone to work for the Texas School Book Depository, he had rented a box at the nearby Terminal Annex postal station, this being Box 6225, and that this box was also rented in his name, Lee H. Oswald. He stated he had only checked out one key for this box, which information was found to be accurate, and this key was found on his person at the time of his arrest. He professed not to recall the fact that he showed on the box rental application under name of corporation “Fair Play For Cuba Committee” and “American Civil Liberties Union”. When asked as to why he showed these organizations on the application, he simply shrugged and said that he didn’t recall showing them. When asked if he paid the box rental fee or did the organizations pay it, he stated that he paid it. In answer to another question, he also stated that no one had any knowledge that he had this box other than himself.

ORGANIZATIONS- MEMBERSHIP IN—With respect to American Civil Liberties Union he was a little evasive stating something to the effect that he had made some effort to join but it was never made clear whether he had or had not been accepted. He stated that he first became interested in the Fair Play for Cuba Committee, after he went to New Orleans, that it started out as being a group of individuals who, like him, who thought and had like political opinions. They did decide to organize, and did organize after a fashion, but denied that they had any president or any elected officers. He stated that he, himself, could probably be considered the secretary since he wrote some letters on their behalf and attempted to collect dues which, if I recall, were $1.00 per month. He also stated that there was a “Fair Play for Cuba Committee” in New York which was better organized. He denied that he was sent to Dallas for the purpose of organizing such a cell in Dallas.

635

When asked if he was a communist, he stated emphatically not, that he was a Marxist. Someone asked the difference and he stated that a communist is a Lenin-Marxist, that he himself was a pure Marxist, and when someone asked the difference, he stated that it was a long story and if they didn’t know, it would take too long to tell them. He stated further that he had read about everything written by or about Karl Marx.

When asked as to his religion, he stated that Karl Marx was his religion, and in response to further questioning he stated that some people may find the Bible interesting reading, but it was not for him, stating further that even as a philosophy there was not much to the Bible.

MARINE CORP SERVICE—Captain Fritz made some mention of his dishonorable discharge from the Marine Corp at which point he bristled noticeably, stating that he had been discharged with an “honorable” discharge and that this was later changed due to his having attempted to denounce his American Citizenship while he was living in Russia. He stated further that since his change of citizenship did not come to pass, he had written a letter to Mr. Connally, then Secretary of the Navy, and after considerable delay, received a very respectful reply wherein Connally stated he had resigned to run for Governor of Texas, and that his letter was being referred to the new Secretary, a Mr. Cork, Kurth, or something like that. He showed no particular animosity toward Mr. Connally while discussing this feature.

MAP—Captain Fritz advised him that among his effects in his room, there was found a map of the City of Dallas that had some marks on it and asked him to explain this map. Oswald said he presumed he had reference to an old City map which he had on which he had made some X’s denoting location of firms that had advertised job vacancies. He stated that he had no transportation and either walked or rode a bus and that as he was constantly looking for work, in fact had registered for employment at the Texas Employment Bureau, and that as he would receive leads either from newspaper ads or from the Bureau or from neighbors, he would chart these places on the map to save time in his traveling. He said to the best of his recollection, most of them were out Industrial, presumably meaning Industrial Blvd. When asked as to why the X at the location of the Texas School Book Depository at Elm and Houston, he stated that “Well, I interviewed there for a job, in fact, got the job, therefore the X”.

When asked as to how he learned about this vacancy, he stated that “Oh, it was general information in the neighborhood, I don’t recall just who told me about it, but I learned it from people in Mrs. Paynes’ neighborhood” and that all the people around there were looking out for possible employment for him.

ACTIVITY JUST PRIOR TO AND IMMEDIATELY FOLLOWING ASSASSINATION ATTEMPT—To an inquiry as to why he went to visit his wife on Thursday night, November 21, whereas he normally visited her over the weekend, he stated that on this particular weekend he had learned that his wife and Mrs. Payne were giving a party for the children and that they were having in a “houseful” of neighborhood children and that he just didn’t want to be around at such a time. Therefore, he made his weekly visit on Thursday night.

636

When asked if he didn’t bring a sack with him the next morning to work, he stated that he did, and when asked as to the contents of the sack, he stated that it contained his lunch. Then, when asked as to the size or shape of the sack, he said “Oh, I don’t recall, it may have a small sack or a large sack, you don’t always find one that just fits your sandwiches.” When asked as to where he placed the sack when he got in the car, he said in his lap, or possibly the front seat beside him, as he always did because he didn’t want to get it crushed. He denied that he placed any package in the back seat. When advised that the driver stated that he had brought out a long parcel and placed it in the back seat, he stated “Oh, he must be mistaken or else thinking about some other time when he picked me up.”

When asked as to his whereabouts at the time of the shooting, he stated that when lunch time came, and he didn’t say which floor he was on, he said one of the Negro employees invited him to eat lunch with him and he stated “You go on down and send the elevator back up and I will join you in a few minutes.” Before he could finish whatever he was doing, he stated, the commotion surrounding the assassination took place and when he went down stairs, a policeman questioned him as to his identification and his boss stated that “he is one of our employees” whereupon the policeman had him step aside momentarily. Following this, he simply walked out the front door of the building. I don’t recall that anyone asked why he left or where or how he went. I just presumed that this had been covered in an earlier questioning.

A. J. HIDELL IDENTIFICATION CARD—Captain Fritz asked him if he knew anyone by the name of A. J. Hidell and he denied that he did. When asked if he had ever used this name as an alias, he also made a denial. In fact, he stated that he had never used the name, didn’t know anyone by this name, and never had heard of the name before. Captain Fritz then asked him about the I.D. card he had in his pocket bearing such a name and he flared up and stated “I’ve told you all I’m going to about that card. You took notes, just read them for yourself, if you want to refresh your memory.” He told Captain Fritz that “You have the card. Now you know as much about it as I do.”
* * * * *

About 11:00 a.m. or a few minutes thereafter, someone handed through the door several hangers on which there were some trousers, shirts, and a couple of sweaters. When asked if he wanted to change any of his clothes before being transferred to the County jail, he said “Just give me one of these sweaters.” He didn’t like the one they handed him and insisted on putting on a black slip-over sweater than had some jagged holes in it near the front of the right shoulder. One cuff was released while he slipped this over the head, following which he was again cuffed. During this change of clothing, Chief of Police Curry came into the room and discussed something in an inaudible undertone with Captain Fritz, apparently for the purpose of not letting Oswald hear what was being said. I have no idea what this conversation was, but just presume they were discussing the transfer of the prisoner. I did not go downstairs to witness the further transfer of the prisoner.`;

  // ---------- text handling ----------
  const words = t => (t.replace(TOKEN, ' ').match(/\S+/g) || []);

  function limitWords(text) {
    const re = /\S+/g; let m, n = 0;
    while ((m = re.exec(text))) { if (++n > MAX_WORDS) return text.slice(0, m.index); }
    return text;
  }

  function splitSentences(text) {
    const paras = text.replace(/\r/g, '').split(/\n+/).map(s => s.trim()).filter(Boolean);
    const out = [];
    const seg = 'Segmenter' in Intl ? new Intl.Segmenter(undefined, { granularity: 'sentence' }) : null;
    for (const p of paras) {
      const parts = seg ? Array.from(seg.segment(p), x => x.segment)
                        : (p.match(/[^.!?…]+[.!?…]+["'”’)\]]*\s*|[^.!?…]+$/g) || [p]);
      for (const s of parts) { const t = s.trim(); if (t) out.push(t); }
    }
    return out;
  }

  // Text plus [image N] tags -> a flat list of sentences (strings) and images (objects).
  function parse(text) {
    const out = [];
    let last = 0;
    text.replace(TOKEN, (m, n, off) => {
      out.push(...splitSentences(text.slice(last, off)));
      const img = images.get(+n);
      if (img) out.push(img);
      last = off + m.length;
      return m;
    });
    out.push(...splitSentences(text.slice(last)));
    return out;
  }

  // ---------- images ----------
  function loadImage(file) {
    return new Promise(resolve => {
      const src = URL.createObjectURL(file);
      const im = new Image();
      im.onload = () => resolve({ src, aspect: im.naturalWidth / im.naturalHeight || 1, name: file.name });
      im.onerror = () => { URL.revokeObjectURL(src); resolve(null); };
      im.src = src;
    });
  }

  function insertAtCursor(str) {
    const v = input.value;
    const pos = document.activeElement === input || input.selectionEnd ? input.selectionEnd : v.length;
    const before = v.slice(0, pos), after = v.slice(pos);
    const pad = (before && !/\s$/.test(before) ? ' ' : '') + str + (after && !/^\s/.test(after) ? ' ' : '');
    input.value = before + pad + after;
    input.selectionStart = input.selectionEnd = pos + pad.length;
  }

  async function addFiles(files) {
    for (const f of files) {
      if (!f.type.startsWith('image/')) continue;
      const img = await loadImage(f);
      if (!img) continue;
      const n = nextImage++;
      images.set(n, img);
      insertAtCursor(`[image ${n}]`);
    }
    renderThumbs();
    updateCount();
  }

  function removeImage(n) {
    URL.revokeObjectURL(images.get(n).src);
    images.delete(n);
    input.value = input.value.replace(new RegExp(`\\s?\\[image ${n}\\]`, 'gi'), '');
    renderThumbs();
  }

  function renderThumbs() {
    thumbs.textContent = '';
    for (const [n, img] of images) {
      const d = document.createElement('div');
      d.className = 'thumb';
      d.innerHTML = `<img alt=""><span>[image ${n}]</span><button title="Remove image">×</button>`;
      d.querySelector('img').src = img.src;
      d.querySelector('button').onclick = () => removeImage(n);
      thumbs.appendChild(d);
    }
  }

  function updateCount() {
    const n = words(input.value).length;
    count.textContent = `${n.toLocaleString()} / ${MAX_WORDS.toLocaleString()} words` + (n > MAX_WORDS ? ' (extra words will be cut)' : '');
    count.classList.toggle('over', n > MAX_WORDS);
  }

  // ---------- DOM ----------
  function makeItem(i) {
    const it = items[i];
    const el = document.createElement('span');
    el.className = 's';
    el.dataset.i = i;
    if (typeof it === 'string') {
      el.textContent = it + ' ';
    } else {
      el.classList.add('img');
      const im = document.createElement('img');
      im.src = it.src;
      im.alt = it.name || '';
      im.draggable = false;
      im.style.setProperty('--ar', it.aspect);
      if (imageSide[i]) el.classList.add('right');
      el.append(im);
    }
    return el;
  }

  let imageSide = [];
  function build() {
    let n = 0;
    imageSide = items.map(it => typeof it === 'string' ? 0 : (n++ % 2));
    flowSpans = items.map((_, i) => makeItem(i));
    measureSpans = items.map((_, i) => makeItem(i));
    [...mBands, ...fBands].forEach(b => { b.textContent = ''; });
    lastSizes = null;
    calib.fill(1);
    totalChars = items.reduce((a, s) => a + (typeof s === 'string' ? s.length + 1 : 0), 0);
    flow.classList.toggle('no-anim', items.length > 1500);
  }

  // ---------- fitting ----------
  function box() {
    const cs = getComputedStyle(stage);
    const W = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const H = stage.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    return { W: Math.floor(W), H: Math.floor(H) };
  }

  const isImg = i => typeof items[i] !== 'string';

  // Standard image sizes, in golden-ratio steps: the focused image is a third of the
  // screen wide, near images step down by φ, far ones stop at 1/(3φ²) so they stay visible.
  const view = { W: 1000, H: 700, imgScale: 1, imgArea: 0 };

  const imgShrink = new Map();   // pictures made smaller because the text beside them runs out

  function imageWidth(i) {
    const level = i === focus ? 0 : Math.min(LEVEL_AT[Math.abs(i - focus)], IMG_STEPS);
    let w = view.W * IMG_MAX / Math.pow(PHI, level);
    w = Math.min(w, view.H * IMG_TALL * items[i].aspect) * view.imgScale * (imgShrink.get(i) || 1);
    return Math.max(w, 40);
  }

  function updateView() {
    const { W, H } = box();
    view.W = W; view.H = H; view.imgScale = 1;
    let area = 0;
    items.forEach((it, i) => { if (isImg(i)) { const w = imageWidth(i); area += w * w / it.aspect; } });
    const cap = IMG_AREA * W * H;
    if (area > cap) view.imgScale = Math.sqrt(cap / area);
    view.imgArea = Math.min(area, cap);
  }

  // Leading: big type sits tight, small type stays a little looser. `extra` is the
  // spare leading handed out to close the block at the bottom, mostly to small type.
  function lhFor(size, extra = 0) {
    const t = Math.min(Math.max(Math.log(size / 6) / Math.log(160 / 6), 0), 1);
    const weight = Math.min(Math.max(1 - (size - 30) / 70 * 0.5, 0.5), 1);
    return 0.98 - 0.16 * t + extra * weight;
  }

  // Inside a column: as wide as the column, at most a third of the screen, and in proportion to the text.
  function colImageWidth(i, k) {
    const w = Math.min(colW[k], view.W * IMG_MAX, view.H * IMG_COL_TALL * items[i].aspect, colImgH[k] * items[i].aspect) * view.imgScale;
    return Math.max(w, Math.min(56, colW[k]));
  }

  function columnWidthEm(size) {
    let band = 0;
    while (band < COL_SIZE_STEPS.length && size >= COL_SIZE_STEPS[band]) band++;
    return COL_WIDTH_EM[band];
  }

  function setImage(el, i) {
    const k = bandOf[i];
    let w;
    if (k === 0 || k === 2) w = colImageWidth(i, k);
    else w = imageWidth(i);
    const im = el.firstChild;
    im.style.width = w.toFixed(1) + 'px';
    im.style.height = (w / items[i].aspect).toFixed(1) + 'px';
    el.style.setProperty('--m', Math.max(k === 1 ? 6 : 4, Math.round(w * 0.05)) + 'px');
  }

  // Which items form the top and bottom column blocks: the far, small ones at each end.
  function groupsOf(ord) {
    const n = ord.length;
    let a = 0, b = n;
    if (columnsOn) {
      while (a < n && ord[a] < focus && LEVEL_AT[focus - ord[a]] >= COL_LEVEL) a++;
      while (b > a && ord[b - 1] > focus && LEVEL_AT[ord[b - 1] - focus] >= COL_LEVEL) b--;
      // pictures only stay in a column block when there is enough text around them;
      // otherwise the block ends right before its first picture (the picture floats in the middle)
      const rich = (from, to) => {
        let chars = 0, pics = 0;
        for (let p = from; p < to; p++) isImg(ord[p]) ? pics++ : (chars += items[ord[p]].length);
        return !pics || chars / pics >= COL_CHARS_PER_IMG;
      };
      if (!rich(0, a)) { let p = 0; while (!isImg(ord[p])) p++; a = p; }
      if (!rich(b, n)) { let p = n - 1; while (!isImg(ord[p])) p--; b = p + 1; }
      if (a < 2) a = 0;
      if (n - b < 2) b = n;
    }
    return [ord.slice(0, a), ord.slice(a, b), ord.slice(b)];
  }

  // Put `spans` into `container` in order, moving only what has to move
  // (so items that stay put keep their running transitions).
  function place(container, spans) {
    const want = new Set(spans);
    for (const c of [...container.children]) if (!want.has(c)) c.remove();
    for (let k = 0; k < spans.length; k++) {
      const cur = container.children[k];
      if (cur !== spans[k]) container.insertBefore(spans[k], cur || null);
    }
  }

  function arrange(ord) {
    order = ord;
    groups = groupsOf(ord);
    bandOf = new Array(items.length);
    groups.forEach((g, k) => g.forEach(i => { bandOf[i] = k; }));
    groups.forEach((g, k) => place(mBands[k], g.map(i => measureSpans[i])));
    if (lastSizes) styleBands(mBands, lastSizes);
  }

  // Column count follows the type size: about 35 characters per line.
  function styleBands(bands, sizes) {
    for (const k of [0, 2]) {
      const g = groups[k];
      if (!g.length) continue;
      let chars = 0, weighted = 0, maxSize = 0, pics = 0;
      for (const i of g) if (!isImg(i)) {
        chars += items[i].length;
        weighted += sizes[i] * items[i].length;
        maxSize = Math.max(maxSize, sizes[i]);
      } else pics++;
      const ref = chars ? weighted / chars : 10;
      const gap = Math.min(Math.max(ref * 1.1, 3), 26);
      const widthEm = columnWidthEm(maxSize || ref);
      // Floor instead of round: rounding can make nearby target measures collapse
      // to the same column count and therefore look almost identical.
      let count = g.length >= 2 ? Math.floor((view.W + gap) / (Math.max(ref * widthEm, COL_MIN_W) + gap)) : 1;
      count = Math.max(count, 1);
      bandCount[k] = count;
      bands[k].style.hyphens = ref < 9 ? 'manual' : '';   // hyphenating unreadably small text is slow and pointless
      bands[k].style.columnCount = count;
      bands[k].style.columnGap = gap.toFixed(1) + 'px';
      colW[k] = (view.W - gap * (count - 1)) / count;
      // Pictures stay in proportion to the text: each at most 45% of a column's text height,
      // and together at most 30% of the block, so the columns stay balanced.
      let textH = 0;
      for (const i of g) if (!isImg(i)) textH += items[i].length * 0.5 * sizes[i] / colW[k] * sizes[i] * lhFor(sizes[i]);
      const hc = textH / count;
      colImgH[k] = pics ? Math.max(Math.min(hc * 0.45, hc * count * 0.3 / pics), 16) : 0;
    }
  }

  // Biggest size for the focus sentence alone: fills the width on one line,
  // and its block is no taller than maxH. For an image: the text size whose golden
  // height (φ em) equals the image's height, so the type still scales around it.
  function focusSize(W, maxH) {
    if (isImg(focus)) return imageWidth(focus) / items[focus].aspect / PHI;
    probe.style.width = W + 'px';
    probe.textContent = '';
    const el = probe.appendChild(makeItem(focus));
    const setSize = px => { el.style.fontSize = px + 'px'; el.style.lineHeight = lhFor(px); };

    el.style.whiteSpace = 'nowrap';
    setSize(100);
    const fill = 100 * W / (el.getBoundingClientRect().width || 1) * 0.99;
    el.style.whiteSpace = '';

    let lo = 1, hi = Math.min(fill, maxH / lhFor(160));
    setSize(hi);
    if (probe.scrollHeight <= maxH) return hi;
    for (let k = 0; k < 14; k++) {
      const mid = (lo + hi) / 2;
      setSize(mid);
      if (probe.scrollHeight <= maxH) lo = mid; else hi = mid;
    }
    return lo;
  }

  function sizesFor(F, k) {
    return items.map((_, i) => {
      if (i === focus) return F;
      const d = Math.abs(i - focus);
      return k * Math.pow(PHI, -LEVEL_AT[d]);
    });
  }

  // Column blocks of the measuring copy: a fixed height (found by a quick overflow check)
  // instead of the slow balancing, or the real balanced layout when fastBands is off.
  function fitBandHeights(sizes, extra) {
    for (const k of [0, 2]) {
      const g = groups[k], el = mBands[k];
      if (!g.length) continue;
      if (!fastBands || bandCount[k] < 2) { el.style.columnFill = ''; el.style.height = ''; continue; }
      let est = 0;
      for (const i of g) {
        if (isImg(i)) { const w = colImageWidth(i, k); est += w / items[i].aspect + 2 * Math.max(4, Math.round(w * 0.05)); }
        else est += (items[i].length * EST_CHAR_W * sizes[i] / colW[k] + 0.5) * sizes[i] * lhFor(sizes[i], extra);
      }
      est = Math.max(est / bandCount[k], 1);
      let h = est * calib[k];
      el.style.columnFill = 'auto';
      const fits = v => { el.style.height = v.toFixed(1) + 'px'; return el.scrollWidth <= el.clientWidth + 1; };
      // bracket the smallest height that still fits (steps grow 1.8×), then bisect to ~1%
      let lo = 0, hi = 0, step = 0.03;
      if (fits(h)) {
        hi = h;
        for (let t = 0; t < 10; t++) { const h2 = hi * (1 - step); if (fits(h2)) { hi = h2; step *= 1.8; } else { lo = h2; break; } }
      } else {
        lo = h;
        for (let t = 0; t < 16; t++) { const h2 = lo * (1 + step); if (fits(h2)) { hi = h2; break; } lo = h2; step *= 1.8; }
        if (!hi) hi = lo * 2;
      }
      for (let t = 0; t < 3 && lo && hi / lo > 1.012; t++) { const mid = (lo + hi) / 2; if (fits(mid)) hi = mid; else lo = mid; }
      h = hi;
      fits(h);
      calib[k] = h / est;
    }
  }

  function apply(spans, sizes, extra = 0) {
    lastSizes = sizes; lastExtra = extra;
    for (let i = 0; i < spans.length; i++) {
      if (isImg(i)) continue;
      spans[i].style.fontSize = sizes[i] + 'px';
      spans[i].style.lineHeight = lhFor(sizes[i], extra);
    }
    styleBands(mBands, sizes);
    for (let i = 0; i < spans.length; i++) if (isImg(i)) setImage(spans[i], i);
    fitBandHeights(sizes, extra);
  }

  function setLeading(spans, sizes, extra) {
    lastExtra = extra;
    for (let i = 0; i < spans.length; i++) if (!isImg(i)) spans[i].style.lineHeight = lhFor(sizes[i], extra);
    fitBandHeights(sizes, extra);
  }

  // Given a focus size F, find the largest scale for all other items that still fits.
  function fitRest(F, W, H) {
    measure.style.width = W + 'px';
    let lo = 0, hi = F;
    apply(measureSpans, sizesFor(F, hi));
    if (measure.scrollHeight <= H) return { k: hi, sizes: sizesFor(F, hi) };
    for (let it = 0; it < 9; it++) {
      const mid = (lo + hi) / 2;
      apply(measureSpans, sizesFor(F, mid));
      if (measure.scrollHeight <= H) lo = mid; else hi = mid;
    }
    return { k: lo, sizes: sizesFor(F, lo) };
  }

  // Short texts leave room over: grow everything together until the screen is full.
  function fill(sizes, W, H) {
    measure.style.width = W + 'px';
    const scaled = m => sizes.map((s, i) => isImg(i) ? s : s * m);   // images keep their standard size
    apply(measureSpans, sizes);
    if (measure.scrollHeight >= H * 0.97) return sizes;
    let lo = 1, hi = 2;
    for (;;) {
      apply(measureSpans, scaled(hi));
      if (measure.scrollHeight > H || hi > 64) break;
      lo = hi; hi *= 2;
    }
    for (let it = 0; it < 10; it++) {
      const mid = (lo + hi) / 2;
      apply(measureSpans, scaled(mid));
      if (measure.scrollHeight <= H) lo = mid; else hi = mid;
    }
    return scaled(lo);
  }

  function solve() {
    const { W, H } = box();
    if (!items.length || W < 10 || H < 10) return null;
    // Golden-ratio steps stay fixed; leftover space scales the whole cascade up.
    return fill(solveShares(W, H), W, H);
  }

  function solveShares(W, H) {

    // Rough size if all text were uniform: tells us how small "the rest" may get.
    const uniform = Math.sqrt(Math.max(W * H - view.imgArea, W * H * 0.2) / (Math.max(totalChars, 1) * 0.6));
    const minReadable = Math.min(8, uniform * 0.25);

    const smallest = sizes => sizes.reduce((m, s, i) => (i === focus || isImg(i)) ? m : Math.min(m, s), Infinity);
    if (isImg(focus)) {                       // the focus size doesn't depend on a height share
      const F = focusSize(W, H), r = fitRest(F, W, H);
      return r.sizes;
    }
    const tryShare = share => {
      const F = focusSize(W, H * share);
      const r = fitRest(F, W, H);
      const min = smallest(r.sizes);
      return { sizes: r.sizes, min, good: items.length === 1 || min >= minReadable };
    };

    // How much of the height may the focus sentence claim? Too much starves the rest,
    // too little caps the rest (nothing may outgrow the focus). Scan from the top,
    // take the first share that keeps the rest readable, then refine upward.
    const STEP = 0.1;
    let fallback = null;
    for (let share = 0.92; share > 0.04; share -= STEP) {
      const r = tryShare(share);
      if (r.good) {
        let lo = share, hi = Math.min(0.92, share + STEP), best = r;
        for (let it = 0; it < 4 && share < 0.92; it++) {
          const mid = (lo + hi) / 2, m = tryShare(mid);
          if (m.good) { best = m; lo = mid; } else hi = mid;
        }
        return best.sizes;
      }
      if (!fallback || r.min > fallback.min) fallback = r;
    }
    return fallback.sizes;
  }

  const nearness = i => i === focus ? 1 : Math.pow(0.82, Math.abs(i - focus));

  function colorFor(i) {
    if (i === focus) return '#111';
    const t = nearness(i);
    const g = Math.round(150 - t * 105); // near = darker, far = lighter
    return `rgb(${g},${g},${g - 4})`;
  }

  // Bottom of the last line of text in the middle block of the measuring copy
  // (null when that block holds no text).
  function textEnd() {
    const mid = groups[1];
    for (let k = mid.length - 1; k >= 0; k--) {
      if (isImg(mid[k])) continue;
      const rects = measureSpans[mid[k]].getClientRects();
      return rects.length ? rects[rects.length - 1].bottom : 0;
    }
    return null;
  }

  // The floated image that hangs furthest below the end of the text, i.e. would leave
  // empty space beside it: { k: position in `order`, hang, h } or null when all close flush.
  function overhangingImage() {
    const end = textEnd();
    if (end === null) return null;
    const mid = groups[1], offset = groups[0].length;
    let worst = null;
    for (let k = mid.length - 1; k >= 0; k--) {
      if (!isImg(mid[k])) continue;
      const r = measureSpans[mid[k]].getBoundingClientRect(), hang = r.bottom - end;
      if (hang > 2 && (!worst || hang > worst.hang)) worst = { k: offset + k, hang, h: r.height };
    }
    return worst;
  }

  // Move the image at position k up to the latest position where the text after it
  // is long enough to wrap around it (binary search, sizes unchanged). It never moves
  // up into the top column block.
  function liftImage(k) {
    const img = order[k];
    const others = order.filter((_, p) => p !== k);
    const placeAt = t => arrange(others.slice(0, t).concat([img], others.slice(t)));
    const hangs = () => { const e = textEnd(); return e !== null && measureSpans[img].getBoundingClientRect().bottom > e + 2; };
    let lo = groups[0].length, hi = k;
    placeAt(lo);
    if (hangs()) { placeAt(k); return false; }       // no position helps: leave it where it was
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      placeAt(mid);
      if (hangs()) hi = mid; else lo = mid;
    }
    placeAt(lo);
    return lo !== k;
  }

  // Vertical justification: hand out spare leading so the block ends at the bottom.
  function stretchLeading(sizes, H) {
    apply(measureSpans, sizes);
    const fits = e => { setLeading(measureSpans, sizes, e); return measure.scrollHeight <= H; };
    let lo = 0, hi = 0.6;
    if (fits(hi)) lo = hi;
    else for (let it = 0; it < 8; it++) { const mid = (lo + hi) / 2; if (fits(mid)) lo = mid; else hi = mid; }
    fits(lo);
    return lo;
  }

  // Order, sizes and leading for the current focus (everything measured on the hidden copy).
  function pipeline() {
    const { H } = view;
    arrange(items.map((_, i) => i));                       // start from the natural order
    let sizes = solve();
    if (!sizes) return null;
    let extra = stretchLeading(sizes, H);

    // No empty space beside images: an image the remaining text can't wrap around
    // moves up one sentence at a time until the text closes around it.
    // If no position helps, the picture shrinks until the text beside it fills the space.
    imgShrink.clear();
    for (let pass = 0; pass < 6; pass++) {
      const over = overhangingImage();
      if (!over) break;
      if (!liftImage(over.k)) {
        const i = order[over.k];
        imgShrink.set(i, (imgShrink.get(i) || 1) * Math.max(0.35, (over.h - over.hang - 4) / over.h * 0.92));
      }
      sizes = solve();
      extra = stretchLeading(sizes, H);
    }
    return { sizes, extra };
  }

  function layout(animate = true) {
    updateView();
    const { W, H } = view;
    flow.style.width = W + 'px';          // same width as the measuring copy, so lines wrap identically
    fastBands = columnsOn;
    let r = pipeline();
    if (!r) return;
    if (fastBands && (groups[0].length || groups[2].length)) {
      // confirm with the real, balanced columns; if the estimate was too optimistic, redo it exactly
      fastBands = false;
      apply(measureSpans, r.sizes);
      setLeading(measureSpans, r.sizes, r.extra);
      if (measure.scrollHeight > H) r = pipeline();
    }
    const sizes = r.sizes;
    let extra = r.extra;
    groups.forEach((g, k) => place(fBands[k], g.map(i => flowSpans[i])));

    flow.classList.toggle('instant', !animate || flow.classList.contains('no-anim'));
    extra = Math.floor(extra * 1e4) / 1e4;

    // The last line is the only one justify leaves ragged. Stretch it too when it is
    // already mostly full, so the block closes flush on the right.
    const end = document.createElement('span');
    mBands[1].appendChild(end);
    const mr = mBands[1].getBoundingClientRect(), er = end.getBoundingClientRect();
    end.remove();
    fBands[1].classList.toggle('last-justify', mr.width > 0 && (er.left - mr.left) / mr.width > 0.6);
    styleBands(fBands, sizes);
    flowSpans.forEach((el, i) => {
      if (isImg(i)) { setImage(el, i); el.style.opacity = (0.5 + 0.5 * nearness(i)).toFixed(3); }
      else {
        el.style.fontSize = sizes[i] + 'px';
        el.style.lineHeight = lhFor(sizes[i], extra);
        el.style.color = colorFor(i);
      }
      el.classList.toggle('focus', i === focus);
    });
  }

  // ---------- interaction ----------
  function setFocus(i) {
    i = Math.max(0, Math.min(items.length - 1, i));
    if (i === focus) return;
    focus = i;
    layout(true);
  }

  flow.addEventListener('click', e => {
    const el = e.target.closest('.s');
    if (el) setFocus(+el.dataset.i);
  });

  function openEditor() {
    editor.hidden = false;
    cancelBtn.hidden = !items.length;
    updateCount();
    input.focus();
  }
  function closeEditor() { editor.hidden = true; }

  function go() {
    const text = limitWords(input.value);
    const next = parse(text);
    if (!next.length) { input.focus(); return; }
    items = next;
    // Start on a random text item so the first sentence is not always the hero.
    const textItems = items.map((item, i) => typeof item === 'string' ? i : -1).filter(i => i >= 0);
    focus = textItems.length ? textItems[Math.floor(Math.random() * textItems.length)] : 0;
    // Hyphenation dictionary: German or English, whichever the text looks like.
    const de = (text.match(/\b(und|der|die|das|ist|nicht|ich|mit|ein|eine|auf|für)\b/gi) || []).length;
    const en = (text.match(/\b(the|and|is|of|to|with|that|it|for|on)\b/gi) || []).length;
    const lang = de > en ? 'de' : 'en';
    [flow, measure, probe].forEach(el => el.lang = lang);
    build();
    closeEditor();
    layout(false);
  }

  const colCheck = document.getElementById('colCheck');
  function updateColBtn() {
    colBtn.textContent = 'Columns: ' + (columnsOn ? 'on' : 'off');
    colBtn.setAttribute('aria-pressed', columnsOn);
    colCheck.checked = columnsOn;
  }
  function toggleColumns() {
    columnsOn = !columnsOn;
    try { localStorage.setItem('text-resize-columns', columnsOn ? '1' : '0'); } catch {}
    updateColBtn();
    if (items.length) layout(false);
  }
  colBtn.addEventListener('click', toggleColumns);
  colCheck.addEventListener('change', () => { if (colCheck.checked !== columnsOn) toggleColumns(); });
  updateColBtn();

  goBtn.addEventListener('click', go);
  cancelBtn.addEventListener('click', closeEditor);
  editBtn.addEventListener('click', openEditor);
  input.addEventListener('input', updateCount);
  filesInput.addEventListener('change', () => { addFiles([...filesInput.files]); filesInput.value = ''; });
  input.addEventListener('paste', e => {
    const files = [...(e.clipboardData?.files || [])].filter(f => f.type.startsWith('image/'));
    if (files.length) { e.preventDefault(); addFiles(files); }
  });
  editor.addEventListener('dragover', e => { e.preventDefault(); editor.classList.add('drag'); });
  editor.addEventListener('dragleave', e => { if (e.target === editor) editor.classList.remove('drag'); });
  editor.addEventListener('drop', e => {
    e.preventDefault();
    editor.classList.remove('drag');
    addFiles([...e.dataTransfer.files]);
  });
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) go();
  });

  document.addEventListener('keydown', e => {
    if (!editor.hidden) { if (e.key === 'Escape' && items.length) closeEditor(); return; }
    if (e.key === 'Escape') openEditor();
    else if (e.key === 'c' || e.key === 'C') toggleColumns();
    else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') setFocus(focus + 1);
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') setFocus(focus - 1);
  });

  let uiTimer;
  document.addEventListener('mousemove', () => {
    document.body.classList.add('show-ui');
    clearTimeout(uiTimer);
    uiTimer = setTimeout(() => document.body.classList.remove('show-ui'), 1600);
  });

  let rTimer;
  window.addEventListener('resize', () => {
    clearTimeout(rTimer);
    rTimer = setTimeout(() => layout(false), 120);
  });

  updateCount();
  input.focus();
})();
