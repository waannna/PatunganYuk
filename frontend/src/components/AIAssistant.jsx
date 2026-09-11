// src/components/AIAssistant.jsx
import { useState, useRef, useEffect } from 'react';
import { 
  Bot, Send, User, X, Minimize2, Maximize2, Loader2
} from 'lucide-react';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'HALO! SAYA ASISTEN AI PATUNGANYUK.\n\nAda yang bisa saya bantu? Coba tanyakan:\n\n• CARA BUAT GRUP\n• TAMBAH ANGGOTA\n• CATAT PENGELUARAN\n• PELUNASAN UTANG',
      timestamp: new Date(),
      quickReplies: [
        { label: '📋 CARA BUAT GRUP', value: 'cara buat grup' },
        { label: '👥 TAMBAH ANGGOTA', value: 'tambah anggota' },
        { label: '💰 CATAT PENGELUARAN', value: 'catat pengeluaran' },
        { label: '💳 PELUNASAN UTANG', value: 'pelunasan utang' }
      ]
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const knowledgeBase = [
    {
      keywords: ['grup', 'buat grup', 'membuat grup', 'cara buat grup'],
      responses: [
        '📋 **CARA MEMBUAT GRUP:**\n\n1. Buka halaman GRUP SAYA\n2. Klik tombol BARU\n3. Masukkan nama grup dan kategori\n4. Klik SIMPAN\n\n✨ Grup akan langsung aktif!'
      ],
      quickReplies: [{ label: '👥 TAMBAH ANGGOTA', value: 'tambah anggota' }]
    },
    {
      keywords: ['anggota', 'tambah anggota', 'invite', 'ajak'],
      responses: [
        '👥 **MENAMBAHKAN ANGGOTA:**\n\n1. Pilih grup yang diinginkan\n2. Klik tombol ANGGOTA\n3. Masukkan nama anggota baru\n4. Klik TAMBAH\n\n✅ Anggota langsung terdaftar!'
      ],
      quickReplies: [{ label: '💰 CATAT PENGELUARAN', value: 'catat pengeluaran' }]
    },
    {
      keywords: ['pengeluaran', 'tambah pengeluaran', 'catat pengeluaran', 'transaksi'],
      responses: [
        '💰 **MENCATAT PENGELUARAN:**\n\n1. Pilih grup\n2. Klik tombol CATAT\n3. Isi form:\n   • Deskripsi\n   • Nominal\n   • Kategori\n   • Dibayar oleh\n4. Klik SIMPAN\n\n📊 Transaksi langsung tercatat!'
      ],
      quickReplies: [{ label: '💳 PELUNASAN UTANG', value: 'pelunasan utang' }]
    },
    {
      keywords: ['pelunasan', 'bayar utang', 'settle', 'lunas', 'bayar hutang'],
      responses: [
        '💳 **PELUNASAN UTANG:**\n\n1. Buka grup\n2. Klik tombol LUNAS\n3. Pilih:\n   • Pengirim\n   • Penerima\n   • Nominal\n4. Klik CATAT\n\n💡 Atau gunakan SARAN PELUNASAN!'
      ],
      quickReplies: [{ label: '💰 CATAT PENGELUARAN', value: 'catat pengeluaran' }]
    },
    {
      keywords: ['kategori', 'warna', 'label', 'klasifikasi'],
      responses: [
        '🏷️ **MENGELOLA KATEGORI:**\n\n1. Buka KATEGORI\n2. Isi nama kategori\n3. Pilih warna label\n4. Klik TAMBAH\n\n🎨 Kategori muncul di dropdown!'
      ],
      quickReplies: [{ label: '💰 CATAT PENGELUARAN', value: 'catat pengeluaran' }]
    },
    {
      keywords: ['aktivitas', 'riwayat', 'history', 'log'],
      responses: [
        '📝 **HALAMAN AKTIVITAS:**\n\n• Semua transaksi dari seluruh grup\n• Diurutkan dari terbaru\n• Filter kategori\n• Filter periode\n\n🔍 Cari transaksi dengan mudah!'
      ],
      quickReplies: [{ label: '📋 CARA BUAT GRUP', value: 'cara buat grup' }]
    },
    {
      keywords: ['help', 'bantuan', 'panduan', 'cara', 'bagaimana'],
      responses: [
        '🤖 **SAYA ASISTEN AI PATUNGANYUK!**\n\nSaya bisa membantu:\n• 💡 Tips & trik\n• ❓ Jawab pertanyaan\n• 🔧 Panduan\n• 📚 Tutorial\n\nTanyakan apa saja! 🚀'
      ],
      quickReplies: [
        { label: '📋 CARA BUAT GRUP', value: 'cara buat grup' },
        { label: '👥 TAMBAH ANGGOTA', value: 'tambah anggota' }
      ]
    }
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, isMinimized]);

  const findAnswer = (question) => {
    const lowerQuestion = question.toLowerCase();
    let bestMatch = null;
    let bestScore = 0;

    for (const item of knowledgeBase) {
      for (const keyword of item.keywords) {
        if (lowerQuestion.includes(keyword.toLowerCase())) {
          const score = keyword.length;
          if (score > bestScore) {
            bestScore = score;
            bestMatch = item;
          }
        }
      }
    }

    if (bestMatch) {
      return {
        response: bestMatch.responses[0],
        quickReplies: bestMatch.quickReplies || null
      };
    }

    return {
      response: '🤔 Maaf, saya belum mengerti.\n\nCoba tanyakan:\n\n• CARA BUAT GRUP\n• TAMBAH ANGGOTA\n• CATAT PENGELUARAN\n• PELUNASAN UTANG',
      quickReplies: [
        { label: '📋 CARA BUAT GRUP', value: 'cara buat grup' },
        { label: '👥 TAMBAH ANGGOTA', value: 'tambah anggota' }
      ]
    };
  };

  const handleSendMessage = async (e, customMessage = null) => {
    e?.preventDefault?.();
    const messageToSend = customMessage || inputMessage;
    if (!messageToSend?.trim()) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: messageToSend.trim(),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    setTimeout(() => {
      const result = findAnswer(messageToSend);
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
        quickReplies: result.quickReplies
      };
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 600);
  };

  const handleSuggestionClick = (value) => {
    handleSendMessage(null, value);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const isMobile = window.innerWidth < 768;

  // Posisi bottom dinamis
  const bottomPosition = isMobile 
    ? 'calc(80px + env(safe-area-inset-bottom, 0px))' 
    : '90px';

  return (
    <>
      {/* ==================== FLOATING BUTTON ==================== */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed z-40 right-3 lg:right-6"
          style={{ bottom: bottomPosition }}
          aria-label="Buka Asisten AI"
        >
          <div className={`
            bg-stone-900 text-amber-50 border-2 border-stone-900
            receipt-shadow hover:scale-105 transition-transform
            flex items-center justify-center relative
            ${isMobile ? 'w-10 h-10' : 'w-11 h-11'}
          `}>
            <Bot size={isMobile ? 16 : 18} />
            <span className={`
              absolute -top-1 -right-1 bg-emerald-500 
              border-2 border-amber-50 animate-pulse
              ${isMobile ? 'w-2.5 h-2.5' : 'w-3 h-3'}
            `} />
          </div>
        </button>
      )}

      {/* ==================== CHAT WINDOW - COMPACT ==================== */}
      {isOpen && (
        <div 
          className={`
            fixed z-40 transition-all duration-300
            ${isMinimized 
              ? 'w-48 h-10 right-3 lg:right-6' 
              : 'w-[280px] sm:w-[300px] h-[420px] max-h-[65vh] right-3 lg:right-6'
            }
          `}
          style={{ bottom: bottomPosition }}
        >
          <div className="
            receipt-paper receipt-shadow
            border-2 border-stone-400
            overflow-hidden flex flex-col h-full
          ">
            {/* HEADER */}
            <div className="
              bg-stone-900 px-2.5 py-2 
              flex items-center justify-between flex-shrink-0
            ">
              <div className="flex items-center gap-1.5">
                <div className="bg-amber-50/10 p-1 border border-amber-50/20">
                  <Bot size={11} className="text-amber-50" />
                </div>
                <div>
                  <h3 className="
                    font-mono font-bold text-amber-50 uppercase tracking-widest
                    text-[9px]
                  ">
                    ASISTEN AI
                  </h3>
                  <p className="
                    text-[7px] text-amber-50/60 
                    flex items-center gap-1
                    font-mono uppercase tracking-widest
                  ">
                    <span className="w-1 h-1 bg-emerald-400 inline-block animate-pulse" />
                    ONLINE
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1 text-amber-50/60 hover:text-amber-50 transition-colors"
                  aria-label="Minimize"
                >
                  {isMinimized ? <Maximize2 size={11} /> : <Minimize2 size={11} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-amber-50/60 hover:text-amber-50 transition-colors"
                  aria-label="Tutup"
                >
                  <X size={12} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* MESSAGES */}
                <div className="flex-1 overflow-y-auto p-2 space-y-2.5 bg-stone-100">
                  {messages.map((message) => (
                    <div key={message.id}>
                      <div className={`
                        flex items-start gap-1.5 
                        ${message.role === 'user' ? 'flex-row-reverse' : ''}
                      `}>
                        <div className={`
                          w-6 h-6 flex items-center justify-center flex-shrink-0
                          border font-mono font-bold
                          ${message.role === 'assistant' 
                            ? 'bg-stone-900 text-amber-50 border-stone-900' 
                            : 'bg-amber-50 text-stone-900 border-stone-900'}
                        `}>
                          {message.role === 'assistant' ? <Bot size={10} /> : <User size={10} />}
                        </div>
                        <div className={`
                          flex-1 max-w-[88%] 
                          ${message.role === 'user' ? 'text-right' : ''}
                        `}>
                          <div className={`
                            inline-block p-2 font-mono text-[10px] 
                            leading-relaxed whitespace-pre-wrap
                            border
                            ${message.role === 'assistant' 
                              ? 'bg-amber-50 border-stone-300 text-stone-800' 
                              : 'bg-stone-900 text-amber-50 border-stone-900'}
                          `}>
                            {message.content}
                          </div>
                          <p className={`
                            font-mono text-[8px] text-stone-400 mt-0.5
                            ${message.role === 'user' ? 'text-right' : ''}
                          `}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>

                      {message.quickReplies && message.quickReplies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5 ml-7">
                          {message.quickReplies.map((reply, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleSuggestionClick(reply.value)}
                              className="
                                px-2 py-0.5 
                                bg-white border border-dashed border-stone-300 
                                hover:border-stone-600 hover:bg-stone-50
                                font-mono text-[8px] font-bold uppercase tracking-wider
                                text-stone-700 transition-colors
                              "
                            >
                              {reply.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="flex items-start gap-1.5">
                      <div className="
                        w-6 h-6 flex items-center justify-center 
                        bg-stone-900 text-amber-50 border border-stone-900
                      ">
                        <Bot size={10} />
                      </div>
                      <div className="
                        bg-amber-50 border border-stone-300 p-2
                      ">
                        <Loader2 size={12} className="text-stone-500 animate-spin" />
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>

                {/* INPUT */}
                <form 
                  onSubmit={handleSendMessage} 
                  className="
                    p-2 border-t-2 border-dashed border-stone-300 
                    bg-amber-50 flex-shrink-0
                  "
                >
                  <div className="flex gap-1.5">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="TANYAKAN..."
                      className="
                        flex-1 px-2 py-1.5 
                        bg-white/70 border border-dashed border-stone-300
                        font-mono text-[10px] uppercase
                        focus:border-stone-600 focus:border-solid focus:outline-none
                        placeholder:text-stone-400 placeholder:italic
                      "
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !inputMessage.trim()}
                      className="
                        bg-stone-900 hover:bg-stone-800 
                        text-amber-50 
                        border border-stone-900
                        p-1.5 disabled:opacity-40 
                        transition-colors
                      "
                      aria-label="Kirim"
                    >
                      <Send size={12} />
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}