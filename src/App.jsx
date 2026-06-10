import { useState, useEffect } from "react"

// ─── Constants ───────────────────────────────────────────────────────────────

const TONES = [
  { id: "general",    label: "⚡ General",   desc: "Balanced & clear" },
  { id: "formal",     label: "👔 Formal",    desc: "Professional" },
  { id: "casual",     label: "😊 Casual",    desc: "Conversational" },
  { id: "technical",  label: "🔧 Technical", desc: "Precise & detailed" },
  { id: "creative",   label: "🎨 Creative",  desc: "Imaginative" },
  { id: "concise",    label: "✂️ Concise",   desc: "Short & sharp" },
]

const TONE_INSTRUCTIONS = {
  general:   "Make the prompt clear, specific, and well-structured.",
  formal:    "Make the prompt professional and structured, suitable for academic or business contexts.",
  casual:    "Make the prompt friendly and conversational, using simple everyday language.",
  technical: "Make the prompt highly precise. Include technical specifications, constraints, and expected output format.",
  creative:  "Make the prompt imaginative and expressive, encouraging creative thinking.",
  concise:   "Make the prompt as short and direct as possible while keeping full clarity. Remove all fluff.",
}

const REPHRASE_TONES = [
  { id: "formal",       label: "👔 Formal",      desc: "Professional & polished" },
  { id: "casual",       label: "😊 Casual",       desc: "Relaxed & friendly" },
  { id: "polite",       label: "🙏 Polite",       desc: "Courteous & respectful" },
  { id: "assertive",    label: "💪 Assertive",    desc: "Confident & direct" },
  { id: "empathetic",   label: "❤️ Empathetic",   desc: "Warm & understanding" },
  { id: "humorous",     label: "😄 Humorous",     desc: "Light & witty" },
  { id: "academic",     label: "🎓 Academic",     desc: "Scholarly & structured" },
  { id: "simple",       label: "🧒 Simple",       desc: "Easy to understand" },
]

const REPHRASE_INSTRUCTIONS = {
  formal:     "Rewrite this in a formal, professional tone suitable for business or official communication.Dont change the meaning of the sentence.",
  casual:     "Rewrite this in a casual, relaxed tone like texting a friend.Dont change the meaning of the sentence.",
  polite:     "Rewrite this in a very polite and courteous tone, maintaining respect throughout. Dont change the meaning of the sentence.",
  assertive:  "Rewrite this in a confident, assertive tone that is direct without being rude.Dont change the meaning of the sentence.",
  empathetic: "Rewrite this in a warm, empathetic tone that shows understanding and care.Dont change the meaning of the sentence.",
  humorous:   "Rewrite this in a light-hearted, witty tone with a touch of humour.Dont change the meaning of the sentence.",
  academic:   "Rewrite this in an academic, scholarly tone with structured arguments.Dont change the meaning of the sentence.",
  simple:     "Rewrite this in very simple language a child could understand. Short sentences, no jargon.Dont change the meaning of the sentence.",
}

const SCORE_PROMPT = (original, improved) => `
You are a prompt quality evaluator. Score the following two prompts on a scale of 1-10.
Return ONLY valid JSON, no extra text, no markdown:
{"original":{"clarity":7,"specificity":4,"effectiveness":5,"overall":5},"improved":{"clarity":9,"specificity":8,"effectiveness":9,"overall":9},"summary":"One sentence explaining the key improvement."}

Original prompt: ${original}
Improved prompt: ${improved}
`

const AI_SCORE_PROMPT = (text) => `
Analyse this text and estimate the probability it was written by an AI (0-100).
Look for: em-dashes, phrases like "delve into", "it's worth noting", "in conclusion", "furthermore", "it is important to note", "in the realm of", "straightforward", "commendable", "meticulous", "navigating", "landscape", "testament", overly structured bullet points, and unnatural formality.
Return ONLY valid JSON: {"score":72,"reasons":["Uses em-dashes","Contains phrase delve into","Overly formal structure"]}

Text: ${text}
`

const HUMANISE_PROMPT = (text) => `
Rewrite this text to sound naturally human-written. Remove all AI-sounding patterns:
- Replace em-dashes with commas or restructure the sentence
- Remove phrases like: "delve into", "it's worth noting", "in conclusion", "furthermore", "it is important to note", "in the realm of", "straightforward", "commendable", "meticulous", "testament to", "navigating", "landscape"
- Vary sentence lengths — mix short punchy sentences with longer ones
- Use contractions naturally (it's, don't, you'll, we're)
- Avoid bullet points unless the original clearly uses them
- Write the way a real person would speak or write
- Keep the original meaning and all key information

Return ONLY the rewritten text, nothing else.

Text: ${text}
`

// ─── Shared API call ─────────────────────────────────────────────────────────

async function callAI(messages) {
  const response = await fetch("/api/improve", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "openai/gpt-oss-120b:free",
      messages,
    }),
  })
  const data = await response.json()
  return data.choices[0].message.content
}

// ─── Reusable Components ──────────────────────────────────────────────────────

function ToneButton({ tone, selected, onClick }) {
  return (
    <button
      onClick={() => onClick(tone.id)}
      className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-medium transition-all duration-200
        ${selected
          ? "bg-violet-600/20 border-violet-500 text-white shadow-lg shadow-violet-950"
          : "bg-gray-900 border-gray-800 text-gray-500 hover:border-gray-600 hover:text-gray-300"
        }`}
    >
      <span className="text-base">{tone.label.split(" ")[0]}</span>
      <span className="font-semibold">{tone.label.split(" ").slice(1).join(" ")}</span>
      <span className={`text-[10px] font-normal ${selected ? "text-violet-300" : "text-gray-700"}`}>
        {tone.desc}
      </span>
    </button>
  )
}

function PromptBox({ label, value, onChange, placeholder, readOnly = false, glowActive = false }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</label>
      {readOnly ? (
        <div className={`w-full h-56 bg-gray-900 border rounded-xl p-4 text-sm overflow-y-auto whitespace-pre-wrap transition-all duration-300
          ${glowActive ? "border-violet-800 text-gray-100" : "border-gray-800 text-gray-600"}`}>
          {value || <span className="text-gray-700">{placeholder}</span>}
        </div>
      ) : (
        <textarea
          className="w-full h-56 bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm text-gray-100 resize-none focus:outline-none focus:ring-2 focus:ring-violet-600 placeholder-gray-700 transition-all"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  )
}

function CopyButton({ text, loading }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <button
      onClick={handleCopy}
      disabled={!text || loading}
      className="w-full py-3 rounded-xl font-bold text-sm bg-gray-800 hover:bg-gray-700 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
    >
      {copied ? "✅ Copied!" : "📋 Copy"}
    </button>
  )
}

function ActionButton({ onClick, disabled, loading, label, loadingLabel }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full py-3 rounded-xl font-bold text-sm bg-violet-600 hover:bg-violet-500 active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-150"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          {loadingLabel}
        </span>
      ) : label}
    </button>
  )
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-24 text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 bg-gray-800 rounded-full h-1.5 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${value * 10}%` }} />
      </div>
      <span className="w-5 text-right text-gray-300 font-mono">{value}</span>
    </div>
  )
}

function ScorePanel({ scores, loading }) {
  if (loading) return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 animate-pulse">
      <div className="h-4 bg-gray-800 rounded w-32 mb-4" />
      <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-3 bg-gray-800 rounded" />)}</div>
    </div>
  )
  if (!scores) return null
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">📊 Prompt Score</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-gray-500 uppercase tracking-wider">Original</span>
            <span className="text-2xl font-black text-gray-400">{scores.original.overall}<span className="text-xs font-normal text-gray-600">/10</span></span>
          </div>
          <div className="space-y-2">
            <ScoreBar label="Clarity"       value={scores.original.clarity}       color="bg-gray-500" />
            <ScoreBar label="Specificity"   value={scores.original.specificity}   color="bg-gray-500" />
            <ScoreBar label="Effectiveness" value={scores.original.effectiveness} color="bg-gray-500" />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs text-violet-400 uppercase tracking-wider">Improved</span>
            <span className="text-2xl font-black text-violet-400">{scores.improved.overall}<span className="text-xs font-normal text-violet-600">/10</span></span>
          </div>
          <div className="space-y-2">
            <ScoreBar label="Clarity"       value={scores.improved.clarity}       color="bg-violet-500" />
            <ScoreBar label="Specificity"   value={scores.improved.specificity}   color="bg-violet-500" />
            <ScoreBar label="Effectiveness" value={scores.improved.effectiveness} color="bg-violet-500" />
          </div>
        </div>
      </div>
      {scores.summary && (
        <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-400 italic">
          💡 {scores.summary}
        </div>
      )}
    </div>
  )
}

// ─── AI Percentage Display ────────────────────────────────────────────────────

function AiScoreDisplay({ before, after, reasons }) {
  if (before === null || before === undefined) return null
  const improved = (before !== null && after !== null) ? before - after : null
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">🤖 AI Detection</h3>
      <div className="flex items-center gap-6 mb-4 flex-wrap">
        <div className="text-center">
          <p className="text-3xl font-black text-red-400">{before}%</p>
          <p className="text-xs text-gray-600 mt-1">Before</p>
        </div>
        <div className="text-gray-600 text-xl">→</div>
        {after !== null && after !== undefined ? (
          <div className="text-center">
            <p className="text-3xl font-black text-green-400">{after}%</p>
            <p className="text-xs text-gray-600 mt-1">After</p>
          </div>
        ) : (
          <div className="text-center animate-pulse">
            <p className="text-3xl font-black text-gray-600">—</p>
            <p className="text-xs text-gray-600 mt-1">Scoring...</p>
          </div>
        )}
        {improved > 0 && (
          <>
            <div className="text-gray-600 text-xl">=</div>
            <div className="text-center">
              <p className="text-3xl font-black text-violet-400">-{improved}%</p>
              <p className="text-xs text-gray-600 mt-1">Reduction</p>
            </div>
          </>
        )}
      </div>
      {reasons && reasons.length > 0 && (
        <div className="pt-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 uppercase tracking-wider mb-2">AI signals found in original</p>
          <div className="flex flex-wrap gap-2">
            {reasons.map((r, i) => (
              <span key={i} className="text-xs bg-red-950/50 text-red-400 border border-red-900/40 px-2 py-1 rounded-lg">{r}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── History Item ─────────────────────────────────────────────────────────────

function HistoryItem({ item, onRestore, onDelete }) {
  const [expanded, setExpanded] = useState(false)
  const tone = [...TONES, ...REPHRASE_TONES].find(t => t.id === item.tone)
  const typeStyle = {
    improve:  "bg-violet-900/40 text-violet-400",
    rephrase: "bg-blue-900/40 text-blue-400",
    humanise: "bg-green-900/40 text-green-400",
  }
  const typeLabel = {
    improve:  "✨ Improve",
    rephrase: "🔄 Rephrase",
    humanise: "🧹 Humanise",
  }
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${typeStyle[item.type] || "bg-gray-800 text-gray-400"}`}>
              {typeLabel[item.type] || item.type}
            </span>
            {tone && <span className="text-[10px] bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">{tone.label}</span>}
            <span className="text-[10px] text-gray-600">{item.timestamp}</span>
            {item.scores && (
              <span className="text-[10px] bg-violet-900/40 text-violet-400 px-2 py-0.5 rounded-full">
                Score: {item.scores.original.overall} → {item.scores.improved.overall}
              </span>
            )}
            {item.aiScoreBefore !== undefined && item.aiScoreAfter !== undefined && (
              <span className="text-[10px] bg-green-900/40 text-green-400 px-2 py-0.5 rounded-full">
                AI: {item.aiScoreBefore}% → {item.aiScoreAfter}%
              </span>
            )}
          </div>
          <p className="text-gray-400 truncate text-xs">{item.original}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setExpanded(!expanded)} className="text-gray-600 hover:text-gray-300 text-xs px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors">
            {expanded ? "▲" : "▼"}
          </button>
          <button onClick={() => onRestore(item)} className="text-violet-500 hover:text-violet-300 text-xs px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors">
            Restore
          </button>
          <button onClick={() => onDelete(item.id)} className="text-gray-700 hover:text-red-400 text-xs px-2 py-1 rounded-lg hover:bg-gray-800 transition-colors">
            ✕
          </button>
        </div>
      </div>
      {expanded && (
        <div className="mt-3 pt-3 border-t border-gray-800 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] text-gray-600 uppercase mb-1">Original</p>
            <p className="text-gray-400 text-xs whitespace-pre-wrap">{item.original}</p>
          </div>
          <div>
            <p className="text-[10px] text-violet-600 uppercase mb-1">Output</p>
            <p className="text-gray-300 text-xs whitespace-pre-wrap">{item.output}</p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Tab: Improve ─────────────────────────────────────────────────────────────

function ImproveTab({ addToHistory }) {
  const [original, setOriginal]           = useState("")
  const [improved, setImproved]           = useState("")
  const [loading, setLoading]             = useState(false)
  const [selectedTone, setSelectedTone]   = useState("general")
  const [scores, setScores]               = useState(null)
  const [scoresLoading, setScoresLoading] = useState(false)

  const handleImprove = async () => {
    if (!original.trim()) return
    setLoading(true)
    setImproved("")
    setScores(null)
    try {
      const result = await callAI([{
        role: "user",
        content: `You are an expert prompt engineer. Rewrite the user's prompt to be clearer, more specific, and more likely to get an excellent response from any AI model.

Tone instruction: ${TONE_INSTRUCTIONS[selectedTone]}

Rules:
- Keep the original intent 100%
- Add context, structure, and clarity
- Do NOT answer the prompt — only improve it
- Return ONLY the improved prompt, nothing else

Original prompt:
${original}`,
      }])
      setImproved(result)
      setLoading(false)

      setScoresLoading(true)
      try {
        const scoreRaw = await callAI([{ role: "user", content: SCORE_PROMPT(original, result) }])
        const parsed = JSON.parse(scoreRaw.replace(/```json|```/g, "").trim())
        setScores(parsed)
        addToHistory({ type: "improve", original, output: result, tone: selectedTone, scores: parsed })
      } catch { addToHistory({ type: "improve", original, output: result, tone: selectedTone }) }
      finally { setScoresLoading(false) }
    } catch {
      setImproved("❌ Error: Could not connect. Check your API key in Netlify environment variables.")
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Tone</label>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {TONES.map(t => <ToneButton key={t.id} tone={t} selected={selectedTone === t.id} onClick={setSelectedTone} />)}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <PromptBox label="Your Prompt" value={original} onChange={setOriginal} placeholder="e.g. write me a cover letter..." />
          <ActionButton onClick={handleImprove} disabled={!original.trim()} loading={loading} label="✨ Improve My Prompt" loadingLabel="Improving..." />
        </div>
        <div className="flex flex-col gap-2">
          <PromptBox
            label={`Improved Prompt${improved && !loading ? " · " + TONES.find(t => t.id === selectedTone)?.label : ""}`}
            value={improved} readOnly glowActive={!!improved && !loading}
            placeholder="Your improved prompt will appear here..."
          />
          <CopyButton text={improved} loading={loading} />
        </div>
      </div>
      {(scoresLoading || scores) && <ScorePanel scores={scores} loading={scoresLoading} />}
    </div>
  )
}

// ─── Tab: Rephrase ────────────────────────────────────────────────────────────

function RephraseTab({ addToHistory }) {
  const [original, setOriginal]           = useState("")
  const [rephrased, setRephrased]         = useState("")
  const [loading, setLoading]             = useState(false)
  const [selectedTone, setSelectedTone]   = useState("formal")

  const handleRephrase = async () => {
    if (!original.trim()) return
    setLoading(true)
    setRephrased("")
    try {
      const result = await callAI([{
        role: "user",
        content: `You are an expert writer and communication coach. Rephrase the following text in the requested tone.

Tone: ${REPHRASE_INSTRUCTIONS[selectedTone]}

Rules:
- Keep the original meaning 100%
- Only change the tone and style, not the facts
- Do NOT add new information
- Return ONLY the rephrased text, nothing else

Text to rephrase:
${original}`,
      }])
      setRephrased(result)
      addToHistory({ type: "rephrase", original, output: result, tone: selectedTone })
    } catch {
      setRephrased("❌ Error: Could not connect. Check your API key in Netlify environment variables.")
    } finally {
      setLoading(false)
    }
  }

  const currentTone = REPHRASE_TONES.find(t => t.id === selectedTone)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 block">Target Tone</label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {REPHRASE_TONES.map(t => <ToneButton key={t.id} tone={t} selected={selectedTone === t.id} onClick={setSelectedTone} />)}
        </div>
      </div>
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 text-xs text-gray-500">
        💡 <span className="text-gray-400">Use this for everyday writing — emails, messages, essays, texts — not just AI prompts.</span>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <PromptBox label="Original Text" value={original} onChange={setOriginal} placeholder="Paste any sentence or paragraph here..." />
          <ActionButton
            onClick={handleRephrase}
            disabled={!original.trim()}
            loading={loading}
            label={`🔄 Rephrase as ${currentTone?.label}`}
            loadingLabel="Rephrasing..."
          />
        </div>
        <div className="flex flex-col gap-2">
          <PromptBox
            label={`Rephrased · ${currentTone?.label || ""}`}
            value={rephrased} readOnly glowActive={!!rephrased && !loading}
            placeholder="Your rephrased text will appear here..."
          />
          <CopyButton text={rephrased} loading={loading} />
        </div>
      </div>
    </div>
  )
}

// ─── Tab: Humanise ────────────────────────────────────────────────────────────

function HumaniseTab({ addToHistory }) {
  const [original, setOriginal]             = useState("")
  const [humanised, setHumanised]           = useState("")
  const [loading, setLoading]               = useState(false)
  const [aiScoreBefore, setAiScoreBefore]   = useState(null)
  const [aiScoreAfter, setAiScoreAfter]     = useState(null)
  const [aiReasons, setAiReasons]           = useState([])
  const [step, setStep]                     = useState("")

  const handleHumanise = async () => {
    if (!original.trim()) return
    setLoading(true)
    setHumanised("")
    setAiScoreBefore(null)
    setAiScoreAfter(null)
    setAiReasons([])

    try {
      // Step 1: Score original
      setStep("Analysing AI patterns...")
      let beforeScore = null
      let reasons = []
      try {
        const beforeRaw = await callAI([{ role: "user", content: AI_SCORE_PROMPT(original) }])
        const parsed = JSON.parse(beforeRaw.replace(/```json|```/g, "").trim())
        beforeScore = parsed.score
        reasons = parsed.reasons || []
        setAiScoreBefore(beforeScore)
        setAiReasons(reasons)
      } catch { /* silent */ }

      // Step 2: Humanise
      setStep("Humanising text...")
      const result = await callAI([{ role: "user", content: HUMANISE_PROMPT(original) }])
      setHumanised(result)

      // Step 3: Score output
      setStep("Scoring result...")
      let afterScore = null
      try {
        const afterRaw = await callAI([{ role: "user", content: AI_SCORE_PROMPT(result) }])
        const parsed = JSON.parse(afterRaw.replace(/```json|```/g, "").trim())
        afterScore = parsed.score
        setAiScoreAfter(afterScore)
      } catch { /* silent */ }

      addToHistory({
        type: "humanise",
        original,
        output: result,
        tone: null,
        aiScoreBefore: beforeScore,
        aiScoreAfter: afterScore,
      })

    } catch {
      setHumanised("❌ Error: Could not connect. Check your API key in Netlify environment variables.")
    } finally {
      setLoading(false)
      setStep("")
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 text-xs flex flex-col gap-1">
        <p className="text-gray-400 font-medium">🧹 What this does</p>
        <p className="text-gray-500">Removes AI-sounding patterns — em-dashes, filler phrases like "delve into" or "it's worth noting", and unnatural formality — and rewrites your text to sound genuinely human.</p>
        <p className="text-gray-600 mt-1">Works with: ChatGPT output, Claude responses, Gemini drafts, any AI-generated text.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <PromptBox label="AI-Generated Text" value={original} onChange={setOriginal} placeholder="Paste your AI-generated text here..." />
          <ActionButton
            onClick={handleHumanise}
            disabled={!original.trim()}
            loading={loading}
            label="🧹 Humanise Text"
            loadingLabel={step || "Processing..."}
          />
        </div>
        <div className="flex flex-col gap-2">
          <PromptBox label="Humanised Text" value={humanised} readOnly glowActive={!!humanised && !loading} placeholder="Your humanised text will appear here..." />
          <CopyButton text={humanised} loading={loading} />
        </div>
      </div>
      <AiScoreDisplay before={aiScoreBefore} after={aiScoreAfter} reasons={aiReasons} />
    </div>
  )
}

// ─── Tab: History ─────────────────────────────────────────────────────────────

function HistoryTab({ history, onRestore, onDelete, onClear }) {
  const [filter, setFilter] = useState("all")
  const filtered = filter === "all" ? history : history.filter(h => h.type === filter)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-1 bg-gray-900 rounded-xl p-1 flex-wrap">
          {[
            { id: "all",      label: `All (${history.length})` },
            { id: "improve",  label: "✨ Improve"  },
            { id: "rephrase", label: "🔄 Rephrase" },
            { id: "humanise", label: "🧹 Humanise" },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f.id ? "bg-violet-600 text-white" : "text-gray-500 hover:text-white"}`}
            >
              {f.label}
            </button>
          ))}
        </div>
        {history.length > 0 && (
          <button onClick={onClear} className="text-xs text-gray-600 hover:text-red-400 transition-colors">
            Clear all
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-700">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-sm">No history yet.</p>
          <p className="text-xs mt-1">Your sessions will be saved here automatically.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map(item => (
            <HistoryItem key={item.id} item={item} onRestore={onRestore} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState("improve")
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("superprompt_history") || "[]") }
    catch { return [] }
  })

  useEffect(() => {
    localStorage.setItem("superprompt_history", JSON.stringify(history))
  }, [history])

  const addToHistory = (entry) => {
    const item = {
      id: Date.now(),
      ...entry,
      timestamp: new Date().toLocaleString("en-GB", { dateStyle: "short", timeStyle: "short" }),
    }
    setHistory(prev => [item, ...prev].slice(0, 30))
  }

  const handleRestore = (item) => setActiveTab(item.type)
  const handleDelete  = (id)   => setHistory(prev => prev.filter(i => i.id !== id))
  const handleClear   = ()     => { if (confirm("Clear all history?")) setHistory([]) }

  const TABS = [
    { id: "improve",  label: "✨ Improve"  },
    { id: "rephrase", label: "🔄 Rephrase" },
    { id: "humanise", label: "🧹 Humanise" },
    { id: "history",  label: "📋 History", badge: history.length },
  ]

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-900 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">⚡ SuperPrompt</h1>
            <p className="text-gray-600 text-xs">Your AI writing toolkit</p>
          </div>
          <nav className="flex items-center gap-1 bg-gray-900 rounded-xl p-1 flex-wrap">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5
                  ${activeTab === tab.id ? "bg-violet-600 text-white" : "text-gray-400 hover:text-white"}`}
              >
                {tab.label}
                {tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? "bg-violet-500" : "bg-gray-800 text-gray-500"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-4 py-8">
        {activeTab === "improve"  && <ImproveTab  addToHistory={addToHistory} />}
        {activeTab === "rephrase" && <RephraseTab addToHistory={addToHistory} />}
        {activeTab === "humanise" && <HumaniseTab addToHistory={addToHistory} />}
        {activeTab === "history"  && <HistoryTab  history={history} onRestore={handleRestore} onDelete={handleDelete} onClear={handleClear} />}
      </main>
    </div>
  )
}