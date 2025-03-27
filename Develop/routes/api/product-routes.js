const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    // Find all products and include associated Category and Tag data
    const productData = await Product.findAll({
      include: [
        { model: Category, attributes: ['category_name'] }, // Include Category
        { model: Tag, through: ProductTag, attributes: ['tag_name'] } // Include Tags via ProductTag
      ],
    });
    res.status(200).json(productData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    // Find a single product by its ID and include associated Category and Tag data
    const productData = await Product.findByPk(req.params.id, {
      include: [
        { model: Category, attributes: ['category_name'] }, // Include Category
        { model: Tag, through: ProductTag, attributes: ['tag_name'] } // Include Tags via ProductTag
      ],
    });

    if (!productData) {
      res.status(404).json({ message: 'No product found with this id!' });
      return;
    }

    res.status(200).json(productData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

// create new product
router.post('/', (req, res) => {
  // Validate the required fields are in the body
  const { product_name, price, stock, tagIds } = req.body;

  // Ensure all required fields are present
  if (!product_name || !price || !stock) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  // Default tagIds to an empty array if not provided
  const tagIdsArray = tagIds || [];

  // Create the product
  Product.create({
    product_name,
    price,
    stock
  })
    .then((product) => {
      // If tagIds were provided, create the associations in the ProductTag model
      if (tagIdsArray.length) {
        const productTagIdArr = tagIdsArray.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // No tags provided, just return the product
      return product;
    })
    .then((result) => {
      // If productTagIds were created, return them, else just return the product
      res.status(200).json(result);
    })
    .catch((err) => {
      console.log(err);
      res.status(400).json(err); // Respond with the error
    });
});


// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      if (req.body.tagIds && req.body.tagIds.length) {
        
        ProductTag.findAll({
          where: { product_id: req.params.id }
        }).then((productTags) => {
          // create filtered list of new tag_ids
          const productTagIds = productTags.map(({ tag_id }) => tag_id);
          const newProductTags = req.body.tagIds
          .filter((tag_id) => !productTagIds.includes(tag_id))
          .map((tag_id) => {
            return {
              product_id: req.params.id,
              tag_id,
            };
          });

            // figure out which ones to remove
          const productTagsToRemove = productTags
          .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
          .map(({ id }) => id);
                  // run both actions
          return Promise.all([
            ProductTag.destroy({ where: { id: productTagsToRemove } }),
            ProductTag.bulkCreate(newProductTags),
          ]);
        });
      }

      return res.json(product);
    })
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  try{
    const productData = await Product.destroy({
      where: {
        id: req.params.id
      }
    });
    
    if (!productData){
      res.status(404).json({ message: 'No Product found with this id!' });
      return;
    }
    
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
