import { useEffect, useMemo, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { getMyThreads, getThreadMessages, markThreadRead, sendMessage, startThread } from '../../services/messageService';
import type { Message } from '../../types';

type ThreadRow = {
  participant: {
    thread_id: string;
    user_id: string;
    role?: string | null;
    last_read_at?: string | null;
    created_at: string;
  };
  thread: {
    id: string;
    subject?: string | null;
    created_by: string;
    metadata?: Record<string, any>;
    created_at: string;
    updated_at: string;
  };
};

const MessagesPage = () => {
  const { user } = useAuth();
  const [threads, setThreads] = useState<ThreadRow[]>([]);
  const [threadsLoading, setThreadsLoading] = useState(true);
  const [threadsError, setThreadsError] = useState<string>('');

  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string>('');

  const [composer, setComposer] = useState('');
  const [sending, setSending] = useState(false);

  const [showNewModal, setShowNewModal] = useState(false);
  const [newRecipientEmail, setNewRecipientEmail] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [newError, setNewError] = useState('');
  const [newSending, setNewSending] = useState(false);

  const loadThreads = async () => {
    setThreadsLoading(true);
    setThreadsError('');
    try {
      const rows = await getMyThreads();
      const sorted = [...rows].sort((a, b) => {
        const at = new Date(a.thread.updated_at).getTime();
        const bt = new Date(b.thread.updated_at).getTime();
        return bt - at;
      });
      setThreads(sorted);
      if (!activeThreadId && sorted.length > 0) {
        setActiveThreadId(sorted[0].thread.id);
      }
    } catch (error: any) {
      setThreadsError(error?.message || 'No se pudieron cargar las conversaciones.');
    } finally {
      setThreadsLoading(false);
    }
  };

  const loadMessages = async (threadId: string) => {
    setMessagesLoading(true);
    setMessagesError('');
    try {
      const rows = await getThreadMessages(threadId);
      setMessages(rows);
      await markThreadRead(threadId);
      // Refresh thread list so unread state updates.
      await loadThreads();
    } catch (error: any) {
      setMessagesError(error?.message || 'No se pudieron cargar los mensajes.');
    } finally {
      setMessagesLoading(false);
    }
  };

  useEffect(() => {
    loadThreads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!activeThreadId) return;
    loadMessages(activeThreadId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeThreadId]);

  const activeThread = useMemo(
    () => threads.find((t) => t.thread.id === activeThreadId) || null,
    [threads, activeThreadId]
  );

  const getUnread = (row: ThreadRow) => {
    const lastRead = row.participant.last_read_at ? new Date(row.participant.last_read_at).getTime() : 0;
    const updated = row.thread.updated_at ? new Date(row.thread.updated_at).getTime() : 0;
    return updated > lastRead;
  };

  const onSend = async () => {
    const body = composer.trim();
    if (!activeThreadId || body.length === 0) return;
    setSending(true);
    setMessagesError('');
    try {
      await sendMessage(activeThreadId, body);
      setComposer('');
      await loadMessages(activeThreadId);
    } catch (error: any) {
      setMessagesError(error?.message || 'No se pudo enviar el mensaje.');
    } finally {
      setSending(false);
    }
  };

  const onStartThread = async () => {
    setNewSending(true);
    setNewError('');
    try {
      const recipientEmail = newRecipientEmail.trim().toLowerCase();
      if (!recipientEmail) {
        setNewError('Introduce un email.');
        return;
      }
      const { threadId } = await startThread({
        recipientEmail,
        subject: newSubject.trim() || undefined,
        message: newMessage.trim() || undefined,
      });

      setShowNewModal(false);
      setNewRecipientEmail('');
      setNewSubject('');
      setNewMessage('');
      await loadThreads();
      setActiveThreadId(threadId);
    } catch (error: any) {
      setNewError(error?.message || 'No se pudo crear la conversación.');
    } finally {
      setNewSending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mensajes</h1>
              <p className="text-gray-600 mt-1">Comunícate con Central, Delegados y Productores.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setNewError('');
                setShowNewModal(true);
              }}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium"
            >
              Nuevo mensaje
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-3">
              <div className="border-b md:border-b-0 md:border-r border-gray-200">
                <div className="p-4 border-b border-gray-100">
                  <div className="text-sm font-semibold text-gray-900">Conversaciones</div>
                  <div className="text-xs text-gray-500 mt-1">{threads.length} total</div>
                </div>

                {threadsLoading ? (
                  <div className="p-6 text-sm text-gray-600">Cargando...</div>
                ) : threadsError ? (
                  <div className="p-6 text-sm text-red-600">{threadsError}</div>
                ) : threads.length === 0 ? (
                  <div className="p-6 text-sm text-gray-600">
                    Aún no tienes conversaciones. Pulsa <strong>Nuevo mensaje</strong> para empezar.
                  </div>
                ) : (
                  <div className="max-h-[70vh] overflow-auto">
                    {threads.map((row) => {
                      const isActive = row.thread.id === activeThreadId;
                      const unread = getUnread(row);
                      return (
                        <button
                          key={row.thread.id}
                          type="button"
                          onClick={() => setActiveThreadId(row.thread.id)}
                          className={[
                            'w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-orange-50 transition-colors',
                            isActive ? 'bg-orange-50' : 'bg-white',
                          ].join(' ')}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <div className="font-medium text-gray-900 truncate">
                                  {row.thread.subject || 'Conversación'}
                                </div>
                                {unread && <span className="inline-block w-2 h-2 rounded-full bg-orange-600" />}
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                Actualizado {new Date(row.thread.updated_at).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-gray-900 truncate">
                        {activeThread?.thread.subject || 'Selecciona una conversación'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {activeThread ? `ID: ${activeThread.thread.id}` : ' '}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => activeThreadId && loadMessages(activeThreadId)}
                      disabled={!activeThreadId || messagesLoading}
                      className="text-sm text-orange-600 hover:text-orange-700 disabled:opacity-50"
                    >
                      Recargar
                    </button>
                  </div>
                </div>

                <div className="p-4">
                  {!activeThreadId ? (
                    <div className="text-sm text-gray-600">Selecciona una conversación para ver los mensajes.</div>
                  ) : messagesLoading ? (
                    <div className="text-sm text-gray-600">Cargando mensajes...</div>
                  ) : messagesError ? (
                    <div className="text-sm text-red-600">{messagesError}</div>
                  ) : (
                    <div className="space-y-3 max-h-[55vh] overflow-auto pr-2">
                      {messages.length === 0 ? (
                        <div className="text-sm text-gray-600">No hay mensajes aún.</div>
                      ) : (
                        messages.map((m) => {
                          const mine = user?.id && m.sender_user_id === user.id;
                          return (
                            <div key={m.id} className={mine ? 'flex justify-end' : 'flex justify-start'}>
                              <div
                                className={[
                                  'max-w-[85%] rounded-2xl px-4 py-3 border',
                                  mine
                                    ? 'bg-orange-600 text-white border-orange-600'
                                    : 'bg-white text-gray-900 border-gray-200',
                                ].join(' ')}
                              >
                                <div className="text-sm whitespace-pre-wrap">{m.body}</div>
                                <div className={mine ? 'text-xs text-orange-100 mt-2' : 'text-xs text-gray-500 mt-2'}>
                                  {new Date(m.created_at).toLocaleString()}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  {activeThreadId && (
                    <div className="mt-4 border-t border-gray-100 pt-4">
                      <div className="flex gap-3">
                        <textarea
                          value={composer}
                          onChange={(e) => setComposer(e.target.value)}
                          placeholder="Escribe un mensaje..."
                          rows={2}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                        />
                        <button
                          type="button"
                          onClick={onSend}
                          disabled={sending || composer.trim().length === 0}
                          className="bg-orange-600 text-white px-5 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
                        >
                          {sending ? 'Enviando...' : 'Enviar'}
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Consejo: puedes usar este canal para coordinar proveedores, cambios en experiencias y soporte.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showNewModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="text-lg font-semibold text-gray-900">Nuevo mensaje</div>
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Para (email)</label>
                <input
                  value={newRecipientEmail}
                  onChange={(e) => setNewRecipientEmail(e.target.value)}
                  placeholder="delegado@empresa.com"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Asunto (opcional)</label>
                <input
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  placeholder="Ej: Nueva experiencia en A Coruña"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mensaje inicial (opcional)</label>
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Escribe tu mensaje..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                />
              </div>
              {newError && <div className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-lg">{newError}</div>}
            </div>
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowNewModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={onStartThread}
                disabled={newSending}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors font-medium disabled:opacity-50"
              >
                {newSending ? 'Creando...' : 'Crear conversación'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;

