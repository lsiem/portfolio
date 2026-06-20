import { useEffect, useRef, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { personalInfo } from '@/content';
import { uiText } from '@/content/ui';

const commands: Record<string, string> = {
  help: 'Verfügbare Befehle: help, whoami, skills, contact, clear',
  whoami: `${personalInfo.name} — ${personalInfo.title}`,
  skills: 'Full-Stack, DevOps, Cloud, Java, Python, React, Docker, Kubernetes',
  contact: personalInfo.email,
};

interface DevTerminalProps {
  open: boolean;
  onClose: () => void;
}

export function DevTerminal({ open, onClose }: DevTerminalProps) {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<string[]>([
    'Willkommen im Dev Terminal. Tippe "help".',
  ]);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [history]);

  const runCommand = () => {
    const command = input.trim().toLowerCase();
    if (!command) return;

    if (command === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    const response = commands[command] ?? `Unbekannter Befehl: ${command}`;
    setHistory((prev) => [...prev, `> ${input}`, response]);
    setInput('');
  };

  return (
    <Modal open={open} onClose={onClose} title={uiText.terminal.title}>
      <div
        ref={outputRef}
        className="mb-4 max-h-64 overflow-y-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-sm text-cyan-100"
      >
        {history.map((line, index) => (
          <div key={`${line}-${index}`} className="mb-2 whitespace-pre-wrap">
            {line}
          </div>
        ))}
      </div>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          runCommand();
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={uiText.terminal.placeholder}
          className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 font-mono text-sm text-white outline-none focus:border-accent/50"
          autoFocus
        />
        <button
          type="submit"
          className="rounded-xl bg-accent px-4 py-3 text-sm font-medium text-space-950"
        >
          Run
        </button>
      </form>
    </Modal>
  );
}
