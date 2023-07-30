const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

// GET all categories
router.get("/", async (req, res) => {
  try {
    const categoryData = await Category.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(categoryData);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET category by id
router.get("/:id", async (req, res) => {
  try {
    const categoryData = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    if (!categoryData) {
      res
        .status(404)
        .json({ message: `No category found with id: ${req.params.id}` });
      return;
    }
    res.status(200).json(categoryData);
  } catch (error) {
    res.status(500).json(error);
  }
});

// POST new category
router.post("/", async (req, res) => {
  try {
    const data = await Category.create({
      category_name: req.body.category_name,
    });
    res.status(200).json(data);
  } catch (error) {
    res.status(400).json(error);
  }
});

// PUT updated category_name by id
router.put("/:id", async (req, res) => {
  try {
    const categoryData = await Category.update(req.body, {
      where: {
        id: req.params.id,
      },
    });

    if (!categoryData) {
      res
        .status(404)
        .json({ message: `No category found with id: ${req.body.id}` });
      return;
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json(error);
  }
});

// DELETE category by id
router.delete("/:id", async (req, res) => {
  try {
    const categoryData = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!categoryData) {
      res
        .status(404)
        .json({ message: `No category found with id: ${req.params.id}` });
      return;
    }

    res.status(200).json(categoryData);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
