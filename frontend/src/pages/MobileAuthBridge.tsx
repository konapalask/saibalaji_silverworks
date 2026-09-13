import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  getRedirectResult, 
  signInWithRedirect, 
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

  const [status, setStatus] = useState<'initializing' | 'signing_in' | 'exchanging' | 'success' | 'cancelled' | 'error'>('initializing');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [deepLinkTarget, setDeepLinkTarget] = useState<string>('');
  const hasInitiatedRef = useRef(false);

  // Exchange the verified Google user from the redirect result for a backend one-time code
  const completeMobileAuth = async (fbUser: FirebaseUser) => {
    setStatus('exchanging');
    try {
      // Obtain verified Firebase ID token from the user selected in Google account chooser
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
      console.error('Mobile Auth Bridge Exchange Error:', err);
      setErrorMessage(err.response?.data?.detail || err.message || 'Failed to authenticate with Sai Balaji backend.');
      setStatus('error');
    }
  };

  const triggerGoogleRedirect = async () => {
    setStatus('signing_in');
    setErrorMessage('');
    try {
      // Explicitly create GoogleAuthProvider with prompt: 'select_account'
      // This forces Google to show the account chooser modal instead of silently picking an existing browser session
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      // Clear any prior lingering Firebase session in this tab so the selected account becomes the primary identity
      if (auth.currentUser) {
        try {
          await auth.signOut();
        } catch (signOutErr) {
          console.warn('Sign-out prior session notice:', signOutErr);
        }
      }

      sessionStorage.setItem('sbs_mobile_redirect_initiated', 'true');
      await signInWithRedirect(auth, provider);
    } catch (redirectErr: any) {
      sessionStorage.removeItem('sbs_mobile_redirect_initiated');
      console.error('signInWithRedirect error:', redirectErr);
      setStatus('error');
      setErrorMessage(redirectErr.message || 'Unable to open Google account chooser.');
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
          // User has actively chosen an account in Google's chooser and redirected back
          sessionStorage.removeItem('sbs_mobile_redirect_initiated');
          await completeMobileAuth(redirectResult.user);
          return;
        }

        // Step 2: Check if redirect was already attempted and returned without a credential (e.g. user cancelled)
        const wasRedirectInitiated = sessionStorage.getItem('sbs_mobile_redirect_initiated') === 'true';
        if (wasRedirectInitiated) {
          sessionStorage.removeItem('sbs_mobile_redirect_initiated');
          setStatus('cancelled');
          return;
        }

        // Step 3: Fresh entry from Android app
        // CRITICAL REQUIREMENT: Do NOT check auth.currentUser and do NOT silently auto-authenticate.
        // We must always initiate Google's account-selection flow for the Android app.
        await triggerGoogleRedirect();
      } catch (err: any) {
        if (!isMounted) return;
        sessionStorage.removeItem('sbs_mobile_redirect_initiated');
        console.error('Initial Redirect Processing Error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'Unable to process Google authentication.');
      }
    };

    runAuthFlow();

    return () => {
      isMounted = false;
    };
  }, [redirectUri]);

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
                {status === 'initializing' ? 'Connecting to Google Account Chooser...' : 'Opening Google Account Chooser...'}
              </p>
            </>
          )}

          {status === 'exchanging' && (
            <>
              <Loader2 className="w-12 h-12 text-[#B9A77A] animate-spin" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#202020]">
                  Google Account Selected
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

          {(status === 'cancelled' || status === 'error') && (
            <>
              <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-[#202020]">
                  {status === 'cancelled' ? 'Account Selection Required' : 'Authentication Notice'}
                </p>
                {errorMessage && (
                  <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-medium">
                    {errorMessage}
                  </p>
                )}
                <p className="text-xs text-[#666666]">
                  Please tap below to choose your Google account.
                </p>
              </div>

              <div className="pt-2 w-full">
                <button
                  type="button"
                  onClick={triggerGoogleRedirect}
                  className="w-full bg-[#202020] hover:bg-[#B9A77A] text-white py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Choose Google Account</span>
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
