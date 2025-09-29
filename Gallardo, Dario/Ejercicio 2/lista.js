import express from "express";
import { db } from "./db.js"; 
import { body, query } from "express-validator";
import { verificarValidaciones, validarId } from "./validaciones.js";

const router = express.Router();

// Validaciones
const validarTarea = [
  body("nombre").isString().isLength({ min: 1, max: 100 }),
  body("completada").isBoolean().optional()
];

const validarFiltros = [
  query("completada").optional().isBoolean().toBoolean()
];

// GET listado de tareas con filtro (completadas o pendientes)
router.get("/", validarFiltros, verificarValidaciones, async (req, res) => {
  const filtros = [];
  const parametros = [];

  if (req.query.completada !== undefined) {
    filtros.push("completada = ?");
    parametros.push(req.query.completada ? 1 : 0);
  }

  let sql = "SELECT id, nombre, completada FROM tareas";

  if (filtros.length > 0) {
    sql += " WHERE " + filtros.join(" AND ");
  }

  sql += " ORDER BY id DESC";

  const [rows] = await db.execute(sql, parametros);
  res.json({ success: true, data: rows });
});

// GET detalle de una tarea
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  const [rows] = await db.execute("SELECT * FROM tareas WHERE id = ?", [id]);

  if (rows.length === 0) {
    return res
      .status(404)
      .json({ success: false, message: "Tarea no encontrada" });
  }

  res.json({ success: true, data: rows[0] });
});

// POST crear tarea (evitar repetidos)
router.post("/", validarTarea, verificarValidaciones, async (req, res) => {
  const { nombre, completada = 0 } = req.body;

  // Verificar si ya existe la tarea
  const [existente] = await db.execute("SELECT id FROM tareas WHERE nombre = ?", [nombre]);

  if (existente.length > 0) {
    return res.status(400).json({
      success: false,
      message: "La tarea ya existe"
    });
  }

  const [result] = await db.execute(
    "INSERT INTO tareas (nombre, completada) VALUES (?, ?)",
    [nombre, completada]
  );

  res.status(201).json({
    success: true,
    data: { id: result.insertId, nombre, completada }
  });
});

// PUT modificar tarea
router.put("/:id", validarId, validarTarea, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);
  const { nombre, completada } = req.body;

  await db.execute(
    "UPDATE tareas SET nombre=?, completada=? WHERE id=?",
    [nombre, completada, id]
  );

  res.json({
    success: true,
    data: { id, nombre, completada }
  });
});

// DELETE eliminar tarea
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
  const id = Number(req.params.id);

  await db.execute("DELETE FROM tareas WHERE id=?", [id]);
  res.json({ success: true, data: id });
});

export default router;
