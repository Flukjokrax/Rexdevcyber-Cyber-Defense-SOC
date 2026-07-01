import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from "firebase/auth";
import firebaseConfig from "../../firebase-applet-config.json";

// Initialize Firebase App
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Provider Setup
export const googleProvider = new GoogleAuthProvider();
// Request Drive permissions
googleProvider.addScope("https://www.googleapis.com/auth/drive");

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Listen for Auth changes and manage state
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        // Try to fetch token if user is signed in but we don't have it cached.
        // In popup flow, signInWithPopup resolves with the token, so we rely on that.
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Trigger google sign in with popup
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error("Failed to get access token from Firebase OAuth flow.");
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error) {
    console.error("Firebase Sign In Error:", error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Clear authentication session
export const logoutUser = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Retrieve token
export const getAccessToken = (): string | null => {
  return cachedAccessToken;
};

// Drive File interface
export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime: string;
}

// 1. List files from Drive
export const listDriveFiles = async (token: string): Promise<DriveFile[]> => {
  const query = "trashed = false";
  const url = `https://www.googleapis.com/drive/v3/files?pageSize=100&q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,modifiedTime)&orderBy=modifiedTime desc`;
  
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Drive API list files error:", errorBody);
    throw new Error(`Drive list failed: ${response.statusText}`);
  }

  const data = await response.json();
  return data.files || [];
};

// 2. Upload file (Robust two-step upload: create metadata, then upload content)
export const uploadDriveFile = async (
  token: string, 
  name: string, 
  mimeType: string, 
  blob: Blob
): Promise<DriveFile> => {
  // Step A: Create metadata entry
  const metadataUrl = "https://www.googleapis.com/drive/v3/files";
  const metadataResponse = await fetch(metadataUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      name,
      mimeType: mimeType || "application/octet-stream"
    })
  });

  if (!metadataResponse.ok) {
    const errorText = await metadataResponse.text();
    console.error("Drive metadata creation error:", errorText);
    throw new Error(`Failed to initialize file metadata: ${metadataResponse.statusText}`);
  }

  const fileMetadata = await metadataResponse.json();
  const fileId = fileMetadata.id;

  // Step B: Patch with content binary/media
  const mediaUrl = `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`;
  const mediaResponse = await fetch(mediaUrl, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": mimeType || "application/octet-stream"
    },
    body: blob
  });

  if (!mediaResponse.ok) {
    const errorText = await mediaResponse.text();
    console.error("Drive media content upload error:", errorText);
    throw new Error(`Failed to upload file content: ${mediaResponse.statusText}`);
  }

  const finalFile = await mediaResponse.json();
  return finalFile;
};

// 3. Delete file from Google Drive (Requires confirmation in UI)
export const deleteDriveFile = async (token: string, fileId: string): Promise<boolean> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}`;
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Drive API delete file error:", errorBody);
    throw new Error(`Drive delete failed: ${response.statusText}`);
  }

  return true;
};

// 4. Download file from Google Drive as a Blob
export const downloadDriveFile = async (token: string, fileId: string): Promise<Blob> => {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  if (!response.ok) {
    const errorBody = await response.text();
    console.error("Drive API download file error:", errorBody);
    throw new Error(`Drive download failed: ${response.statusText}`);
  }

  return await response.blob();
};
