import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  getRedirectResult, 
  signInWithRedirect, 
  signInWithPopup, 
  User as FirebaseUser 
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import api from '../services/api';
import { Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';

export const MobileAuthBridge: React.FC = () => {
  const [searchParams] = useSearchParams();
  const rawRedirectUri = searchParams.get('redirect_uri') || 'saibalaji://auth/callback';
  // Strip trailing slashes or format parameters cleanly
  const redirectUri = rawRedirectUri.trim();

  const [status, setStatus] = useState<'initializing' | 'signing_in' | 'exchanging' | 'success' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [deepLinkTarget, setDeepLinkTarget] = useState<string>('');
  const hasInitiatedRef = useRef(false);

  // Helper to exchange Firebase user for backend one-time code and trigger Android deep link
  const completeMobileAuth = async (fbUser: FirebaseUser) => {
    setStatus('exchanging');
    try {
      const idToken = await fbUser.getIdToken();
      const email = fbUser.email || '';
      const name = fbUser.displayName || (email ? email.split('@')[0] : 'User');
      const photo = fbUser.photoURL || undefined;

      // Request secure single-use one-time code from Sai Balaji backend
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

      // Build deep link callback with the single-use code
      const delimiter = redirectUri.includes('?') ? '&' : '?';
      const targetUrl = `${redirectUri}${delimiter}code=${encodeURIComponent(code)}`;
      setDeepLinkTarget(targetUrl);
      setStatus('success');

      // Dispatch redirect to Android application immediately
      window.location.href = targetUrl;
    } catch (err: any) {
      console.error('Mobile Auth Bridge Error:', err);
      setErrorMessage(err.response?.data?.detail || err.message || 'Failed to authenticate with Sai Balaji backend.');
      setStatus('error');
    }
  };

  useEffect(() => {
    if (hasInitiatedRef.current) return;
    hasInitiatedRef.current = true;

    let isMounted = true;

    const runAuthFlow = async () => {
      try {
        // Step 1: Check if returning from Google OAuth Redirect
        const redirectResult = await getRedirectResult(auth);
        if (!isMounted) return;

        if (redirectResult && redirectResult.user) {
          await completeMobileAuth(redirectResult.user);
          return;
        }

        // Step 2: Check if current Firebase user is already active in this session
        if (auth.currentUser) {
          await completeMobileAuth(auth.currentUser);
          return;
        }

        // Step 3: Trigger Google Account Chooser via Redirect
        setStatus('signing_in');
        try {
          await signInWithRedirect(auth, googleProvider);
        } catch (redirectErr: any) {
          console.warn('signInWithRedirect prevented or failed, offering user prompt:', redirectErr);
          setStatus('error');
          setErrorMessage('Please tap below to sign in with Google.');
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.error('Initial Redirect Result Error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Unable to complete Google authentication.');
      }
    };

    runAuthFlow();

    return () => {
      isMounted = false;
    };
  }, [redirectUri]);

  // Fallback direct user-tap handler (supports popup if redirect is blocked by mobile webview)
  const handleManualGoogleSignIn = async () => {
    setStatus('signing_in');
    setErrorMessage('');
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result && result.user) {
        await completeMobileAuth(result.user);
      }
    } catch (err: any) {
      console.error('Manual popup sign-in error:', err);
      setStatus('error');
      setErrorMessage(err.message || 'Google sign-in was cancelled or failed.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F1] flex flex-col items-center justify-center p-6 text-[#202020] select-none">
      <div className="w-full max-w-sm bg-white border border-[#E5E0D8] rounded-3xl p-8 shadow-sm text-center space-y-6">
        
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
        <div className="py-4 flex flex-col items-center justify-center space-y-4">
          {(status === 'initializing' || status === 'signing_in') && (
            <>
              <div className="relative">
                <Loader2 className="w-12 h-12 text-[#B9A77A] animate-spin" />
              </div>
              <p className="text-xs text-[#666666] font-medium animate-pulse">
                {status === 'initializing' ? 'Connecting to Google Account Chooser...' : 'Opening Google Sign-In...'}
              </p>
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
                  Generating secure single-use code for Sai Balaji App...
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
                <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium">
                  {errorMessage || 'Unable to complete Google authentication.'}
                </p>
              </div>

              <div className="pt-2 w-full">
                <button
                  type="button"
                  onClick={handleManualGoogleSignIn}
                  className="w-full bg-[#202020] hover:bg-[#B9A77A] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Continue with Google</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Security Footer */}
        <div className="pt-4 border-t border-[#E5E0D8]">
          <p className="text-[10px] text-gray-400 tracking-wide uppercase">
            End-to-End Encrypted Session Bridge
          </p>
        </div>

      </div>
    </div>
  );
};
export default MobileAuthBridge;
