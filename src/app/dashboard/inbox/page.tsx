"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Check, CheckCheck, Trash2, MessageSquarePlus, Paperclip, X, Loader2, User, ChevronDown, Clock, Bot, AlertCircle } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

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
  const [devices, setDevices] = useState<any[]>([]);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluatingMessageId, setEvaluatingMessageId] = useState<string | null>(null);

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
  const messages = activeConversation?.messages ? [...activeConversation.messages].reverse() : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, activeContactId]);

  const getSenderNameDisplay = (senderName: string) => {
    if (!senderName) return "Unknown";
    if (/^\d+$/.test(senderName)) {
      const contact = allContacts.find(c => c.phoneNumber.startsWith(senderName));
      if (contact && contact.name && contact.name !== "Unknown") {
        return contact.name;
      }
      return `+${senderName}`;
    }
    return senderName;
  };

  const getAvatarColor = (name: string) => {
    return "bg-secondary text-secondary-foreground border border-border shadow-sm";
  };

  const getInitials = (name: string) => {
    if (!name || name === "Unknown") return "?";
    const parts = name.split(/[ -]/);
    if (parts.length >= 2 && parts[1].length > 0) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeContactId || (!newMessage.trim() && !attachment)) return;

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
        alert("Failed to send message: " + (data.error || "Unknown error"));
      } else {
        setNewMessage("");
        setAttachment(null);
      }
      
      fetchConversations();
    } catch (error) {
      console.error("Failed to send message", error);
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
      await fetch("/api/v1/inbox/new", {
        method: "POST",
        body: JSON.stringify({ phoneNumber: newPhone, content: newMsg }),
        headers: { "Content-Type": "application/json" }
      });
      setShowNewChat(false);
      setNewPhone("");
      setNewMsg("");
      await fetchConversations();
    } catch (error) {
      console.error(error);
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

  return (
    <div className="h-[calc(100vh-8rem)] flex bg-card rounded-[0.35rem] border border-border shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-500 relative">
      <div className="w-1/3 border-r border-border flex flex-col bg-card z-10">
        <div className="p-4 border-b border-border bg-card flex justify-between items-center sticky top-0 z-20">
          <h2 className="font-extrabold text-lg text-foreground tracking-tight">Messages</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowNewChat(true)} className="text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors rounded-[0.25rem] h-8 w-8">
            <MessageSquarePlus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading && conversations.length === 0 ? (
            <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : conversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm font-bold uppercase tracking-widest">No conversations found.</div>
          ) : (
            <ul className="overflow-hidden">
              <AnimatePresence>
              {conversations.map((contact) => {
                const displayName = contact.name && contact.name !== "Unknown" ? contact.name : `+${contact.phoneNumber.replace('@lid', '')}`;
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
                      onClick={() => setActiveContactId(contact.id)}
                      className={`relative w-full h-full p-3 cursor-pointer transition-all ${activeContactId === contact.id ? 'bg-secondary/50 border-l-4 border-primary' : 'hover:bg-muted/50'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-[0.35rem] flex items-center justify-center font-bold text-xs shadow-sm ${getAvatarColor(displayName)}`}>
                            {getInitials(displayName)}
                          </div>
                          <div>
                            <span className="font-extrabold text-sm text-foreground block truncate max-w-[150px]">
                              {displayName}
                            </span>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[150px] font-medium">{contact.messages && contact.messages[0] ? contact.messages[0].content : ""}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-[10px] font-bold text-muted-foreground mt-1">
                            {contact.messages && contact.messages[0] && new Date(contact.messages[0].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          <button 
                            onClick={(e) => deleteConversation(contact.id, e as any)}
                            className="mt-1 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

      <div className="flex-1 flex flex-col bg-background relative">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("https://www.transparenttextures.com/patterns/cubes.png")` }}></div>
        
        {activeContactId && activeConversation ? (
          <>
            <div className="px-5 py-3 border-b border-border bg-card flex items-center justify-between z-20 sticky top-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-[0.35rem] flex items-center justify-center font-bold text-xs shadow-md ${getAvatarColor(activeConversation.name && activeConversation.name !== "Unknown" ? activeConversation.name : `+${activeConversation.phoneNumber}`)}`}>
                  {getInitials(activeConversation.name !== "Unknown" ? activeConversation.name : activeConversation.phoneNumber.replace('@lid', ''))}
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-base tracking-tight">{activeConversation.name && activeConversation.name !== "Unknown" ? activeConversation.name : `+${activeConversation.phoneNumber.replace('@lid', '')}`}</h3>
                  <p className="text-[11px] font-mono text-muted-foreground">{activeConversation.phoneNumber}</p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 z-10">
              {messages.map((msg: any) => {
                const isOutbound = msg.direction === "outbound";
                return (
                  <div key={msg.id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[75%] p-4 rounded-[0.35rem] shadow-sm relative group ${isOutbound ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground border border-border'}`}>
                      {msg.senderName && msg.senderName !== "Unknown" && !isOutbound && (
                        <span className={`text-xs font-bold block mb-1 text-muted-foreground`}>
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
                      
                      <div className={`absolute top-2 opacity-0 group-hover:opacity-100 transition-opacity ${isOutbound ? "-left-10" : "-right-10"}`}>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center h-8 w-8 rounded-[0.25rem] bg-secondary shadow-md hover:bg-secondary/80 text-foreground focus:outline-none transition-transform hover:scale-105 border border-border">
                            <ChevronDown className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align={isOutbound ? "end" : "start"} className="rounded-[0.25rem] shadow-xl border-border bg-card">
                            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(msg.content)} className="cursor-pointer font-bold text-foreground">
                              <span className="text-xs">Copy</span>
                            </DropdownMenuItem>
                            {isOutbound && (
                              <DropdownMenuItem onClick={() => setEvaluatingMessageId(msg.id)} className="cursor-pointer font-bold text-foreground focus:bg-primary/10 focus:text-primary">
                                <Bot className="h-4 w-4 mr-2" /> Evaluate AI
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => deleteMessage(msg.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer font-bold">
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className={`text-[10px] mt-1.5 flex justify-end items-center gap-1 font-bold ${isOutbound ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                        {new Date(msg.createdAt).toLocaleDateString() === new Date().toLocaleDateString() 
                          ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : new Date(msg.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        {isOutbound && (
                          <span className="ml-0.5">
                            {msg.status === 'queued' && <Clock className="w-3 h-3 opacity-80" />}
                            {msg.status === 'sent' && <Check className="w-3 h-3 opacity-80" />}
                            {msg.status === 'delivered' && <CheckCheck className="w-3 h-3 opacity-80" />}
                            {msg.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-700 font-extrabold shadow-sm" />}
                            {msg.status === 'failed' && <span className="text-destructive">Failed</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-card border-t border-border z-20 sticky bottom-0">
              {attachment && (
                <div className="mb-3 p-3 bg-secondary rounded-[0.35rem] shadow-sm flex items-center justify-between max-w-sm mx-auto animate-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-3 overflow-hidden">
                    {attachment.type.startsWith('image/') ? (
                      <div className="w-10 h-10 rounded-[0.25rem] bg-muted overflow-hidden flex-shrink-0">
                        <img src={URL.createObjectURL(attachment)} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-[0.25rem] bg-primary/20 text-primary flex items-center justify-center flex-shrink-0">
                        <Paperclip className="w-5 h-5" />
                      </div>
                    )}
                    <span className="text-sm font-bold text-foreground truncate">{attachment.name}</span>
                  </div>
                  <button type="button" onClick={() => setAttachment(null)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-[0.25rem] transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex gap-3 max-w-4xl mx-auto items-end">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setAttachment(e.target.files[0]);
                    }
                  }}
                />
                <button 
                  type="button" 
                  onClick={() => fileInputRef.current?.click()}
                  className="h-11 w-11 flex-shrink-0 rounded-[0.35rem] bg-secondary hover:bg-secondary/80 text-foreground shadow-sm border border-border flex items-center justify-center transition-all"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 h-11 bg-background focus:bg-background rounded-[0.35rem] px-4 shadow-sm border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-foreground placeholder-muted-foreground"
                />
                <button 
                  type="submit"
                  disabled={!newMessage.trim() && !attachment}
                  className="h-11 w-11 flex-shrink-0 rounded-[0.35rem] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm flex items-center justify-center transition-all disabled:opacity-50"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground z-10">
            <div className="w-24 h-24 bg-secondary rounded-[0.35rem] flex items-center justify-center mb-6 shadow-sm border border-border">
              <User className="w-10 h-10 text-muted-foreground" />
            </div>
            <p className="font-bold text-muted-foreground tracking-tight uppercase tracking-widest text-sm">Select a conversation to start chatting</p>
            <Button onClick={() => setShowNewChat(true)} className="mt-6 rounded-[0.35rem] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm font-bold px-6">
              <MessageSquarePlus className="w-5 h-5 mr-2" /> Start New Chat
            </Button>
          </div>
        )}
      </div>

      {/* New Chat Modal Overlay */}
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
            className="bg-card rounded-[0.35rem] w-full max-w-md shadow-2xl overflow-hidden border border-border"
          >
            <div className="p-5 border-b border-border flex justify-between items-center bg-card">
              <h3 className="font-extrabold text-lg text-foreground tracking-tight">New Message</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowNewChat(false)} className="rounded-[0.25rem] hover:bg-secondary text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </Button>
            </div>
            <form onSubmit={startNewChat} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">WhatsApp Number or Select Contact</label>
                <Input 
                  list="all-contacts"
                  placeholder="e.g. 628123456789 or type name..." 
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  className="w-full bg-background border-border focus-visible:ring-primary shadow-sm rounded-[0.25rem] text-foreground"
                />
                <datalist id="all-contacts">
                  {allContacts.map(c => (
                    <option key={c.id} value={c.phoneNumber}>{c.name || c.phoneNumber}</option>
                  ))}
                </datalist>
                <p className="text-[11px] font-bold text-muted-foreground mt-1.5 ml-1">Select from contacts or enter new number (with country code, no '+')</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-foreground mb-2">Message</label>
                <textarea 
                  className="w-full h-28 border border-border rounded-[0.25rem] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground shadow-sm resize-none"
                  placeholder="Type your message here..."
                  value={newMsg}
                  onChange={(e) => setNewMsg(e.target.value)}
                />
              </div>
              <div className="pt-2">
                <Button type="submit" disabled={sendingNew || !newPhone.trim() || !newMsg.trim()} className="w-full rounded-[0.35rem] bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm font-bold h-11">
                  {sendingNew ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Send className="w-5 h-5 mr-2" />}
                  Send Message
                </Button>
              </div>
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
              Select the device/integration to use for evaluating this message. The AI will analyze the conversation leading up to this point and provide a score.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {devices.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground flex items-start gap-2 bg-secondary/30 rounded-md">
                <AlertCircle className="w-4 h-4 text-warning shrink-0 mt-0.5" />
                <p>No devices found. Please configure a device in the dashboard first.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {devices.map(d => (
                  <Button 
                    key={d.id} 
                    variant="outline" 
                    className="w-full justify-start h-auto py-3 px-4"
                    onClick={() => handleEvaluate(d.id)}
                    disabled={evaluating}
                  >
                    <div className="flex flex-col items-start gap-1 text-left">
                      <span className="font-bold">{d.name}</span>
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
