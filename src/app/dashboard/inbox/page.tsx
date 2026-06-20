"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Check, CheckCheck, Trash2, MessageSquarePlus, Paperclip, X, Loader2, User, ChevronDown, Clock, Bot, AlertCircle, WifiOff, Phone } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

export default function InboxPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [allContacts, setAllContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeContactId, setActiveContactId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newPhone, setNewPhone] = useState("");
  const [newMsg, setNewMsg] = useState("");
  const [sendingNew, setSendingNew] = useState(false);
  const [sendingMsg, setSendingMsg] = useState(false);
  const [devices, setDevices] = useState<any[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluatingMessageId, setEvaluatingMessageId] = useState<string | null>(null);
  const [togglingAi, setTogglingAi] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const toggleAiEnabled = async (checked: boolean) => {
    if (!activeContactId) return;
    setTogglingAi(true);
    try {
      const res = await fetch(`/api/v1/contacts/${activeContactId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ aiEnabled: checked })
      });
      if (res.ok) {
        setConversations(prev => prev.map(c => c.id === activeContactId ? { ...c, aiEnabled: checked } : c));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setTogglingAi(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    fetchAllContacts();
    fetchDevices();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchDevices = async () => {
    try {
      const res = await fetch("/api/devices");
      const data = await res.json();
      if (data.success && data.data) {
        setDevices(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch devices", error);
    }
  };

  const fetchAllContacts = async () => {
    try {
      const res = await fetch("/api/v1/contacts");
      const data = await res.json();
      setAllContacts(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchConversations = async () => {
    try {
      const res = await fetch("/api/v1/inbox");
      const data = await res.json();
      setConversations(data);
      setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const activeConversation = conversations.find(c => c.id === activeContactId);
  const hasConnectedDevice = devices.some(d => d.status === "connect");
  const messages = activeConversation?.messages ? [...activeConversation.messages].reverse() : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeContactId]);

  const getInitials = (name: string) => {
    if (!name || name === "Unknown") return "?";
    const parts = name.split(/[ -]/);
    if (parts.length >= 2 && parts[1].length > 0) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContactId || (!newMessage.trim() && !attachment)) return;
    setSendingMsg(true);
    setSendError(null);

    try {
      const formData = new FormData();
      formData.append('contactId', activeContactId);
      formData.append('content', newMessage.trim());
      if (attachment) {
        formData.append('file', attachment);
      }

      const res = await fetch('/api/v1/inbox', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        setSendError(data.error || "Unknown error");
      } else {
        setNewMessage("");
        setAttachment(null);
        setSendError(null);
        fetchConversations();
      }
    } catch (error: any) {
      setSendError("Network error: " + error.message);
    } finally {
      setSendingMsg(false);
    }
  };

  const deleteMessage = async (msgId: string) => {
    try {
      await fetch(`/api/v1/messages/${msgId}`, { method: "DELETE" });
      await fetchConversations();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteConversation = async (contactId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await fetch(`/api/v1/inbox/${contactId}`, { method: "DELETE" });
      if (activeContactId === contactId) setActiveContactId(null);
      await fetchConversations();
    } catch (error) {
      console.error(error);
    }
  };

  const startNewChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPhone.trim() || !newMsg.trim()) return;
    
    setSendingNew(true);
    try {
      const res = await fetch("/api/v1/inbox/new", {
        method: "POST",
        body: JSON.stringify({ phoneNumber: newPhone, content: newMsg }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        alert("Gagal mengirim pesan: " + (data.error || "Unknown error"));
      } else {
        setShowNewChat(false);
        setNewPhone("");
        setNewMsg("");
        await fetchConversations();
      }
    } catch (error) {
      console.error(error);
      alert("Gagal mengirim pesan: Network error");
    } finally {
      setSendingNew(false);
    }
  };

  const handleEvaluate = async (deviceId: string) => {
    if (!activeContactId || !evaluatingMessageId) return;
    setEvaluating(true);
    try {
      const res = await fetch("/api/v1/inbox/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contactId: activeContactId, messageId: evaluatingMessageId, deviceId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Evaluation submitted successfully. Check the AI dashboard for details.");
        setEvaluatingMessageId(null);
      } else {
        alert(data.error || "Failed to evaluate");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setEvaluating(false);
    }
  };

  // AI is off by default (null = unset = false)
  const aiEnabledForContact = activeConversation?.aiEnabled === true;

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-card rounded-[0.35rem] border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
      
      {/* Sidebar - Conversation List */}
      <div className="w-80 flex-shrink-0 border-r border-border flex flex-col bg-card z-10">
        <div className="p-4 border-b border-border bg-card flex justify-between items-center sticky top-0 z-20">
          <div>
            <h2 className="font-extrabold text-lg text-foreground tracking-tight">Messages</h2>
            <p className="text-xs text-muted-foreground font-medium">{conversations.length} conversations</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowNewChat(true)} 
            className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-[0.25rem] h-9 w-9"
            title="Start new chat"
          >
            <MessageSquarePlus className="w-4 h-4" />
          </Button>
        </div>

        {/* Device Warning Banner */}
        {!hasConnectedDevice && !loading && (
          <div className="mx-3 mt-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-md flex items-start gap-2">
            <WifiOff className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400">No Device Connected</p>
              <p className="text-[11px] text-amber-500/80 mt-0.5">Connect a WhatsApp device to send messages.</p>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquarePlus className="w-7 h-7 text-muted-foreground" />
              </div>
              <p className="text-sm font-bold text-muted-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Start a new chat to begin</p>
            </div>
          ) : (
            <ul className="overflow-hidden">
              <AnimatePresence>
              {conversations.map((contact) => {
                const displayName = contact.name && contact.name !== "Unknown" ? contact.name : `+${contact.phoneNumber.replace('@lid', '')}`;
                const lastMsg = contact.messages && contact.messages[0];
                const isActive = activeContactId === contact.id;
                return (
                  <motion.li 
                    key={contact.id} 
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                    className="relative border-b border-border last:border-b-0 group"
                  >
                    <div
                      onClick={() => { setActiveContactId(contact.id); setSendError(null); }}
                      className={`relative w-full h-full p-3 cursor-pointer transition-all ${isActive ? 'bg-primary/5 border-l-4 border-primary' : 'hover:bg-muted/50 border-l-4 border-transparent'}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-xs bg-gradient-to-br from-primary/30 to-primary/10 text-primary border border-primary/20 shadow-sm">
                          {getInitials(displayName)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-sm text-foreground truncate max-w-[140px]">
                              {displayName}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground flex-shrink-0 ml-1">
                              {lastMsg && new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[12px] text-muted-foreground truncate mt-0.5 font-medium">
                            {lastMsg ? (lastMsg.direction === 'outbound' ? '✓ ' : '') + (lastMsg.content || `[${lastMsg.mediaType}]`) : ""}
                          </p>
                        </div>
                        <button 
                          onClick={(e) => deleteConversation(contact.id, e as any)}
                          className="ml-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 self-center p-1 rounded hover:bg-destructive/10"
                          title="Delete conversation"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
              </AnimatePresence>
            </ul>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-background relative min-w-0">
        
        {activeContactId && activeConversation ? (
          <>
            {/* Chat Header */}
            <div className="px-5 py-3 border-b border-border bg-card flex items-center justify-between z-20 sticky top-0 shadow-sm flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-sm bg-gradient-to-br from-primary/30 to-primary/10 text-primary border border-primary/20 shadow-sm">
                  {getInitials(activeConversation.name !== "Unknown" ? activeConversation.name : activeConversation.phoneNumber.replace('@lid', ''))}
                </div>
                <div className="min-w-0">
                  <h3 className="font-extrabold text-foreground text-base tracking-tight truncate">
                    {activeConversation.name && activeConversation.name !== "Unknown" ? activeConversation.name : `+${activeConversation.phoneNumber.replace('@lid', '')}`}
                  </h3>
                  <p className="text-[11px] font-mono text-muted-foreground truncate">{activeConversation.phoneNumber}</p>
                </div>
              </div>
              
              {/* AI Toggle - Default OFF */}
              <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full border transition-all flex-shrink-0 ${aiEnabledForContact ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-secondary border-border'}`}>
                <Bot className={`w-4 h-4 ${aiEnabledForContact ? 'text-emerald-500 animate-pulse' : 'text-muted-foreground'}`} />
                <div className="flex flex-col items-start">
                  <span className={`text-[11px] font-bold leading-none ${aiEnabledForContact ? 'text-emerald-600 dark:text-emerald-400' : 'text-muted-foreground'}`}>
                    AI Auto-Reply
                  </span>
                  <span className="text-[9px] text-muted-foreground/70 font-medium">
                    {aiEnabledForContact ? 'ON' : 'OFF'}
                  </span>
                </div>
                <Switch 
                  checked={aiEnabledForContact} 
                  onCheckedChange={toggleAiEnabled} 
                  disabled={togglingAi}
                  className={aiEnabledForContact ? 'data-[state=checked]:bg-emerald-500' : ''}
                />
              </div>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 z-10">
              {messages.length === 0 && (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <p className="text-sm">No messages yet in this conversation</p>
                </div>
              )}
              {messages.map((msg: any) => {
                const isOutbound = msg.direction === "outbound";
                return (
                  <div key={msg.id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[70%] px-4 py-2.5 rounded-2xl shadow-sm relative group ${isOutbound ? 'bg-primary text-primary-foreground rounded-br-sm' : 'bg-secondary text-secondary-foreground border border-border rounded-bl-sm'}`}>
                      {msg.senderName && msg.senderName !== "Unknown" && !isOutbound && (
                        <span className="text-[11px] font-bold block mb-1 text-muted-foreground">
                          ~{msg.senderName}
                        </span>
                      )}
                      {msg.mediaUrl && msg.mediaType === 'image' && (
                        <div className="mb-2">
                          <img src={msg.mediaUrl} alt="Attachment" className="max-w-full rounded-xl shadow-sm" />
                        </div>
                      )}
                      {msg.mediaUrl && msg.mediaType === 'document' && (
                        <div className="mb-2 p-3 bg-black/10 rounded-xl flex items-center gap-2">
                          <Paperclip className="w-5 h-5 opacity-70" />
                          <a href={msg.mediaUrl} target="_blank" rel="noreferrer" className="underline font-medium text-sm">Download Document</a>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                      
                      {/* Message actions */}
                      <div className={`absolute top-1 opacity-0 group-hover:opacity-100 transition-opacity ${isOutbound ? "-left-10" : "-right-10"}`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-card shadow-md hover:bg-secondary text-foreground focus:outline-none transition-all border border-border">
                            <ChevronDown className="h-3.5 w-3.5" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isOutbound ? "end" : "start"} className="rounded-[0.25rem] shadow-xl border-border bg-card">
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(msg.content)} className="cursor-pointer font-bold text-foreground text-xs">
                              Copy
                            </DropdownMenuItem>
                            {isOutbound && (
                              <DropdownMenuItem onClick={() => setEvaluatingMessageId(msg.id)} className="cursor-pointer font-bold text-foreground focus:bg-primary/10 focus:text-primary text-xs">
                                <Bot className="h-3.5 w-3.5 mr-2" /> Evaluate AI
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => deleteMessage(msg.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-bold text-xs">
                              <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className={`text-[10px] mt-1 flex justify-end items-center gap-1 font-medium ${isOutbound ? "text-primary-foreground/60" : "text-muted-foreground/70"}`}>
                        {new Date(msg.createdAt).toLocaleDateString() === new Date().toLocaleDateString() 
                          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {isOutbound && (
                          <span className="ml-0.5">
                            {msg.status === 'queued' && <Clock className="w-3 h-3 opacity-60" />}
                            {msg.status === 'sent' && <Check className="w-3 h-3 opacity-80" />}
                            {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 opacity-80" />}
                            {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-300 font-extrabold" />}
                            {msg.status === 'failed' && <span className="text-red-300 text-[9px]">Failed</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Send Message Bar */}
            <div className="p-3 bg-card border-t border-border z-20 flex-shrink-0">
              {/* Error Banner */}
              {sendError && (
                <div className="mb-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-xs text-red-500">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="flex-1">{sendError}</span>
                  <button onClick={() => setSendError(null)} className="text-red-400 hover:text-red-500 ml-1"><X className="w-3.5 h-3.5" /></button>
                </div>
              )}
              {/* No Device Warning */}
              {!hasConnectedDevice && (
                <div className="mb-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <WifiOff className="w-4 h-4 flex-shrink-0" />
                  No WhatsApp device connected. Go to <strong className="mx-1">Devices</strong> to connect first.
                </div>
              )}
              {attachment && (
                <div className="mb-2 p-2 bg-secondary rounded-lg flex items-center justify-between max-w-sm animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {attachment.type.startsWith('image/') ? (
                      <div className="w-8 h-8 rounded bg-muted overflow-hidden flex-shrink-0">
                        <img src={URL.createObjectURL(attachment)} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                        <Paperclip className="w-4 h-4" />
                      </div>
                    )}
                    <span className="text-xs font-bold text-foreground truncate">{attachment.name}</span>
                  </div>
                  <button type="button" onClick={() => setAttachment(null)} className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex items-end gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setAttachment(e.target.files[0]);
                    }
                  }}
                  disabled={!hasConnectedDevice}
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={!hasConnectedDevice}
                  className="h-10 w-10 flex-shrink-0 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground border border-border flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={hasConnectedDevice ? "Type a message..." : "Connect a device to chat"}
                  disabled={!hasConnectedDevice || sendingMsg}
                  className="flex-1 h-10 bg-background rounded-xl px-4 border border-border focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all text-sm text-foreground placeholder-muted-foreground disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button 
                  type="submit"
                  disabled={!hasConnectedDevice || (!newMessage.trim() && !attachment) || sendingMsg}
                  className="h-10 w-10 flex-shrink-0 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
                >
                  {sendingMsg ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground z-10 p-8">
            <div className="w-20 h-20 bg-secondary rounded-full flex items-center justify-center mb-5 shadow-sm border border-border">
              <MessageSquarePlus className="w-9 h-9 text-muted-foreground/50" />
            </div>
            <h3 className="font-bold text-foreground text-base mb-1">Select a conversation</h3>
            <p className="text-sm text-muted-foreground text-center max-w-xs">Choose an existing conversation from the left or start a new one</p>
            <Button onClick={() => setShowNewChat(true)} className="mt-5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm font-bold px-6 h-10">
              <MessageSquarePlus className="w-4 h-4 mr-2" /> New Chat
            </Button>
            {!hasConnectedDevice && (
              <div className="mt-4 px-4 py-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 max-w-xs">
                <WifiOff className="w-4 h-4 flex-shrink-0" />
                No WhatsApp device connected. Go to Devices to connect first.
              </div>
            )}
          </div>
        )}
      </div>

      {/* New Chat Modal */}
      <AnimatePresence>
      {showNewChat && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 bg-background/80 flex items-center justify-center backdrop-blur-sm p-4"
        >
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
            className="bg-card rounded-2xl w-full max-w-md shadow-2xl overflow-hidden border border-border"
          >
            <div className="p-5 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg text-foreground">New Message</h3>
                {!hasConnectedDevice && (
                  <p className="text-xs text-amber-500 font-medium flex items-center gap-1 mt-0.5">
                    <WifiOff className="w-3 h-3" /> No device connected
                  </p>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowNewChat(false)} className="rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground h-8 w-8">
                <X className="w-4 h-4" />
              </Button>
            </div>
            <form onSubmit={startNewChat} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">
                  <Phone className="w-3.5 h-3.5 inline mr-1" />
                  WhatsApp Number
                </label>
                <Input 
                  list="all-contacts"
                  placeholder="e.g. 628123456789" 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-background border-border focus-visible:ring-primary rounded-xl text-foreground"
                />
                <datalist id="all-contacts">
                  {allContacts.map(c => (
                    <option key={c.id} value={c.phoneNumber}>{c.name || c.phoneNumber}</option>
                  ))}
                </datalist>
                <p className="text-[11px] text-muted-foreground mt-1 ml-1">With country code, no '+' (e.g. 628123456789)</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-1.5">Message</label>
                <textarea 
                  className="w-full h-24 border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground resize-none"
                  placeholder="Type your message..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />
              </div>
              <Button 
                type="submit" 
                disabled={sendingNew || !newPhone.trim() || !newMsg.trim() || !hasConnectedDevice} 
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10"
              >
                {sendingNew ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {!hasConnectedDevice ? "No Device Connected" : "Send Message"}
              </Button>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

      {/* Evaluate AI Dialog */}
      <Dialog open={!!evaluatingMessageId} onOpenChange={(open) => !open && setEvaluatingMessageId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Evaluate AI Response</DialogTitle>
            <DialogDescription>
              Select the device to use for evaluating this message.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {devices.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground flex items-start gap-2 bg-secondary/30 rounded-md">
                <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <p>No devices found.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map(d => (
                  <Button 
                    key={d.id} 
                    variant="outline" 
                    className="w-full justify-start h-auto py-3 px-4 rounded-xl"
                    onClick={() => handleEvaluate(d.id)}
                    disabled={evaluating}
                  >
                    <div className="flex flex-col items-start gap-0.5 text-left">
                      <span className="font-bold text-sm">{d.name}</span>
                      <span className="text-xs text-muted-foreground">{d.phoneNumber}</span>
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEvaluatingMessageId(null)} disabled={evaluating}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
