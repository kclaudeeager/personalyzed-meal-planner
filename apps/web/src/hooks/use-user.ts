'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useState, useEffect, useRef } from 'react';
import { API_BASE } from '@/lib/api';

export function useUserId() {
  const { userId: clerkId, isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const [internalId, setInternalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const createdRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn || !clerkId) {
      setLoading(false);
      return;
    }

    const cached = sessionStorage.getItem(`user_id_${clerkId}`);
    if (cached) {
      setInternalId(cached);
      setLoading(false);
      return;
    }

    let cancelled = false;

    async function resolve() {
      try {
        const res = await fetch(`${API_BASE}/users/clerk/${clerkId}`);
        if (res.ok) {
          const data = await res.json();
          const id = data?.data?.id ?? data?.id;
          if (id && !cancelled) {
            sessionStorage.setItem(`user_id_${clerkId}`, id);
            setInternalId(id);
            setLoading(false);
            return;
          }
        }
      } catch {}

      if (cancelled) return;

      // Auto-create user if not found in local DB
      if (createdRef.current) {
        setLoading(false);
        return;
      }
      createdRef.current = true;

      try {
        const name = user?.fullName || `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim() || 'Clerk User';
        const email = user?.primaryEmailAddress?.emailAddress || user?.emailAddresses?.[0]?.emailAddress || `${clerkId}@clerk.dev`;

        const createRes = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ clerkId, email, fullName: name.trim() }),
        });
        if (createRes.ok) {
          const createData = await createRes.json();
          const id = createData?.data?.id ?? createData?.id;
          if (id && !cancelled) {
            sessionStorage.setItem(`user_id_${clerkId}`, id);
            setInternalId(id);
          }
        }
      } catch {}

      if (!cancelled) setLoading(false);
    }

    resolve();

    return () => { cancelled = true; };
  }, [clerkId, isLoaded, isSignedIn, user]);

  return { userId: internalId, isLoading: loading, isSignedIn: !!isSignedIn };
}
