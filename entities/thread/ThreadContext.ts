import { createContext } from 'react';
import { Thread } from '@/entities/thread/model';

export interface ThreadContextType {
    threads: Thread[];
    addThread: (thread: Omit<Thread, 'id' | 'createAt'>) => Promise<void>;
    updateThread: (id: number, thread: Partial<Omit<Thread, 'id' | 'createAt'>>) => Promise<void>;
    deleteThread: (id: number) => Promise<void>;
    handleSetSearch: (search?: string) => void;
    isLoading: boolean;
}

export const ThreadContext = createContext<ThreadContextType | undefined>(undefined);