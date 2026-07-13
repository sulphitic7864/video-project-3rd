import React, { useState } from 'react';
import { Mail, Instagram, Edit, Sparkles, X, Check, Copy } from 'lucide-react';

interface ContactPageProps {
  isAdminMode: boolean;
  contactBio: string;
  setContactBio: (bio: string) => void;
  contactEmail: string;
  setContactEmail: (email: string) => void;
  contactPhoto: string;
  setContactPhoto: (photo: string) => void;
  setToastMessage: (msg: string | null) => void;
}

export function ContactPage({
  isAdminMode,
  contactBio,
  setContactBio,
  contactEmail,
  setContactEmail,
  contactPhoto,
  setContactPhoto,
  setToastMessage,
}: ContactPageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bioInput, setBioInput] = useState(contactBio);
  const [emailInput, setEmailInput] = useState(contactEmail);
  const [copied, setCopied] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setToastMessage('Email address copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setContactBio(bioInput);
    setContactEmail(emailInput);
    setIsEditing(false);
    setToastMessage('Contact profile updated successfully.');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 space-y-12 animate-fade-in text-center">
      
      {/* Elegant Centered Title */}
      <div className="space-y-2">
        <h2 className="font-serif text-4xl sm:text-5xl font-bold uppercase tracking-widest text-white">
          Contact
        </h2>
        <div className="w-12 h-[1px] bg-neutral-800 mx-auto mt-4" />
      </div>

      {/* Main Content Area */}
      <div className="space-y-12 max-w-xl mx-auto pt-4">
        
        {/* Bio description */}
        <div className="space-y-3">
          <span className="text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase block">
            [ Profile / Bio ]
          </span>
          <p className="font-serif text-lg sm:text-xl text-neutral-300 leading-relaxed italic">
            {contactBio}
          </p>
        </div>

        {/* Minimalist Connections Block */}
        <div className="pt-8 border-t border-neutral-900 space-y-8">
          <span className="text-[9px] font-mono tracking-[0.2em] text-neutral-500 uppercase block">
            [ Connections & Inquiries ]
          </span>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
            {/* Email Option */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-neutral-500 uppercase block tracking-widest">Email</span>
              <div className="flex items-center justify-center gap-2">
                <a
                  href={`mailto:${contactEmail}`}
                  className="text-base font-serif text-white hover:text-neutral-300 hover:underline transition-all"
                >
                  {contactEmail}
                </a>
                <button
                  onClick={handleCopyEmail}
                  className="p-1 text-neutral-500 hover:text-white transition-colors cursor-pointer"
                  title="Copy email to clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Instagram Option */}
            <div className="space-y-1">
              <span className="text-[9px] font-mono text-neutral-500 uppercase block tracking-widest">Instagram</span>
              <a
                href="https://www.instagram.com/bahriakshit/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-serif text-white hover:text-neutral-300 hover:underline transition-all block"
              >
                @bahriakshit
              </a>
            </div>
          </div>
        </div>

        {/* Admin Mode Editor Action Button */}
        {isAdminMode && !isEditing && (
          <div className="pt-8 flex justify-center">
            <button
              onClick={() => {
                setBioInput(contactBio);
                setEmailInput(contactEmail);
                setIsEditing(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-950 border border-neutral-900 hover:border-neutral-700 text-xs font-mono text-neutral-400 hover:text-white transition-all uppercase cursor-pointer tracking-wider"
            >
              <Edit className="w-4 h-4 text-neutral-500" />
              Edit Details
            </button>
          </div>
        )}
      </div>

      {/* Simplified, Clean Editor Panel */}
      {isAdminMode && isEditing && (
        <div className="border border-neutral-900 bg-neutral-950 p-6 md:p-8 space-y-6 max-w-xl mx-auto rounded-sm animate-fade-in mt-12 text-left">
          <div className="flex items-center justify-between border-b border-neutral-900 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-white" />
              <h3 className="font-mono text-xs text-white uppercase tracking-widest">
                Contact Editor
              </h3>
            </div>
            <button
              onClick={() => setIsEditing(false)}
              className="text-neutral-500 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase block">
                  Contact Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="e.g. bahriakshit@gmail.com"
                  className="w-full bg-neutral-900 border border-neutral-900 focus:border-neutral-700 text-neutral-100 text-xs px-3 py-2.5 rounded-sm outline-hidden font-serif"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono tracking-wider text-neutral-400 uppercase block">
                  Bio / Profile Text *
                </label>
                <textarea
                  required
                  rows={4}
                  value={bioInput}
                  onChange={(e) => setBioInput(e.target.value)}
                  placeholder="Describe your film production style, equipment, goals, or bio..."
                  className="w-full bg-neutral-900 border border-neutral-900 focus:border-neutral-700 text-neutral-100 text-xs px-3 py-2.5 rounded-sm outline-hidden font-serif resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-neutral-900 flex gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 py-2 border border-neutral-900 text-neutral-400 hover:text-white text-xs font-mono uppercase transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-mono uppercase tracking-wider font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
