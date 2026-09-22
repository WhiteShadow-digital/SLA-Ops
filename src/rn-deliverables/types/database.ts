export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = 'it_staff' | 'employee';
export type AssetStatus = 'available' | 'checked_out' | 'in_repair' | 'retired';

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  department: string;
  avatar_url?: string | null;
  created_at?: string;
}

export interface Asset {
  id: string;
  qr_code_id: string;
  name: string;
  serial_number: string;
  category: string;
  status: AssetStatus;
  location: string;
  warranty_expiration: string;
  created_at?: string;
}

export interface AssetAssignment {
  id: string;
  asset_id: string;
  assigned_to: string;
  checked_out_by: string;
  check_out_date: string;
  check_in_date: string | null;
  notes: string | null;
  created_at?: string;
}

export interface AssetWithRelations extends Asset {
  asset_assignments?: (AssetAssignment & {
    profiles?: Profile | null;
  })[];
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at'> & { created_at?: string };
        Update: Partial<Profile>;
      };
      assets: {
        Row: Asset;
        Insert: Omit<Asset, 'created_at' | 'id'> & { id?: string; created_at?: string };
        Update: Partial<Asset>;
      };
      asset_assignments: {
        Row: AssetAssignment;
        Insert: Omit<AssetAssignment, 'created_at' | 'id'> & { id?: string; created_at?: string };
        Update: Partial<AssetAssignment>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: UserRole;
      asset_status: AssetStatus;
    };
  };
}
