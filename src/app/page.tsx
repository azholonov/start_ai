// pages/index.tsx
import ProtectedRoute from '@/components/ProtectedRoute';
import Chat from '@/components/Chat';

export default function Home() {
  return (
    <ProtectedRoute>
      <Chat />
    </ProtectedRoute>
  );
}