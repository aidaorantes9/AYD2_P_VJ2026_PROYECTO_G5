const express = require('express');
const router  = express.Router();
const pool    = require('../db');
const { cifrar, descifrar } = require('../crypto');

// crea un candidato nuevo cifrando su nombre y email antes de guardarlos
router.post('/candidato', async (req, res) => {
  try {
    const { nombre, email } = req.body;
    // validar que vengan los datos necesarios
    if (!nombre || !email) {
      return res.status(400).json({ error: 'nombre y email son requeridos' });
    }
    // cifrar los datos sensibles antes de insertar en la bd
    const nombre_cifrado = cifrar(nombre);
    const email_cifrado  = cifrar(email);
    const [result] = await pool.execute(
      'INSERT INTO CandidatoSeguridad (nombre_cifrado, email_cifrado) VALUES (?, ?)',
      [nombre_cifrado, email_cifrado]
    );
    res.status(201).json({ id: result.insertId, mensaje: 'Candidato creado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// busca un candidato por id y devuelve sus datos descifrados
router.get('/candidato/:id', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM CandidatoSeguridad WHERE id = ?',
      [req.params.id]
    );
    // si no existe el candidato retornar 404
    if (rows.length === 0) return res.status(404).json({ error: 'Candidato no encontrado' });
    const candidato = rows[0];
    // descifrar los campos antes de enviarlos en la respuesta
    res.json({
      id:          candidato.id,
      nombre:      descifrar(candidato.nombre_cifrado),
      email:       descifrar(candidato.email_cifrado),
      estado_gdpr: candidato.estado_gdpr,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// cambia el estado del candidato a olvidado para cumplir con el derecho al olvido del GDPR
router.post('/anonimizar/:id', async (req, res) => {
  try {
    const [result] = await pool.execute(
      "UPDATE CandidatoSeguridad SET estado_gdpr = 'olvidado' WHERE id = ?",
      [req.params.id]
    );
    // si no encuentra el candidato retornar 404
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Candidato no encontrado' });
    res.json({ mensaje: `Candidato ${req.params.id} marcado como olvidado (GDPR)` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;