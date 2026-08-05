'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FileText, Star, Edit, Trash2, Bookmark, Search, X, Sparkles, Send, Brain, MessageSquare, ChevronUp, ChevronDown, Maximize2, Minimize2 } from 'lucide-react';
import { useLibrary } from '@/context/LibraryContext';

const MOCK_NOTES = [
  {
    id: 'mock-1',
    bookTitle: 'Trading in the Zone',
    text: 'Consistency in trading is built upon the acceptance of risk. When you truly accept the risk, you will not feel any emotional discomfort or fear.',
    note: 'Important paradigm shift. Apply this to pre-trade planning checklist.',
    date: 'Yesterday',
    page: 112,
    collection: 'Trading'
  },
  {
    id: 'mock-2',
    bookTitle: 'The Productive Muslim',
    text: 'Barakah is the attachment of divine goodness to a thing, so that if it is tiny, it increases, and if it is great, it benefits.',
    note: 'Remember to align intentions before beginning study sessions.',
    date: '3 days ago',
    page: 45,
    collection: 'Quran'
  },
  {
    id: 'mock-3',
    bookTitle: 'Atomic Habits',
    text: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    note: 'Focus on setting up automated syncs and dashboard metrics so tracking is automatic.',
    date: '1 week ago',
    page: 28,
    collection: 'Self Development'
  }
];

const getHighlighterColors = (collection: string) => {
  const normalized = collection.toLowerCase().trim();
  if (normalized === 'quran') {
    return {
      highlightClass: 'bg-emerald-200/50 text-emerald-950 dark:bg-emerald-950/50 dark:text-emerald-200 px-1.5 py-0.5 rounded-md leading-relaxed',
      borderLeft: 'border-l-4 border-emerald-500',
      thoughtBg: 'bg-emerald-50/40 border-emerald-200/30 dark:bg-emerald-950/20 dark:border-emerald-500/10'
    };
  } else if (normalized === 'trading') {
    return {
      highlightClass: 'bg-blue-200/50 text-blue-955 dark:bg-blue-955/50 dark:text-blue-200 px-1.5 py-0.5 rounded-md leading-relaxed',
      borderLeft: 'border-l-4 border-blue-500',
      thoughtBg: 'bg-blue-50/40 border-blue-200/30 dark:bg-blue-950/20 dark:border-blue-500/10'
    };
  } else if (normalized === 'self-development' || normalized === 'self development') {
    return {
      highlightClass: 'bg-indigo-200/50 text-indigo-955 dark:bg-indigo-955/50 dark:text-indigo-200 px-1.5 py-0.5 rounded-md leading-relaxed',
      borderLeft: 'border-l-4 border-indigo-500',
      thoughtBg: 'bg-indigo-50/40 border-indigo-200/30 dark:bg-indigo-950/20 dark:border-indigo-500/10'
    };
  }
  return {
    highlightClass: 'bg-purple-200/50 text-purple-955 dark:bg-purple-950/50 dark:text-purple-200 px-1.5 py-0.5 rounded-md leading-relaxed',
    borderLeft: 'border-l-4 border-purple-500',
    thoughtBg: 'bg-purple-50/40 border-purple-200/30 dark:bg-purple-950/20 dark:border-purple-500/10'
  };
};

export default function Notes() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { highlights, collections, updateHighlight, deleteHighlight } = useLibrary();

  // Inline editing states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editHighlightText, setEditHighlightText] = useState('');
  const [editNoteText, setEditNoteText] = useState('');

  const handleEditClick = (note: any) => {
    if (note.id && String(note.id).startsWith('mock-')) {
      alert("This is a template note. You can create your own notes by highlighting text inside any book in the PDF Reader!");
      return;
    }
    setEditingId(note.id);
    setEditHighlightText(note.text);
    setEditNoteText(note.note || '');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editHighlightText.trim()) {
      alert("Highlight text cannot be empty.");
      return;
    }
    await updateHighlight(id, editHighlightText, editNoteText);
    setEditingId(null);
  };

  const handleDelete = async (id: any) => {
    if (id && String(id).startsWith('mock-')) {
      alert("This is a template note. You can only edit/delete notes you create on your synced books!");
      return;
    }
    if (confirm("Are you sure you want to delete this note?")) {
      await deleteHighlight(id);
    }
  };

  // AI Chat States
  const [aiExpanded, setAiExpanded] = useState(false);
  const [aiMaximized, setAiMaximized] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copyToast, setCopyToast] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([
    {
      role: 'assistant',
      content: 'Peace be upon you! I am your Antigravity AI Study Companion. Ask me to query or synthesize your highlights, outline key concepts, or generate a visual infographic/diagram map of your notes! 📚✨'
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat history window
  useEffect(() => {
    if (aiExpanded && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, aiExpanded]);

  const parseMessageContent = (content: string) => {
    const parts = [];
    
    // Catch-all code blocks that contain '<svg'
    const codeBlockRegex = /```(?:xml|svg|html)?\s*([\s\S]*?)(?:```|$)/g;
    let lastIndex = 0;
    let match;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push({
          type: 'text' as const,
          value: content.slice(lastIndex, match.index)
        });
      }
      
      const blockContent = match[1].trim();
      if (blockContent.startsWith('<svg') || blockContent.includes('<svg')) {
        let svgCode = blockContent;
        const svgStartIdx = svgCode.indexOf('<svg');
        if (svgStartIdx !== -1) {
          svgCode = svgCode.slice(svgStartIdx);
        }
        
        // Dynamic Recovery: If truncated, append closing </svg> tag
        if (!svgCode.includes('</svg>')) {
          svgCode += '\n</svg>';
        }
        
        parts.push({
          type: 'svg' as const,
          value: svgCode
        });
      } else {
        parts.push({
          type: 'text' as const,
          value: match[0]
        });
      }
      
      lastIndex = codeBlockRegex.lastIndex;
      if (match[0].length === 0) break;
    }

    if (lastIndex < content.length) {
      parts.push({
        type: 'text' as const,
        value: content.slice(lastIndex)
      });
    }

    return parts;
  };

  const renderMarkdownText = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      let renderedLine = line.trim();
      if (!renderedLine) return <div key={idx} className="h-2" />;

      if (renderedLine.startsWith('|')) {
        return (
          <div key={idx} className="flex gap-2.5 py-1 px-3 border-b border-border-custom/30 font-mono text-[10px] text-muted-custom">
            {renderedLine.split('|').filter(Boolean).map((cell, cIdx) => (
              <span key={cIdx} className="flex-1 truncate">{cell.trim()}</span>
            ))}
          </div>
        );
      }

      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      while ((match = boldRegex.exec(renderedLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(renderedLine.slice(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} className="font-bold text-accent-gold">{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      if (lastIndex < renderedLine.length) {
        parts.push(renderedLine.slice(lastIndex));
      }

      if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
        return (
          <li key={idx} className="ml-4 list-disc text-xs leading-relaxed text-foreground/90 my-1">
            {parts.length > 0 ? parts : renderedLine.replace(/^[-*]\s+/, '')}
          </li>
        );
      }

      return (
        <p key={idx} className="text-xs leading-relaxed text-foreground/90 my-1">
          {parts.length > 0 ? parts : renderedLine}
        </p>
      );
    });
  };

  const handleSendAiMessage = async (textToSend: string) => {
    if (!textToSend.trim() || aiLoading) return;
    const userMsg = { role: 'user' as const, content: textToSend };
    setChatMessages(prev => [...prev, userMsg]);
    setAiInput('');
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...chatMessages, userMsg].map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            content: m.content
          })),
          highlights: filteredNotes
        })
      });

      const data = await res.json();
      if (data.error) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an issue: ${data.error}` }]);
      } else {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
      }
    } catch (e: any) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: Unable to reach AI Companion. ${e.message}` }]);
    } finally {
      setAiLoading(false);
    }
  };

  const downloadSvg = (svgContent: string, fileName = 'infographic-study-map.svg') => {
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = (text: string, msgId: string) => {
    navigator.clipboard.writeText(text);
    setCopyToast(msgId);
    setTimeout(() => setCopyToast(null), 2500);
  };

  const downloadText = (textContent: string, fileName = 'study-summary.txt') => {
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Combine real database highlights with mock data
  const realNotesMapped = highlights ? highlights.map(h => ({
    id: h.id,
    bookTitle: h.source,
    text: h.text,
    note: h.note || h.text,
    date: h.dateAdded,
    page: 12, // default mock page number
    collection: h.collection || 'Self Development'
  })) : [];

  const allNotes = [...realNotesMapped, ...MOCK_NOTES];

  // Filter notes based on category selection AND keyword search query
  const filteredNotes = allNotes.filter(note => {
    // 1. Search Query Match
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || (
      note.bookTitle.toLowerCase().includes(q) ||
      note.text.toLowerCase().includes(q) ||
      note.note.toLowerCase().includes(q)
    );

    // 2. Category Match
    const matchesCategory = selectedCategory === 'all' || 
      (note.collection && note.collection.toLowerCase().trim() === selectedCategory.toLowerCase().trim());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 p-6 md:p-10 max-w-3xl mx-auto w-full">
      <header className="mb-8">
        <h1 className="text-sm font-medium text-muted-custom uppercase tracking-widest mb-1">
          Highlights and thoughts
        </h1>
        <p className="font-handwritten text-4xl font-bold tracking-tight text-header-custom">
          Notes
        </p>
      </header>

      {/* Dynamic Search Box */}
      <div className="relative mb-4 shadow-sm">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-custom" />
        <input
          type="text"
          placeholder="Search notes, book titles, or your thoughts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-11 py-3 bg-card border border-border-custom rounded-2xl text-xs focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 transition-all text-foreground"
        />
        {searchQuery && (
          <button 
            onClick={() => setSearchQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-foreground/5 text-muted-custom hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all border cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-accent-gold text-background border-accent-gold shadow-sm'
              : 'bg-card text-muted-custom border-border-custom hover:bg-foreground/5'
          }`}
        >
          All
        </button>
        {collections.map(c => (
          <button
            key={c.slug}
            onClick={() => setSelectedCategory(c.name)}
            className={`px-3 py-1.5 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all border cursor-pointer ${
              selectedCategory.toLowerCase().trim() === c.name.toLowerCase().trim()
                ? 'bg-accent-gold text-background border-accent-gold shadow-sm'
                : 'bg-card text-muted-custom border-border-custom hover:bg-foreground/5'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Collapsible AI Study Companion Widget */}
      <div className="mb-8 border border-border-custom bg-card/60 backdrop-blur-md rounded-3xl overflow-hidden shadow-md transition-all duration-500">
        {/* Header Header */}
        <div 
          onClick={() => setAiExpanded(!aiExpanded)}
          className="p-5 flex items-center justify-between cursor-pointer select-none bg-foreground/5 hover:bg-foreground/10 transition-colors"
        >
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-accent-gold/10 border border-accent-gold/25 text-accent-gold animate-pulse">
              <Brain className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-serif text-sm font-bold text-foreground flex items-center gap-1.5">
                AI Study Companion <span className="text-[10px] text-accent-gold bg-accent-gold/15 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Beta</span>
              </h3>
              <p className="text-[10px] text-muted-custom mt-0.5">
                Query, synthesize, and create visual infographics of your highlights
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
            {aiExpanded && (
              <button 
                onClick={() => setAiMaximized(!aiMaximized)}
                className="text-muted-custom hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-foreground/5 cursor-pointer"
                title={aiMaximized ? "Minimize View" : "Enlarge View"}
              >
                {aiMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            )}
            <button 
              onClick={() => { setAiExpanded(!aiExpanded); if (aiExpanded) setAiMaximized(false); }}
              className="text-muted-custom hover:text-foreground transition-colors p-1.5 rounded-full hover:bg-foreground/5 cursor-pointer"
            >
              {aiExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsed Suggestion Bar */}
        {!aiExpanded && (
          <div className="px-5 pb-5 pt-1.5 flex flex-wrap gap-2 overflow-x-auto">
            <button 
              onClick={() => { setAiExpanded(true); handleSendAiMessage("Summarize all my highlights and notes into a structured study checklist."); }}
              className="text-[10px] bg-foreground/5 hover:bg-accent-gold/10 hover:text-accent-gold border border-border-custom/50 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer"
            >
              📝 Summarize Notes
            </button>
            <button 
              onClick={() => { setAiExpanded(true); handleSendAiMessage("Analyze my highlights and generate a visual flowchart infographic comparing key trading principles and Quranic mindset notes."); }}
              className="text-[10px] bg-foreground/5 hover:bg-accent-gold/10 hover:text-accent-gold border border-border-custom/50 px-3 py-1.5 rounded-xl font-medium transition-colors cursor-pointer"
            >
              📊 Generate Infographic Map
            </button>
          </div>
        )}

        {/* Expanded Chat area */}
        {aiExpanded && (
          <div className="border-t border-border-custom/50 p-5 flex flex-col gap-4 bg-background/25">
            {/* Scrollable messages box */}
            <div className={`overflow-y-auto pr-1 flex flex-col gap-4 scrollbar-thin transition-all duration-300 ${
              aiMaximized ? 'max-h-[650px] min-h-[480px]' : 'max-h-[360px]'
            }`}>
              {chatMessages.map((msg, index) => {
                const isAi = msg.role === 'assistant';
                return (
                  <div key={index} className={`flex gap-3 max-w-[85%] ${isAi ? 'self-start' : 'self-end flex-row-reverse'}`}>
                    {/* Avatar */}
                    <span className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border text-xs font-bold ${
                      isAi 
                        ? 'bg-accent-gold/10 border-accent-gold/30 text-accent-gold' 
                        : 'bg-indigo-500/10 border-indigo-500/25 text-indigo-400'
                    }`}>
                      {isAi ? 'AI' : 'ME'}
                    </span>
                    
                    {/* Bubble Wrapper */}
                    {isAi ? (
                      <div className="flex flex-col gap-1.5 min-w-0">
                        {/* Bubble Content */}
                        <div className="p-3.5 rounded-2xl text-xs leading-relaxed border bg-card/90 border-border-custom/40 rounded-tl-none text-foreground shadow-sm">
                          {parseMessageContent(msg.content).map((part, pIdx) => {
                            if (part.type === 'svg') {
                              return (
                                <div key={pIdx} className="w-full my-4 flex flex-col gap-2 group/svg select-none">
                                  <div 
                                    className="w-full bg-slate-900/50 p-4 rounded-2xl border border-border-custom/60 overflow-x-auto flex justify-center shadow-inner"
                                    dangerouslySetInnerHTML={{ __html: part.value }}
                                  />
                                  <div className="flex justify-end">
                                    <button
                                      onClick={() => downloadSvg(part.value)}
                                      className="px-3 py-1.5 bg-foreground/5 hover:bg-accent-gold/10 hover:text-accent-gold border border-border-custom/50 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                                    >
                                      Download SVG File 📥
                                    </button>
                                  </div>
                                </div>
                              );
                            }
                            return <div key={pIdx} className="space-y-1.5">{renderMarkdownText(part.value)}</div>;
                          })}
                        </div>
                        
                        {/* Text Action Bar */}
                        <div className="flex items-center gap-2.5 ml-1">
                          <button
                            onClick={() => copyToClipboard(msg.content, `msg-${index}`)}
                            className="text-[9px] font-bold uppercase tracking-wider text-muted-custom hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
                          >
                            📋 {copyToast === `msg-${index}` ? 'Copied!' : 'Copy to Clipboard'}
                          </button>
                          <span className="text-muted-custom/30 text-[9px]">•</span>
                          <button
                            onClick={() => downloadText(msg.content)}
                            className="text-[9px] font-bold uppercase tracking-wider text-muted-custom hover:text-foreground transition-all flex items-center gap-1 cursor-pointer"
                          >
                            💾 Save to Notepad (.txt)
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* User Bubble Content */
                      <div className="p-3.5 rounded-2xl text-xs leading-relaxed border bg-accent-gold text-background border-accent-gold rounded-tr-none font-medium shadow-sm">
                        <p>{msg.content}</p>
                      </div>
                    )}
                  </div>
                );
              })}

              {aiLoading && (
                <div className="flex gap-3 self-start max-w-[80%]">
                  <span className="w-7 h-7 rounded-xl flex items-center justify-center shrink-0 border bg-accent-gold/10 border-accent-gold/30 text-accent-gold text-xs font-bold animate-spin">
                    AI
                  </span>
                  <div className="p-3.5 bg-card/90 border border-border-custom/40 rounded-2xl rounded-tl-none flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-accent-gold animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick action buttons row inside chat */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-border-custom/30">
              <button 
                onClick={() => handleSendAiMessage("Summarize my Quranic highlights into three primary spiritual takeaways.")}
                className="text-[9px] font-bold uppercase tracking-wider bg-foreground/5 hover:bg-foreground/10 px-2.5 py-1 rounded-xl transition-colors cursor-pointer text-muted-custom"
                disabled={aiLoading}
              >
                🌿 Quran takeaways
              </button>
              <button 
                onClick={() => handleSendAiMessage("Draw a simple visual map charting how James Clear's system-building concept links to Mark Douglas's trading discipline rules.")}
                className="text-[9px] font-bold uppercase tracking-wider bg-foreground/5 hover:bg-foreground/10 px-2.5 py-1 rounded-xl transition-colors cursor-pointer text-muted-custom"
                disabled={aiLoading}
              >
                🗺️ Habits-Trading Linkage Map
              </button>
            </div>

            {/* Input field Form */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendAiMessage(aiInput); }}
              className="flex items-center gap-2 mt-1 relative"
            >
              <input
                type="text"
                placeholder="Ask AI study companion or request a flowchart infographic..."
                value={aiInput}
                onChange={(e) => setAiInput(e.target.value)}
                disabled={aiLoading}
                className="w-full py-3 pl-4 pr-12 bg-card border border-border-custom rounded-2xl text-xs focus:outline-none focus:border-accent-gold/50 focus:ring-1 focus:ring-accent-gold/20 text-foreground transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={aiLoading || !aiInput.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-accent-gold text-background rounded-xl hover:opacity-90 disabled:opacity-40 transition-all cursor-pointer flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Highlights List */}
      <div className="flex flex-col gap-6">
        {filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border-custom rounded-3xl p-6">
            <FileText className="w-12 h-12 text-muted-custom mb-3 opacity-50 animate-pulse" />
            <h3 className="font-serif text-lg font-bold">No matching notes</h3>
            <p className="text-xs text-muted-custom max-w-xs mt-1">
              Try searching with another keyword or clearing the input.
            </p>
          </div>
        ) : (
          filteredNotes.map((note, idx) => {
            const colors = getHighlighterColors(note.collection || 'Self Development');
            return (
              <div 
                key={note.id} 
                className={`bg-card border-y border-x md:border border-border-custom rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden flex flex-col gap-4 ${colors.borderLeft}`}
              >
                {/* Paper clipping header */}
                <div className="flex justify-between items-center text-xs border-b border-border-custom/30 pb-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-mono font-bold bg-accent-gold/15 text-accent-gold border border-accent-gold/25 px-2 py-0.5 rounded-lg shrink-0 mr-1 shadow-sm">
                      Note #{idx + 1}
                    </span>
                    <Bookmark className="w-4 h-4 text-accent-gold shrink-0" />
                    <span className="font-serif font-bold text-foreground truncate">
                      {note.bookTitle}
                    </span>
                    <span className="text-[10px] bg-foreground/5 text-muted-custom px-2 py-0.5 rounded-full font-bold ml-1 shrink-0">
                      Page {note.page}
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-custom font-mono shrink-0 ml-2">
                    {note.date}
                  </span>
                </div>

                {editingId === note.id ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-muted-custom">Highlighted Text</label>
                      <textarea
                        value={editHighlightText}
                        onChange={(e) => setEditHighlightText(e.target.value)}
                        className="w-full p-3 text-xs bg-background border border-border-custom rounded-xl focus:outline-none focus:border-accent-gold text-foreground font-serif leading-relaxed"
                        rows={2}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] uppercase font-bold text-muted-custom">My Thoughts</label>
                      <textarea
                        value={editNoteText}
                        onChange={(e) => setEditNoteText(e.target.value)}
                        className="w-full p-3 text-xs bg-background border border-border-custom rounded-xl focus:outline-none focus:border-accent-gold text-foreground leading-relaxed"
                        rows={2}
                      />
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 border border-border-custom text-muted-custom rounded-xl text-xs font-bold hover:text-foreground transition-all cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleSaveEdit(note.id)}
                        className="px-3 py-1.5 bg-accent-gold text-background rounded-xl text-xs font-bold hover:opacity-90 transition-all cursor-pointer"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Kindle Highlighter Text */}
                    <div className="text-sm text-foreground/90 font-serif leading-relaxed italic pl-1 py-1">
                      <span className={colors.highlightClass}>
                        "{note.text}"
                      </span>
                    </div>

                    {/* Sticky Post-it style thoughts */}
                    <div className={`rounded-2xl p-4 border flex flex-col gap-1.5 shadow-inner ${colors.thoughtBg}`}>
                      <span className="text-[9px] uppercase tracking-wider font-bold text-muted-custom">
                        My Thoughts
                      </span>
                      <p className="text-xs text-foreground/80 leading-relaxed">
                        {note.note}
                      </p>
                    </div>

                    {/* Operations Footer */}
                    <div className="flex justify-end gap-3 pt-3 border-t border-border-custom/30 text-muted-custom text-xs">
                      <button 
                        onClick={() => handleEditClick(note)}
                        className="hover:text-foreground flex items-center gap-1 transition-colors cursor-pointer font-semibold"
                      >
                        <Edit className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(note.id)}
                        className="hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
