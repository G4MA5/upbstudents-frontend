export interface LibraryDocument {
  id: number;
  title: string;
  filiere: string;
  annee: string;
  niveau: string;
  session: string;
  type: string;
  file_url: string;
  filePath: string;
  created_at: string | null;
}

export interface Profile {
  nom: string;
  prenom: string;
  email: string;
  numero: string;
  niveau: string;
  filiere: string;
  proprietaire: boolean;
}

export interface Session {
  access_token: string;
  refresh_token: string;
  /** Unix time in seconds. */
  expires_at: number;
}

export interface DocumentMetadata {
  filiere: string;
  type: string;
  annee: string;
  niveau: string;
  matiere: string;
  session: string;
}
