import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { auth } from '../../firebase/config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db, authReady } from '../../firebase/config';
import type {
  SignInRequest,
  SignUpRequest,
  AuthResponse,
  User,
} from '../types/auth.types';

export class AuthService {
  // Sign in with email and password
  static async signIn(credentials: SignInRequest): Promise<AuthResponse> {
    await authReady;
    const { email, password } = credentials;
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Check if email is verified
    if (!firebaseUser.emailVerified) {
      throw new Error('Please verify your email before signing in. Check your inbox for the verification link.');
    }

    // Get user profile from Firestore
    const userProfile = await this.getUserProfile(firebaseUser.uid);

    if (!userProfile) {
      throw new Error('User profile not found. Please contact support.');
    }

    return {
      success: true,
      user: userProfile,
    };
  }

  // Sign up - POST /users
  static async signUp(userData: SignUpRequest): Promise<AuthResponse> {
    await authReady;
    const { email, password, firstName, lastName, department } = userData;

    try {
      console.log('[AuthService] Starting signup process for:', email);
      
      // Create Firebase auth user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      console.log('[AuthService] Firebase user created:', firebaseUser.uid);

      // Update display name
      await updateProfile(firebaseUser, { 
        displayName: `${firstName} ${lastName}` 
      });
      console.log('[AuthService] Display name updated');

      // Send email verification with action code settings
      try {
        await sendEmailVerification(firebaseUser, {
          url: window.location.origin + '/auth/verify-email',
          handleCodeInApp: false,
        });
        console.log('[AuthService] ✅ Email verification sent successfully to:', email);
      } catch (emailError: any) {
        console.error('[AuthService] ❌ Failed to send verification email:', emailError);
        console.error('[AuthService] Email error code:', emailError.code);
        console.error('[AuthService] Email error message:', emailError.message);
        // Don't throw - we still want to create the account
      }

      // Create user profile in Firestore (Users collection)
      const user: Omit<User, 'createdAt'> = {
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        firstName,
        lastName,
        department,
        firebase_uid: firebaseUser.uid,
        isAdmin: false, // Default: is_admin = false
        emailVerified: false,
      };

      await this.createUserProfile(user);
      console.log('[AuthService] User profile created in Firestore');

      return {
        success: true,
        user: { ...user, createdAt: new Date() },
        message: 'Account created! Please check your email (and spam folder) to verify your account.',
      };
    } catch (error: any) {
      console.error('[AuthService] Signup error:', error);
      console.error('[AuthService] Error code:', error.code);
      console.error('[AuthService] Error message:', error.message);
      
      // Clean up Firebase auth user if Firestore creation fails
      if (auth.currentUser) {
        await auth.currentUser.delete().catch(console.error);
      }
      throw error;
    }
  }

  // Create user profile in Firestore
  private static async createUserProfile(user: Omit<User, 'createdAt'>): Promise<void> {
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, {
      ...user,
      createdAt: new Date(),
    });
  }

  // Get user profile from Firestore
  static async getUserProfile(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      return null;
    }

    const data = userSnap.data();
    return {
      id: userSnap.id,
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      department: data.department,
      firebase_uid: data.firebase_uid,
      isAdmin: data.isAdmin || false,
      emailVerified: data.emailVerified || false,
      createdAt: data.createdAt?.toDate() || new Date(),
    };
  }

  // Resend verification email
  static async resendVerificationEmail(): Promise<{ success: boolean; message: string }> {
    await authReady;
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser) {
      throw new Error('No user is currently signed in');
    }

    if (firebaseUser.emailVerified) {
      return {
        success: false,
        message: 'Your email is already verified',
      };
    }

    console.log('[AuthService] Resending verification email to:', firebaseUser.email);
    
    try {
      await sendEmailVerification(firebaseUser, {
        url: window.location.origin + '/auth/verify-email',
        handleCodeInApp: false,
      });
      console.log('[AuthService] ✅ Verification email resent successfully');
    } catch (error: any) {
      console.error('[AuthService] ❌ Failed to resend verification email:', error);
      console.error('[AuthService] Error code:', error.code);
      throw error;
    }
    
    return {
      success: true,
      message: 'Verification email sent! Please check your inbox and spam folder.',
    };
  }

  // Check and update email verification status
  static async checkEmailVerification(): Promise<boolean> {
    await authReady;
    const firebaseUser = auth.currentUser;
    
    if (!firebaseUser) {
      return false;
    }

    // Reload user to get latest verification status
    await firebaseUser.reload();
    
    // Update Firestore if verification status changed
    if (firebaseUser.emailVerified) {
      const userRef = doc(db, 'users', firebaseUser.uid);
      await setDoc(userRef, { emailVerified: true }, { merge: true });
    }

    return firebaseUser.emailVerified;
  }

  // Sign out
  static async signOut(): Promise<void> {
    await authReady;
    await firebaseSignOut(auth);
  }

  // Send password reset email
  static async forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
    await authReady;
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent. Please check your inbox.',
    };
  }

  // Get current Firebase user
  static getCurrentFirebaseUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Subscribe to auth state changes
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
  }
}
