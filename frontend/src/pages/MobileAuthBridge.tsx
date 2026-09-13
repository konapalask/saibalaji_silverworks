import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  getRedirectResult, 
  signInWithPopup, 
  GoogleAuthProvider, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth } from '../config/firebase';
import api from '../services/api';
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export const MobileAuthBridge: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawRedirectUri = searchParams.get('redirect_uri') || 'saibalaji://auth/callback';
  const redirectUri = rawRedirectUri.trim();

  const [status, setStatus] = useState<'initializing' | 'ready' | 'exchanging' | 'success' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [deepLinkTarget, setDeepLinkTarget] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const hasInitiatedRef = useRef(false);

  // Exchange the freshly verified Google user for backend one-time authorization code
  const completeMobileAuth = async (fbUser: FirebaseUser) => {
    setStatus('exchanging');
    try {
      const idToken = await fbUser.getIdToken();
      const email = fbUser.email || '';
      const name = fbUser.displayName || (email ? email.split('@')[0] : 'User');
      const photo = fbUser.photoURL || undefined;

      const res = await api.post('/auth/mobile/code', {
        idToken,
        firebase_uid: fbUser.uid,
        email,
        full_name: name,
        photo_url: photo
      });

      const { code } = res.data;
      if (!code) {
        throw new Error('No authorization code returned by Sai Balaji backend.');
      }

      const delimiter = redirectUri.includes('?') ? '&' : '?';
      const targetUrl = `${redirectUri}${delimiter}code=${encodeURIComponent(code)}`;
      setDeepLinkTarget(targetUrl);
      setStatus('success');

      // Dispatch redirect to Android application immediately
      window.location.href = targetUrl;
    } catch (err: any) {
      const errMsg = err.response?.data?.detail || err.message || 'Failed to authenticate with Sai Balaji backend.';
      setErrorMessage(errMsg);
      setStatus('error');
    }
  };

  // Google Sign-In with fresh account-selection
  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Clear any prior lingering session in this tab before initiating
      if (auth.currentUser) {
        try {
          await auth.signOut();
        } catch (e) {
          // ignore signout errors
        }
      }

      const result = await signInWithPopup(auth, provider);
      if (result && result.user) {
        // Crucial: Only the user returned from THIS interaction is used
        await completeMobileAuth(result.user);
      } else {
        setStatus('ready');
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setStatus('ready');
      } else {
        console.error('Google Sign-In Error:', err);
        setErrorMessage(err.message || 'Google authentication failed. Please try again.');
        setStatus('error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (hasInitiatedRef.current) return;
    hasInitiatedRef.current = true;

    let isMounted = true;

    const initAuth = async () => {
      try {
        // Check if returning from a redirect operation (if any)
        const redirectResult = await getRedirectResult(auth);
        if (!isMounted) return;

        if (redirectResult && redirectResult.user) {
          await completeMobileAuth(redirectResult.user);
          return;
        }

        // Clean slate: Clear any prior session from previous mobile test runs
        if (auth.currentUser) {
          try {
            await auth.signOut();
          } catch (e) {}
        }

        // In mobile browsers/Custom Tabs, attempt direct popup if allowed, or present clean 1-click button
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          prompt: 'select_account'
        });

        try {
          const result = await signInWithPopup(auth, provider);
          if (!isMounted) return;
          if (result && result.user) {
            await completeMobileAuth(result.user);
            return;
          }
        } catch (autoErr: any) {
          // If browser popup blocker intercepts auto-popup (standard on mobile), smoothly present 1-click button
          if (!isMounted) return;
          setStatus('ready');
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus('ready');
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, [redirectUri]);

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center p-4 sm:p-6 text-[#202020] select-none">
      <div className="w-full max-w-sm bg-white border border-[#E5E0D8] rounded-3xl p-6 sm:p-8 shadow-sm text-center space-y-6">
        
        {/* Brand Header */}
        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.25em] uppercase font-bold text-[#B9A77A]">
            Sai Balaji Silverworks
          </p>
          <h1 className="font-serif text-2xl font-bold text-[#202020]">
            Android App Sign-In
          </h1>
        </div>

        {/* Dynamic Status Display */}
        <div className="py-2 flex flex-col items-center justify-center space-y-4">
          {status === 'initializing' && (
            <>
              <div className="relative">
                <Loader2 className="w-12 h-12 text-[#B9A77A] animate-spin" />
              </div>
              <p className="text-xs text-[#666666] font-medium animate-pulse">
                Connecting to Google Sign-In...
              </p>
            </>
          )}

          {status === 'ready' && (
            <>
              <div className="space-y-2">
                <p className="text-xs text-[#666666]">
                  Sign in with your Google account to continue to the Sai Balaji application.
                </p>
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-full bg-[#202020] hover:bg-[#B9A77A] text-white py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>{loading ? 'Connecting to Google...' : 'Continue with Google'}</span>
              </button>
            </>
          )}

          {status === 'exchanging' && (
            <>
              <Loader2 className="w-12 h-12 text-[#B9A77A] animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#202020]">
                  Google Account Verified
                </p>
                <p className="text-[11px] text-[#666666]">
                  Returning to Sai Balaji Android Application...
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#202020]">
                  Authentication Successful
                </p>
                <p className="text-xs text-[#666666]">
                  Returning to Sai Balaji Android Application...
                </p>
              </div>

              {deepLinkTarget && (
                <div className="pt-3 w-full">
                  <a
                    href={deepLinkTarget}
                    className="w-full inline-flex items-center justify-center gap-2 bg-[#202020] hover:bg-[#B9A77A] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm"
                  >
                    <span>Open Sai Balaji App</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <p className="text-[10px] text-gray-400 mt-2">
                    Tap the button above if you are not automatically redirected.
                  </p>
                </div>
              )}
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#202020]">
                  Authentication Notice
                </p>
                {errorMessage && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium">
                    {errorMessage}
                  </p>
                )}
              </div>

              <div className="pt-2 w-full">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={loading}
                  className="w-full bg-[#202020] hover:bg-[#B9A77A] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Try Again with Google</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Security Footer */}
        <div className="pt-2 border-t border-[#E5E0D8]">
          <p className="text-[10px] text-gray-400 tracking-wide uppercase">
            End-to-End Encrypted Session Bridge
          </p>
        </div>

      </div>
    </div>
  );
};

export default MobileAuthBridge;
