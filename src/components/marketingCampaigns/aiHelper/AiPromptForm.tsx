'use client';

import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { MCPStrategyResponse } from '@/types/MCP';
import { Loader2 } from 'lucide-react';
import { runMcpAi } from '@/lib/ai/ai';
import { useAuthStore } from '@/lib/store';

interface AiPromptFormProps {
    onStrategyLoaded: (data: MCPStrategyResponse) => void;
}

const examplePrompts = [
    'Segment clients with the name Carlos or who have birthday this month',
    'Target young clients and those who prefer telegram',
    'Group clients by shared characteristics to maximize total audience coverage across all clients',
];

export default function AiPromptForm({ onStrategyLoaded }: AiPromptFormProps) {
    const [prompt, setPrompt] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [feedback, setFeedback] = useState<string | null>(null);

    const token = useAuthStore((state) => state.token);

    const handleExampleClick = (example: string) => {
        setPrompt(example);
    };

    const handleSubmit = async () => {
        setError(null);
        setLoading(true);

        try {
            const response = await runMcpAi({ prompt });
            onStrategyLoaded(response);
            setFeedback(response.message ?? null);
        } catch (err: any) {
            console.error('MCP AI error:', err);
            setError(err.message || 'Unexpected error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4 justify-center mb-6">
            <div className="text-center space-y-2 mt-5">
                <h1 className="text-3xl font-bold">Hi!, welcome to AutoSmark AI-Powered Campaigns</h1>
                <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
                    Type the criteria you want to use to segment audiences for a new campaign.
                </p>
            </div>

            <div className="justify-center mt-12">
                <p className="text-center font-bold text-md max-w-2xl mx-auto">
                    Would you like to....?
                </p>
                <div className="flex flex-wrap gap-2 justify-center mt-5">
                    {examplePrompts.map((ex, idx) => (
                        <Button
                            key={idx}
                            variant="outline"
                            size="sm"
                            onClick={() => handleExampleClick(ex)}
                            className="text-xs px-3 py-1"
                        >
                            {ex}
                        </Button>
                    ))}
                </div>
            </div>

            <Textarea
                placeholder="Or describe how you'd like to segment your clients..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                className="resize-none mt-5"
            />

            <div className="flex justify-center mt-5 mb-20">
                <Button onClick={handleSubmit} disabled={loading || !prompt}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Generate Strategy
                </Button>
            </div>

            {feedback && (
                <div className="text-center text-sm text-foreground/80 mt-4">
                    {feedback}
                </div>
            )}

            {error && (
                <div className="text-red-600 text-sm mt-2">
                    {error}
                </div>
            )}
        </div>
    );
}
