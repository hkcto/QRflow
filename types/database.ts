export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      qrcodes: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          code: string;
          target_url: string;
          scan_count: number;
          is_active: boolean;
          style: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          code: string;
          target_url: string;
          scan_count?: number;
          is_active?: boolean;
          style?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          code?: string;
          target_url?: string;
          scan_count?: number;
          is_active?: boolean;
          style?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      increment_scan: {
        Args: { p_code: string };
        Returns: string | null;
      };
      get_qr_public: {
        Args: { p_code: string };
        Returns: string | null;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type QrCodeRow = Database["public"]["Tables"]["qrcodes"]["Row"];
