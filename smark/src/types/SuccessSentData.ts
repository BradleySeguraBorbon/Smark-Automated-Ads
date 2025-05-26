export type SuccessSentData = {
    email: { sent: number; draft: number; total: number };
    telegram: { sent: number; draft: number; total: number };
    general: { sent: number; draft: number; total: number };
};