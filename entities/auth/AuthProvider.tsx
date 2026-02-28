import React, { useState, useEffect } from 'react';
import * as TokenService from './../services/keychain';
import api from '../api/api';
import { AuthContext } from "./AuthContext";
import {postSignIn, postUser} from "@/entities/services/auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const token = await TokenService.getAccessToken();
                if (token) {
                    setIsLoggedIn(true);
                }
            } catch (e) {
                console.log('No tokens found');
            } finally {
                setIsLoading(false);
            }
        };
        loadStorageData();
    }, []);

    const signIn = async (login: string, pass: string) => {
        const response = await postSignIn(login, pass);
        const { accessToken, refreshToken } = response;
        await TokenService.saveTokens(accessToken, refreshToken);
        setIsLoggedIn(true);
    };

    const signUp = async (login: string, pass: string, role: number) => {
        return await postUser(login, pass, role);
    }

    const signOut = async () => {
        await TokenService.clearTokens();
        setIsLoggedIn(false);
    };

    return (
        <AuthContext.Provider value={{
            isLoggedIn,
            isLoading,
            signIn,
            signUp,
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
};