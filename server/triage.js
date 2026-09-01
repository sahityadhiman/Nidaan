import { GoogleGenerativeAI } from '@google/generative-ai';

/*
  Snap-to-Solve AI triage (feature 1a).
  Gemini Flash classifies a civic-issue photo into a structured report.
  Falls back to a believable keyword/heuristic guess when no key or the call fails,
  so the demo always produces a filled form.
*/

const apiKey = process.env.GEMINI_API_KEY;
let ai = null;
if (apiKey) {
  try { ai = new GoogleGenerativeAI(apiKey); } catch { ai = null; }
}

const DEPT_BY_CATEGORY = {
  pothole: 'Roads & Works Dept',
  road_sign: 'Roads & Works Dept',
  water_leak: 'Water & Sewerage Board',
  drainage: 'Water & Sewerage Board',
  wiring: 'Electricity Authority',
  garbage: 'Solid Waste Management',
  debris: 'Solid Waste Management',
  fire: 'Fire & Emergency Services',
};

const VALID_CATEGORIES = Object.keys(DEPT_BY_CATEGORY);
const VALID_SEVERITIES = ['low', 'medium', 'high', 'RedAlert'];

// Fetch a remote image and return base64 + mime so Gemini Vision can read it.
async function fetchImageAsInline(url) {
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`image fetch ${resp.status}`);
  const mime = resp.headers.get('content-type') || 'image/jpeg';
  const buf = Buffer.from(await resp.arrayBuffer());
  return { data: buf.toString('base64'), mimeType: mime.split(';')[0] };
}

// Heuristic fallback used when Gemini is unavailable.
function heuristicTriage(hint = '') {
  const t = hint.toLowerCase();
  let category = 'pothole';
  if (/fire|flame|blaze|burning|smoke/.test(t)) category = 'fire';
  else if (/pothole|crack/.test(t)) category = 'pothole';
  else if (/water|pipe|leak|burst|flood/.test(t)) category = 'water_leak';
  else if (/wire|electric|spark|cable|pole|transformer/.test(t)) category = 'wiring';
  else if (/garbage|trash|litter|waste/.test(t)) category = 'garbage';
  else if (/drain|sewage|sewer|overflow/.test(t)) category = 'drainage';
  else if (/debris|rubble|construction|sand/.test(t)) category = 'debris';
  else if (/light|lamp|sign|signal/.test(t)) category = 'road_sign';
  else if (/road|asphalt/.test(t)) category = 'pothole';

  let severity = 'medium';
  if (/spark|live wire|gas|downed|fire|flood/.test(t)) severity = 'RedAlert';
  else if (/burst|gushing|deep|major|dangerous|hazard/.test(t)) severity = 'high';

  return {
    category,
    severity,
    title: `${category.replace('_', ' ')} reported`,
    description: hint || `Auto-classified ${category.replace('_', ' ')} from the submitted photo.`,
    suggestedDept: DEPT_BY_CATEGORY[category],
    confidence: 0.62,
    source: 'heuristic',
  };
}

function coerce(raw, hint) {
  const fallback = heuristicTriage(hint);
  if (!raw || typeof raw !== 'object') return fallback;
  const category = VALID_CATEGORIES.includes(raw.category) ? raw.category : fallback.category;
  const severity = VALID_SEVERITIES.includes(raw.severity) ? raw.severity : fallback.severity;
  return {
    category,
    severity,
    title: (raw.title || fallback.title).toString().slice(0, 90),
    description: (raw.description || fallback.description).toString().slice(0, 400),
    suggestedDept: raw.suggestedDept || DEPT_BY_CATEGORY[category],
    confidence: typeof raw.confidence === 'number' ? Math.max(0, Math.min(1, raw.confidence)) : 0.88,
    source: 'gemini',
  };
}

export async function triagePhoto({ photoUrl, photoBase64, mimeType, hint } = {}) {
  if (!ai) return heuristicTriage(hint);

  try {
    const model = ai.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: { responseMimeType: 'application/json' },
    });

    let inline = null;
    if (photoBase64) inline = { data: photoBase64.replace(/^data:[^;]+;base64,/, ''), mimeType: mimeType || 'image/jpeg' };
    else if (photoUrl && /^https?:/.test(photoUrl)) {
      try { inline = await fetchImageAsInline(photoUrl); } catch { inline = null; }
    }

    const instruction = `You are the Nidaan civic-issue triage model. Classify the civic problem${inline ? ' shown in this photo' : ''}.
Return STRICT JSON only with keys:
{"category": one of ${JSON.stringify(VALID_CATEGORIES)},
 "severity": one of ${JSON.stringify(VALID_SEVERITIES)} (use "RedAlert" only for life-threatening hazards like live wires, gas leaks or flooding),
 "title": short headline (max 8 words),
 "description": one factual sentence a citizen would file,
 "suggestedDept": the responsible municipal department,
 "confidence": 0..1}
${hint ? `Citizen note: "${hint}".` : ''}`;

    const parts = [{ text: instruction }];
    if (inline) parts.push({ inlineData: inline });

    const result = await model.generateContent({ contents: [{ role: 'user', parts }] });
    const text = result.response.text();
    let parsed;
    try { parsed = JSON.parse(text); }
    catch { parsed = JSON.parse((text.match(/\{[\s\S]*\}/) || ['{}'])[0]); }
    return coerce(parsed, hint);
  } catch (err) {
    console.error('Gemini triage failed, using heuristic fallback:', err.message);
    return heuristicTriage(hint);
  }
}

export { DEPT_BY_CATEGORY };
