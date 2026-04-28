"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  decryptMessageForParticipant,
  EncryptedEnvelope,
  encryptMessageForParticipants,
  loadOrCreateIdentityKeys,
} from "@/lib/e2ee";

type ChannelName = "General" | "Task 1" | "Task 2" | "Planning";
type Priority = "red" | "yellow" | "green" | "";
type ParticipantId = "you" | "user";

type ChatMessage = {
  id: number;
  sender: "you" | "user";
  text: string;
};

type EncryptedMessage = {
  id: number;
  envelope: EncryptedEnvelope<ParticipantId>;
};

type GroupMember = {
  name: string;
  avatar: string;
  active: boolean;
};

const groupMembers: GroupMember[] = [
  { name: "user", avatar: "🔵", active: true },
  { name: "user2", avatar: "🟣", active: true },
  { name: "user3", avatar: "🟢", active: false },
  { name: "user4", avatar: "🟠", active: false },
];

const headerOnlineUsers = groupMembers.filter((member) => member.active).slice(0, 2);

const initialMessages: Record<ChannelName, ChatMessage[]> = {
  General: [
    { id: 1, sender: "user", text: "Hey" },
    { id: 2, sender: "you", text: "Hey" },
    { id: 3, sender: "you", text: "Create kanban" },
  ],
  "Task 1": [
    { id: 4, sender: "user", text: "Can we finish Task 1 today?" },
    { id: 5, sender: "you", text: "Yes, I’ll handle the draft." },
  ],
  "Task 2": [{ id: 6, sender: "user", text: "Task 2 needs review." }],
  Planning: [
    { id: 7, sender: "user", text: "Hey" },
    { id: 8, sender: "you", text: "Hey" },
    { id: 9, sender: "user", text: "Should we start planning?" },
    { id: 10, sender: "you", text: "Yes" },
  ],
};

const initialPinned: Record<ChannelName, number[]> = {
  General: [],
  "Task 1": [],
  "Task 2": [],
  Planning: [7, 8],
};

const channels: ChannelName[] = ["General", "Task 1", "Task 2", "Planning"];
const participants: readonly ParticipantId[] = ["you", "user"];
const viewerId: ParticipantId = "you";

export default function MessagesPage() {
  const [selectedChannel, setSelectedChannel] = useState<ChannelName>("General");
  const [messagesByChannel, setMessagesByChannel] =
    useState<Record<ChannelName, EncryptedMessage[]>>({
      General: [],
      "Task 1": [],
      "Task 2": [],
      Planning: [],
    });
  const [decryptedByChannel, setDecryptedByChannel] =
    useState<Record<ChannelName, ChatMessage[]>>({
      General: [],
      "Task 1": [],
      "Task 2": [],
      Planning: [],
    });
  const [encryptionReady, setEncryptionReady] = useState(false);
  const [identityKeys, setIdentityKeys] =
    useState<Awaited<ReturnType<typeof loadOrCreateIdentityKeys<ParticipantId>>> | null>(
      null
    );
  const [pinnedByChannel, setPinnedByChannel] =
    useState<Record<ChannelName, number[]>>(initialPinned);

  const [input, setInput] = useState("");
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [showPinnedPanel, setShowPinnedPanel] = useState(false);
  const [showMembersPanel, setShowMembersPanel] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [showEncryptedPayloads, setShowEncryptedPayloads] = useState(false);

  const [quickTask, setQuickTask] = useState("");
  const [quickPriority, setQuickPriority] = useState<Priority>("");

  const photoInputRef = useRef<HTMLInputElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const bootstrapEncryptedMessages = async () => {
      const identities = await loadOrCreateIdentityKeys(participants);
      const encryptedEntries = await Promise.all(
        channels.map(async (channel) => {
          const encryptedMessages = await Promise.all(
            initialMessages[channel].map(async (message) => {
              const envelope = await encryptMessageForParticipants({
                channel,
                plaintext: message.text,
                sender: message.sender,
                recipients: participants,
                identities,
              });
              return {
                id: message.id,
                envelope,
              };
            })
          );
          return [channel, encryptedMessages] as const;
        })
      );

      const encryptedRecord = Object.fromEntries(encryptedEntries) as Record<
        ChannelName,
        EncryptedMessage[]
      >;
      const decryptedEntries = await Promise.all(
        channels.map(async (channel) => {
          const decryptedMessages = await Promise.all(
            encryptedRecord[channel].map(async (message) => {
              const plaintext = await decryptMessageForParticipant({
                channel,
                envelope: message.envelope,
                participant: viewerId,
                identities,
              });
              return {
                id: message.id,
                sender: message.envelope.sender,
                text: plaintext,
              };
            })
          );
          return [channel, decryptedMessages] as const;
        })
      );
      const decryptedRecord = Object.fromEntries(decryptedEntries) as Record<
        ChannelName,
        ChatMessage[]
      >;

      setMessagesByChannel(encryptedRecord);
      setDecryptedByChannel(decryptedRecord);
      setIdentityKeys(identities);
      setEncryptionReady(true);
    };

    void bootstrapEncryptedMessages();
  }, []);

  const currentMessages = useMemo(
    () => decryptedByChannel[selectedChannel],
    [decryptedByChannel, selectedChannel]
  );

  const pinnedMessages = useMemo(() => {
    const pinnedIds = pinnedByChannel[selectedChannel];
    return currentMessages.filter((message) => pinnedIds.includes(message.id));
  }, [currentMessages, pinnedByChannel, selectedChannel]);

  const encryptedMessageById = useMemo(() => {
    return new Map(messagesByChannel[selectedChannel].map((message) => [message.id, message]));
  }, [messagesByChannel, selectedChannel]);

  const lastCreateKanbanIndex = useMemo(() => {
    for (let i = currentMessages.length - 1; i >= 0; i--) {
      const msg = currentMessages[i];
      if (
        msg.sender === "you" &&
        msg.text.trim().toLowerCase().includes("create kanban")
      ) {
        return i;
      }
    }
    return -1;
  }, [currentMessages]);

  const priorityBoxClass = (color: Exclude<Priority, "">) => {
    const active =
      quickPriority === color
        ? color === "red"
          ? "bg-red-400 border-red-500"
          : color === "yellow"
          ? "bg-yellow-300 border-yellow-400"
          : "bg-lime-400 border-lime-500"
        : color === "red"
        ? "border-red-400 bg-white"
        : color === "yellow"
        ? "border-yellow-300 bg-white"
        : "border-lime-400 bg-white";

    return `h-8 w-8 rounded-md border-[3px] transition ${active}`;
  };

  const appendMessage = async (text: string) => {
    if (!identityKeys) return;

    const id = Date.now();
    const envelope = await encryptMessageForParticipants({
      channel: selectedChannel,
      plaintext: text,
      sender: "you",
      recipients: participants,
      identities: identityKeys,
    });

    const encryptedMessage: EncryptedMessage = {
      id,
      envelope,
    };
    const decryptedMessage: ChatMessage = {
      id,
      sender: "you",
      text,
    };

    setMessagesByChannel((prev) => ({
      ...prev,
      [selectedChannel]: [...prev[selectedChannel], encryptedMessage],
    }));
    setDecryptedByChannel((prev) => ({
      ...prev,
      [selectedChannel]: [...prev[selectedChannel], decryptedMessage],
    }));
  };

  const sendMessage = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    void appendMessage(trimmed);

    if (trimmed.toLowerCase().includes("create kanban")) {
      setShowQuickCreate(true);
    }

    setInput("");
  };

  const handleQuickCreate = () => {
    if (!quickTask.trim()) return;

    void appendMessage(
      `Kanban item created: ${quickTask}${quickPriority ? ` (${quickPriority})` : ""}`
    );

    setShowQuickCreate(false);
    setQuickTask("");
    setQuickPriority("");
  };

  const togglePinned = (messageId: number) => {
    setPinnedByChannel((prev) => {
      const currentPinned = prev[selectedChannel];
      const alreadyPinned = currentPinned.includes(messageId);

      return {
        ...prev,
        [selectedChannel]: alreadyPinned
          ? currentPinned.filter((id) => id !== messageId)
          : [...currentPinned, messageId],
      };
    });
  };

  const jumpToMessage = (messageId: number) => {
    const el = document.getElementById(`message-${messageId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setShowPinnedPanel(false);
  };

  const isPinned = (messageId: number) =>
    pinnedByChannel[selectedChannel].includes(messageId);

  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    void appendMessage(`📷 Sent photo: ${file.name}`);
    setShowAttachMenu(false);
    event.target.value = "";
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    void appendMessage(`📎 Attached file: ${file.name}`);
    setShowAttachMenu(false);
    event.target.value = "";
  };

  const handleVoiceMemo = () => {
    void appendMessage("🎙️ Voice memo sent");
    setShowAttachMenu(false);
  };

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.14),_transparent_24%),linear-gradient(135deg,#eaf0fa_0%,#f7f9fd_45%,#eef4fd_100%)] text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-[1500px] gap-0 p-5">
        <aside className="flex min-h-full w-[235px] shrink-0 overflow-hidden rounded-l-[28px] border border-white/70 bg-white/60 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex w-[70px] flex-col items-center border-r border-slate-200/80 bg-white/50">
            <div className="flex h-[58px] w-full items-center justify-center border-b border-slate-200/80 text-3xl text-sky-700">
              ☰
            </div>

            <Link
        href="/"
        className="mt-4 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl shadow-sm transition hover:scale-[1.03]"
      >
        ⌂
      </Link>

      <Link
              href="/kanban"
              className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold shadow-sm transition hover:scale-[1.03]"
            >
              KB
            </Link>
      <Link
            href="/messages"
            className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-2xl shadow-sm transition hover:scale-[1.03]"
          >
            💬
      </Link>

      <Link
        href="/leaderboard"
        className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm transition hover:scale-[1.03]"
      >
        🏆
      </Link>

      <Link
        href="/"
        className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-bold shadow-sm transition hover:scale-[1.03]"
      >
        Tasks
      </Link>
      <Link
        href="/call"
        className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm transition hover:scale-[1.03]"
      >
        📞
      </Link>

      <Link
        href="/editor"
        className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-xl shadow-sm transition hover:scale-[1.03]"
      >
        📝
      </Link>

      <Link
        href="/projects"
        className="mt-3 flex h-[46px] w-[46px] items-center justify-center rounded-xl border border-slate-200 bg-white text-lg shadow-sm transition hover:scale-[1.03]"
      >
        📁
      </Link>

            <div className="mt-5 text-2xl tracking-[6px] text-sky-500">...</div>
          </div>

          <div className="flex-1">
            <div className="flex h-[58px] items-center border-b border-slate-200/80 px-4">
              <h1 className="text-[42px] leading-none tracking-tight">Groups</h1>
            </div>

            <div className="px-4 py-5 text-[24px] font-semibold leading-tight">
              <div className="mb-4 rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-3 shadow-sm">
                INFO2222
              </div>
              <div className="rounded-2xl border border-slate-200/70 bg-white/70 px-3 py-3 shadow-sm">
                COMP2017
              </div>
            </div>
          </div>
        </aside>

        <section className="min-h-full w-[240px] border border-l-0 border-white/70 bg-white/55 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="flex h-[58px] items-center border-b border-slate-200/80 px-5">
            <h2 className="text-[34px] leading-none tracking-tight">Chats</h2>
          </div>

          <div className="px-5 py-5">
            <div className="space-y-4">
              {channels.map((channel) => {
                const active = selectedChannel === channel;
                return (
                  <button
                    key={channel}
                    onClick={() => {
                      setSelectedChannel(channel);
                      setShowPinnedPanel(false);
                      setShowMembersPanel(false);
                    }}
                    className={`block w-full text-left text-[24px] font-semibold leading-none transition ${
                      active
                        ? "text-slate-900 underline underline-offset-8"
                        : "text-slate-800 hover:text-sky-700"
                    }`}
                  >
                    #{channel}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="flex min-h-full flex-1 flex-col overflow-hidden rounded-r-[28px] border border-l-0 border-white/70 bg-white/50 shadow-[0_20px_60px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="relative flex h-[58px] items-center justify-between border-b border-slate-200/80 bg-white/60 px-5">
            <div className="text-[30px] font-semibold leading-none">
              #{selectedChannel}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowEncryptedPayloads((prev) => !prev)}
                className={`rounded-xl border px-3 py-2 text-sm font-semibold shadow-sm transition ${
                  showEncryptedPayloads
                    ? "border-emerald-300 bg-emerald-100 text-emerald-800"
                    : "border-slate-200 bg-white text-slate-700"
                }`}
                title="Show encrypted payloads"
              >
                {showEncryptedPayloads ? "Encrypted: On" : "Encrypted: Off"}
              </button>
              <button
                onClick={() => {
                  setShowPinnedPanel((prev) => !prev);
                  setShowMembersPanel(false);
                }}
                className="flex h-10 items-center justify-center rounded-xl border border-slate-200 bg-white px-3 text-xl shadow-sm transition hover:scale-[1.03]"
                title="Pinned messages"
              >
                📌
              </button>

              <button
                onClick={() => {
                  setShowMembersPanel((prev) => !prev);
                  setShowPinnedPanel(false);
                }}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-1.5 shadow-sm transition hover:scale-[1.03]"
                title="Active users"
              >
                <div className="text-sm font-semibold text-slate-700">
                  Online Users:
                </div>
                <div className="flex items-center gap-2">
                  {headerOnlineUsers.map((user) => (
                    <div
                      key={user.name}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-lg shadow-sm"
                    >
                      {user.avatar}
                    </div>
                  ))}
                </div>
              </button>
            </div>

            {showPinnedPanel && (
              <div className="absolute right-56 top-[66px] z-30 w-[240px] rounded-[28px] border-2 border-slate-900 bg-white px-4 py-4 shadow-2xl">
                <div className="absolute -top-3 right-10 h-5 w-5 rotate-45 border-l-2 border-t-2 border-slate-900 bg-white" />

                <div className="mb-3 text-[22px] font-semibold text-sky-700">
                  Pinned
                </div>

                {pinnedMessages.length === 0 ? (
                  <div className="text-sm text-slate-500">No pinned messages yet.</div>
                ) : (
                  <div className="space-y-3">
                    {pinnedMessages.map((message) => (
                      <div key={message.id} className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-xl shadow-sm">
                          {message.sender === "you" ? "🟣" : "🔵"}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-slate-800">
                            {message.sender}
                          </div>
                          <div className="truncate text-[18px] text-slate-900">
                            {message.text}
                          </div>
                        </div>

                        <button
                          onClick={() => jumpToMessage(message.id)}
                          className="rounded-full border border-slate-300 bg-white px-3 py-1 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                          Jump
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {showMembersPanel && (
              <div className="absolute right-4 top-[66px] z-30 w-[230px] rounded-[28px] border-2 border-slate-900 bg-white px-4 py-4 shadow-2xl">
                <div className="absolute -top-3 right-12 h-5 w-5 rotate-45 border-l-2 border-t-2 border-slate-900 bg-white" />

                <div className="mb-3 text-[20px] font-semibold text-sky-700">
                  Group Members
                </div>

                <div className="space-y-3">
                  {groupMembers.map((member) => (
                    <div key={member.name} className="flex items-center gap-3">
                      <div
                        className={`h-3 w-3 rounded-full ${
                          member.active ? "bg-lime-500" : "bg-slate-300"
                        }`}
                      />
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-300 bg-white text-xl shadow-sm">
                        {member.avatar}
                      </div>
                      <div className="text-[20px] text-slate-900">{member.name}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto px-8 py-8">
            <div className="space-y-8">
              {currentMessages.map((message, index) => {
                const isYou = message.sender === "you";
                const encryptedMessage = encryptedMessageById.get(message.id);
                const isCreateKanban =
                  isYou &&
                  message.text.trim().toLowerCase().includes("create kanban");
                const isLastCreateKanban =
                  isCreateKanban && index === lastCreateKanbanIndex;

                return (
                  <div
                    id={`message-${message.id}`}
                    key={message.id}
                    className={`flex ${isYou ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[520px] items-end gap-3 ${
                        isYou ? "flex-row-reverse text-right" : ""
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="mb-1 text-lg font-semibold text-slate-800">
                          {message.sender}
                        </div>
                        <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-slate-300 bg-white text-3xl shadow-sm">
                          {isYou ? "🟣" : "🔵"}
                        </div>
                      </div>

                      <div
                        className={`flex flex-col ${
                          isYou ? "items-end" : "items-start"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <button
                            onClick={() => togglePinned(message.id)}
                            className={`mt-2 rounded-full border px-2 py-1 text-xs font-semibold shadow-sm transition ${
                              isPinned(message.id)
                                ? "border-sky-300 bg-sky-100 text-sky-700"
                                : "border-slate-200 bg-white text-slate-500 hover:text-slate-700"
                            }`}
                            title={isPinned(message.id) ? "Unpin message" : "Pin message"}
                          >
                            📌
                          </button>

                          <div
                            className={`rounded-[26px] border px-5 py-4 text-[20px] leading-tight shadow-sm ${
                              isYou
                                ? "border-sky-200 bg-gradient-to-r from-sky-50 to-indigo-50 text-slate-900"
                                : "border-slate-200 bg-white text-slate-900"
                            }`}
                          >
                            {message.text}
                          </div>
                        </div>
                        {showEncryptedPayloads && encryptedMessage && (
                          <div className="mt-2 max-w-[420px] rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-left">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                              Encrypted payload (ciphertext)
                            </div>
                            <div className="mt-1 break-all font-mono text-[11px] leading-snug text-emerald-900">
                              {encryptedMessage.envelope.ciphertext}
                            </div>
                          </div>
                        )}

                        {showQuickCreate && isLastCreateKanban && (
                          <div className="relative mt-3 w-[250px] rounded-[28px] border-2 border-slate-900 bg-white px-4 py-4 text-left shadow-xl">
                            <div className="absolute -top-3 right-10 h-5 w-5 rotate-45 border-l-2 border-t-2 border-slate-900 bg-white" />

                            <div className="text-[18px] font-semibold leading-tight text-slate-900">
                              Quick create
                            </div>

                            <div className="mt-3">
                              <label className="block text-[16px] font-medium text-slate-900">
                                Task:
                              </label>
                              <input
                                value={quickTask}
                                onChange={(e) => setQuickTask(e.target.value)}
                                className="mt-1 h-10 w-full rounded-full border-2 border-slate-300 bg-white px-4 text-base outline-none focus:border-sky-400"
                              />
                            </div>

                            <div className="mt-3">
                              <div className="mb-2 text-[16px] font-medium text-slate-900">
                                Priority
                              </div>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => setQuickPriority("red")}
                                  className={priorityBoxClass("red")}
                                />
                                <button
                                  onClick={() => setQuickPriority("yellow")}
                                  className={priorityBoxClass("yellow")}
                                />
                                <button
                                  onClick={() => setQuickPriority("green")}
                                  className={priorityBoxClass("green")}
                                />
                              </div>
                            </div>

                            <div className="mt-4 flex justify-end gap-2">
                              <button
                                onClick={() => setShowQuickCreate(false)}
                                className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
                              >
                                Close
                              </button>
                              <button
                                onClick={handleQuickCreate}
                                className="rounded-xl bg-sky-600 px-3 py-2 text-sm font-semibold text-white"
                              >
                                Create
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="border-t border-slate-200/80 bg-white/60 px-5 py-5">
            <div className="relative flex items-center gap-4">
              {showAttachMenu && (
                <div className="absolute bottom-[72px] left-0 z-30 w-[240px] rounded-[28px] border-2 border-slate-900 bg-white shadow-2xl">
                  <div className="absolute -bottom-3 left-8 h-5 w-5 rotate-45 border-b-2 border-r-2 border-slate-900 bg-white" />

                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="flex w-full items-center gap-3 border-b-2 border-slate-900 px-4 py-4 text-left text-[20px] font-medium hover:bg-slate-50"
                  >
                    <span className="text-2xl">📷</span>
                    <span>Send Photo</span>
                  </button>

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center gap-3 border-b-2 border-slate-900 px-4 py-4 text-left text-[20px] font-medium hover:bg-slate-50"
                  >
                    <span className="text-2xl">📄</span>
                    <span>Attach file</span>
                  </button>

                  <button
                    onClick={handleVoiceMemo}
                    className="flex w-full items-center gap-3 px-4 py-4 text-left text-[20px] font-medium hover:bg-slate-50"
                  >
                    <span className="text-2xl">🎙️</span>
                    <span>Voice memo</span>
                  </button>
                </div>
              )}

              <button
                onClick={() => setShowAttachMenu((prev) => !prev)}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 border-slate-900 bg-white text-4xl leading-none shadow-sm transition hover:scale-[1.03]"
              >
                +
              </button>

              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoSelect}
              />

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileSelect}
              />

              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage();
                }}
                placeholder="Message"
                disabled={!encryptionReady}
                className="h-16 flex-1 rounded-full border-2 border-slate-900 bg-white px-6 text-[22px] outline-none placeholder:text-slate-500"
              />

              <button
                onClick={sendMessage}
                disabled={!encryptionReady}
                className="h-16 rounded-full border-2 border-slate-900 bg-white px-8 text-[22px] font-semibold shadow-sm transition hover:scale-[1.02]"
              >
                {encryptionReady ? "Send" : "Encrypting..."}
              </button>
            </div>
            <div className="mt-2 text-right text-xs text-slate-500">
              End-to-end encryption active for all messages in this session.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}