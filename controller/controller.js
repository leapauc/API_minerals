// create controller-implement CRUD functionnalities
const express = require("express");
const router = express.Router();
const db = require("../db/db");
const bodyParser = require("body-parser");
const cors = require("cors");

router.use(bodyParser.json());
router.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
router.use(express.json());
router.use(cors());

// GET ALL MINERALS
router.get("/api/minerals", async (req, res) => {
  try {
    const result =
      await db.query(`SELECT mineralid,namemineral,system_min,class_min,group_min,stuntzname,formula,weightformula,incertitud,percent,mohsscalemin,mohsscalemax,
        stuntzname,macle,refraction_index,habitus,string_to_array(luster,'|') as luster,string_to_array(transparence,'|') as transparence,
        mag,radioactivity,string_to_array(color,'|') as color,string_to_array(species,'|') as species,string_to_array(molecules,'|') as molecules,
        pleochroism,fluorescence,cleavage,density,fusiontemperature,mineralsassociation,string_to_array(chemicalbehaviour,'- ') as chemicalbehaviour,
        discovery,gite,utility,topotype,infosup,synonyme,string_to_array(country,'|') as country,string_to_array(gisement_name, '|') as gisement
        FROM mineralsfullinfo`);
    if (result.rows.length === 0) {
      return res.status(404).send("No minerals found");
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// GET A MINERAL BY ID
router.get("/api/minerals/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT mineralid,namemineral,system_min,class_min,group_min,stuntzname,formula,weightformula,incertitud,percent,mohsscalemin,mohsscalemax,
        stuntzname,macle,refraction_index,habitus,string_to_array(luster,'|') as luster,string_to_array(transparence,'|') as transparence,
        mag,radioactivity,string_to_array(color,'|') as color,string_to_array(species,'|') as species,string_to_array(molecules,'|') as molecules,
        pleochroism,fluorescence,cleavage,density,fusiontemperature,mineralsassociation,string_to_array(chemicalbehaviour,'- ') as chemicalbehaviour,
        discovery,gite,utility,topotype,infosup,synonyme,string_to_array(country,'|') as country,string_to_array(gisement_name, '|') as gisement
        FROM mineralsfullinfo WHERE mineralid=$1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Mineral not found");
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// POST
router.post("/api/minerals", async (req, res) => {
  const {
    namemineral,
    groupmineralid,
    formula,
    weightformula,
    incertitud,
    percent,
  } = req.body;

  // Remplacer les valeurs manquantes par NULL
  const values = [
    namemineral || null,
    groupmineralid || null,
    formula || null,
    weightformula || null,
    incertitud || null,
    percent || null,
  ];

  try {
    const result = await db.query(
      `
            INSERT INTO mineralsclassification (mineralid, namemineral, groupmineralid, formula, weightformula, incertitud, percent) 
            VALUES ((SELECT COALESCE(MAX(mineralid), 0) + 1 FROM mineralsclassification), $1, $2, $3, $4, $5, $6) 
            RETURNING *`,
      values
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur du serveur");
  }
});

// PUT
router.put("/api/minerals/:id", async (req, res) => {
  const { id } = req.params;
  const {
    namemineral,
    groupmineralid,
    formula,
    weightformula,
    incertitud,
    percent,
  } = req.body;
  try {
    const result = await db.query(
      `UPDATE mineralsclassification SET
            namemineral=$1, groupmineralid=$2, formula=$3, weightformula=$4, incertitud=$5, 
            percent=$6 WHERE mineralid=$7 RETURNING *`,
      [
        namemineral,
        groupmineralid,
        formula,
        weightformula,
        incertitud,
        percent,
        id,
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Mineral not found");
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send("Server Error");
  }
});

// DELETE
router.delete("/api/minerals/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Étape 1 : Récupérer le minéral avant de le supprimer
    const selectResult = await db.query(
      "SELECT * FROM mineralsclassification WHERE mineralid = $1",
      [id]
    );

    if (selectResult.rows.length === 0) {
      return res.status(404).send("Mineral not found");
    }

    // Étape 2 : Supprimer le minéral
    const result = await db.query(
      "DELETE FROM mineralsclassification WHERE mineralid = $1 RETURNING *",
      [id]
    );

    // Étape 3 : Renvoyer le nom du minéral supprimé
    const deletedMineral = selectResult.rows[0]; // Le minéral que nous avons sélectionné
    res.json({
      message: `Minéral '${deletedMineral.namemineral}' supprimé avec succès`,
      deletedMineral,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur du serveur");
  }
});

// GET FILTER
router.get("/api/filter/minerals", async (req, res) => {
  const {
    name,
    system_min,
    stuntz,
    class_min,
    group_min,
    formula,
    color,
    mohsmin,
    mohsmax,
    country,
    density,
    fusiontemperature,
    luster,
    transparence,
    magnetism,
    radioactivity,
    pleochroism,
    fluorescence,
  } = req.query; // Récupérer les paramètres de requête
  console.log(req.query);
  // Construire la requête SQL de manière dynamique
  let query = `SELECT mineralid,namemineral,formula,weightformula,incertitud,percent,mohsscalemin,mohsscalemax,
          stuntzname,macle,refraction_index,habitus,string_to_array(luster,'|') as luster,string_to_array(transparence,'|') as transparence,
          mag,radioactivity,string_to_array(color,'|') as color,string_to_array(species,'|') as species,string_to_array(molecules,'|') as molecules,
          pleochroism,fluorescence,cleavage,density,fusiontemperature,mineralsassociation,string_to_array(chemicalbehaviour,'- ') as chemicalbehaviour,
          discovery,gite,utility,topotype,infosup,synonyme,string_to_array(country,'|') as country,string_to_array(gisement_name, '|') as gisement
          FROM mineralsfullinfo WHERE 1=1`; // 1=1 pour simplifier l'ajout de conditions
  const values = [];

  if (name) {
    query += ` AND namemineral ILIKE '%' || $${values.length + 1} || '%'`;
    values.push(name);
  }
  if (system_min) {
    const systems = system_min.split(",").map((s) => s.trim()); // Split and trim values
    const placeholders = systems
      .map((_, index) => "$" + (values.length + index + 1))
      .join(", ");
    query += " AND system_min IN (" + placeholders + ")";
    values.push(...systems); // Add all systems to values
  }
  if (luster) {
    const lusters = luster.split(",").map((s) => s.trim()); // Split and trim values
    const placeholders = lusters
      .map((_, index) => "$" + (values.length + index + 1))
      .join(", ");
    query += " AND luster IN (" + placeholders + ")";
    values.push(...lusters); // Add all lusters to values
  }
  if (transparence) {
    const transparences = transparence.split(",").map((s) => s.trim()); // Split and trim values
    const placeholders = transparences
      .map((_, index) => "$" + (values.length + index + 1))
      .join(", ");
    query += " AND transparence IN (" + placeholders + ")";
    values.push(...transparences); // Add all transparences to values
  }

  if (color) {
    // Vérifier le séparateur
    if (color.includes("|")) {
      const colors = color.split("|").map((s) => s.trim()); // Split by &&
      if (colors.length > 0) {
        const colorPlaceholders = colors
          .map(
            (_, index) =>
              `color ILIKE '%#' || $${values.length + index + 1} || '%'`
          )
          .join(" AND ");
        query += " AND (" + colorPlaceholders + ")";
        values.push(...colors); // Add all colors to values
      }
    } else {
      const colors = color.split(",").map((s) => s.trim()); // Split by ,
      if (colors.length > 0) {
        const colorPlaceholders = colors
          .map(
            (_, index) =>
              `color ILIKE '%#' || $${values.length + index + 1} || '%'`
          )
          .join(" OR ");
        query += " AND (" + colorPlaceholders + ")";
        values.push(...colors); // Add all colors to values
      }
    }
  }
  if (country) {
    // Vérifier le séparateur
    if (country.includes("|")) {
      const countrys = country.split("|").map((s) => s.trim()); // Split by &&
      if (countrys.length > 0) {
        const countryPlaceholders = countrys
          .map(
            (_, index) =>
              `country ILIKE '%' || $${values.length + index + 1} || '%'`
          )
          .join(" AND ");
        query += " AND (" + countryPlaceholders + ")";
        values.push(...countrys); // Add all colors to values
      }
    } else {
      const countrys = country.split(",").map((s) => s.trim()); // Split by ,
      if (countrys.length > 0) {
        const countryPlaceholders = countrys
          .map(
            (_, index) =>
              `country ILIKE '%' || $${values.length + index + 1} || '%'`
          )
          .join(" OR ");
        query += " AND (" + countryPlaceholders + ")";
        values.push(...countrys); // Add all colors to values
      }
    }
  }

  if (class_min) {
    const classes = class_min.split(",").map((s) => s.trim()); // Split and trim values
    const placeholders = classes
      .map((_, index) => "$" + (values.length + index + 1))
      .join(", ");
    query += " AND system_min IN (" + placeholders + ")";
    values.push(...classes); // Add all systems to values
  }
  if (group_min) {
    query += " AND group = $" + (values.length + 1);
    values.push(group_min);
  }

  if (stuntz) {
    query += " AND stuntz = $" + (values.length + 1);
    values.push(stuntz);
  }

  if (formula) {
    query += " AND formula = $" + (values.length + 1);
    values.push(formula);
  }

  if (mohsmin) {
    const mohsConditions = mohsmin.split(",").map((s) => s.trim()); // Split and trim values

    // Vérifier si c'est un intervalle
    if (mohsmin.includes("-")) {
      const range = mohsmin.split("-").map((s) => s.trim());
      if (range.length === 2) {
        // Si deux valeurs, on suppose que c'est un BETWEEN
        query +=
          " AND mohsscalemin BETWEEN $" +
          (values.length + 1) +
          " AND $" +
          (values.length + 2);
        values.push(range[0], range[1]); // Ajouter les deux valeurs
      }
    } else {
      // Si plusieurs conditions, gérer les comparaisons
      let hasComparison = false; // Flag pour vérifier si une comparaison a été ajoutée
      mohsConditions.forEach((condition) => {
        if (condition.startsWith(">=")) {
          query += " AND mohsscalemin >= $" + (values.length + 1);
          values.push(condition.slice(2).trim()); // Enlever le '>='
          hasComparison = true; // Indiquer qu'une comparaison a été ajoutée
        } else if (condition.startsWith(">")) {
          query += " AND mohsscalemin > $" + (values.length + 1);
          values.push(condition.slice(1).trim()); // Enlever le '>'
          hasComparison = true; // Indiquer qu'une comparaison a été ajoutée
        } else if (condition.startsWith("<=")) {
          query += " AND mohsscalemin <= $" + (values.length + 1);
          values.push(condition.slice(2).trim()); // Enlever le '<='
          hasComparison = true; // Indiquer qu'une comparaison a été ajoutée
        } else if (condition.startsWith("<")) {
          query += " AND mohsscalemin < $" + (values.length + 1);
          values.push(condition.slice(1).trim()); // Enlever le '<'
          hasComparison = true; // Indiquer qu'une comparaison a été ajoutée
        }
      });

      // Vérifier si aucune comparaison n'a été ajoutée
      if (!hasComparison && mohsConditions.length === 1) {
        // Si une seule valeur, on suppose que c'est un égal
        query += " AND mohsscalemin = $" + (values.length + 1);
        values.push(mohsConditions[0]);
      }
    }
  }
  if (mohsmax) {
    const mohsConditions = mohsmax.split(",").map((s) => s.trim()); // Split and trim values

    // Vérifier si c'est un intervalle
    if (mohsmax.includes("-")) {
      const range = mohsmax.split("-").map((s) => s.trim());
      if (range.length === 2) {
        // Si deux valeurs, on suppose que c'est un BETWEEN
        query +=
          " AND mohsscalemax BETWEEN $" +
          (values.length + 1) +
          " AND $" +
          (values.length + 2);
        values.push(range[0], range[1]); // Ajouter les deux valeurs
      }
    } else {
      // Si plusieurs conditions, gérer les comparaisons
      let hasComparison = false; // Flag pour vérifier si une comparaison a été ajoutée
      mohsConditions.forEach((condition) => {
        if (condition.startsWith(">=")) {
          query += " AND mohsscalemax >= $" + (values.length + 1);
          values.push(condition.slice(2).trim()); // Enlever le '>='
          hasComparison = true; // Indiquer qu'une comparaison a été ajoutée
        } else if (condition.startsWith(">")) {
          query += " AND mohsscalemax > $" + (values.length + 1);
          values.push(condition.slice(1).trim()); // Enlever le '>'
          hasComparison = true; // Indiquer qu'une comparaison a été ajoutée
        } else if (condition.startsWith("<=")) {
          query += " AND mohsscalemax <= $" + (values.length + 1);
          values.push(condition.slice(2).trim()); // Enlever le '<='
          hasComparison = true; // Indiquer qu'une comparaison a été ajoutée
        } else if (condition.startsWith("<")) {
          query += " AND mohsscalemax < $" + (values.length + 1);
          values.push(condition.slice(1).trim()); // Enlever le '<'
          hasComparison = true; // Indiquer qu'une comparaison a été ajoutée
        }
      });

      // Vérifier si aucune comparaison n'a été ajoutée
      if (!hasComparison && mohsConditions.length === 1) {
        // Si une seule valeur, on suppose que c'est un égal
        query += " AND mohsscalemax = $" + (values.length + 1);
        values.push(mohsConditions[0]);
      }
    }
  }
  // PLEOCHROISM

  // MAGNETISM

  // FLUORESENCE

  // RADIOACTIVITY

  console.log("Query:", query);
  console.log("Values:", values);
  try {
    const result = await db.query(query, values);
    if (result.rows.length === 0) {
      return res.status(404).send("Aucun minéral trouvé avec ces critères");
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur du serveur");
  }
});

module.exports = router;
