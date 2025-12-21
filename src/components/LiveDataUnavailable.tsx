import React from 'react';

export function LiveDataUnavailable({ message }: { message?: string }) {
  return (
    <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-md text-center">
      <h2 className="text-lg font-semibold text-yellow-800">Live data unavailable</h2>
      <p className="mt-2 text-sm text-yellow-700">{message ?? 'The application cannot reach the live database (Supabase) or the data is not available.'}</p>
      <p className="mt-2 text-xs text-gray-500">Please ensure the environment variables NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set.</p>
    </div>
  );
}
