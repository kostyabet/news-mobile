import {ThreadContext, ThreadContextType} from "@/entities/thread/ThreadContext";
import {useContext} from "react";

export const useThreads = (): ThreadContextType => {
    const context = useContext(ThreadContext);

    if (context === undefined) {
        throw new Error('useThreads must be used within a ThreadProvider');
    }

    return context;
};