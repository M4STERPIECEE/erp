INSERT INTO roles (name) VALUES ('admin'), ('employe'), ('rh') ON CONFLICT (name) DO NOTHING;

INSERT INTO users (email, password) VALUES ('admin@erp.com', '$2a$10$MmD1/KZQzCOpK.W6R82hmefkShhjQLrgKGj1QOrrO7SrccYpLdz56') 
ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password;

INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@erp.com' AND r.name = 'admin'
ON CONFLICT (user_id, role_id) DO NOTHING;

INSERT INTO department (nom, description) VALUES 
('Informatique', 'Département informatique et développement'),
('Ressources Humaines', 'Gestion des ressources humaines'),
('Marketing', 'Département marketing et communication'),
('Finance', 'Département finance et comptabilité'),
('Commerce', 'Département commerce')
ON CONFLICT (nom) DO NOTHING;
