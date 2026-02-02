import React, {useEffect, useMemo, useState} from "react";
import {Thread} from "@/entities/thread/model";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {ThreadContext, ThreadContextType} from "@/entities/thread/ThreadContext";

const STORAGE_KEY = '@threads_data';

interface ThreadProviderProps {
    children: React.ReactNode;
}

export const ThreadProvider: React.FC<ThreadProviderProps> = ({ children }) => {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [debounceSearch, setDebounceSearch] = useState<string>("");

    const handleSetSearch = (search?: string) => {
        setDebounceSearch(search || "");
    };

    useEffect(() => {
        loadThreads();
    }, []);

    const loadThreads = async () => {
        try {
            setIsLoading(true);
            const storedThreads = await AsyncStorage.getItem(STORAGE_KEY);

            if (storedThreads) {
                const parsedThreads: Thread[] = JSON.parse(storedThreads).map((thread: any) => ({
                    ...thread,
                    createAt: new Date(thread.createAt),
                }));
                setThreads(parsedThreads);
            } else {
                const initialThreads: Thread[] = [
                    { id: 0, title: "USA", description: "USA", createAt: new Date() },
                    { id: 1, title: "Russia", description: "Russia", createAt: new Date() },
                    { id: 2, title: "Belarus", description: "Belarus", createAt: new Date() },
                    { id: 3, title: "Danmark", description: "Danmark", createAt: new Date() },
                    { id: 4, title: "Sweden", description: "Sweden", createAt: new Date() },
                ];
                setThreads(initialThreads);
                await saveThreadsToStorage(initialThreads);
            }
        } catch (error) {
            console.error('Error loading threads:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const saveThreadsToStorage = async (threadsToSave: Thread[]) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(threadsToSave));
        } catch (error) {
            console.error('Error saving threads:', error);
        }
    };

    const addThread = async (threadData: Omit<Thread, 'id'>) => {
        try {
            const newId = threads.length > 0 ? Math.max(...threads.map(t => t.id)) + 1 : 0;
            const newThread: Thread = {
                ...threadData,
                id: newId,
                createAt: threadData.createAt || new Date(),
            };

            const updatedThreads = [...threads, newThread];
            setThreads(updatedThreads);
            await saveThreadsToStorage(updatedThreads);
        } catch (error) {
            console.error('Error adding thread:', error);
            throw error;
        }
    };

    const updateThread = async (id: number, updates: Partial<Omit<Thread, 'id'>>) => {
        try {
            const updatedThreads = threads.map(thread =>
                thread.id === id ? { ...thread, ...updates } : thread
            );

            setThreads(updatedThreads);
            await saveThreadsToStorage(updatedThreads);
        } catch (error) {
            console.error('Error updating thread:', error);
            throw error;
        }
    };

    const deleteThread = async (id: number) => {
        try {
            const updatedThreads = threads.filter(thread => thread.id !== id);
            setThreads(updatedThreads);
            await saveThreadsToStorage(updatedThreads);
        } catch (error) {
            console.error('Error deleting thread:', error);
            throw error;
        }
    };

    const filterThreads = useMemo(() : Thread[] => {
        if (!debounceSearch.trim()) return threads;

        const searchLower = debounceSearch.toLowerCase();
        return threads.filter(thread =>
            thread.title.toLowerCase().includes(searchLower) ||
            thread.description.toLowerCase().includes(searchLower)
        );
    }, [threads, debounceSearch]);

    const contextValue: ThreadContextType = {
        threads: filterThreads,
        addThread,
        updateThread,
        deleteThread,
        handleSetSearch,
        isLoading,
    };

    return (
        <ThreadContext.Provider value={contextValue}>
            {children}
        </ThreadContext.Provider>
    );
};