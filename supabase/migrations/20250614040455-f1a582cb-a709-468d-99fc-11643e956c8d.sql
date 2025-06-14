
-- Insert the predefined subjects into the subjects table
INSERT INTO public.subjects (id, name, code, department) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'DBMS', 'DBMS', 'Computer Science'),
('550e8400-e29b-41d4-a716-446655440002', 'DSA', 'DSA', 'Computer Science'),
('550e8400-e29b-41d4-a716-446655440003', 'CAO', 'CAO', 'Computer Science'),
('550e8400-e29b-41d4-a716-446655440004', 'DLDM', 'DLDM', 'Computer Science'),
('550e8400-e29b-41d4-a716-446655440005', 'DAA', 'DAA', 'Computer Science'),
('550e8400-e29b-41d4-a716-446655440006', 'Math 1', 'MATH1', 'Mathematics'),
('550e8400-e29b-41d4-a716-446655440007', 'Math 2', 'MATH2', 'Mathematics'),
('550e8400-e29b-41d4-a716-446655440008', 'Math 3', 'MATH3', 'Mathematics'),
('550e8400-e29b-41d4-a716-446655440009', 'ML', 'ML', 'Computer Science'),
('550e8400-e29b-41d4-a716-446655440010', 'SQL', 'SQL', 'Computer Science')
ON CONFLICT (code) DO NOTHING;
