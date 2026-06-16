cat > backend/sm-seguridad/seed.sql << 'EOF'
USE prccd;

INSERT INTO CandidatoSeguridad (nombre_cifrado, email_cifrado, estado_gdpr)
VALUES
    ('Ana Lopez',     'ana.lopez@usac.edu.gt',     'activo'),
    ('Carlos Mora',   'carlos.mora@ucr.ac.cr',     'activo'),
    ('Maria Ramos',   'maria.ramos@ues.edu.sv',    'activo'),
    ('Pedro Jimenez', 'pedro.jimenez@usac.edu.gt', 'activo');
EOF