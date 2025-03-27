const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({
      include: [
        { model: Product, through: ProductTag, attributes: ['product_name', 'price', 'stock'] } // Include Tags via ProductTag
      ],
    });
    res.status(200).json(tagData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [
        { model: Product, through: ProductTag, attributes: ['product_name', 'price', 'stock'] } // Include Tags via ProductTag
      ],
    });

    if (!tagData) {
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const newTag = await Tag.create({
      tag_name: req.body.tag_name,
    });
    res.status(200).json(newTag);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create tag', error: err });
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    // Find the tag by its `id` and update its name
    const updatedTag = await Tag.update(
      { tag_name: req.body.tag_name },  // updating tag_name from the request body
      {
        where: {
          id: req.params.id,  // identifying the tag by id from the route parameter
        },
      }
    );

    // If no tag is found with the given id, respond with a 404 status
    if (!updatedTag[0]) {
      return res.status(404).json({ message: 'No tag found with this id!' });
    }

    res.status(200).json({ message: 'Tag updated successfully' });
  } catch (err) {
    res.status(500).json(err);  // Catch any errors and respond with a 500 status
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try{
    const tagData = await Tag.destroy({
      where: {
        id: req.params.id
      }
    });
    
    if (!tagData){
      res.status(404).json({ message: 'No tag found with this id!' });
      return;
    }
    
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});



module.exports = router;
