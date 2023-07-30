const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

// GET all tags
router.get("/", async (req, res) => {
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(tagData);
  } catch (error) {
    res.status(500).json(error);
  }
});

// GET tag by id
router.get("/:id", async (req, res) => {
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }],
    });

    if (!tagData) {
      res
        .status(404)
        .json({ message: `No tag found with id: ${req.params.id}` });
      return;
    }
    res.status(200).json(tagData);
  } catch (error) {
    res.status(500).json(error);
  }
});

// POST new tag
router.post("/", async (req, res) => {
  // create a new tag
  Tag.create(req.body)
    .then((tag) => {
      // if there's products, we need to create pairings to bulk create in the ProductTag model
      if (req.body.productIds.length) {
        const productTagIdArr = req.body.productIds.map((product_id) => {
          return {
            product_id,
            tag_id: tag.id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no products, just respond
      res.status(200).json(tag);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// PUT updated tag by id
router.put("/:id", (req, res) => {
  Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {
      if (req.body.productIds && req.body.productIds.length) {
        ProductTag.findAll({
          where: { tag_id: req.params.id },
        }).then((productTags) => {
          // create filtered list of new product_ids
          const productTagIds = productTags.map(({ product_id }) => product_id);
          const newProductTags = req.body.productIds
            .filter((product_id) => !productTagIds.includes(product_id))
            .map((product_id) => {
              return {
                product_id,
                tag_id: req.params.id,
              };
            });

          // figure out which ones to remove
          const productTagsToRemove = productTags
            .filter(
              ({ product_id }) => !req.body.productIds.includes(product_id)
            )
            .map(({ id }) => id);
          // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(tag);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

// DELETE tag by id
router.delete("/:id", async (req, res) => {
  try {
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });

    if (!tagData) {
      res
        .status(404)
        .json({ message: `No tag found with id: ${req.params.id}` });
      return;
    }

    res.status(200).json(tagData);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
