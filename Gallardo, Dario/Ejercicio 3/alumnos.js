import express from "express";
import { db } from "./db.js";
import { validarId, verificarValidaciones } from "./validaciones.js";
import { query, body} from "express-validator";

const router = express.Router();

// Validaciones
const validarFiltros = [
    query("nombre").isAlpha("es-ES").optional(),
     query("apellido").isAlpha("es-ES").optional(),       
]

const validarAlumno = [
    body("nombre").isAlpha("es-ES").isLength({ max: 50 }),
    body("apellido").isAlpha("es-ES").isLength({ max: 50 }),
];

// GET para entregar listado de productos
router.get("/", async (req, res) => {
    const filtros = [];
    const parametros = [];

    const { nombre, apellido } = req.query;

    if (nombre) {
        filtros.push("nombre LIKE ?");
        parametros.push(`%${nombre}%`);
    }
    if (apellido) {
        filtros.push("apellido LIKE ?");
        parametros.push(`%${apellido}%`);
    }


    let sql =
        `SELECT 
    alumnos.idalumno,
    alumnos.nombre,
    alumnos.apellido,
    cursado.idcursado,
    materias.materia ,
    notas.nota1,
    notas.nota2,
    notas.nota3
FROM alumnos 
JOIN cursado  ON alumnos.idalumno = cursado.idalumno
JOIN materias  ON cursado.idmateria = materias.idmateria
JOIN notas  ON cursado.idcursado = notas.idcursado;
`


    if (filtros.length > 0) {
        sql += " WHERE " + filtros.join(" AND ");
    }

    const [rows] = await db.execute(sql, parametros);
    res.json({ success: true, data: rows });
});

// GET para entregar detalle de producto
router.get("/:id", validarId, verificarValidaciones, async (req, res) => {
    // Obtengo id
    const id = Number(req.params.id);

    const [rows] = await db.execute("SELECT * FROM alumnos WHERE idalumno=?", [id]);

    if (rows.length === 0) {
        return res
            .status(404)
            .json({ success: false, message: "alumno no encontrado" });
    }

    res.json({ success: true, data: rows[0] });
});

// POST para crear producto
router.post("/", validarAlumno, verificarValidaciones, async (req, res) => {
    // Obtengo body
    const { nombre, apellido, materia, nota1,nota2,nota3 } = req.body;
    const [result] = await db.execute(
        "INSERT INTO alumnos (nombre, apellido) VALUES (?,?)",
        [nombre, apellido]
    );
    res.status(201).json({
        success: true,
        data: { id: result.insertId, nombre, apellido },
    });
});

// PUT para modificar producto a partir de un id
router.put(
    "/:id",
    validarId,
    validarAlumno,
    verificarValidaciones,
    async (req, res) => {
        // Obtengo id
        const id = Number(req.params.id);

        // Obtengo body
        const { nombre, apellido,materia,nota1,nota2,nota3 } = req.body;

        await db.execute(
            "UPDATE alumnos SET nombre=?, apellido=?, materia=?, nota1, nota2, nota3, WHERE idalumno=?",
            [nombre, apellido,materia,nota1,nota2,nota3]
        );

        res.json({
            success: true,
            data: { id, nombre, apellido, materia, nota1,nota2,nota3 },
        });
    }
);

// DELETE para quitar un producto a partir de un id
router.delete("/:id", validarId, verificarValidaciones, async (req, res) => {
    // Obtengo id
    const id = Number(req.params.id);

    await db.execute("DELETE FROM alumno WHERE idalumno=?", [id]);
    res.json({ success: true, data: id });
});

export default router;
