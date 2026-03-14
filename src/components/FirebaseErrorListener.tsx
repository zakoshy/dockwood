'use client';

import { useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { useToast } from '@/hooks/use-toast';

export function FirebaseErrorListener() {
  const { toast } = useToast();

  useEffect(() => {
    const handlePermissionError = (error: any) => {
      // In development, this will help surface the exact rule failure.
      // In production, we show a cleaner error message.
      toast({
        variant: 'destructive',
        title: 'Security Permission Denied',
        description: `Operation ${error.context.operation} on ${error.context.path} was rejected by security rules.`,
      });
      
      // We throw an actual error to trigger the Next.js error overlay in dev mode
      if (process.env.NODE_ENV === 'development') {
        throw error;
      }
    };

    errorEmitter.on('permission-error', handlePermissionError);
    return () => {
      errorEmitter.off('permission-error', handlePermissionError);
    };
  }, [toast]);

  return null;
}