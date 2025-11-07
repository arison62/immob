classDiagram
    %% Classes de Base et Sécurité (unchanged except minor relations)
    class User {
        <<entity>>
        -UUID id
        -UUID workspace_id
        -String email
        -String password
        -String first_name
        -String last_name
        -String phone
        -Role role
        -Boolean is_active
        -DateTime created_at
        -UUID created_by
        +authenticate() Boolean
        +hasPermission(resource, action) Boolean
        +isActive() Boolean
    }

    class Role {
        <<enumeration>>
        OWNER
        MANAGER
        VIEWER
    }

    class Workspace {
        <<entity>>
        -UUID id
        -UUID admin_user_id
        -String company_name
        -String tax_number
        -String full_address
        -DateTime created_at
        +getTotalProperties() Collection~Property~
        +createManager() User
        +revokeAccess(user_id) void
    }

    class UserBuildingPermission {
        <<entity>>
        -UUID id
        -UUID user_id
        -UUID building_id
        -Boolean can_view
        -Boolean can_create
        -Boolean can_update
        -Boolean can_delete
        -DateTime granted_at
        -UUID granted_by
        -DateTime expires_at
        +isValid() Boolean
        +hasAccess(action) Boolean
        +isExpired() Boolean
    }

    %% Classes Métier (unchanged except where noted)
    class Building {
        <<entity>>
        -UUID id
        -UUID workspace_id
        -String name
        -String address
        -String city
        -String postal_code
        -String country
        -Float latitude
        -Float longitude
        -Integer floor_count
        -String description
        -DateTime created_at
        -DateTime updated_at
        +getOccupancyRate() Float
        +getPropertyCount() Integer
        +getOccupiedPropertyCount() Integer
    }

    class Property {
        <<entity>>
        -UUID id
        -UUID building_id
        -UUID workspace_id
        -String reference_code
        -String name
        -PropertyType type
        -Integer floor
        -String door_number
        -Float surface_area
        -Integer room_count
        -Integer bedroom_count
        -Integer bathroom_count
        -Boolean has_parking
        -Boolean has_balcony
        -Decimal monthly_rent
        -PropertyStatus status
        -String description
        -JSON equipment_list
        -DateTime created_at
        -DateTime updated_at
        +isAvailable() Boolean
        +changeStatus(new_status) void
        +hasActiveContrat() Boolean
    }

    class PropertyType {
        <<enumeration>>
        APARTMENT
        HOUSE
        STUDIO
    }

    class PropertyStatus {
        <<enumeration>>
        AVAILABLE
        OCCUPIED
        MAINTENANCE
        UNAVAILABLE
    }

    class Tenant {
        <<entity>>
        -UUID id
        -UUID workspace_id  %% ADDED: For multi-tenancy isolation
        -String first_name
        -String last_name
        -String email
        -String phone
        -String id_number~encrypted~
        -Date birth_date
        -String address
        -String emergency_contact_name
        -String emergency_contact_phone
        -DateTime created_at
        -Decimal outstanding_balance  %% ADDED: Quick financial summary
        +getActiveContrats() Collection~Contrat~
        +getHistory() Collection~Contrat~
        +calculateBalance() Decimal  %% ADDED: To compute from payments
    }

    class Contrat {
        <<entity>>
        -UUID id
        -UUID property_id
        -UUID tenant_id
        -UUID workspace_id  %% ADDED: Direct scoping for queries/finances
        -UUID created_by
        -String contrat_number
        -Date start_date
        -Date end_date
        -Decimal monthly_rent
        -Decimal security_deposit
        -Decimal charges
        -PaymentFrequency payment_frequency
        -ContratStatus status
        -JSON terms  %% CHANGED: From String to JSON for structured clauses
        -DateTime signature_date
        -DateTime created_at
        -DateTime updated_at
        -UUID updated_by
        -Integer amendment_count  %% ADDED: Track revisions
        +activate() void
        +terminate() void
        +isActive() Boolean
        +generatePayments() void
        +amend(details) void  %% ADDED: For rent adjustments, etc.
    }

    class PaymentFrequency {
        <<enumeration>>
        MONTHLY
        QUARTERLY
        ANNUALLY
    }

    class ContratStatus {
        <<enumeration>>
        DRAFT
        ACTIVE
        EXPIRED
        TERMINATED
    }

    class Payment {
        <<entity>>
        -UUID id
        -UUID contrat_id
        -Decimal amount
        -Date due_date
        -DateTime payment_date
        -PaymentStatus status
        -PaymentMethod payment_method
        -String reference_number~encrypted~  %% ADDED: Encryption for sensitive info
        -String notes
        -UUID created_by
        -DateTime created_at
        -Decimal late_fee  %% ADDED: For automated escalations
        +markAsPaid() void
        +isLate() Boolean
        +calculateLateDays() Integer
        +applyLateFee() void  %% ADDED: Business logic for finances
    }

    class PaymentStatus {
        <<enumeration>>
        PENDING
        PAID
        LATE
        CANCELLED
        PARTIAL  %% ADDED: For partial payments/refunds
    }

    class PaymentMethod {
        <<enumeration>>
        CASH
        BANK_TRANSFER
        CHECK
        CARD
    }

    %% NEW: For financial documents
    class Invoice {
        <<entity>>
        -UUID id
        -UUID payment_id  %% Or contrat_id if contrat-level
        -String invoice_number
        -Date issue_date
        -Decimal total_amount
        -String pdf_path  %% Storage for generated invoice
        -InvoiceStatus status
        -DateTime created_at
        +generatePdf() void
        +sendToTenant() void
    }

    class InvoiceStatus {
        <<enumeration>>
        DRAFT
        SENT
        PAID
        OVERDUE
    }

    %% Other classes unchanged (PropertyPhoto, MaintenanceLog, etc.)

    %% Relations (updated)
    User "1" -- "1" Role : has
    User "1" -- "0..1" Workspace : administers_as_owner  %% Clarified "Owner" relation
    User "1" -- "0..*" UserBuildingPermission : has
    User "1" -- "0..*" AuditLog : performs
    
    Workspace "1" -- "0..*" Building : contains
    Workspace "1" -- "0..*" Property : contains
    Workspace "1" -- "0..*" Tenant : manages  %% ADDED
    Workspace "1" -- "0..*" Contrat : manages  %% ADDED
    
    Building "0..1" -- "0..*" Property : contains
    
    Property "1" -- "1" PropertyType : is
    Property "1" -- "1" PropertyStatus : has
    Property "1" -- "0..*" Contrat : rented_by
    Property "1" -- "0..*" PropertyPhoto : has
    Property "1" -- "0..*" MaintenanceLog : maintenance_history
    
    Tenant "1" -- "0..*" Contrat : signs
    
    Contrat "1" -- "1" ContratStatus : has
    Contrat "1" -- "1" PaymentFrequency : uses
    Contrat "1" -- "0..*" Payment : generates
    
    Payment "1" -- "1" PaymentStatus : has
    Payment "1" -- "1" PaymentMethod : paid_with
    Payment "1" -- "0..*" Invoice : generates  %% ADDED: Links finances to documents
    
    MaintenanceLog "1" -- "1" MaintenanceType : is
    MaintenanceLog "1" -- "1" MaintenanceStatus : has
    
    UserBuildingPermission "*" -- "0..1" Building : scoped_to
    UserBuildingPermission "*" -- "0..1" Property : scoped_to
    
    %% Notes de sécurité (updated)
    note for User "Secure authentication\npassword_hash with bcrypt/Argon2\nSession management"
    note for UserBuildingPermission "Granular access control\nAutomatic expiration\nMandatory audit\nExtend to Tenant/Contrat if needed"
    note for Tenant "Sensitive data encrypted\nid_number encrypted\nGDPR compliant\nFinancial fields read-only for viewers"
    note for AuditLog "Complete traceability\n2 years minimum retention\nDenied access attempts logged\nLog all financial changes"
    note for Contrat "Encrypt financial details\nTrack amendments in AuditLog"
    note for Payment "Encrypt reference_number\nAutomate late fees in business logic"