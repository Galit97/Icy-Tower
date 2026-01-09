export class SoundManager {
    private audioContext: AudioContext | null = null;
    private isInitialized: boolean = false;
    private unlockAudioPromise: Promise<void> | null = null;

    constructor() {
        // Don't initialize audio context in constructor - wait for user interaction
        // This is required for mobile browsers, especially iOS
    }

    // Unlock audio on iOS - create and play a silent buffer
    // Made public so it can be called from main.ts on first touch
    async unlockAudio() {
        if (this.unlockAudioPromise) {
            return this.unlockAudioPromise;
        }

        this.unlockAudioPromise = (async () => {
            if (!this.audioContext) {
                try {
                    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
                } catch (e) {
                    console.warn("Web Audio API not supported:", e);
                    return;
                }
            }

            // Create a silent buffer to unlock audio on iOS
            try {
                const buffer = this.audioContext.createBuffer(1, 1, 22050);
                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(this.audioContext.destination);
                source.start(0);
            } catch (e) {
                // Ignore - some browsers may not need this
            }

            // Resume audio context
            if (this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                } catch (e) {
                    console.warn("Failed to resume audio context:", e);
                }
            }
        })();

        return this.unlockAudioPromise;
    }

    private async ensureAudioContext() {
        // Unlock audio first (especially important for iOS)
        await this.unlockAudio();

        if (!this.audioContext) {
            try {
                this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            } catch (e) {
                console.warn("Web Audio API not supported:", e);
                return null;
            }
        }
        
        // Resume audio context if suspended (required by mobile browsers)
        if (this.audioContext.state === 'suspended') {
            try {
                await this.audioContext.resume();
            } catch (e) {
                console.warn("Failed to resume audio context:", e);
            }
        }
        
        // Initialize on first user interaction
        if (!this.isInitialized) {
            this.isInitialized = true;
            // Try to resume immediately
            if (this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                } catch (e) {
                    // Ignore - will be handled on next play
                }
            }
        }
        
        return this.audioContext;
    }

    async playJumpSound() {
        try {
            const ctx = await this.ensureAudioContext();
            if (!ctx) return;

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Icy tower style jump sound - short, high-pitched beep
            oscillator.frequency.setValueAtTime(600, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
            
            gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);

            oscillator.type = 'sine';
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.15);
        } catch (e) {
            // Silently fail - sound is not critical
            console.debug("Could not play jump sound:", e);
        }
    }

    async playFailSound() {
        try {
            const ctx = await this.ensureAudioContext();
            if (!ctx) return;

            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Icy tower style fail sound - descending tone
            oscillator.frequency.setValueAtTime(400, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.5);
            
            gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

            oscillator.type = 'sawtooth';
            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + 0.5);
        } catch (e) {
            // Silently fail - sound is not critical
            console.debug("Could not play fail sound:", e);
        }
    }
}

// Singleton instance
export const soundManager = new SoundManager();
