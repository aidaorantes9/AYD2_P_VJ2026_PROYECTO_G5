# Crear directorio SSH
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Eliminar la llave anterior (si existe)
rm -f ~/.ssh/github_actions ~/.ssh/github_actions.pub

# Generar nueva llave para GitHub Actions (sin passphrase)
ssh-keygen -t ed25519 -C "github-actions-prccd" -f ~/.ssh/github_actions -N ""

# Autorizar la llave para este mismo usuario
cat ~/.ssh/github_actions.pub >> ~/.ssh/authorized_keys

# Permisos correctos
chmod 600 ~/.ssh/authorized_keys
chmod 600 ~/.ssh/github_actions
chmod 644 ~/.ssh/github_actions.pub

# Mostrar información
echo
echo "========== LLAVE PRIVADA PARA GITHUB ACTIONS =========="
cat ~/.ssh/github_actions
echo
echo "======================================================"
echo
echo "========== LLAVE PUBLICA =========="
cat ~/.ssh/github_actions.pub
echo
echo "==================================="

