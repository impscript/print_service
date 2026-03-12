export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      contract_machines: {
        Row: {
          contract_id: string
          created_at: string | null
          id: string
          initial_meter_color: number | null
          initial_meter_mono: number | null
          installed_at: string | null
          machine_id: string
        }
        Insert: {
          contract_id: string
          created_at?: string | null
          id?: string
          initial_meter_color?: number | null
          initial_meter_mono?: number | null
          installed_at?: string | null
          machine_id: string
        }
        Update: {
          contract_id?: string
          created_at?: string | null
          id?: string
          initial_meter_color?: number | null
          initial_meter_mono?: number | null
          installed_at?: string | null
          machine_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_machines_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_machines_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_machines_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          auto_renewal: boolean | null
          billing_cycle: Database["public"]["Enums"]["billing_cycle"]
          click_rate_black: number | null
          click_rate_color: number | null
          contract_number: string
          created_at: string | null
          customer_id: string
          document_url: string | null
          end_date: string
          excess_rate_black: number | null
          excess_rate_color: number | null
          free_volume_black: number | null
          free_volume_color: number | null
          id: string
          min_guarantee_volume: number | null
          monthly_fee: number | null
          notes: string | null
          old_contract_number: string | null
          package_id: string | null
          paper_gram: number | null
          paper_included: boolean | null
          payment_terms: string | null
          po_url: string | null
          pricing_type: Database["public"]["Enums"]["pricing_type"]
          quote_id: string | null
          sales_id: string
          signed_at: string | null
          site_id: string
          start_date: string
          status: Database["public"]["Enums"]["contract_status"]
          termination_notice_days: number | null
          updated_at: string | null
          vat_included: boolean | null
          waste_paper_discount: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          auto_renewal?: boolean | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          click_rate_black?: number | null
          click_rate_color?: number | null
          contract_number: string
          created_at?: string | null
          customer_id: string
          document_url?: string | null
          end_date: string
          excess_rate_black?: number | null
          excess_rate_color?: number | null
          free_volume_black?: number | null
          free_volume_color?: number | null
          id?: string
          min_guarantee_volume?: number | null
          monthly_fee?: number | null
          notes?: string | null
          old_contract_number?: string | null
          package_id?: string | null
          paper_gram?: number | null
          paper_included?: boolean | null
          payment_terms?: string | null
          po_url?: string | null
          pricing_type: Database["public"]["Enums"]["pricing_type"]
          quote_id?: string | null
          sales_id: string
          signed_at?: string | null
          site_id: string
          start_date: string
          status?: Database["public"]["Enums"]["contract_status"]
          termination_notice_days?: number | null
          updated_at?: string | null
          vat_included?: boolean | null
          waste_paper_discount?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          auto_renewal?: boolean | null
          billing_cycle?: Database["public"]["Enums"]["billing_cycle"]
          click_rate_black?: number | null
          click_rate_color?: number | null
          contract_number?: string
          created_at?: string | null
          customer_id?: string
          document_url?: string | null
          end_date?: string
          excess_rate_black?: number | null
          excess_rate_color?: number | null
          free_volume_black?: number | null
          free_volume_color?: number | null
          id?: string
          min_guarantee_volume?: number | null
          monthly_fee?: number | null
          notes?: string | null
          old_contract_number?: string | null
          package_id?: string | null
          paper_gram?: number | null
          paper_included?: boolean | null
          payment_terms?: string | null
          po_url?: string | null
          pricing_type?: Database["public"]["Enums"]["pricing_type"]
          quote_id?: string | null
          sales_id?: string
          signed_at?: string | null
          site_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["contract_status"]
          termination_notice_days?: number | null
          updated_at?: string | null
          vat_included?: boolean | null
          waste_paper_discount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "pricing_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_sales_id_fkey"
            columns: ["sales_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_bookings: {
        Row: {
          additional_notes: string | null
          booking_token: string
          created_at: string | null
          customer_id: string
          id: string
          installation_address: string | null
          installation_contact_person: string | null
          installation_phone: string | null
          is_submitted: boolean | null
          number_of_computers: number | null
          preferred_date: string | null
          quotation_id: string
          submitted_at: string | null
          updated_at: string | null
        }
        Insert: {
          additional_notes?: string | null
          booking_token: string
          created_at?: string | null
          customer_id: string
          id?: string
          installation_address?: string | null
          installation_contact_person?: string | null
          installation_phone?: string | null
          is_submitted?: boolean | null
          number_of_computers?: number | null
          preferred_date?: string | null
          quotation_id: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          additional_notes?: string | null
          booking_token?: string
          created_at?: string | null
          customer_id?: string
          id?: string
          installation_address?: string | null
          installation_contact_person?: string | null
          installation_phone?: string | null
          is_submitted?: boolean | null
          number_of_computers?: number | null
          preferred_date?: string | null
          quotation_id?: string
          submitted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "customer_bookings_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          address: string | null
          company_name: string
          contact_person: string | null
          created_at: string | null
          created_by: string | null
          customer_type: Database["public"]["Enums"]["customer_type"] | null
          email: string | null
          id: string
          notes: string | null
          payment_terms: string | null
          phone: string | null
          tax_id: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: Database["public"]["Enums"]["customer_type"] | null
          email?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          contact_person?: string | null
          created_at?: string | null
          created_by?: string | null
          customer_type?: Database["public"]["Enums"]["customer_type"] | null
          email?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          phone?: string | null
          tax_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customers_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory_items: {
        Row: {
          category: string
          created_at: string | null
          id: string
          location: string | null
          min_stock: number
          name: string
          notes: string | null
          product_id: string | null
          quantity: number
          sku: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          location?: string | null
          min_stock?: number
          name: string
          notes?: string | null
          product_id?: string | null
          quantity?: number
          sku?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          location?: string | null
          min_stock?: number
          name?: string
          notes?: string | null
          product_id?: string | null
          quantity?: number
          sku?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          adjusted_volume_black: number | null
          adjusted_volume_color: number | null
          base_amount: number | null
          billing_period_end: string
          billing_period_start: string
          contract_id: string
          created_at: string | null
          customer_id: string
          due_date: string
          excess_amount_black: number | null
          excess_amount_color: number | null
          id: string
          invoice_number: string
          meter_reading_black: number | null
          meter_reading_color: number | null
          notes: string | null
          paid_amount: number | null
          paid_at: string | null
          pdf_url: string | null
          previous_reading_black: number | null
          previous_reading_color: number | null
          sent_at: string | null
          status: Database["public"]["Enums"]["invoice_status"]
          subtotal: number | null
          total: number | null
          updated_at: string | null
          vat: number | null
          volume_black: number | null
          volume_color: number | null
        }
        Insert: {
          adjusted_volume_black?: number | null
          adjusted_volume_color?: number | null
          base_amount?: number | null
          billing_period_end: string
          billing_period_start: string
          contract_id: string
          created_at?: string | null
          customer_id: string
          due_date: string
          excess_amount_black?: number | null
          excess_amount_color?: number | null
          id?: string
          invoice_number: string
          meter_reading_black?: number | null
          meter_reading_color?: number | null
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          pdf_url?: string | null
          previous_reading_black?: number | null
          previous_reading_color?: number | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
          vat?: number | null
          volume_black?: number | null
          volume_color?: number | null
        }
        Update: {
          adjusted_volume_black?: number | null
          adjusted_volume_color?: number | null
          base_amount?: number | null
          billing_period_end?: string
          billing_period_start?: string
          contract_id?: string
          created_at?: string | null
          customer_id?: string
          due_date?: string
          excess_amount_black?: number | null
          excess_amount_color?: number | null
          id?: string
          invoice_number?: string
          meter_reading_black?: number | null
          meter_reading_color?: number | null
          notes?: string | null
          paid_amount?: number | null
          paid_at?: string | null
          pdf_url?: string | null
          previous_reading_black?: number | null
          previous_reading_color?: number | null
          sent_at?: string | null
          status?: Database["public"]["Enums"]["invoice_status"]
          subtotal?: number | null
          total?: number | null
          updated_at?: string | null
          vat?: number | null
          volume_black?: number | null
          volume_color?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      job_parts: {
        Row: {
          created_at: string | null
          id: string
          job_sheet_id: string
          part_name: string
          part_number: string | null
          quantity: number
          unit_price: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          job_sheet_id: string
          part_name: string
          part_number?: string | null
          quantity?: number
          unit_price?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          job_sheet_id?: string
          part_name?: string
          part_number?: string | null
          quantity?: number
          unit_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "job_parts_job_sheet_id_fkey"
            columns: ["job_sheet_id"]
            isOneToOne: false
            referencedRelation: "job_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          job_sheet_id: string
          photo_url: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          job_sheet_id: string
          photo_url: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          job_sheet_id?: string
          photo_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_sheet_id_fkey"
            columns: ["job_sheet_id"]
            isOneToOne: false
            referencedRelation: "job_sheets"
            referencedColumns: ["id"]
          },
        ]
      }
      job_sheets: {
        Row: {
          arrival_time: string | null
          completion_time: string | null
          created_at: string | null
          customer_name: string | null
          customer_signature: string | null
          final_meter_color: number | null
          final_meter_mono: number | null
          id: string
          initial_meter_color: number | null
          initial_meter_mono: number | null
          job_id: string
          notes: string | null
          submitted_at: string | null
          technician_id: string
          updated_at: string | null
          work_description: string
        }
        Insert: {
          arrival_time?: string | null
          completion_time?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_signature?: string | null
          final_meter_color?: number | null
          final_meter_mono?: number | null
          id?: string
          initial_meter_color?: number | null
          initial_meter_mono?: number | null
          job_id: string
          notes?: string | null
          submitted_at?: string | null
          technician_id: string
          updated_at?: string | null
          work_description: string
        }
        Update: {
          arrival_time?: string | null
          completion_time?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_signature?: string | null
          final_meter_color?: number | null
          final_meter_mono?: number | null
          id?: string
          initial_meter_color?: number | null
          initial_meter_mono?: number | null
          job_id?: string
          notes?: string | null
          submitted_at?: string | null
          technician_id?: string
          updated_at?: string | null
          work_description?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_sheets_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_sheets_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          assigned_to: string | null
          booking_reference: string | null
          cancellation_reason: string | null
          completed_date: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string
          customer_id: string | null
          delivery_sequence: number | null
          description: string
          id: string
          is_partner_contract: boolean | null
          job_category: string | null
          job_number: string
          machine_id: string | null
          machine_info_notes: string | null
          meter_reading_schedule: string | null
          notes: string | null
          paper_notes: string | null
          paper_quantity: number | null
          partner_name: string | null
          pickup_machine_status: string | null
          planned_delivery_date: string | null
          priority: Database["public"]["Enums"]["job_priority"]
          return_machine_serial: string | null
          scheduled_date: string | null
          service_by: string | null
          site_id: string | null
          status: Database["public"]["Enums"]["job_status"]
          type: Database["public"]["Enums"]["job_type"]
          updated_at: string | null
          vehicle_number: string | null
        }
        Insert: {
          assigned_to?: string | null
          booking_reference?: string | null
          cancellation_reason?: string | null
          completed_date?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by: string
          customer_id?: string | null
          delivery_sequence?: number | null
          description: string
          id?: string
          is_partner_contract?: boolean | null
          job_category?: string | null
          job_number: string
          machine_id?: string | null
          machine_info_notes?: string | null
          meter_reading_schedule?: string | null
          notes?: string | null
          paper_notes?: string | null
          paper_quantity?: number | null
          partner_name?: string | null
          pickup_machine_status?: string | null
          planned_delivery_date?: string | null
          priority?: Database["public"]["Enums"]["job_priority"]
          return_machine_serial?: string | null
          scheduled_date?: string | null
          service_by?: string | null
          site_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          type: Database["public"]["Enums"]["job_type"]
          updated_at?: string | null
          vehicle_number?: string | null
        }
        Update: {
          assigned_to?: string | null
          booking_reference?: string | null
          cancellation_reason?: string | null
          completed_date?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string
          customer_id?: string | null
          delivery_sequence?: number | null
          description?: string
          id?: string
          is_partner_contract?: boolean | null
          job_category?: string | null
          job_number?: string
          machine_id?: string | null
          machine_info_notes?: string | null
          meter_reading_schedule?: string | null
          notes?: string | null
          paper_notes?: string | null
          paper_quantity?: number | null
          partner_name?: string | null
          pickup_machine_status?: string | null
          planned_delivery_date?: string | null
          priority?: Database["public"]["Enums"]["job_priority"]
          return_machine_serial?: string | null
          scheduled_date?: string | null
          service_by?: string | null
          site_id?: string | null
          status?: Database["public"]["Enums"]["job_status"]
          type?: Database["public"]["Enums"]["job_type"]
          updated_at?: string | null
          vehicle_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jobs_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_requirements: {
        Row: {
          color_type: Database["public"]["Enums"]["color_type"]
          created_at: string | null
          estimated_volume_black: number | null
          estimated_volume_color: number | null
          id: string
          lead_id: string
          machine_type: Database["public"]["Enums"]["machine_type"]
          paper_size: Database["public"]["Enums"]["paper_size"]
          quantity: number
          special_requirements: string | null
          updated_at: string | null
        }
        Insert: {
          color_type?: Database["public"]["Enums"]["color_type"]
          created_at?: string | null
          estimated_volume_black?: number | null
          estimated_volume_color?: number | null
          id?: string
          lead_id: string
          machine_type?: Database["public"]["Enums"]["machine_type"]
          paper_size?: Database["public"]["Enums"]["paper_size"]
          quantity?: number
          special_requirements?: string | null
          updated_at?: string | null
        }
        Update: {
          color_type?: Database["public"]["Enums"]["color_type"]
          created_at?: string | null
          estimated_volume_black?: number | null
          estimated_volume_color?: number | null
          id?: string
          lead_id?: string
          machine_type?: Database["public"]["Enums"]["machine_type"]
          paper_size?: Database["public"]["Enums"]["paper_size"]
          quantity?: number
          special_requirements?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lead_requirements_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          booking_computer_count: number | null
          booking_contact_person: string | null
          color_type: Database["public"]["Enums"]["color_type"]
          created_at: string | null
          customer_acquisition_type:
            | Database["public"]["Enums"]["lead_customer_acquisition_type"]
            | null
          customer_id: string
          estimated_volume_black: number | null
          estimated_volume_color: number | null
          expected_close_date: string | null
          id: string
          lead_number: string
          machine_type: Database["public"]["Enums"]["machine_type"]
          notes: string | null
          paper_size: Database["public"]["Enums"]["paper_size"]
          past_brand: string | null
          past_paper_type: string | null
          price_validity_days: number | null
          sales_id: string
          site_id: string | null
          special_requirements: string | null
          status: Database["public"]["Enums"]["lead_status"]
          tor_file_url: string | null
          type: Database["public"]["Enums"]["lead_type"]
          updated_at: string | null
        }
        Insert: {
          booking_computer_count?: number | null
          booking_contact_person?: string | null
          color_type: Database["public"]["Enums"]["color_type"]
          created_at?: string | null
          customer_acquisition_type?:
            | Database["public"]["Enums"]["lead_customer_acquisition_type"]
            | null
          customer_id: string
          estimated_volume_black?: number | null
          estimated_volume_color?: number | null
          expected_close_date?: string | null
          id?: string
          lead_number: string
          machine_type: Database["public"]["Enums"]["machine_type"]
          notes?: string | null
          paper_size: Database["public"]["Enums"]["paper_size"]
          past_brand?: string | null
          past_paper_type?: string | null
          price_validity_days?: number | null
          sales_id: string
          site_id?: string | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tor_file_url?: string | null
          type?: Database["public"]["Enums"]["lead_type"]
          updated_at?: string | null
        }
        Update: {
          booking_computer_count?: number | null
          booking_contact_person?: string | null
          color_type?: Database["public"]["Enums"]["color_type"]
          created_at?: string | null
          customer_acquisition_type?:
            | Database["public"]["Enums"]["lead_customer_acquisition_type"]
            | null
          customer_id?: string
          estimated_volume_black?: number | null
          estimated_volume_color?: number | null
          expected_close_date?: string | null
          id?: string
          lead_number?: string
          machine_type?: Database["public"]["Enums"]["machine_type"]
          notes?: string | null
          paper_size?: Database["public"]["Enums"]["paper_size"]
          past_brand?: string | null
          past_paper_type?: string | null
          price_validity_days?: number | null
          sales_id?: string
          site_id?: string | null
          special_requirements?: string | null
          status?: Database["public"]["Enums"]["lead_status"]
          tor_file_url?: string | null
          type?: Database["public"]["Enums"]["lead_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "leads_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_sales_id_fkey"
            columns: ["sales_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      machines: {
        Row: {
          condition: Database["public"]["Enums"]["machine_condition"]
          contract_id: string | null
          created_at: string | null
          current_counter_color: number | null
          current_counter_mono: number | null
          id: string
          notes: string | null
          product_id: string
          purchase_date: string | null
          qr_code: string | null
          serial_number: string
          site_id: string | null
          status: Database["public"]["Enums"]["machine_status"]
          updated_at: string | null
          warranty_end_date: string | null
        }
        Insert: {
          condition?: Database["public"]["Enums"]["machine_condition"]
          contract_id?: string | null
          created_at?: string | null
          current_counter_color?: number | null
          current_counter_mono?: number | null
          id?: string
          notes?: string | null
          product_id: string
          purchase_date?: string | null
          qr_code?: string | null
          serial_number: string
          site_id?: string | null
          status?: Database["public"]["Enums"]["machine_status"]
          updated_at?: string | null
          warranty_end_date?: string | null
        }
        Update: {
          condition?: Database["public"]["Enums"]["machine_condition"]
          contract_id?: string | null
          created_at?: string | null
          current_counter_color?: number | null
          current_counter_mono?: number | null
          id?: string
          notes?: string | null
          product_id?: string
          purchase_date?: string | null
          qr_code?: string | null
          serial_number?: string
          site_id?: string | null
          status?: Database["public"]["Enums"]["machine_status"]
          updated_at?: string | null
          warranty_end_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_machines_contract"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_machines_contract"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts_expiring_soon"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machines_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "machines_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pricing_packages: {
        Row: {
          base_monthly_fee: number | null
          click_rate_black: number | null
          click_rate_color: number | null
          created_at: string | null
          description: string | null
          excess_rate_black: number | null
          excess_rate_color: number | null
          free_volume_black: number | null
          free_volume_color: number | null
          id: string
          includes_paper: boolean | null
          is_active: boolean | null
          min_guarantee_price: number | null
          min_guarantee_volume: number | null
          name: string
          pricing_type: Database["public"]["Enums"]["pricing_type"]
          product_id: string | null
          updated_at: string | null
          waste_paper_discount: number | null
        }
        Insert: {
          base_monthly_fee?: number | null
          click_rate_black?: number | null
          click_rate_color?: number | null
          created_at?: string | null
          description?: string | null
          excess_rate_black?: number | null
          excess_rate_color?: number | null
          free_volume_black?: number | null
          free_volume_color?: number | null
          id?: string
          includes_paper?: boolean | null
          is_active?: boolean | null
          min_guarantee_price?: number | null
          min_guarantee_volume?: number | null
          name: string
          pricing_type: Database["public"]["Enums"]["pricing_type"]
          product_id?: string | null
          updated_at?: string | null
          waste_paper_discount?: number | null
        }
        Update: {
          base_monthly_fee?: number | null
          click_rate_black?: number | null
          click_rate_color?: number | null
          created_at?: string | null
          description?: string | null
          excess_rate_black?: number | null
          excess_rate_color?: number | null
          free_volume_black?: number | null
          free_volume_color?: number | null
          id?: string
          includes_paper?: boolean | null
          is_active?: boolean | null
          min_guarantee_price?: number | null
          min_guarantee_volume?: number | null
          name?: string
          pricing_type?: Database["public"]["Enums"]["pricing_type"]
          product_id?: string | null
          updated_at?: string | null
          waste_paper_discount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pricing_packages_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          brand: Database["public"]["Enums"]["brand"]
          color_type: Database["public"]["Enums"]["color_type"]
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          model: string
          paper_size: Database["public"]["Enums"]["paper_size"]
          speed_ppm: number | null
          type: Database["public"]["Enums"]["machine_type"]
          updated_at: string | null
        }
        Insert: {
          brand: Database["public"]["Enums"]["brand"]
          color_type: Database["public"]["Enums"]["color_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          model: string
          paper_size: Database["public"]["Enums"]["paper_size"]
          speed_ppm?: number | null
          type: Database["public"]["Enums"]["machine_type"]
          updated_at?: string | null
        }
        Update: {
          brand?: Database["public"]["Enums"]["brand"]
          color_type?: Database["public"]["Enums"]["color_type"]
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          model?: string
          paper_size?: Database["public"]["Enums"]["paper_size"]
          speed_ppm?: number | null
          type?: Database["public"]["Enums"]["machine_type"]
          updated_at?: string | null
        }
        Relationships: []
      }
      quotation_items: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          machine_id: string | null
          product_id: string
          quantity: number
          quotation_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          machine_id?: string | null
          product_id: string
          quantity?: number
          quotation_id: string
          total_price: number
          unit_price: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          machine_id?: string | null
          product_id?: string
          quantity?: number
          quotation_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_items_machine_id_fkey"
            columns: ["machine_id"]
            isOneToOne: false
            referencedRelation: "machines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_items_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotation_revisions: {
        Row: {
          changed_by: string | null
          changes: Json
          created_at: string | null
          id: string
          quotation_id: string
          revision_number: number
        }
        Insert: {
          changed_by?: string | null
          changes: Json
          created_at?: string | null
          id?: string
          quotation_id: string
          revision_number: number
        }
        Update: {
          changed_by?: string | null
          changes?: Json
          created_at?: string | null
          id?: string
          quotation_id?: string
          revision_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotation_revisions_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotation_revisions_quotation_id_fkey"
            columns: ["quotation_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
        ]
      }
      quotations: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          attention_title: string | null
          created_at: string | null
          customer_id: string
          discount: number | null
          id: string
          lead_id: string | null
          marketing_id: string | null
          notes: string | null
          package_id: string | null
          pdf_url: string | null
          pricing_type: Database["public"]["Enums"]["pricing_type"]
          quote_number: string
          rejection_reason: string | null
          revision_number: number | null
          sales_id: string
          site_id: string | null
          status: Database["public"]["Enums"]["quote_status"]
          subtotal: number | null
          terms_conditions: string | null
          total: number | null
          updated_at: string | null
          valid_until: string | null
          vat: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          attention_title?: string | null
          created_at?: string | null
          customer_id: string
          discount?: number | null
          id?: string
          lead_id?: string | null
          marketing_id?: string | null
          notes?: string | null
          package_id?: string | null
          pdf_url?: string | null
          pricing_type: Database["public"]["Enums"]["pricing_type"]
          quote_number: string
          rejection_reason?: string | null
          revision_number?: number | null
          sales_id: string
          site_id?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number | null
          terms_conditions?: string | null
          total?: number | null
          updated_at?: string | null
          valid_until?: string | null
          vat?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          attention_title?: string | null
          created_at?: string | null
          customer_id?: string
          discount?: number | null
          id?: string
          lead_id?: string | null
          marketing_id?: string | null
          notes?: string | null
          package_id?: string | null
          pdf_url?: string | null
          pricing_type?: Database["public"]["Enums"]["pricing_type"]
          quote_number?: string
          rejection_reason?: string | null
          revision_number?: number | null
          sales_id?: string
          site_id?: string | null
          status?: Database["public"]["Enums"]["quote_status"]
          subtotal?: number | null
          terms_conditions?: string | null
          total?: number | null
          updated_at?: string | null
          valid_until?: string | null
          vat?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "quotations_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_marketing_id_fkey"
            columns: ["marketing_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "pricing_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_sales_id_fkey"
            columns: ["sales_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotations_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      sites: {
        Row: {
          address: string
          contact_person: string | null
          created_at: string | null
          customer_id: string
          district: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          province: string | null
          sub_district: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          contact_person?: string | null
          created_at?: string | null
          customer_id: string
          district?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          province?: string | null
          sub_district?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          contact_person?: string | null
          created_at?: string | null
          customer_id?: string
          district?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          province?: string | null
          sub_district?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sites_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          auth_id: string | null
          avatar: string | null
          created_at: string | null
          department: string | null
          email: string
          id: string
          is_active: boolean | null
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          auth_id?: string | null
          avatar?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          auth_id?: string | null
          avatar?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      contracts_expiring_soon: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          auto_renewal: boolean | null
          billing_cycle: Database["public"]["Enums"]["billing_cycle"] | null
          click_rate_black: number | null
          click_rate_color: number | null
          contract_number: string | null
          created_at: string | null
          customer_id: string | null
          customer_name: string | null
          days_until_expiry: number | null
          document_url: string | null
          end_date: string | null
          excess_rate_black: number | null
          excess_rate_color: number | null
          free_volume_black: number | null
          free_volume_color: number | null
          id: string | null
          min_guarantee_volume: number | null
          monthly_fee: number | null
          notes: string | null
          package_id: string | null
          payment_terms: string | null
          po_url: string | null
          pricing_type: Database["public"]["Enums"]["pricing_type"] | null
          quote_id: string | null
          sales_id: string | null
          signed_at: string | null
          site_id: string | null
          site_name: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status"] | null
          termination_notice_days: number | null
          updated_at: string | null
          waste_paper_discount: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "pricing_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_sales_id_fkey"
            columns: ["sales_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contracts_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "sites"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_stats: {
        Row: {
          active_contracts: number | null
          active_quotations: number | null
          contracts_expiring_30_days: number | null
          low_stock_items: number | null
          monthly_revenue: number | null
          pending_approvals: number | null
          pending_jobs: number | null
          total_leads: number | null
        }
        Relationships: []
      }
      machine_inventory_overview: {
        Row: {
          brand: Database["public"]["Enums"]["brand"] | null
          color_type: Database["public"]["Enums"]["color_type"] | null
          condition: Database["public"]["Enums"]["machine_condition"] | null
          count: number | null
          model: string | null
          status: Database["public"]["Enums"]["machine_status"] | null
          type: Database["public"]["Enums"]["machine_type"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_manage_users: { Args: never; Returns: boolean }
      get_current_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: { Args: never; Returns: boolean }
      link_user_identity: { Args: never; Returns: boolean }
    }
    Enums: {
      billing_cycle: "monthly" | "quarterly"
      brand:
        | "Kyocera"
        | "Lexmark"
        | "Canon"
        | "HP"
        | "Epson"
        | "Ricoh"
        | "Other"
      color_type: "Color" | "Mono"
      contract_status:
        | "draft"
        | "pending_approval"
        | "active"
        | "expired"
        | "terminated"
        | "renewal_pending"
      customer_type:
        | "sme"
        | "private"
        | "government"
        | "education_school"
        | "hospital"
        | "other_shop"
        | "education_university"
        | "financial_institution"
        | "state_enterprise"
        | "industrial_estate"
        | "copy_shop"
        | "computer_shop"
        | "post_office"
      invoice_status: "draft" | "sent" | "paid" | "overdue" | "cancelled"
      job_priority: "low" | "normal" | "high" | "urgent"
      job_status:
        | "pending"
        | "assigned"
        | "in_progress"
        | "completed"
        | "cancelled"
      job_type:
        | "installation"
        | "maintenance"
        | "repair"
        | "pickup"
        | "meter_reading"
        | "delivery"
      lead_customer_acquisition_type:
        | "existing_add"
        | "existing_replace"
        | "new_customer"
        | "existing_contract_renewal"
        | "existing_repeat_purchase"
      lead_status:
        | "new"
        | "contacted"
        | "qualified"
        | "proposal"
        | "negotiation"
        | "won"
        | "lost"
        | "mkt_matching"
        | "quotation"
        | "pr"
        | "po"
        | "contract"
      lead_type: "fast_print" | "print_service"
      machine_condition: "New" | "Used"
      machine_status:
        | "In Stock"
        | "Installed"
        | "Maintenance"
        | "Reserved"
        | "Repairing"
        | "Retired"
      machine_type: "Printer" | "MFP"
      notification_type: "info" | "success" | "warning" | "error"
      paper_size: "A4" | "A3"
      pricing_type:
        | "actual_usage"
        | "rental"
        | "min_guarantee"
        | "rental_click"
        | "package_paper"
        | "package_no_paper"
      quote_status:
        | "draft"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "sent"
        | "accepted"
        | "expired"
      user_role:
        | "sales"
        | "marketing"
        | "approver"
        | "planner"
        | "technician"
        | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      billing_cycle: ["monthly", "quarterly"],
      brand: ["Kyocera", "Lexmark", "Canon", "HP", "Epson", "Ricoh", "Other"],
      color_type: ["Color", "Mono"],
      contract_status: [
        "draft",
        "pending_approval",
        "active",
        "expired",
        "terminated",
        "renewal_pending",
      ],
      customer_type: [
        "sme",
        "private",
        "government",
        "education_school",
        "hospital",
        "other_shop",
        "education_university",
        "financial_institution",
        "state_enterprise",
        "industrial_estate",
        "copy_shop",
        "computer_shop",
        "post_office",
      ],
      invoice_status: ["draft", "sent", "paid", "overdue", "cancelled"],
      job_priority: ["low", "normal", "high", "urgent"],
      job_status: [
        "pending",
        "assigned",
        "in_progress",
        "completed",
        "cancelled",
      ],
      job_type: [
        "installation",
        "maintenance",
        "repair",
        "pickup",
        "meter_reading",
        "delivery",
      ],
      lead_customer_acquisition_type: [
        "existing_add",
        "existing_replace",
        "new_customer",
        "existing_contract_renewal",
        "existing_repeat_purchase",
      ],
      lead_status: [
        "new",
        "contacted",
        "qualified",
        "proposal",
        "negotiation",
        "won",
        "lost",
        "mkt_matching",
        "quotation",
        "pr",
        "po",
        "contract",
      ],
      lead_type: ["fast_print", "print_service"],
      machine_condition: ["New", "Used"],
      machine_status: [
        "In Stock",
        "Installed",
        "Maintenance",
        "Reserved",
        "Repairing",
        "Retired",
      ],
      machine_type: ["Printer", "MFP"],
      notification_type: ["info", "success", "warning", "error"],
      paper_size: ["A4", "A3"],
      pricing_type: [
        "actual_usage",
        "rental",
        "min_guarantee",
        "rental_click",
        "package_paper",
        "package_no_paper",
      ],
      quote_status: [
        "draft",
        "pending_approval",
        "approved",
        "rejected",
        "sent",
        "accepted",
        "expired",
      ],
      user_role: [
        "sales",
        "marketing",
        "approver",
        "planner",
        "technician",
        "admin",
      ],
    },
  },
} as const
