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
    if (candidato.estado_gdpr === 'olvidado') {
      return res.json({
        id: candidato.id,
        nombre: null,
        email: null,
        estado_gdpr: 'olvidado',
      });
    }
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
router.post('/olvidar/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        error: 'El id del candidato no es válido',
      });
    }

    const [candidatos] = await pool.execute(
      'SELECT estado_gdpr FROM CandidatoSeguridad WHERE id = ?',
      [id]
    );

    if (candidatos.length === 0) {
      return res.status(404).json({
        error: 'Candidato no encontrado',
      });
    }

    if (candidatos[0].estado_gdpr === 'olvidado') {
      return res.json({
        mensaje: `El candidato ${id} ya había ejercido el derecho al olvido`,
      });
    }

    const nombreAnonimizado = cifrar(`CANDIDATO_OLVIDADO_${id}`);
    const emailAnonimizado = cifrar(`olvidado_${id}@anonimo.local`);

    await pool.execute(
      `
      UPDATE CandidatoSeguridad
      SET
        nombre_cifrado = ?,
        email_cifrado = ?,
        estado_gdpr = 'olvidado'
      WHERE id = ?
      `,
      [nombreAnonimizado, emailAnonimizado, id]
    );

    return res.json({
      mensaje: `Derecho al olvido aplicado al candidato ${id}`,
    });
  } catch (error) {
    console.error('Error aplicando derecho al olvido:', error);

    return res.status(500).json({
      error: 'No fue posible procesar el derecho al olvido',
    });
  }
});

module.exports = router;