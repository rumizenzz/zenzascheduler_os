CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    company VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    field VARCHAR(100),
    start_date DATE NOT NULL,
    end_date DATE,
    pay_type VARCHAR(50),
    pay_rate DECIMAL(10,2),
    pay_frequency VARCHAR(50),
    hours_per_week INTEGER,
    is_current BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);