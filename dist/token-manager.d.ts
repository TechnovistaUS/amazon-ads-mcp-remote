export declare function getAccessToken(): Promise<string>;
export declare function getTokenStatus(): {
    valid: boolean;
    expiresAt: number | null;
    expiresInSeconds: number | null;
    status: string;
};
export declare function startAutoRefresh(): void;
//# sourceMappingURL=token-manager.d.ts.map