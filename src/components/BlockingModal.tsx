'use client';

import { Loader2 } from 'lucide-react';

export default function BlockingModal({ message }: { message: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center gap-4">
        <Loader2 className="animate-spin h-8 w-8 text-gray-700" />
        <p className="text-lg font-medium">{message}</p>
      </div>
    </div>
  );
}
