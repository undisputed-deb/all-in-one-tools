import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, Mail, Lock, FileText, Image, Sparkles } from 'lucide-react';

interface AuthFormProps {
    onSubmit: (email: string, password: string, remember: boolean) => void;
    onGoogleSignIn?: () => void;
    mode?: 'signin' | 'signup';
}

interface VideoBackgroundProps {
    videoUrl: string;
}

interface FormInputProps {
    icon: React.ReactNode;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    autoComplete?: string;
}

interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    id: string;
}

const FormInput: React.FC<FormInputProps> = ({ icon, type, placeholder, value, onChange, required, autoComplete }) => {
    return (
        <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
                {icon}
            </div>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                autoComplete={autoComplete}
                className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/60 focus:outline-none focus:border-blue-500/50 transition-colors"
            />
        </div>
    );
};

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, id }) => {
    return (
        <div className="relative inline-block w-10 h-5 cursor-pointer">
            <input
                type="checkbox"
                id={id}
                className="sr-only"
                checked={checked}
                onChange={onChange}
            />
            <div className={`absolute inset-0 rounded-full transition-colors duration-200 ease-in-out ${checked ? 'bg-blue-600' : 'bg-white/20'}`}>
                <div className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full bg-white transition-transform duration-200 ease-in-out ${checked ? 'transform translate-x-5' : ''}`} />
            </div>
        </div>
    );
};

const VideoBackground: React.FC<VideoBackgroundProps> = ({ videoUrl }) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current) {
            videoRef.current.play().catch(error => {
                console.error("Video autoplay failed:", error);
            });
        }
    }, []);

    return (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-indigo-900/40 to-purple-900/40 z-10" />
            <video
                ref={videoRef}
                className="absolute inset-0 min-w-full min-h-full object-cover w-auto h-auto"
                autoPlay
                loop
                muted
                playsInline
            >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
};

const AuthForm: React.FC<AuthFormProps> = ({ onSubmit, onGoogleSignIn, mode = 'signin' }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (mode === 'signup' && password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        setIsSubmitting(true);

        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsSuccess(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        onSubmit(email, password, remember);
        setIsSubmitting(false);
        setIsSuccess(false);
    };

    return (
        <div className="p-8 rounded-2xl backdrop-blur-sm bg-black/50 border border-white/10 shadow-2xl">
            <div className="mb-8 text-center">
                <div className="flex justify-center mb-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/30 via-indigo-500/30 to-purple-500/30 blur-xl opacity-75 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                        <div className="relative p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
                            <Sparkles className="text-white" size={32} />
                        </div>
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-2 text-white">
                    {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
                </h2>

                <div className="text-white/80 flex flex-col items-center space-y-1">
                    <span className="animate-pulse">
                        {mode === 'signin'
                            ? 'Access your document processing workspace'
                            : 'Start processing documents in seconds'}
                    </span>
                    <span className="text-xs text-white/50 animate-pulse">
                        {mode === 'signin'
                            ? '[Press Enter to continue]'
                            : '[Join thousands of users]'}
                    </span>
                    <div className="flex space-x-2 text-xs text-white/40">
                        <span className="animate-pulse">📄</span>
                        <span className="animate-bounce">🖼️</span>
                        <span className="animate-pulse">✨</span>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {mode === 'signin' && (
                    <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-white/80 text-sm">
                        <p className="font-semibold mb-1">Demo Credentials:</p>
                        <p className="text-xs">Username: <span className="font-mono text-blue-300">admin</span> / Password: <span className="font-mono text-blue-300">admin123</span></p>
                        <p className="text-xs">or Username: <span className="font-mono text-blue-300">user</span> / Password: <span className="font-mono text-blue-300">user123</span></p>
                    </div>
                )}

                <FormInput
                    icon={<Mail className="text-white/60" size={18} />}
                    type="text"
                    placeholder="Username"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                />

                <div className="relative">
                    <FormInput
                        icon={<Lock className="text-white/60" size={18} />}
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
                    />
                    <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                </div>

                {mode === 'signup' && (
                    <div className="relative">
                        <FormInput
                            icon={<Lock className="text-white/60" size={18} />}
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white focus:outline-none transition-colors"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                )}

                {mode === 'signin' && (
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                            <div onClick={() => setRemember(!remember)} className="cursor-pointer">
                                <ToggleSwitch
                                    checked={remember}
                                    onChange={() => setRemember(!remember)}
                                    id="remember-me"
                                />
                            </div>
                            <label
                                htmlFor="remember-me"
                                className="text-sm text-white/80 cursor-pointer hover:text-white transition-colors"
                                onClick={() => setRemember(!remember)}
                            >
                                Remember me
                            </label>
                        </div>
                        <a href="#" className="text-sm text-white/80 hover:text-white transition-colors">
                            Forgot password?
                        </a>
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-3 rounded-lg ${isSuccess
                            ? 'bg-green-600'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                        } text-white font-medium transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40`}
                >
                    {isSubmitting
                        ? (mode === 'signin' ? 'Signing in...' : 'Creating account...')
                        : (mode === 'signin' ? 'Sign In' : 'Create Account')}
                </button>
            </form>

            <div className="mt-8">
                <div className="relative flex items-center justify-center">
                    <div className="border-t border-white/10 absolute w-full"></div>
                    <div className="bg-transparent px-4 relative text-white/60 text-sm">
                        or continue with
                    </div>
                </div>

                <div className="mt-6 space-y-3">
                    <button
                        type="button"
                        onClick={onGoogleSignIn}
                        className="w-full flex items-center justify-center gap-3 p-3 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition-all duration-200 group"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        <span className="font-medium">Continue with Google</span>
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <FileText size={18} />
                            <span className="text-sm">PDF Demo</span>
                        </button>
                        <button
                            type="button"
                            className="flex items-center justify-center gap-2 p-3 bg-white/5 border border-white/10 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
                        >
                            <Image size={18} />
                            <span className="text-sm">Image Demo</span>
                        </button>
                    </div>
                </div>
            </div>

            <p className="mt-8 text-center text-sm text-white/60">
                {mode === 'signin' ? "Don't have an account?" : "Already have an account?"}{' '}
                <a
                    href={mode === 'signin' ? '/signup' : '/signin'}
                    className="font-medium text-white hover:text-blue-300 transition-colors"
                >
                    {mode === 'signin' ? 'Create Account' : 'Sign In'}
                </a>
            </p>
        </div>
    );
};

const AuthPage = {
    AuthForm,
    VideoBackground
};

export default AuthPage;
