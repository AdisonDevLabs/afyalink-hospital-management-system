-- init-db.sql

-- Helper function to update 'updated_at' timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop tables in reverse dependency order to avoid foreign key conflicts
DROP TABLE IF EXISTS activity_logs CASCADE;
DROP TABLE IF EXISTS alerts CASCADE;
DROP TABLE IF EXISTS medications CASCADE;
DROP TABLE IF EXISTS messages CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS prescriptions CASCADE;
DROP TABLE IF EXISTS clinical_notes CASCADE;
DROP TABLE IF EXISTS vitals CASCADE;
DROP TABLE IF EXISTS beds CASCADE;
DROP TABLE IF EXISTS lab_reports CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS doctor_availability CASCADE;
DROP TABLE IF EXISTS appointments CASCADE;
DROP TABLE IF EXISTS patients CASCADE;
DROP TABLE IF EXISTS departments CASCADE;
DROP TABLE IF EXISTS users CASCADE;


-- Create Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'receptionist' CHECK (role IN ('admin', 'doctor', 'receptionist', 'nurse', 'patient')),
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    email VARCHAR(255),
    phone_number VARCHAR(20),
    address TEXT,
    date_of_birth DATE,
    gender VARCHAR(10),
    specialization VARCHAR(255) DEFAULT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMPTZ,
    photo_url VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create Departments Table
CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    head_of_department_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create Patients Table
CREATE TABLE patients (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender VARCHAR(10) NOT NULL,
    national_id VARCHAR(30) UNIQUE,
    contact_phone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    address TEXT,
    assigned_nurse_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    photo_url TEXT,
    is_admitted BOOLEAN DEFAULT FALSE,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    emergency_contact_relationship VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_patients_last_name ON patients (last_name);
CREATE INDEX idx_patients_national_id ON patients (national_id);


-- Create Appointments Table
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    department_id INTEGER REFERENCES departments(id),
    appointment_date DATE NOT NULL,
    appointment_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled',
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT appointments_patient_id_doctor_id_appointment_date_appointm_key UNIQUE (patient_id, doctor_id, appointment_date, appointment_time)
);
CREATE INDEX idx_appointments_date_time ON appointments (appointment_date, appointment_time);
CREATE INDEX idx_appointments_doctor_id ON appointments (doctor_id);
CREATE INDEX idx_appointments_patient_id ON appointments (patient_id);
CREATE INDEX idx_appointments_status ON appointments (status);


-- Create Doctor Availability Table
CREATE TABLE doctor_availability (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 for Sunday, 6 for Saturday
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    max_patients_per_slot INTEGER DEFAULT 1 CHECK (max_patients_per_slot > 0),
    max_patients_per_day INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT doctor_availability_doctor_id_day_of_week_start_time_end_ti_key UNIQUE (doctor_id, day_of_week, start_time, end_time)
);
CREATE INDEX idx_doctor_availability_doctor_day ON doctor_availability (doctor_id, day_of_week);


-- Create Clinical Notes Table
CREATE TABLE clinical_notes (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    appointment_id INTEGER REFERENCES appointments(id) ON DELETE SET NULL,
    note_type VARCHAR(50) NOT NULL DEFAULT 'Consultation',
    visit_datetime TIMESTAMPTZ,
    chief_complaint TEXT,
    diagnosis TEXT,
    medications_prescribed TEXT,
    vitals TEXT, -- Consider normalizing this to link to vitals records
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_clinical_notes_doctor_id ON clinical_notes (doctor_id);
CREATE INDEX idx_clinical_notes_patient_id ON clinical_notes (patient_id);


-- Create Lab Reports Table
CREATE TABLE lab_reports (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id),
    doctor_id INTEGER NOT NULL REFERENCES users(id),
    test_name VARCHAR(255) NOT NULL,
    results TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    report_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_lab_reports_doctor_id ON lab_reports (doctor_id);
CREATE INDEX idx_lab_reports_patient_id ON lab_reports (patient_id);


-- Create Medications Table (for administered medications)
CREATE TABLE medications (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    administration_time TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'due',
    assigned_nurse_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    administered_by_nurse_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create Messages Table
CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id),
    recipient_id INTEGER NOT NULL REFERENCES users(id),
    type VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    reference_id INTEGER, -- Can be used to link to other entities like appointments, alerts etc.
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_messages_recipient_id ON messages (recipient_id);
CREATE INDEX idx_messages_type ON messages (type);


-- Create Orders Table (e.g., lab orders, treatment orders)
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    order_type VARCHAR(100) NOT NULL,
    details TEXT,
    order_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'new',
    assigned_nurse_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Create Payments Table
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER REFERENCES patients(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    payment_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_date_status ON payments (payment_date, status);
CREATE INDEX idx_payments_status ON payments (status);


-- Create Prescriptions Table
CREATE TABLE prescriptions (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    medication_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    frequency VARCHAR(100),
    instructions TEXT,
    prescribed_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    end_date DATE,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_prescriptions_doctor_id ON prescriptions (doctor_id);
CREATE INDEX idx_prescriptions_patient_id ON prescriptions (patient_id);


-- Create Schedules Table (General schedules, e.g. for users or general events)
CREATE TABLE schedules (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    schedule_date DATE NOT NULL,
    start_time TIME WITHOUT TIME ZONE NOT NULL,
    end_time TIME WITHOUT TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_schedule_time UNIQUE (user_id, schedule_date, start_time, end_time)
);
CREATE INDEX idx_schedules_user_date ON schedules (user_id, schedule_date);
CREATE TRIGGER update_schedules_updated_at BEFORE UPDATE ON schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- Create Vitals Table
CREATE TABLE vitals (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    recorded_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- User who recorded the vitals
    body_temperature NUMERIC(4,1),
    pulse_rate INTEGER,
    respiration_rate INTEGER,
    blood_pressure_systolic INTEGER,
    blood_pressure_diastolic INTEGER,
    oxygen_saturation NUMERIC(4,1),
    weight NUMERIC(5,2),
    height NUMERIC(4,2),
    bmi NUMERIC(4,2),
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) DEFAULT 'current'
);


-- Create Beds Table
CREATE TABLE beds (
    id SERIAL PRIMARY KEY,
    room_number VARCHAR(50) NOT NULL,
    bed_number VARCHAR(50) NOT NULL,
    is_occupied BOOLEAN DEFAULT FALSE,
    patient_id INTEGER UNIQUE REFERENCES patients(id) ON DELETE SET NULL, -- Occupying patient, can be NULL
    ward_type VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Create Alerts Table
CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    message TEXT NOT NULL,
    severity VARCHAR(50) NOT NULL DEFAULT 'medium', -- e.g., 'low', 'medium', 'high', 'critical'
    alert_type VARCHAR(100),
    patient_id INTEGER REFERENCES patients(id) ON DELETE CASCADE,
    recipient_role VARCHAR(50) NOT NULL, -- e.g., 'doctor', 'nurse', 'admin'
    recipient_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Create Activity Logs Table (Based on common logging patterns and presence in \dt)
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL, -- e.g., 'login', 'patient_add', 'appointment_update'
    description TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);


-- Initial Data (Example Admin User)
-- You MUST replace 'your_hashed_admin_password_here' with an actual bcrypt hash of a password
-- If your backend uses bcrypt, you can hash 'adminpassword123' (or your desired password)
-- using a simple Node.js script:
--
-- const bcrypt = require('bcrypt');
-- async function hashPassword(password) {
--   const hash = await bcrypt.hash(password, 10); // 10 is salt rounds
--   console.log(hash);
-- }
-- hashPassword('your_desired_admin_password'); // Run this and copy the output
INSERT INTO users (username, password_hash, role, first_name, last_name, email) VALUES
('admin', '$2b$10$0G6hW.eX/C.T.y.N/qZ.V.N/qZ.V.N/qZ.V.N/qZ.V.N/qZ.V.N/qZ.V.N/qZ.V.N/qZ.V.N/qZ.V.N/qZ.V.N', 'admin', 'Super', 'User', 'admin@example.com')
ON CONFLICT (username) DO NOTHING; -- Prevents re-inserting if user already exists