INSERT INTO roles (name) VALUES ('admin'), ('employe'), ('rh');

INSERT INTO users (email, password) VALUES ('admin@erp.com', '$2a$10$gRst75Ur8KpW5Z.t5rFpC.d5p3mF8J8m9p7Hq7fK7zO2v1/6PZ8kC');

INSERT INTO user_roles (user_id, role_id) 
SELECT u.id, r.id FROM users u, roles r 
WHERE u.email = 'admin@erp.com' AND r.name = 'admin';

INSERT INTO department (nom, description) VALUES 
('Informatique', 'Département informatique et développement'),
('Ressources Humaines', 'Gestion des ressources humaines'),
('Marketing', 'Département marketing et communication'),
('Finance', 'Département finance et comptabilité'),
('Commerce', 'Département commerce');
