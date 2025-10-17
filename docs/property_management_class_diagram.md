classDiagram
    %% Classes de Base et Sécurité
    class User {
        <<entity>>
        -UUID id
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

    class Owner {
        <<entity>>
        -UUID id
        -UUID user_id
        -String company_name
        -String tax_number
        -String full_address
        -DateTime created_at
        +getTotalProperties() Collection~Property~
        +createManager() User
        +revokeAccess(user_id) void
    }

    class UserPropertyPermission {
        <<entity>>
        -UUID id
        -UUID user_id
        -UUID building_id
        -UUID property_id
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

    %% Classes Métier
    class Building {
        <<entity>>
        -UUID id
        -UUID owner_id
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
        -UUID owner_id
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
        +hasActiveContract() Boolean
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
        +getActiveContracts() Collection~Contract~
        +getHistory() Collection~Contract~
    }

    class Contract {
        <<entity>>
        -UUID id
        -UUID property_id
        -UUID tenant_id
        -UUID created_by
        -String contract_number
        -Date start_date
        -Date end_date
        -Decimal monthly_rent
        -Decimal security_deposit
        -Decimal charges
        -PaymentFrequency payment_frequency
        -ContractStatus status
        -String terms
        -DateTime signature_date
        -DateTime created_at
        -DateTime updated_at
        -UUID updated_by
        +activate() void
        +terminate() void
        +isActive() Boolean
        +generatePayments() void
    }

    class PaymentFrequency {
        <<enumeration>>
        MONTHLY
        QUARTERLY
        ANNUALLY
    }

    class ContractStatus {
        <<enumeration>>
        DRAFT
        ACTIVE
        EXPIRED
        TERMINATED
    }

    class Payment {
        <<entity>>
        -UUID id
        -UUID contract_id
        -Decimal amount
        -Date due_date
        -DateTime payment_date
        -PaymentStatus status
        -PaymentMethod payment_method
        -String reference_number
        -String notes
        -UUID created_by
        -DateTime created_at
        +markAsPaid() void
        +isLate() Boolean
        +calculateLateDays() Integer
    }

    class PaymentStatus {
        <<enumeration>>
        PENDING
        PAID
        LATE
        CANCELLED
    }

    class PaymentMethod {
        <<enumeration>>
        CASH
        BANK_TRANSFER
        CHECK
        CARD
    }

    class PropertyPhoto {
        <<entity>>
        -UUID id
        -UUID property_id
        -String file_path
        -String file_name
        -Boolean is_primary
        -Integer display_order
        -DateTime uploaded_at
        +setAsPrimary() void
    }

    class MaintenanceLog {
        <<entity>>
        -UUID id
        -UUID property_id
        -MaintenanceType type
        -Date scheduled_date
        -DateTime completion_date
        -MaintenanceStatus status
        -String description
        -Decimal cost
        -String technician_name
        -UUID created_by
        -DateTime created_at
        +complete() void
        +cancel() void
    }

    class MaintenanceType {
        <<enumeration>>
        REPAIR
        INSPECTION
        CLEANING
        IMPROVEMENT
    }

    class MaintenanceStatus {
        <<enumeration>>
        SCHEDULED
        IN_PROGRESS
        COMPLETED
        CANCELLED
    }

    class AuditLog {
        <<entity>>
        -UUID id
        -UUID user_id
        -AuditAction action
        -String entity_type
        -UUID entity_id
        -JSON old_values
        -JSON new_values
        -String ip_address
        -String user_agent
        -DateTime action_date
        +log(user, action, entity) void
    }

    class AuditAction {
        <<enumeration>>
        CREATE
        UPDATE
        DELETE
        VIEW
        ACCESS_DENIED
    }

    %% Relations
    User "1" -- "1" Role : has
    User "1" -- "0..1" Owner : is
    User "1" -- "0..*" UserPropertyPermission : has
    User "1" -- "0..*" AuditLog : performs
    
    Owner "1" -- "0..*" Building : owns
    Owner "1" -- "0..*" Property : owns
    
    Building "0..1" -- "0..*" Property : contains
    
    Property "1" -- "1" PropertyType : is
    Property "1" -- "1" PropertyStatus : has
    Property "1" -- "0..*" Contract : rented_by
    Property "1" -- "0..*" PropertyPhoto : has
    Property "1" -- "0..*" MaintenanceLog : maintenance_history
    
    Tenant "1" -- "0..*" Contract : signs
    
    Contract "1" -- "1" ContractStatus : has
    Contract "1" -- "1" PaymentFrequency : uses
    Contract "1" -- "0..*" Payment : generates
    
    Payment "1" -- "1" PaymentStatus : has
    Payment "1" -- "1" PaymentMethod : paid_with
    
    MaintenanceLog "1" -- "1" MaintenanceType : is
    MaintenanceLog "1" -- "1" MaintenanceStatus : has
    
    UserPropertyPermission "*" -- "0..1" Building : scoped_to
    UserPropertyPermission "*" -- "0..1" Property : scoped_to
    
    %% Notes de sécurité
    note for User "Secure authentication\npassword_hash with bcrypt/Argon2\nSession management"
    note for UserPropertyPermission "Granular access control\nAutomatic expiration\nMandatory audit"
    note for Tenant "Sensitive data encrypted\nid_number encrypted\nGDPR compliant"
    note for AuditLog "Complete traceability\n2 years minimum retention\nDenied access attempts logged"