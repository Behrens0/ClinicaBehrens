// src/app/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      'https://sxdosrgvnxbxifxvasks.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4ZG9zcmd2bnhieGlmeHZhc2tzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2ODQ0MzAsImV4cCI6MjA3NzI2MDQzMH0.4UZnIfEWBfptVMsNDkOmJNh6RyWvguzZTOVvkNnXfZ4'
    );
  }

  getSupabase() {
    return this.supabase;
  }
}