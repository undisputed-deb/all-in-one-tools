import AuthPage from '../components/ui/auth-form';
import ProceduralGroundBackground from '../components/ui/animated-pattern-cloud';
import { authAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

function SignUp() {
  const navigate = useNavigate();

  const handleSignUp = async (email: string, password: string, remember: boolean) => {
    try {
      // Register the new user
      await authAPI.register(email, password);

      if (remember) {
        localStorage.setItem('rememberMe', 'true');
      }

      navigate('/');
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMessage = error?.response?.data?.message || error?.message || 'Registration failed';
      alert(`Registration failed: ${errorMessage}`);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      // In a real implementation, this would trigger OAuth flow
      // For now, we'll simulate it with the demo login
      console.log('Google Sign-Up initiated');
      await authAPI.login('admin', 'admin123');
      navigate('/');
    } catch (error) {
      console.error('Google sign-up failed:', error);
      alert('Google sign-up is currently in demo mode. Please use email/password.');
    }
  };

  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated WebGL Background */}
      <ProceduralGroundBackground />

      {/* Auth Form */}
      <div className="relative z-20 w-full max-w-md animate-fadeIn mb-auto mt-20">
        <AuthPage.AuthForm
          onSubmit={handleSignUp}
          onGoogleSignIn={handleGoogleSignIn}
          mode="signup"
        />
      </div>

      {/* Footer */}
      <footer className="relative z-20 mt-auto pb-8 text-center text-white/60 text-sm">
        © 2025 Document & Image Processor. All rights reserved.
      </footer>
    </div>
  );
}

export default SignUp;
