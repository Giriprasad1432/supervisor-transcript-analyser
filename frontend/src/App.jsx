import React, { useState } from 'react';
import axios from 'axios';
import { Search, FileText, TrendingUp, AlertTriangle, HelpCircle, Loader2, RefreshCcw, Target } from 'lucide-react';

const samples = {
  karthik: "Karthik is a great worker. He comes on time, leaves on time — actually he stays late most days, I don't ask him to. He's always on the floor. He helps me with production tracking. Earlier I used to maintain everything in my head — how many pieces came off each machine, what's the rejection rate, what's pending for dispatch. Every evening he updates it and sends it to me on WhatsApp. Very useful. He also handles a lot of the coordination. When we have quality complaints from Tier 1 — they send an email, sometimes call directly — Karthik takes the first call. He notes down the complaint, talks to the QC team, and gives me a summary. He did a study on cycle times and suggested we move the deburring station closer to the CNC machines. Good idea. We did it. Saved maybe 10 minutes per batch in material handling. Sometimes he asks too many questions — like he wants to understand everything before doing it. He doesn't really push back. If I tell him to do something, he does it. Even if it's not the best way. I wish he would tell me sometimes, 'Sir, I think we should do it differently.' But maybe he's still new. He'll get there. The workers on the floor know him. He speaks to them in Marathi — that helps.",
  meena: "Meena has been with us for six months now. She's... different. When she started, we had a huge problem with the inventory management. We were losing track of raw materials, especially the high-value alloy steels. Meena didn't just 'help' like the others. She spent two weeks just observing, talking to the storekeeper, the logistics guys. Then she built a custom database using Excel and some VBA scripts. Now, we have real-time tracking. If a bar of steel moves from the store to the shop floor, the system knows. It's not just her doing it—the storekeeper now uses the system she built. That's what I like. She builds things that work even when she's not there. She's also very direct. Sometimes too direct. Last week, I told her to prioritize the Bosch order. She looked at the data and told me, 'Sir, if we do that, we miss the deadline for the Siemens order, which has a higher penalty. We should stick to the original schedule.' She was right. I don't always like being corrected, but I need someone who isn't afraid to say no when the data says otherwise. She's already training a junior to take over the inventory system so she can focus on quality control. That's Layer 2 thinking right there.",
  anil: "Anil is my go-to guy for everything. Honestly, I don't know what I'd do without him. If a machine breaks down at 2 AM, Anil is the one who picks up the phone and drives to the factory. He knows every nut and bolt in this place. Last month, when we had that power surge that fried the controllers on the older CNCs, Anil spent 48 hours straight here, manually resetting the parameters and getting us back online. We only missed our shipment by six hours. That's dedication. He doesn't really use the tracking systems Meena built—he says he prefers to keep it in his logbook. He's got 20 of those logbooks from the last five years. If you want to know what happened on Machine 4 in 2019, he can find it in five minutes. The only problem is... if Anil isn't here, nobody else knows how to fix those old controllers. He hasn't really trained anyone else because he says 'you can't teach 20 years of experience.' He's a legend on the floor, but I worry about what happens when he eventually retires."
};

function App() {
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const analyze = async () => {
    if (!transcript.trim()) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post('http://localhost:3000/ask', { transcript });
      setResult(data);
    } catch (err) {
      setError('Failed to analyze. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            Trinethra Analyzer
          </h1>
          <p className="text-slate-400">Supervisor Transcript Diagnostic Tool</p>
        </header>

        <div className="grid lg:grid-cols-2 gap-8">
          <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
            <div className="flex flex-col gap-4 mb-4">
              <h2 className="flex items-center gap-2 text-xl font-semibold">
                <FileText className="text-blue-400" /> Input Transcript
              </h2>
              <div className="flex flex-col gap-2 p-3 bg-slate-900/50 rounded-xl border border-slate-700">
                <h3 className="text-xs text-slate-500 font-bold uppercase tracking-wider">Suggested Samples:</h3>
                <div className="flex gap-2">
                  {Object.keys(samples).map(name => (
                    <button
                      key={name}
                      onClick={() => setTranscript(samples[name])}
                      className="px-4 py-1.5 text-xs bg-slate-700 hover:bg-slate-600 rounded-lg capitalize font-bold transition-all active:scale-95"
                    >
                      {name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <textarea
              className="w-full h-64 bg-slate-950 rounded-xl p-4 text-slate-300 border border-slate-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none transition"
              placeholder="Paste supervisor transcript here..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />

            <div className="grid grid-cols-4 gap-3 mt-4">
              <button
                onClick={analyze}
                disabled={loading || !transcript}
                className="col-span-3 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-700 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
                {loading ? 'Analyzing...' : 'Analyze Fellow Performance'}
              </button>
              <button 
                onClick={() => { setTranscript(""); setResult(null); }}
                className="py-3 bg-slate-700 hover:bg-red-500 rounded-xl font-bold flex justify-center items-center gap-2 transition-all active:scale-95 group"
              >
                <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                Reset
              </button>
            </div>
            {error && <p className="mt-2 text-red-400 text-sm font-bold">{error}</p>}
          </section>

          <section className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl min-h-[400px]">
            {!result && !loading && (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 text-center">
                <TrendingUp size={48} className="mb-4 opacity-20" />
                <p>Run analysis to see diagnostic results</p>
              </div>
            )}

            {result && (
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-slate-950 rounded-xl border-l-4 border-blue-500">
                  <div>
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Diagnostic Score</p>
                    <p className="text-3xl font-bold text-blue-400">{result.score.value}/10</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-xs uppercase tracking-wider font-bold">Band</p>
                    <p className="text-lg font-bold text-emerald-400">{result.score.label}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-slate-400 text-xs uppercase tracking-wider font-bold mb-2">Justification</h3>
                  <p className="text-slate-300 leading-relaxed text-sm">{result.score.justification}</p>
                </div>

                {result.gaps.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-amber-400 text-xs uppercase tracking-wider font-bold mb-2">
                      <AlertTriangle size={16} /> Key Gaps (Missing Evidence)
                    </h3>
                    <div className="space-y-2">
                      {result.gaps.map((gap, i) => (
                        <div key={i} className="p-3 bg-amber-400/5 rounded-lg border border-amber-400/20 text-sm text-amber-100">
                          <span className="font-bold capitalize">{gap.dimension}:</span> {gap.detail}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.followUpQuestions.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-emerald-400 text-xs uppercase tracking-wider font-bold mb-2">
                      <HelpCircle size={16} /> Strategic Follow-ups
                    </h3>
                    <div className="space-y-2">
                      {result.followUpQuestions.map((q, i) => (
                        <div key={i} className="p-3 bg-emerald-400/5 rounded-lg border border-emerald-400/20 text-sm text-emerald-100 italic">
                          "{q.question}"
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.kpiMapping && result.kpiMapping.length > 0 && (
                  <div>
                    <h3 className="flex items-center gap-2 text-purple-400 text-xs uppercase tracking-wider font-bold mb-2">
                      <Target size={16} /> KPI Mapping
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {result.kpiMapping.map((kpi, i) => (
                        <div key={i} className="p-3 bg-purple-400/5 rounded-lg border border-purple-400/20 text-sm flex flex-col justify-between">
                          <div>
                            <p className="font-bold text-purple-300">{kpi.kpi}</p>
                            <p className="text-xs text-slate-400 mt-1 italic leading-tight">"{kpi.evidence}"</p>
                          </div>
                          <div className="mt-2 text-right">
                            <span className="inline-block px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 border border-slate-700 text-slate-300">
                              {kpi.systemOrPersonal}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {result && result.evidence && (
          <section className="mt-8 bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-xl">
            <h3 className="text-xl font-semibold mb-4">Evidence Matrix</h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {result.evidence.map((ev, i) => (
                <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-700 hover:border-slate-500 transition-all">
                  <p className="text-slate-100 text-sm mb-3 italic">"{ev.quote}"</p>
                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${ev.signal === 'positive' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}`}>
                      {ev.signal}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono font-bold">{ev.dimension}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;
