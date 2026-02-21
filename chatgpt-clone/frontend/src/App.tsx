import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { ChatWindow } from './components/ChatWindow';
import { ToastContainer } from './components/Toast';
import { useChatStore } from './store/chatStore';
import { useToastStore } from './store/toastStore';
import { Loader2, Sparkles } from 'lucide-react';

function App() {
  const { initialize, isInitialized, error, clearError } = useChatStore();
  const { toasts, removeToast, error: showError } = useToastStore();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Show chat errors as toasts
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, showError, clearError]);

  if (!isInitialized) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-xl animate-pulse" />
            <div className="relative bg-white p-4 rounded-2xl shadow-lg">
              <Sparkles className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            <p className="text-slate-600 font-medium">正在加载...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <ToastContainer toasts={toasts} onRemove={removeToast} />
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />
      <ChatWindow sidebarCollapsed={sidebarCollapsed} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
    </div>
  );
}

export default App;
